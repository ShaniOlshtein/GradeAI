import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';
import { GradingReport } from '../types';

interface GradingJsonViewerProps {
  report: GradingReport;
  selectedQuestionIndex: number | null;
  onSelectQuestion: (index: number | null) => void;
}

export const GradingJsonViewer: React.FC<GradingJsonViewerProps> = ({
  report,
  selectedQuestionIndex,
  onSelectQuestion,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isCompact, setIsCompact] = useState<boolean>(false);

  // Construct the exact pure JSON structure specified by the system prompt
  const pureJsonData = {
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
      word_detections: (q.word_detections || []).map((w) => ({
        text: w.text,
        confidence_score: w.confidence_score,
        page_number: w.page_number,
        box_2d: w.box_2d,
      })),
    })),
  };

  const jsonString = isCompact
    ? JSON.stringify(pureJsonData)
    : JSON.stringify(pureJsonData, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grading-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 text-xs shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white flex items-center space-x-1.5">
              <span>Raw JSON Grading Output</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Valid Schema
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Total Questions: {report.questions.length} • Score: {report.total_score}/{report.max_score}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Format Toggle */}
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
          >
            {isCompact ? 'Pretty Print' : 'Compact'}
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.json</span>
          </button>
        </div>
      </div>

      {/* Verification Badges */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px] shrink-0">
        <span className="flex items-center space-x-1 text-emerald-400 font-mono">
          <ShieldCheck className="w-3 h-3" />
          <span>word_detections: box_2d [ymin, xmin, ymax, xmax] (0-1000)</span>
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center space-x-1 text-cyan-400 font-mono">
          <span>confidence_score (0-100)</span>
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center space-x-1 text-indigo-400 font-mono">
          <span>status: "correct" | "incorrect" | "partial"</span>
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center space-x-1 text-purple-400 font-mono">
          <span>Pure Raw JSON (No Markdown)</span>
        </span>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs leading-relaxed select-text">
        <pre className="text-slate-300">
          <code>{jsonString}</code>
        </pre>
      </div>

      {/* Footer Instructions */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
        <span>Clean JSON ready for LMS integration or grading database</span>
        <span className="font-mono text-slate-400">Byte size: ~{new Blob([jsonString]).size} bytes</span>
      </div>
    </div>
  );
};
