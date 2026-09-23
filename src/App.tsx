import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Camera,
  PenTool,
  FileCode2,
  ListOrdered,
  BookOpen,
  Sparkles,
  Info,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  ScanLine,
  HelpCircle,
  Layers,
  ChevronRight,
  ExternalLink,
  Award,
  GraduationCap,
  ClipboardCheck,
  FileQuestion,
  FileCheck2,
  Eye
} from 'lucide-react';
import { GradedQuestion, GradingReport, ExamSetSample } from './types';
import { EXAM_SAMPLES } from './data/examSamples';
import { DualDocumentViewer } from './components/DualDocumentViewer';
import { GradingScorecard } from './components/GradingScorecard';
import { GradingJsonViewer } from './components/GradingJsonViewer';
import { UploadExamModal } from './components/UploadExamModal';
import { DrawingCanvas } from './components/DrawingCanvas';
import { CameraCapture } from './components/CameraCapture';
import { PromptInfoModal } from './components/PromptInfoModal';
import { TeacherReportModal } from './components/TeacherReportModal';
import { ExamViewer } from './components/ExamViewer';

export default function App() {
  // Current active exam set
  const [currentExamId, setCurrentExamId] = useState<string>(EXAM_SAMPLES[0].id);
  const [examTitle, setExamTitle] = useState<string>(EXAM_SAMPLES[0].title);
  const [studentName, setStudentName] = useState<string>(EXAM_SAMPLES[0].studentName);
  const [questionPaperUrl, setQuestionPaperUrl] = useState<string>(EXAM_SAMPLES[0].questionPaperUrl);
  const [answerSheetUrl, setAnswerSheetUrl] = useState<string>(EXAM_SAMPLES[0].answerSheetUrl);
  const [report, setReport] = useState<GradingReport>(EXAM_SAMPLES[0].report);

  // View Mode: 'studio' | 'exam-viewer'
  const [currentView, setCurrentView] = useState<'studio' | 'exam-viewer'>('exam-viewer');

  // Inspector Tabs: 'scorecard' | 'json' | 'transcript'
  const [activeTab, setActiveTab] = useState<'scorecard' | 'json' | 'transcript'>('scorecard');

  // Interactive selection state
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [hoveredQuestionIndex, setHoveredQuestionIndex] = useState<number | null>(null);

  // Modals & Panels
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showDrawCanvas, setShowDrawCanvas] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [cameraTarget, setCameraTarget] = useState<'question' | 'answer'>('answer');
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [showTeacherReport, setShowTeacherReport] = useState<boolean>(false);

  // Processing & API state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [serviceNotice, setServiceNotice] = useState<string | null>(null);
  const [activeModelName, setActiveModelName] = useState<string>('gemini-3.1-flash-lite');
  const [lastProcessingTime, setLastProcessingTime] = useState<number | null>(null);
  const [serverHealth, setServerHealth] = useState<{ hasApiKey: boolean; model: string } | null>(null);

  // Last grading parameters cache to support 1-click retry
  const lastGradingParamsRef = useRef<{
    qPaper: string;
    aSheet: string;
    title: string;
    student: string;
    sampleId?: string;
  } | null>(null);

  // Check server health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setServerHealth(data);
        if (data.model) setActiveModelName(data.model);
      })
      .catch((err) => console.log('Server health check:', err));
  }, []);

  // Utility to convert SVG or image URLs into clean PNG Base64 for Gemini vision model
  const rasterizeToPng = async (imageUrl: string): Promise<string> => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('data:image/png;base64,')) {
      return imageUrl;
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 1000;
          canvas.height = img.naturalHeight || 1300;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
        } catch (e) {
          console.warn('Canvas rasterization error:', e);
        }
        resolve(imageUrl);
      };
      img.onerror = () => resolve(imageUrl);
      img.src = imageUrl;
    });
  };

  // Human-readable error message cleaner
  const cleanErrorMessage = (msg: any): string => {
    if (!msg) return 'An unexpected error occurred during automated grading.';
    let str = typeof msg === 'string' ? msg : msg?.message || JSON.stringify(msg);

    const jsonIdx = str.indexOf('{"error"');
    if (jsonIdx !== -1) {
      try {
        const parsed = JSON.parse(str.slice(jsonIdx));
        if (parsed?.error?.message) {
          str = parsed.error.message;
        }
      } catch {
        // use fallback
      }
    }

    if (
      str.includes('503') ||
      str.toLowerCase().includes('high demand') ||
      str.includes('UNAVAILABLE') ||
      str.toLowerCase().includes('temporarily')
    ) {
      return 'The Gemini AI model is experiencing temporary peak demand from Google. Please click "Retry Grading" to try again.';
    }
    if (str.includes('429') || str.toLowerCase().includes('quota')) {
      return 'API rate limit reached. Please wait a few seconds and click "Retry Grading".';
    }
    return str;
  };

  // Switch pre-configured exam sets
  const handleSelectExamSample = (sample: ExamSetSample) => {
    setCurrentExamId(sample.id);
    setExamTitle(sample.title);
    setStudentName(sample.studentName);
    setQuestionPaperUrl(sample.questionPaperUrl);
    setAnswerSheetUrl(sample.answerSheetUrl);
    setReport(sample.report);
    setSelectedQuestionIndex(null);
    setHoveredQuestionIndex(null);
    setApiError(null);
    setServiceNotice(null);
    setShowDrawCanvas(false);
  };

  // Run Automated Grading with multi-model fallback via /api/grade
  const runAutomatedGrading = async (
    qPaperInput: string,
    aSheetInput: string,
    title: string = 'Automated Exam Grading',
    student: string = 'Student Submission',
    sampleId?: string
  ) => {
    setIsProcessing(true);
    setApiError(null);
    setServiceNotice(null);
    const startTime = performance.now();

    // Cache current request for instant retry
    lastGradingParamsRef.current = {
      qPaper: qPaperInput,
      aSheet: aSheetInput,
      title,
      student,
      sampleId,
    };

    try {
      setQuestionPaperUrl(qPaperInput);
      setAnswerSheetUrl(aSheetInput);
      setExamTitle(title);
      setStudentName(student);
      setCurrentExamId(sampleId || 'custom');

      // Ensure clean PNG rasterization so Gemini vision models receive pure pixel bitmaps
      const [rasterizedQPaper, rasterizedASheet] = await Promise.all([
        rasterizeToPng(qPaperInput),
        rasterizeToPng(aSheetInput),
      ]);

      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionPaperBase64: rasterizedQPaper,
          questionPaperMimeType: 'image/png',
          answerSheetBase64: rasterizedASheet,
          answerSheetMimeType: 'image/png',
          sampleId,
          examTitle: title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete automated grading');
      }

      const elapsed = Math.round(performance.now() - startTime);
      setLastProcessingTime(elapsed);
      setReport(data.report);
      if (data.modelUsed) {
        setActiveModelName(data.modelUsed);
      }
      if (data.notice) {
        setServiceNotice(data.notice);
      }
      setSelectedQuestionIndex(null);
      setHoveredQuestionIndex(null);
      setShowUploadModal(false);
    } catch (err: any) {
      console.error('Grading Error:', err);
      const friendlyMsg = cleanErrorMessage(err);
      setApiError(friendlyMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryGrading = () => {
    if (!lastGradingParamsRef.current) return;
    const { qPaper, aSheet, title, student, sampleId } = lastGradingParamsRef.current;
    runAutomatedGrading(qPaper, aSheet, title, student, sampleId);
  };

  const handleUpdateQuestion = (index: number, updated: Partial<GradedQuestion>) => {
    setReport((prev) => {
      const questionsCopy = [...prev.questions];
      questionsCopy[index] = { ...questionsCopy[index], ...updated };
      const newTotal = questionsCopy.reduce((acc, q) => acc + q.score_given, 0);
      return {
        ...prev,
        total_score: newTotal,
        questions: questionsCopy,
      };
    });
  };

  // Handle handwriting sketchpad completed answer sheet
  const handleSketchpadDone = (drawnAnswerSheetBase64: string) => {
    setShowDrawCanvas(false);
    // Grade the drawn answer sheet against the current active question paper
    runAutomatedGrading(
      questionPaperUrl,
      drawnAnswerSheetBase64,
      `${examTitle} (Interactive Pad)`,
      'Live Handwriting Pad'
    );
  };

  // Full transcript summary of student answers
  const allTranscribedAnswers = report.questions
    .map((q) => `[Question ${q.question_number}]: ${q.student_answer_text}`)
    .join('\n\n');

  // Render dedicated Hebrew RTL Exam Viewer if selected
  if (currentView === 'exam-viewer') {
    return (
      <ExamViewer
        imageUrl={answerSheetUrl}
        questionPaperUrl={questionPaperUrl}
        examTitle={examTitle}
        studentName={studentName}
        gradingData={{
          total_score: report.total_score,
          max_score: report.max_score,
          questions: report.questions.map((q) => ({
            question_number: q.question_number,
            question_text: q.question_text,
            expected_answer: q.expected_answer,
            status: q.status,
            score_given: q.score_given,
            max_score: q.max_score,
            feedback: q.feedback,
            word_detections: q.word_detections || [],
          })),
        }}
        isProcessing={isProcessing}
        apiError={apiError}
        currentExamId={currentExamId}
        examSamples={EXAM_SAMPLES}
        onSelectExamSample={handleSelectExamSample}
        onGradeExam={runAutomatedGrading}
        onClose={() => setCurrentView('studio')}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Application Navbar */}
      <header className="flex items-center justify-between px-5 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md z-30 shrink-0">
        {/* Brand & System Badges */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base tracking-tight text-white">
                Automated Grading &amp; Handwriting OCR
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {activeModelName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center space-x-2">
              <span>Dual-Input: Question Paper + Student Answer Sheet</span>
              <span>•</span>
              <span className="text-emerald-400">Word/Answer Box 2D: [ymin, xmin, ymax, xmax]</span>
            </p>
          </div>
        </div>

        {/* Input Tools & Actions */}
        <div className="flex items-center space-x-2">
          {/* Run AI Grading on Current Exam */}
          <button
            onClick={() => runAutomatedGrading(questionPaperUrl, answerSheetUrl, examTitle, studentName, currentExamId)}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
            title="Run Gemini Vision OCR & Automated Grading on active exam"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Grading...' : 'Run AI Grading'}</span>
          </button>

          {/* Upload New Exam */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
            title="Upload Question Paper and Student Answer Sheet"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Exam</span>
          </button>

          {/* Digital Pen Sketchpad */}
          <button
            onClick={() => setShowDrawCanvas(!showDrawCanvas)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              showDrawCanvas
                ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Handwrite student answers on interactive digital paper"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>Handwrite Answers</span>
          </button>

          {/* Camera Snapshot */}
          <button
            onClick={() => {
              setCameraTarget('answer');
              setShowCamera(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            title="Snap photo of paper answer sheet with camera"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Camera</span>
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Prompt Spec Modal */}
          <button
            onClick={() => setShowPromptModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
            title="View system prompt and requirements"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Prompt Spec</span>
          </button>

          {/* Teacher Gradebook & Report */}
          <button
            onClick={() => setShowTeacherReport(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            title="Export official teacher report, CSV, or annotated image"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Grade Report</span>
          </button>

          {/* Dedicated RTL Exam Viewer */}
          <button
            onClick={() => setCurrentView('exam-viewer')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
            title="מעבר לתצוגת בדיקת מבחן נקייה בעברית (RTL)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>בדיקת מבחן (RTL)</span>
          </button>
        </div>
      </header>

      {/* Preset Exam Sets Subheader */}
      <div className="flex items-center justify-between px-5 py-2 bg-slate-900/60 border-b border-slate-800/60 text-xs overflow-x-auto gap-4 shrink-0">
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Curated Exam Sets:
          </span>
          <div className="flex items-center space-x-1.5">
            {EXAM_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectExamSample(sample)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  currentExamId === sample.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                }`}
              >
                <span>{sample.title}</span>
                <span className="text-[10px] opacity-75 font-mono">({sample.report.total_score}%)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Processing Indicator / Metrics */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-400 shrink-0">
          {isProcessing ? (
            <div className="flex items-center space-x-2 text-indigo-400 font-medium animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyzing Question Paper &amp; Student Handwriting with {activeModelName}...</span>
            </div>
          ) : lastProcessingTime ? (
            <div className="flex items-center space-x-1.5 text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                Graded {report.questions.length} questions in {lastProcessingTime}ms (Score: {report.total_score}/{report.max_score})
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-slate-400 font-mono">
              <span>
                Exam Loaded: {examTitle} ({studentName})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Informative Service Notice Banner */}
      {serviceNotice && (
        <div className="px-5 py-2 bg-amber-950/80 border-b border-amber-800 text-amber-200 text-xs flex items-center justify-between shrink-0 animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{serviceNotice}</span>
          </div>
          <button
            onClick={() => setServiceNotice(null)}
            className="text-amber-400 hover:text-white text-xs underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert Banner with 1-Click Retry */}
      {apiError && (
        <div className="px-5 py-2.5 bg-red-950/90 border-b border-red-800 text-red-300 text-xs flex items-center justify-between shrink-0 animate-in fade-in gap-3">
          <div className="flex items-center space-x-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="truncate">{apiError}</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            {lastGradingParamsRef.current && (
              <button
                onClick={handleRetryGrading}
                disabled={isProcessing}
                className="flex items-center space-x-1 px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-medium border border-red-600 transition-colors shadow-sm"
              >
                <RotateCcw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Retrying...' : 'Retry Grading'}</span>
              </button>
            )}
            <button
              onClick={() => setApiError(null)}
              className="text-red-400 hover:text-white text-xs underline font-medium px-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col md:flex-row p-3 gap-3 overflow-hidden">
        {/* Left: Dual Document Viewer or Digital Handwriting Pad */}
        <section className="flex-1 h-full min-w-0">
          {showDrawCanvas ? (
            <DrawingCanvas
              onAnalyzeDrawing={handleSketchpadDone}
              isProcessing={isProcessing}
            />
          ) : (
            <DualDocumentViewer
              questionPaperUrl={questionPaperUrl}
              answerSheetUrl={answerSheetUrl}
              questions={report.questions}
              selectedQuestionIndex={selectedQuestionIndex}
              hoveredQuestionIndex={hoveredQuestionIndex}
              onSelectQuestion={setSelectedQuestionIndex}
              onHoverQuestion={setHoveredQuestionIndex}
              studentName={studentName}
              examTitle={examTitle}
            />
          )}
        </section>

        {/* Right: Tabbed Inspector (Scorecard / Raw JSON / Full Transcript) */}
        <aside className="w-full md:w-[460px] lg:w-[500px] h-full flex flex-col shrink-0">
          {/* Tab Navigation */}
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-t-xl text-xs gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('scorecard')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'scorecard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Scorecard ({report.questions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'json'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Raw JSON</span>
            </button>

            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'transcript'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Full Transcript</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0">
            {activeTab === 'scorecard' && (
              <GradingScorecard
                report={report}
                selectedQuestionIndex={selectedQuestionIndex}
                hoveredQuestionIndex={hoveredQuestionIndex}
                onSelectQuestion={setSelectedQuestionIndex}
                onHoverQuestion={setHoveredQuestionIndex}
                onUpdateQuestion={handleUpdateQuestion}
                answerSheetUrl={answerSheetUrl}
              />
            )}

            {activeTab === 'json' && (
              <GradingJsonViewer
                report={report}
                selectedQuestionIndex={selectedQuestionIndex}
                onSelectQuestion={setSelectedQuestionIndex}
              />
            )}

            {activeTab === 'transcript' && (
              <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="font-semibold text-white">Full OCR Transcribed Answers</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(allTranscribedAnswers)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs transition-colors"
                  >
                    Copy All
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 space-y-4 select-text">
                  {report.questions.map((q) => (
                    <div key={q.question_number} className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                      <div className="font-bold text-indigo-400 mb-1">
                        Question {q.question_number}: {q.question_text}
                      </div>
                      <div className="text-slate-200 italic mb-2">
                        "{q.student_answer_text}"
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-1.5">
                        <span className="capitalize">Status: <strong className="text-white">{q.status}</strong></span>
                        <span>Score: <strong className="text-emerald-400">{q.score_given} / {q.max_score}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Upload Custom Exam Modal */}
      {showUploadModal && (
        <UploadExamModal
          onGradeCustomExam={runAutomatedGrading}
          onOpenSketchpad={() => setShowDrawCanvas(true)}
          onClose={() => setShowUploadModal(false)}
          isProcessing={isProcessing}
        />
      )}

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={(base64) => {
            setShowCamera(false);
            if (cameraTarget === 'answer') {
              runAutomatedGrading(questionPaperUrl, base64, examTitle, 'Camera Snapshot');
            } else {
              setQuestionPaperUrl(base64);
            }
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Prompt Spec & Schema Modal */}
      {showPromptModal && (
        <PromptInfoModal onClose={() => setShowPromptModal(false)} />
      )}

      {/* Teacher Grade Report Modal */}
      {showTeacherReport && (
        <TeacherReportModal
          report={report}
          examTitle={examTitle}
          studentName={studentName}
          answerSheetUrl={answerSheetUrl}
          onClose={() => setShowTeacherReport(false)}
        />
      )}
    </div>
  );
}
