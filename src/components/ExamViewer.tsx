import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  FileCheck2,
  Camera,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Eye,
  X
} from 'lucide-react';
import { CameraCapture } from './CameraCapture';

// Data models matching the grading schema
export interface WordDetection {
  text: string;
  confidence_score: number;
  page_number: number;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface QuestionResult {
  question_number: string;
  question_text: string;
  expected_answer: string;
  status: 'correct' | 'incorrect' | 'partial';
  score_given: number;
  max_score: number;
  feedback: string;
  word_detections: WordDetection[];
}

export interface ExamGradingData {
  total_score: number;
  max_score: number;
  questions: QuestionResult[];
}

export interface ExamViewerProps {
  imageUrl: string;
  questionPaperUrl?: string;
  gradingData: ExamGradingData;
  isProcessing?: boolean;
  apiError?: string | null;
  examTitle?: string;
  studentName?: string;
  currentExamId?: string;
  examSamples?: any[];
  onSelectExamSample?: (sample: any) => void;
  onGradeExam?: (
    questionPaperBase64: string,
    answerSheetBase64: string,
    examTitle?: string,
    studentName?: string,
    sampleId?: string
  ) => Promise<void> | void;
  onClose?: () => void;
}

export const ExamViewer: React.FC<ExamViewerProps> = ({
  imageUrl,
  questionPaperUrl,
  gradingData,
  isProcessing = false,
  apiError = null,
  examTitle = 'בדיקת מבחן אוטומטית',
  studentName = 'תלמיד/ה',
  currentExamId,
  examSamples = [],
  onSelectExamSample,
  onGradeExam,
  onClose,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  // Local file storage for new uploads
  const [localQuestionPaper, setLocalQuestionPaper] = useState<string>(questionPaperUrl || '');
  const [localAnswerSheet, setLocalAnswerSheet] = useState<string>(imageUrl || '');
  const [questionFileName, setQuestionFileName] = useState<string>('');
  const [answerFileName, setAnswerFileName] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Drag-and-drop highlight state
  const [isDraggingQuestion, setIsDraggingQuestion] = useState<boolean>(false);
  const [isDraggingAnswer, setIsDraggingAnswer] = useState<boolean>(false);

  // Camera capture modal state
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [cameraTarget, setCameraTarget] = useState<'question' | 'answer'>('answer');

  // Hidden file input refs
  const questionInputRef = useRef<HTMLInputElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  // Sync props when answerSheet or questionPaper changes from outside (e.g. preset change)
  useEffect(() => {
    if (imageUrl) setLocalAnswerSheet(imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    if (questionPaperUrl) setLocalQuestionPaper(questionPaperUrl);
  }, [questionPaperUrl]);

  // Handle file uploads (Images & PDFs)
  const processUploadedFile = (file: File, type: 'question' | 'answer') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'question') {
        setLocalQuestionPaper(result);
        setQuestionFileName(file.name);
      } else {
        setLocalAnswerSheet(result);
        setAnswerFileName(file.name);
      }
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleQuestionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file, 'question');
  };

  const handleAnswerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file, 'answer');
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'question' | 'answer') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'question') setIsDraggingQuestion(false);
    else setIsDraggingAnswer(false);

    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file, type);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, type: 'question' | 'answer') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'question') setIsDraggingQuestion(true);
    else setIsDraggingAnswer(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, type: 'question' | 'answer') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'question') setIsDraggingQuestion(false);
    else setIsDraggingAnswer(false);
  };

  // Trigger grading
  const handleStartGrading = () => {
    const qPaper = localQuestionPaper || questionPaperUrl;
    const aSheet = localAnswerSheet || imageUrl;

    if (!qPaper) {
      setValidationError('אנא העלה דף שאלות (PDF או תמונה) לפני הפעלת הבדיקה.');
      return;
    }
    if (!aSheet) {
      setValidationError('אנא העלה דף תשובות תלמיד (PDF או תמונה) לפני הפעלת הבדיקה.');
      return;
    }

    setValidationError(null);
    if (onGradeExam) {
      onGradeExam(qPaper, aSheet, examTitle, studentName, currentExamId);
    }
  };

  // Status badge styling helper
  const getStatusBadgeStyle = (status: QuestionResult['status']): React.CSSProperties => {
    switch (status) {
      case 'correct':
        return {
          backgroundColor: '#ecfdf5',
          color: '#047857',
          border: '1px solid #a7f3d0',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
        };
      case 'partial':
        return {
          backgroundColor: '#fffbeb',
          color: '#b45309',
          border: '1px solid #fde68a',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
        };
      case 'incorrect':
        return {
          backgroundColor: '#fff1f2',
          color: '#be123c',
          border: '1px solid #fecdd3',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
        };
    }
  };

  const getStatusLabel = (status: QuestionResult['status']) => {
    switch (status) {
      case 'correct':
        return 'נכון';
      case 'partial':
        return 'חלקית';
      case 'incorrect':
        return 'טעות';
    }
  };

  // Safe percentage calculation
  const scorePercentage = gradingData.max_score > 0
    ? Math.round((gradingData.total_score / gradingData.max_score) * 100)
    : 0;

  return (
    <div
      dir="rtl"
      style={{
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        minHeight: '100vh',
        padding: '24px',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* Hidden file inputs */}
      <input
        ref={questionInputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleQuestionFileChange}
      />
      <input
        ref={answerInputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleAnswerFileChange}
      />

      {/* 1. Header Card with Overall Score Gauge */}
      <header
        style={{
          maxWidth: '1280px',
          margin: '0 auto 20px auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '20px',
          flexWrap: 'wrap',
          gap: '16px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              ← חזרה לתצוגת סטודיו
            </button>
          )}
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              בדיקת מבחן אוטומטית
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
              זיהוי כתב יד (OCR) והערכת תשובות בזמן אמת עם Gemini AI
            </p>
          </div>
        </div>

        {/* Overall Score Gauge & Percentage Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: '#f8fafc',
            padding: '10px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              ציון סופי
            </span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              {gradingData.total_score}{' '}
              <span style={{ fontSize: '14px', fontWeight: 400, color: '#94a3b8' }}>
                / {gradingData.max_score}
              </span>
            </span>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)',
            }}
          >
            {scorePercentage}%
          </div>
        </div>
      </header>

      {/* 2. Top Control Panel: File Uploads, Camera & Primary Action */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto 24px auto',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload style={{ width: '18px', height: '18px', color: '#4f46e5' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              העלאת קבצים והפעלת בדיקה
            </span>
          </div>

          {/* Quick preset selector */}
          {examSamples.length > 0 && onSelectExamSample && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                או בחר מבחן מוכן:
              </span>
              {examSamples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectExamSample(sample)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: currentExamId === sample.id ? '#4f46e5' : '#cbd5e1',
                    backgroundColor: currentExamId === sample.id ? '#eef2ff' : '#f8fafc',
                    color: currentExamId === sample.id ? '#4f46e5' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {sample.title.split(' ')[0]} ({sample.report.total_score} נק׳)
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Upload Inputs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          {/* Input 1: Question Paper Upload */}
          <div
            onDragOver={(e) => handleDragOver(e, 'question')}
            onDragLeave={(e) => handleDragLeave(e, 'question')}
            onDrop={(e) => handleDrop(e, 'question')}
            onClick={() => questionInputRef.current?.click()}
            style={{
              border: isDraggingQuestion ? '2px dashed #4f46e5' : '1px dashed #cbd5e1',
              backgroundColor: isDraggingQuestion ? '#eef2ff' : '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#e0e7ff',
                  color: '#4338ca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  1. העלה דף שאלות (PDF/תמונה)
                </span>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {questionFileName || (localQuestionPaper ? 'דף שאלות נטען במערכת' : 'לחץ או גרור קובץ לכאן')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {localQuestionPaper && (
                <span
                  style={{
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                  מוכן
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  questionInputRef.current?.click();
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                }}
              >
                עיון...
              </button>
            </div>
          </div>

          {/* Input 2: Student Answer Upload */}
          <div
            onDragOver={(e) => handleDragOver(e, 'answer')}
            onDragLeave={(e) => handleDragLeave(e, 'answer')}
            onDrop={(e) => handleDrop(e, 'answer')}
            onClick={() => answerInputRef.current?.click()}
            style={{
              border: isDraggingAnswer ? '2px dashed #4f46e5' : '1px dashed #cbd5e1',
              backgroundColor: isDraggingAnswer ? '#eef2ff' : '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileCheck2 style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  2. העלה תשובת תלמיד (PDF/תמונה)
                </span>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {answerFileName || (localAnswerSheet ? 'דף תשובות תלמיד נטען' : 'כתב יד או סריקה')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {localAnswerSheet && (
                <span
                  style={{
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                  מוכן
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  answerInputRef.current?.click();
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                }}
              >
                עיון...
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: Camera Capture + Primary Grade Exam */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '8px',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          {/* Camera Capture Options */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setCameraTarget('answer');
                setShowCamera(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Camera style={{ width: '15px', height: '15px', color: '#4f46e5' }} />
              <span>צלם במצלמה (דף תשובות)</span>
            </button>

            <button
              onClick={() => {
                setCameraTarget('question');
                setShowCamera(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Camera style={{ width: '15px', height: '15px' }} />
              <span>צלם דף שאלות</span>
            </button>
          </div>

          {/* Primary Action Button: בדוק מבחן */}
          <button
            onClick={handleStartGrading}
            disabled={isProcessing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '10px',
              backgroundColor: isProcessing ? '#94a3b8' : '#4f46e5',
              color: '#ffffff',
              border: 'none',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            {isProcessing ? (
              <>
                <RefreshCw
                  style={{
                    width: '16px',
                    height: '16px',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <span>מעבד מבחן עם Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles style={{ width: '16px', height: '16px' }} />
                <span>בדוק מבחן (הפעל הערכת AI)</span>
              </>
            )}
          </button>
        </div>

        {/* Validation or API Error Alerts */}
        {(validationError || apiError) && (
          <div
            style={{
              marginTop: '14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecdd3',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: '#991b1b',
            }}
          >
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{validationError || apiError}</span>
          </div>
        )}

        {/* Loading Progress Notice */}
        {isProcessing && (
          <div
            style={{
              marginTop: '14px',
              backgroundColor: '#eef2ff',
              border: '1px solid #c7d2fe',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '13px',
              color: '#3730a3',
            }}
          >
            <RefreshCw
              style={{
                width: '18px',
                height: '18px',
                animation: 'spin 1s linear infinite',
                flexShrink: 0,
              }}
            />
            <div>
              <span style={{ fontWeight: 700, display: 'block' }}>
                מערכת Gemini מפענחת את כתב היד ומעריכה את השאלות...
              </span>
              <span style={{ fontSize: '11px', color: '#4338ca' }}>
                מנתח מבנה תשובות, מחשב קואורדינטות מילים [0-1000] ומפיק משוב פרטני.
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Camera Capture Modal */}
      {showCamera && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            padding: '16px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '640px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                צילום במצלמה - {cameraTarget === 'answer' ? 'דף תשובות תלמיד' : 'דף שאלות'}
              </span>
              <button
                onClick={() => setShowCamera(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <div style={{ padding: '16px' }}>
              <CameraCapture
                onCapture={(base64) => {
                  if (cameraTarget === 'answer') {
                    setLocalAnswerSheet(base64);
                    setAnswerFileName('תמונה ממצלמה.png');
                  } else {
                    setLocalQuestionPaper(base64);
                    setQuestionFileName('תמונה ממצלמה.png');
                  }
                  setShowCamera(false);
                  setValidationError(null);
                }}
                onClose={() => setShowCamera(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Grid: Answer Sheet (Left) + Questions Panel (Right) */}
      <main
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: '24px',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Column: Image with Precise Word Bounding Boxes */}
        <div
          style={{
            gridColumn: 'span 7 / span 7',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              padding: '0 4px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
              דף התשובות (סריקה + OCR)
            </span>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#64748b' }}>
              קואורדינטות מנורמלות [0-1000]
            </span>
          </div>

          {/* Image + Bounding Box Canvas Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '680px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f1f5f9',
              boxSizing: 'border-box',
            }}
          >
            {localAnswerSheet ? (
              <img
                src={localAnswerSheet}
                alt="Student Answer Sheet"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  userSelect: 'none',
                }}
              />
            ) : (
              <div
                style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                <ImageIcon style={{ width: '48px', height: '48px', margin: '0 auto 12px auto', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>טרם הועלה דף תשובות</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>העלה קובץ למעלה כדי להציג את התשובה והניקוד</p>
              </div>
            )}

            {/* Word-Level Bounding Boxes with Floating Labels */}
            {localAnswerSheet &&
              gradingData.questions.map((q) => {
                const isSelected = selectedQuestion === null || selectedQuestion === q.question_number;
                if (!isSelected) return null;

                return (q.word_detections || []).map((word, idx) => {
                  const [ymin, xmin, ymax, xmax] = word.box_2d;

                  return (
                    <div
                      key={`${q.question_number}-${idx}`}
                      style={{
                        position: 'absolute',
                        top: `${ymin / 10}%`,
                        left: `${xmin / 10}%`,
                        width: `${(xmax - xmin) / 10}%`,
                        height: `${(ymax - ymin) / 10}%`,
                        border:
                          q.status === 'correct'
                            ? '2px solid #10b981'
                            : q.status === 'partial'
                            ? '2px solid #f59e0b'
                            : '2px solid #f43f5e',
                        backgroundColor:
                          q.status === 'correct'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : q.status === 'partial'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(244, 63, 94, 0.15)',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        pointerEvents: 'auto',
                      }}
                      title={`מילה: "${word.text}" | דיוק OCR: ${word.confidence_score}% | עמוד ${word.page_number}`}
                    >
                      {/* Floating Text Badge directly above word */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '-24px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          zIndex: 20,
                          pointerEvents: 'none',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                      >
                        {word.text}
                      </span>
                    </div>
                  );
                });
              })}
          </div>
        </div>

        {/* Right Column: Questions & Assessment Panel */}
        <div
          style={{
            gridColumn: 'span 5 / span 5',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              padding: '20px',
              boxSizing: 'border-box',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 16px 0',
              }}
            >
              פירוט הבדיקה לפי שאלות
            </h2>

            {/* Question Filter Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                overflowX: 'auto',
                paddingBottom: '4px',
              }}
            >
              <button
                onClick={() => setSelectedQuestion(null)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  backgroundColor: selectedQuestion === null ? '#0f172a' : '#f1f5f9',
                  color: selectedQuestion === null ? '#ffffff' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                הצג הכל
              </button>
              {gradingData.questions.map((q) => {
                const isActive = selectedQuestion === q.question_number;
                return (
                  <button
                    key={q.question_number}
                    onClick={() => setSelectedQuestion(q.question_number)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      backgroundColor: isActive ? '#4f46e5' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    שאלה {q.question_number}
                  </button>
                );
              })}
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {gradingData.questions.map((q) => {
                const isSelected = selectedQuestion === q.question_number;
                const badgeStyle = getStatusBadgeStyle(q.status);

                return (
                  <div
                    key={q.question_number}
                    onClick={() =>
                      setSelectedQuestion(isSelected ? null : q.question_number)
                    }
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#f5f7ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                          שאלה {q.question_number}
                        </span>
                        <span style={badgeStyle}>{getStatusLabel(q.status)}</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                        {q.score_given} / {q.max_score} pt
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '13px',
                        color: '#64748b',
                        margin: '0 0 10px 0',
                        lineHeight: '1.4',
                      }}
                    >
                      {q.question_text}
                    </p>

                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #f1f5f9',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, color: '#475569' }}>
                          תשובה מצופה:{' '}
                        </span>
                        <span style={{ color: '#1e293b' }}>{q.expected_answer}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, color: '#475569' }}>
                          הערות בודק:{' '}
                        </span>
                        <span style={{ color: '#334155' }}>{q.feedback}</span>
                      </div>

                      {q.word_detections && q.word_detections.length > 0 && (
                        <div
                          style={{
                            paddingTop: '6px',
                            borderTop: '1px solid #e2e8f0',
                            marginTop: '4px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#64748b',
                              display: 'block',
                              marginBottom: '4px',
                            }}
                          >
                            מילים שזוהו ב-OCR ({q.word_detections.length}):
                          </span>
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '4px',
                              maxHeight: '90px',
                              overflowY: 'auto',
                            }}
                          >
                            {q.word_detections.map((w, wIdx) => (
                              <span
                                key={wIdx}
                                style={{
                                  fontSize: '10px',
                                  fontFamily: 'monospace',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: '#e2e8f0',
                                  color: '#1e293b',
                                  border: '1px solid #cbd5e1',
                                }}
                                title={`דיוק: ${w.confidence_score}% | עמוד ${w.page_number}`}
                              >
                                {w.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
