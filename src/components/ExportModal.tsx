import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, FileText, Image as ImageIcon, X, Check } from 'lucide-react';
import { DetectedWord } from '../types';

interface ExportModalProps {
  words: DetectedWord[];
  sourceImageUrl: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ words, sourceImageUrl, onClose }) => {
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

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

  const handleExportJson = () => {
    const jsonString = JSON.stringify(
      words.map((w) => ({
        text: w.text,
        box_2d: [w.box_2d[0], w.box_2d[1], w.box_2d[2], w.box_2d[3]],
      })),
      null,
      2
    );
    const blob = new Blob([jsonString], { type: 'application/json' });
    triggerDownload(blob, `handwriting-ocr-${Date.now()}.json`, 'JSON');
  };

  const handleExportCsv = () => {
    const header = 'index,text,ymin,xmin,ymax,xmax\n';
    const rows = words
      .map(
        (w, i) =>
          `${i + 1},"${w.text.replace(/"/g, '""')}",${w.box_2d[0]},${w.box_2d[1]},${w.box_2d[2]},${w.box_2d[3]}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    triggerDownload(blob, `handwriting-ocr-words-${Date.now()}.csv`, 'CSV');
  };

  const handleExportText = () => {
    const text = words.map((w) => w.text).join(' ');
    const blob = new Blob([text], { type: 'text/plain' });
    triggerDownload(blob, `handwriting-transcript-${Date.now()}.txt`, 'TXT');
  };

  const handleExportAnnotatedImage = async () => {
    setIsExportingImage(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = sourceImageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1000;
      canvas.height = img.naturalHeight || 680;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw bounding boxes on image
      words.forEach((w, idx) => {
        const [ymin, xmin, ymax, xmax] = w.box_2d;
        const x = (xmin / 1000) * canvas.width;
        const y = (ymin / 1000) * canvas.height;
        const width = ((xmax - xmin) / 1000) * canvas.width;
        const height = ((ymax - ymin) / 1000) * canvas.height;

        // Box border & fill
        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
        ctx.lineWidth = Math.max(2, canvas.width / 400);
        ctx.strokeRect(x, y, width, height);

        // Word tag pill
        const fontSize = Math.max(12, Math.round(canvas.height / 50));
        ctx.font = `600 ${fontSize}px sans-serif`;
        const textMetrics = ctx.measureText(w.text);
        const tagHeight = fontSize + 6;
        const tagWidth = textMetrics.width + 10;
        const tagY = Math.max(0, y - tagHeight);

        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(x, tagY, tagWidth, tagHeight);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(w.text, x + 5, tagY + fontSize);
      });

      canvas.toBlob((blob) => {
        if (blob) {
          triggerDownload(blob, `annotated-handwriting-${Date.now()}.png`, 'PNG');
        }
        setIsExportingImage(false);
      }, 'image/png');
    } catch (err) {
      console.error('Failed to export annotated image:', err);
      setIsExportingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export OCR & Detection Data</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Options */}
        <div className="p-5 space-y-3">
          {downloadSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Successfully exported {downloadSuccess} file!</span>
            </div>
          )}

          {/* JSON Export */}
          <button
            onClick={handleExportJson}
            className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/60 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-200 text-xs">Raw JSON Schema (.json)</div>
                <div className="text-[11px] text-slate-400 font-mono">Word[] with [ymin, xmin, ymax, xmax]</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
          </button>

          {/* Annotated Image */}
          <button
            onClick={handleExportAnnotatedImage}
            disabled={isExportingImage}
            className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/60 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-200 text-xs">Annotated Image (.png)</div>
                <div className="text-[11px] text-slate-400">High-res document with burned-in boundary boxes</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCsv}
            className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/60 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-200 text-xs">Coordinate Table (.csv)</div>
                <div className="text-[11px] text-slate-400">Excel / Sheets spreadsheet columns</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
          </button>

          {/* TXT Transcript */}
          <button
            onClick={handleExportText}
            className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/60 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-200 text-xs">Plain Transcript (.txt)</div>
                <div className="text-[11px] text-slate-400">Clean continuous transcription text</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
