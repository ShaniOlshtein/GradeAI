import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileQuestion,
  FileCheck,
  Maximize2,
  SplitSquareVertical,
  Columns,
  Eye,
  Crosshair
} from 'lucide-react';
import { GradedQuestion, ViewerSettings } from '../types';

interface DualDocumentViewerProps {
  questionPaperUrl: string;
  answerSheetUrl: string;
  questions: GradedQuestion[];
  selectedQuestionIndex: number | null;
  hoveredQuestionIndex: number | null;
  onSelectQuestion: (index: number | null) => void;
  onHoverQuestion: (index: number | null) => void;
  studentName?: string;
  examTitle?: string;
}

export const DualDocumentViewer: React.FC<DualDocumentViewerProps> = ({
  questionPaperUrl,
  answerSheetUrl,
  questions,
  selectedQuestionIndex,
  hoveredQuestionIndex,
  onSelectQuestion,
  onHoverQuestion,
  studentName = 'Student',
  examTitle = 'Examination',
}) => {
  // View mode: 'split' (side-by-side) or 'tabs' (single document view)
  const [viewMode, setViewMode] = useState<'split' | 'tabs'>('split');
  const [activeTab, setActiveTab] = useState<'answer' | 'question'>('answer');

  // Answer Sheet transform
  const [zoomAnswer, setZoomAnswer] = useState<number>(1);
  const [panAnswer, setPanAnswer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanningAnswer, setIsPanningAnswer] = useState<boolean>(false);
  const [startPanAnswer, setStartPanAnswer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Question Paper transform
  const [zoomQuestion, setZoomQuestion] = useState<number>(1);
  const [panQuestion, setPanQuestion] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanningQuestion, setIsPanningQuestion] = useState<boolean>(false);
  const [startPanQuestion, setStartPanQuestion] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Image load state
  const answerImgRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [overlayMode, setOverlayMode] = useState<'both' | 'questions' | 'words' | 'off'>('both');

  // Pan handler for Answer Sheet
  const handleAnswerMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanningAnswer(true);
    setStartPanAnswer({ x: e.clientX - panAnswer.x, y: e.clientY - panAnswer.y });
  };

  const handleAnswerMouseMove = (e: React.MouseEvent) => {
    if (!isPanningAnswer) return;
    setPanAnswer({
      x: e.clientX - startPanAnswer.x,
      y: e.clientY - startPanAnswer.y,
    });
  };

  const handleAnswerMouseUp = () => {
    setIsPanningAnswer(false);
  };

  // Pan handler for Question Paper
  const handleQuestionMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanningQuestion(true);
    setStartPanQuestion({ x: e.clientX - panQuestion.x, y: e.clientY - panQuestion.y });
  };

  const handleQuestionMouseMove = (e: React.MouseEvent) => {
    if (!isPanningQuestion) return;
    setPanQuestion({
      x: e.clientX - startPanQuestion.x,
      y: e.clientY - startPanQuestion.y,
    });
  };

  const handleQuestionMouseUp = () => {
    setIsPanningQuestion(false);
  };

  const resetAnswerView = () => {
    setZoomAnswer(1);
    setPanAnswer({ x: 0, y: 0 });
  };

  const resetQuestionView = () => {
    setZoomQuestion(1);
    setPanQuestion({ x: 0, y: 0 });
  };

  // Status helper colors
  const getStatusStyle = (status: 'correct' | 'incorrect' | 'partial') => {
    switch (status) {
      case 'correct':
        return {
          border: 'border-emerald-500',
          bg: 'bg-emerald-500/15',
          ring: 'ring-emerald-400',
          badge: 'bg-emerald-600 text-white',
          text: 'text-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'partial':
        return {
          border: 'border-amber-500',
          bg: 'bg-amber-500/20',
          ring: 'ring-amber-400',
          badge: 'bg-amber-600 text-white',
          text: 'text-amber-400',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'incorrect':
        return {
          border: 'border-rose-500',
          bg: 'bg-rose-500/20',
          ring: 'ring-rose-400',
          badge: 'bg-rose-600 text-white',
          text: 'text-rose-400',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 text-xs shrink-0">
        <div className="flex items-center space-x-3">
          {/* View Mode Selector */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'split'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Side-by-side Question Paper & Graded Answer Sheet"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode('tabs')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'tabs'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tabbed Single Document View"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Tabs</span>
            </button>
          </div>

          {viewMode === 'tabs' && (
            <div className="flex items-center bg-slate-800/60 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setActiveTab('answer')}
                className={`px-3 py-1 rounded-md text-xs transition-all ${
                  activeTab === 'answer'
                    ? 'bg-slate-700 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Student Answer Sheet (Graded)
              </button>
              <button
                onClick={() => setActiveTab('question')}
                className={`px-3 py-1 rounded-md text-xs transition-all ${
                  activeTab === 'question'
                    ? 'bg-slate-700 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Question Paper
              </button>
            </div>
          )}

          {/* Overlay Mode Selector */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700/80 text-xs">
            <button
              onClick={() => setOverlayMode('both')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center space-x-1 ${
                overlayMode === 'both' ? 'bg-indigo-600 text-white font-medium shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Show both Question envelopes and Word-Level OCR boxes"
            >
              <Eye className="w-3 h-3" />
              <span>Both (Full OCR)</span>
            </button>
            <button
              onClick={() => setOverlayMode('words')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center space-x-1 ${
                overlayMode === 'words' ? 'bg-indigo-600 text-white font-medium shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Show individual word-level OCR bounding boxes"
            >
              <span>Words Only</span>
            </button>
            <button
              onClick={() => setOverlayMode('questions')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center space-x-1 ${
                overlayMode === 'questions' ? 'bg-indigo-600 text-white font-medium shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Show question-level bounding boxes"
            >
              <span>Questions</span>
            </button>
            <button
              onClick={() => setOverlayMode('off')}
              className={`px-2 py-1 rounded transition-colors ${
                overlayMode === 'off' ? 'bg-slate-700 text-slate-200 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Hide all bounding boxes"
            >
              <span>Off</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-300">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Correct</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Partial</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Incorrect</span>
          </span>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: Question Paper (Visible in split mode or when question tab active) */}
        {(viewMode === 'split' || activeTab === 'question') && (
          <div
            className={`relative flex flex-col border-r border-slate-800 bg-slate-950 overflow-hidden ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            {/* Header tag */}
            <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-lg backdrop-blur shadow-md">
              <FileQuestion className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-200">Question Paper (Original)</span>
            </div>

            {/* Floating Zoom Controls */}
            <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-lg backdrop-blur shadow-md">
              <button
                onClick={() => setZoomQuestion((z) => Math.max(0.5, z - 0.2))}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 text-slate-300">
                {Math.round(zoomQuestion * 100)}%
              </span>
              <button
                onClick={() => setZoomQuestion((z) => Math.min(3, z + 0.2))}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetQuestionView}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Document Viewport */}
            <div
              onMouseDown={handleQuestionMouseDown}
              onMouseMove={handleQuestionMouseMove}
              onMouseUp={handleQuestionMouseUp}
              onMouseLeave={handleQuestionMouseUp}
              className={`flex-1 flex items-center justify-center p-4 overflow-hidden select-none ${
                isPanningQuestion ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <div
                style={{
                  transform: `translate(${panQuestion.x}px, ${panQuestion.y}px) scale(${zoomQuestion})`,
                  transformOrigin: 'center center',
                  transition: isPanningQuestion ? 'none' : 'transform 0.1s ease-out',
                }}
                className="max-h-full max-w-full shadow-2xl rounded-lg overflow-hidden border border-slate-800"
              >
                <img
                  src={questionPaperUrl}
                  alt="Question Paper"
                  className="max-h-[75vh] w-auto object-contain pointer-events-none select-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* RIGHT PANE: Student Answer Sheet with Graded Overlays */}
        {(viewMode === 'split' || activeTab === 'answer') && (
          <div
            className={`relative flex flex-col bg-slate-950 overflow-hidden ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            {/* Header tag */}
            <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-lg backdrop-blur shadow-md">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Student Answer Sheet: <span className="text-indigo-300">{studentName}</span>
              </span>
            </div>

            {/* Floating Zoom Controls */}
            <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-lg backdrop-blur shadow-md">
              <button
                onClick={() => setZoomAnswer((z) => Math.max(0.5, z - 0.2))}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 text-slate-300">
                {Math.round(zoomAnswer * 100)}%
              </span>
              <button
                onClick={() => setZoomAnswer((z) => Math.min(3, z + 0.2))}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetAnswerView}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Document Viewport */}
            <div
              onMouseDown={handleAnswerMouseDown}
              onMouseMove={handleAnswerMouseMove}
              onMouseUp={handleAnswerMouseUp}
              onMouseLeave={handleAnswerMouseUp}
              className={`flex-1 flex items-center justify-center p-4 overflow-hidden select-none ${
                isPanningAnswer ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <div
                style={{
                  transform: `translate(${panAnswer.x}px, ${panAnswer.y}px) scale(${zoomAnswer})`,
                  transformOrigin: 'center center',
                  transition: isPanningAnswer ? 'none' : 'transform 0.1s ease-out',
                }}
                className="relative max-h-full max-w-full shadow-2xl rounded-lg overflow-visible border border-slate-800"
              >
                {/* Background Student Answer Sheet Image */}
                <img
                  ref={answerImgRef}
                  src={answerSheetUrl}
                  alt="Student Answer Sheet"
                  onLoad={() => setImageLoaded(true)}
                  className="max-h-[75vh] w-auto object-contain pointer-events-none select-none block"
                />

                {/* Overlaid Bounding Boxes (Question level and Word-Level OCR) */}
                {overlayMode !== 'off' && (
                  <div className="absolute inset-0 pointer-events-auto">
                    {/* 1. Question-level bounding boxes */}
                    {(overlayMode === 'questions' || overlayMode === 'both') &&
                      questions.map((q, idx) => {
                        const isSelected = selectedQuestionIndex === idx;
                        const isHovered = hoveredQuestionIndex === idx;
                        const box = q.box_2d || (q.word_detections && q.word_detections.length > 0 ? [
                          Math.min(...q.word_detections.map((w) => w.box_2d[0])),
                          Math.min(...q.word_detections.map((w) => w.box_2d[1])),
                          Math.max(...q.word_detections.map((w) => w.box_2d[2])),
                          Math.max(...q.word_detections.map((w) => w.box_2d[3])),
                        ] : [100, 100, 300, 900]);
                        const [ymin, xmin, ymax, xmax] = box;
                        const style = getStatusStyle(q.status);

                        // Percent coordinates relative to 0-1000 scale
                        const top = (ymin / 1000) * 100;
                        const left = (xmin / 1000) * 100;
                        const width = Math.max(1, ((xmax - xmin) / 1000) * 100);
                        const height = Math.max(1, ((ymax - ymin) / 1000) * 100);

                        return (
                          <div
                            key={`graded-box-${idx}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectQuestion(isSelected ? null : idx);
                            }}
                            onMouseEnter={() => onHoverQuestion(idx)}
                            onMouseLeave={() => onHoverQuestion(null)}
                            style={{
                              top: `${top}%`,
                              left: `${left}%`,
                              width: `${width}%`,
                              height: `${height}%`,
                            }}
                            className={`absolute border-2 transition-all cursor-pointer rounded ${style.border} ${
                              overlayMode === 'both' ? 'bg-transparent' : style.bg
                            } ${
                              isSelected
                                ? 'ring-4 ring-indigo-500 shadow-2xl z-30 scale-[1.005]'
                                : isHovered
                                ? `${style.ring} ring-2 z-20`
                                : 'z-10 hover:ring-2'
                            }`}
                          >
                            {/* Corner Reticles */}
                            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white/90" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white/90" />
                            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white/90" />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white/90" />

                            {/* Top Tag: Question Number + Status + Score badge */}
                            <div
                              className={`absolute -top-7 left-0 flex items-center space-x-1.5 px-2 py-0.5 rounded shadow-lg text-[11px] font-semibold tracking-wide whitespace-nowrap z-20 ${style.badge}`}
                            >
                              <span>Q{q.question_number}</span>
                              <span>•</span>
                              <span className="uppercase">{q.status}</span>
                              <span>•</span>
                              <span className="font-mono">
                                +{q.score_given}/{q.max_score} pts
                              </span>
                              {typeof q.confidence_score === 'number' && (
                                <>
                                  <span>•</span>
                                  <span className="opacity-90">{q.confidence_score}% OCR</span>
                                </>
                              )}
                            </div>

                            {/* Hover Tooltip Preview */}
                            {(isHovered || isSelected) && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute left-0 bottom-full mb-8 z-40 w-72 p-3 bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl text-xs text-slate-200 pointer-events-none backdrop-blur-md animate-in fade-in"
                              >
                                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
                                  <span className="font-bold text-white flex items-center space-x-1">
                                    {style.icon}
                                    <span>Question {q.question_number}</span>
                                  </span>
                                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${style.badge}`}>
                                    Score: {q.score_given} / {q.max_score}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mb-1">
                                  <span>Page: {q.page_number || 1}</span>
                                  <span>•</span>
                                  <span className="text-emerald-400">OCR Accuracy: {q.confidence_score ?? 95}%</span>
                                </div>
                                <p className="text-[11px] text-slate-300 font-medium line-clamp-2 mb-1">
                                  {q.question_text}
                                </p>
                                <p className="text-[11px] text-indigo-300 italic line-clamp-2 mb-1">
                                  "{q.student_answer_text || q.word_detections?.map((w) => w.text).join(' ')}"
                                </p>
                                <div className="text-[10px] text-slate-400 bg-slate-900 p-1.5 rounded border border-slate-800">
                                  <span className="font-semibold text-slate-300">Feedback: </span>
                                  {q.feedback}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {/* 2. Word-Level OCR bounding boxes */}
                    {(overlayMode === 'words' || overlayMode === 'both') &&
                      questions.flatMap((q, qIdx) =>
                        (q.word_detections || []).map((w, wIdx) => {
                          const [wYmin, wXmin, wYmax, wXmax] = w.box_2d;
                          const wTop = (wYmin / 1000) * 100;
                          const wLeft = (wXmin / 1000) * 100;
                          const wWidth = Math.max(0.6, ((wXmax - wXmin) / 1000) * 100);
                          const wHeight = Math.max(0.6, ((wYmax - wYmin) / 1000) * 100);

                          const confClass =
                            w.confidence_score >= 96
                              ? 'border-emerald-400/90 bg-emerald-500/20 text-emerald-200'
                              : w.confidence_score >= 90
                              ? 'border-cyan-400/90 bg-cyan-500/20 text-cyan-200'
                              : 'border-amber-400/90 bg-amber-500/20 text-amber-200';

                          return (
                            <div
                              key={`word-box-${qIdx}-${wIdx}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectQuestion(qIdx);
                              }}
                              style={{
                                top: `${wTop}%`,
                                left: `${wLeft}%`,
                                width: `${wWidth}%`,
                                height: `${wHeight}%`,
                              }}
                              className={`absolute border rounded-[2px] transition-all cursor-pointer pointer-events-auto group ${confClass} hover:border-white hover:bg-white/40 hover:scale-110 z-20 shadow-xs`}
                              title={`Word: "${w.text}" • Confidence: ${w.confidence_score}% • Page: ${w.page_number}`}
                            >
                              {/* Word tooltip */}
                              <div className="hidden group-hover:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-slate-950/95 border border-slate-700 text-white rounded text-[10px] font-mono whitespace-nowrap shadow-xl z-50 pointer-events-none items-center space-x-1">
                                <span className="font-semibold text-emerald-400">{w.text}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-cyan-300">{w.confidence_score}% OCR</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Instructions / Coordinates */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
          <span>Click any question box on the Student Answer Sheet to inspect grading details</span>
        </div>
        <div className="font-mono text-slate-400">
          Scale: <span className="text-emerald-400">[0, 0] to [1000, 1000]</span>
        </div>
      </div>
    </div>
  );
};
