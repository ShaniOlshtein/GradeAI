import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  X,
  Target,
  Search,
  Sparkles,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { GradedQuestion, GradingReport } from '../types';

interface GradingScorecardProps {
  report: GradingReport;
  selectedQuestionIndex: number | null;
  hoveredQuestionIndex: number | null;
  onSelectQuestion: (index: number | null) => void;
  onHoverQuestion: (index: number | null) => void;
  onUpdateQuestion: (index: number, updated: Partial<GradedQuestion>) => void;
  answerSheetUrl: string;
}

export const GradingScorecard: React.FC<GradingScorecardProps> = ({
  report,
  selectedQuestionIndex,
  hoveredQuestionIndex,
  onSelectQuestion,
  onHoverQuestion,
  onUpdateQuestion,
  answerSheetUrl,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'correct' | 'partial' | 'incorrect'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editFeedback, setEditFeedback] = useState<string>('');
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  // Load the answer sheet image for crop previews
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = answerSheetUrl;
    img.onload = () => setImageElement(img);
  }, [answerSheetUrl]);

  // Overall Score Calculation
  const totalScore = report.questions.reduce((acc, q) => acc + q.score_given, 0);
  const maxScore = report.questions.reduce((acc, q) => acc + q.max_score, 0) || 100;
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Status Counts
  const correctCount = report.questions.filter((q) => q.status === 'correct').length;
  const partialCount = report.questions.filter((q) => q.status === 'partial').length;
  const incorrectCount = report.questions.filter((q) => q.status === 'incorrect').length;

  // Letter Grade
  const getLetterGrade = (pct: number) => {
    if (pct >= 93) return { grade: 'A', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (pct >= 85) return { grade: 'B', color: 'text-indigo-400', bg: 'bg-indigo-500/20' };
    if (pct >= 75) return { grade: 'C', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (pct >= 65) return { grade: 'D', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { grade: 'F', color: 'text-rose-400', bg: 'bg-rose-500/20' };
  };

  const letter = getLetterGrade(percentage);

  const startEdit = (idx: number, q: GradedQuestion, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingIndex(idx);
    setEditScore(q.score_given);
    setEditFeedback(q.feedback);
  };

  const saveEdit = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const q = report.questions[idx];
    const newStatus: 'correct' | 'incorrect' | 'partial' =
      editScore >= q.max_score ? 'correct' : editScore > 0 ? 'partial' : 'incorrect';

    onUpdateQuestion(idx, {
      score_given: editScore,
      feedback: editFeedback,
      status: newStatus,
    });
    setEditingIndex(null);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingIndex(null);
  };

  const filteredQuestions = report.questions
    .map((q, idx) => ({ q, originalIndex: idx }))
    .filter(({ q }) => {
      if (filterStatus !== 'all' && q.status !== filterStatus) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const studentAns = q.student_answer_text || q.word_detections?.map((w) => w.text).join(' ') || '';
      return (
        q.question_number.toLowerCase().includes(term) ||
        q.question_text.toLowerCase().includes(term) ||
        studentAns.toLowerCase().includes(term) ||
        q.feedback.toLowerCase().includes(term)
      );
    });

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Top Score Banner */}
      <div className="p-4 bg-slate-950/90 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border border-slate-700/80 shadow-lg ${letter.bg} ${letter.color}`}
            >
              {letter.grade}
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-white">{totalScore}</span>
                <span className="text-xs text-slate-400 font-mono">/ {maxScore} pts</span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {percentage}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Automated Grade Assessment</p>
            </div>
          </div>

          {/* Status Breakdown Pills */}
          <div className="flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2 py-1 rounded-md transition-all ${
                filterStatus === 'all'
                  ? 'bg-slate-700 text-white font-medium'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              All ({report.questions.length})
            </button>
            <button
              onClick={() => setFilterStatus('correct')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all ${
                filterStatus === 'correct'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{correctCount}</span>
            </button>
            <button
              onClick={() => setFilterStatus('partial')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all ${
                filterStatus === 'partial'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'bg-amber-950/40 text-amber-400 hover:bg-amber-900/40'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{partialCount}</span>
            </button>
            <button
              onClick={() => setFilterStatus('incorrect')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all ${
                filterStatus === 'incorrect'
                  ? 'bg-rose-600 text-white font-medium'
                  : 'bg-rose-950/40 text-rose-400 hover:bg-rose-900/40'
              }`}
            >
              <XCircle className="w-3 h-3" />
              <span>{incorrectCount}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
          <div
            style={{ width: `${(totalScore / maxScore) * 100}%` }}
            className={`h-full transition-all duration-500 ${
              percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
          />
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions, answers, feedback..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Question Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No questions match filter criteria.
          </div>
        ) : (
          filteredQuestions.map(({ q, originalIndex }) => {
            const isSelected = selectedQuestionIndex === originalIndex;
            const isHovered = hoveredQuestionIndex === originalIndex;
            const isEditing = editingIndex === originalIndex;
            const box = q.box_2d || (q.word_detections && q.word_detections.length > 0 ? [
              Math.min(...q.word_detections.map((w) => w.box_2d[0])),
              Math.min(...q.word_detections.map((w) => w.box_2d[1])),
              Math.max(...q.word_detections.map((w) => w.box_2d[2])),
              Math.max(...q.word_detections.map((w) => w.box_2d[3])),
            ] : [0, 0, 0, 0]);
            const [ymin, xmin, ymax, xmax] = box;
            const studentText = q.student_answer_text || q.word_detections?.map((w) => w.text).join(' ') || '';

            const statusColors = {
              correct: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
              partial: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
              incorrect: 'bg-rose-500/10 border-rose-500/40 text-rose-400',
            }[q.status];

            const statusIcon = {
              correct: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
              partial: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
              incorrect: <XCircle className="w-4 h-4 text-rose-400 shrink-0" />,
            }[q.status];

            return (
              <div
                key={`q-card-${originalIndex}`}
                onClick={() => onSelectQuestion(isSelected ? null : originalIndex)}
                onMouseEnter={() => onHoverQuestion(originalIndex)}
                onMouseLeave={() => onHoverQuestion(null)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg'
                    : isHovered
                    ? 'bg-slate-800/60 border-slate-600'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60'
                }`}
              >
                {/* Header: Question Number, Status, Score, Actions */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      Q{q.question_number}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border capitalize flex items-center space-x-1 ${statusColors}`}>
                      {statusIcon}
                      <span>{q.status}</span>
                    </span>
                    {q.page_number && (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        Page {q.page_number}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {typeof q.confidence_score === 'number' && (
                      <span
                        className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${
                          q.confidence_score >= 95
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : q.confidence_score >= 85
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            : q.confidence_score >= 70
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                        title="Vision OCR Transcription Accuracy Confidence (0-100)"
                      >
                        {q.confidence_score}% OCR
                      </span>
                    )}

                    <span className="font-mono text-xs font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {q.score_given} / {q.max_score} pts
                    </span>

                    {!isEditing && (
                      <button
                        onClick={(e) => startEdit(originalIndex, q, e)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Teacher score override"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-xs text-slate-300 font-medium mb-2 leading-relaxed">
                  {q.question_text}
                </div>

                {/* Transcribed Student Answer with Handwritten Ink Crop */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 mb-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">OCR Transcribed Student Response:</span>
                    <span className="font-mono text-indigo-300">
                      box_2d: [{ymin}, {xmin}, {ymax}, {xmax}]
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 italic font-mono leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800">
                    "{studentText}"
                  </p>

                  {/* Word-level OCR Detection Tokens */}
                  {q.word_detections && q.word_detections.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[10px] font-medium text-slate-400 mb-1 flex items-center justify-between">
                        <span>Word-Level OCR Detections ({q.word_detections.length} words):</span>
                        <span className="text-[9px] text-slate-500 font-mono">scale: 0-1000 [y, x, y, x]</span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                        {q.word_detections.map((w, wIdx) => {
                          const confColor =
                            w.confidence_score >= 96
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : w.confidence_score >= 90
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30';
                          return (
                            <span
                              key={`word-tag-${wIdx}`}
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border inline-flex items-center space-x-1 ${confColor}`}
                              title={`box_2d: [${w.box_2d.join(', ')}] • Page: ${w.page_number}`}
                            >
                              <span className="font-medium text-slate-200">{w.text}</span>
                              <span className="opacity-75 text-[9px]">{w.confidence_score}%</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Crop Canvas of handwriting on sheet */}
                  <div className="h-14 w-full bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center relative mt-1.5">
                    <AnswerCropCanvas imageElement={imageElement} box_2d={box} />
                  </div>
                </div>

                {/* Expected Answer */}
                <div className="text-[11px] text-slate-400 mb-2 bg-slate-900/40 p-2 rounded border border-slate-800/50">
                  <span className="font-semibold text-slate-300">Expected Answer: </span>
                  <span className="text-slate-300">{q.expected_answer}</span>
                </div>

                {/* AI / Teacher Feedback */}
                {isEditing ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="p-2.5 bg-slate-900 rounded-lg border border-indigo-500/80 space-y-2 mt-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Teacher Override:</span>
                      <div className="flex items-center space-x-1.5">
                        <label className="text-xs text-slate-400">Score:</label>
                        <input
                          type="number"
                          min="0"
                          max={q.max_score}
                          value={editScore}
                          onChange={(e) => setEditScore(Number(e.target.value))}
                          className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-white"
                        />
                        <span className="text-xs text-slate-400">/ {q.max_score}</span>
                      </div>
                    </div>
                    <textarea
                      value={editFeedback}
                      onChange={(e) => setEditFeedback(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Add instructor comments / feedback..."
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={cancelEdit}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => saveEdit(originalIndex, e)}
                        className="flex items-center space-x-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                    <span className="font-semibold text-amber-400">Feedback: </span>
                    <span>{q.feedback}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Canvas subcomponent to render cropped slice of handwritten answer
const AnswerCropCanvas: React.FC<{
  imageElement: HTMLImageElement | null;
  box_2d: [number, number, number, number];
}> = ({ imageElement, box_2d }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imageElement) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [ymin, xmin, ymax, xmax] = box_2d;
    const imgW = imageElement.naturalWidth || 1000;
    const imgH = imageElement.naturalHeight || 1300;

    const sx = (xmin / 1000) * imgW;
    const sy = (ymin / 1000) * imgH;
    const sw = Math.max(1, ((xmax - xmin) / 1000) * imgW);
    const sh = Math.max(1, ((ymax - ymin) / 1000) * imgH);

    canvas.width = canvas.parentElement?.clientWidth || 300;
    canvas.height = canvas.parentElement?.clientHeight || 60;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padding = 2;
    ctx.drawImage(
      imageElement,
      sx,
      sy,
      sw,
      sh,
      padding,
      padding,
      canvas.width - padding * 2,
      canvas.height - padding * 2
    );
  }, [imageElement, box_2d]);

  return <canvas ref={canvasRef} className="w-full h-full object-contain" />;
};
