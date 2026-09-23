import React, { useState } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  X,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  Printer
} from 'lucide-react';
import { GradingReport, GradedQuestion } from '../types';

interface TeacherReportModalProps {
  report: GradingReport;
  examTitle: string;
  studentName: string;
  answerSheetUrl: string;
  onClose: () => void;
}

export const TeacherReportModal: React.FC<TeacherReportModalProps> = ({
  report,
  examTitle,
  studentName,
  answerSheetUrl,
  onClose,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);

  const totalScore = report.questions.reduce((acc, q) => acc + q.score_given, 0);
  const maxScore = report.questions.reduce((acc, q) => acc + q.max_score, 0) || 100;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const triggerDownload = (blob: Blob, filename: string, type: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(type);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handleExportCsv = () => {
    const header = 'Question,Page,OCR Confidence (%),Max Score,Score Given,Status,Student Answer,Expected Answer,Feedback,Box_2D\n';
    const rows = report.questions
      .map((q) => {
        const studentAns = q.student_answer_text || q.word_detections?.map((w) => w.text).join(' ') || '';
        const box = q.box_2d || (q.word_detections && q.word_detections.length > 0 ? [
          Math.min(...q.word_detections.map((w) => w.box_2d[0])),
          Math.min(...q.word_detections.map((w) => w.box_2d[1])),
          Math.max(...q.word_detections.map((w) => w.box_2d[2])),
          Math.max(...q.word_detections.map((w) => w.box_2d[3])),
        ] : [0, 0, 0, 0]);
        return `"${q.question_number}","${q.page_number || 1}","${q.confidence_score ?? 95}","${q.max_score}","${q.score_given}","${q.status}","${studentAns.replace(
          /"/g,
          '""'
        )}","${q.expected_answer.replace(/"/g, '""')}","${q.feedback.replace(/"/g, '""')}","[${box.join(
          ','
        )}]"`;
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    triggerDownload(blob, `${studentName.replace(/\s+/g, '_')}_grades_${Date.now()}.csv`, 'CSV');
  };

  const handleExportAnnotatedSheet = async () => {
    setIsExportingImage(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = answerSheetUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1000;
      canvas.height = img.naturalHeight || 1300;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      // Draw original answer sheet
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw each question's bounding box and score mark
      report.questions.forEach((q) => {
        const box = q.box_2d || (q.word_detections && q.word_detections.length > 0 ? [
          Math.min(...q.word_detections.map((w) => w.box_2d[0])),
          Math.min(...q.word_detections.map((w) => w.box_2d[1])),
          Math.max(...q.word_detections.map((w) => w.box_2d[2])),
          Math.max(...q.word_detections.map((w) => w.box_2d[3])),
        ] : [0, 0, 0, 0]);
        const [ymin, xmin, ymax, xmax] = box;
        const x = (xmin / 1000) * canvas.width;
        const y = (ymin / 1000) * canvas.height;
        const w = ((xmax - xmin) / 1000) * canvas.width;
        const h = ((ymax - ymin) / 1000) * canvas.height;

        let strokeColor = '#10b981';
        let fillColor = 'rgba(16, 185, 129, 0.12)';
        let markText = `✔ Q${q.question_number}: +${q.score_given}/${q.max_score}`;

        if (q.status === 'partial') {
          strokeColor = '#f59e0b';
          fillColor = 'rgba(245, 158, 11, 0.12)';
          markText = `▲ Q${q.question_number}: +${q.score_given}/${q.max_score}`;
        } else if (q.status === 'incorrect') {
          strokeColor = '#ef4444';
          fillColor = 'rgba(239, 68, 68, 0.12)';
          markText = `✘ Q${q.question_number}: 0/${q.max_score}`;
        }

        // Box
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(3, canvas.width / 300);
        ctx.strokeRect(x, y, w, h);

        // Header score banner
        const fontSize = Math.max(14, Math.round(canvas.height / 70));
        ctx.font = `bold ${fontSize}px sans-serif`;
        const textMetrics = ctx.measureText(markText);
        const tagHeight = fontSize + 8;
        const tagWidth = textMetrics.width + 12;
        const tagY = Math.max(0, y - tagHeight);

        ctx.fillStyle = strokeColor;
        ctx.fillRect(x, tagY, tagWidth, tagHeight);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(markText, x + 6, tagY + fontSize);
      });

      // Overall Score Stamp on top right
      const stampX = canvas.width - 240;
      const stampY = 40;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(stampX, stampY, 200, 70);
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.strokeRect(stampX, stampY, 200, 70);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('FINAL SCORE:', stampX + 15, stampY + 28);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`${totalScore} / ${maxScore} (${percentage}%)`, stampX + 15, stampY + 58);

      canvas.toBlob((blob) => {
        if (blob) {
          triggerDownload(blob, `graded_${studentName.replace(/\s+/g, '_')}_${Date.now()}.png`, 'Annotated Sheet');
        }
        setIsExportingImage(false);
      }, 'image/png');
    } catch (err) {
      console.error('Export annotated image failed:', err);
      setIsExportingImage(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Official Teacher Grade Report &amp; Transcript</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {downloadSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Exported {downloadSuccess} successfully!</span>
            </div>
          )}

          {/* Exam Summary Banner */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">{examTitle}</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Student: <strong className="text-slate-200">{studentName}</strong> • Date: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {totalScore} / {maxScore}
              </div>
              <div className="text-[11px] text-slate-400">Total Percentage: {percentage}%</div>
            </div>
          </div>

          {/* Question Breakdown Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="p-2.5">Q#</th>
                  <th className="p-2.5">Page</th>
                  <th className="p-2.5">OCR Conf.</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Score</th>
                  <th className="p-2.5">Transcribed Student Answer</th>
                  <th className="p-2.5">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {report.questions.map((q) => (
                  <tr key={q.question_number} className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-bold text-white">Q{q.question_number}</td>
                    <td className="p-2.5 text-slate-400 font-mono text-[11px]">Pg {q.page_number || 1}</td>
                    <td className="p-2.5 font-mono text-[11px] text-indigo-400">
                      {q.confidence_score ?? 95}%
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                          q.status === 'correct'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : q.status === 'partial'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold">
                      {q.score_given} / {q.max_score}
                    </td>
                    <td className="p-2.5 max-w-xs truncate italic text-slate-300" title={q.student_answer_text}>
                      "{q.student_answer_text}"
                    </td>
                    <td className="p-2.5 text-slate-400">{q.feedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleExportAnnotatedSheet}
              disabled={isExportingImage}
              className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/60 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Graded Sheet Image (.png)</div>
                  <div className="text-[11px] text-slate-400">Burned-in marks, bounding boxes &amp; scores</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
            </button>

            <button
              onClick={handleExportCsv}
              className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/60 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Gradebook Export (.csv)</div>
                  <div className="text-[11px] text-slate-400">Scores, answers &amp; box_2d coordinates</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
