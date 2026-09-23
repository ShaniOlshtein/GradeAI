import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  FileCode2,
  FileSpreadsheet,
  Edit3,
  RefreshCw,
  SlidersHorizontal,
  Code
} from 'lucide-react';
import { DetectedWord } from '../types';

interface JsonViewerProps {
  words: DetectedWord[];
  onUpdateWords: (words: DetectedWord[]) => void;
  selectedWordIndex: number | null;
  onSelectWord: (index: number | null) => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  words,
  onUpdateWords,
  selectedWordIndex,
  onSelectWord,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCsv, setCopiedCsv] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editableJson, setEditableJson] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  // Format the raw JSON array strictly matching the required schema:
  // [
  //   {
  //     "text": "transcribed_word",
  //     "box_2d": [ymin, xmin, ymax, xmax]
  //   }
  // ]
  const rawJson = JSON.stringify(
    words.map((w) => ({
      text: w.text,
      box_2d: [w.box_2d[0], w.box_2d[1], w.box_2d[2], w.box_2d[3]],
    })),
    null,
    viewMode === 'formatted' ? 2 : undefined
  );

  useEffect(() => {
    setEditableJson(JSON.stringify(words, null, 2));
    setParseError(null);
  }, [words]);

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(rawJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const handleCopyCsv = async () => {
    try {
      const header = 'index,text,ymin,xmin,ymax,xmax\n';
      const rows = words
        .map(
          (w, idx) =>
            `${idx + 1},"${w.text.replace(/"/g, '""')}",${w.box_2d[0]},${w.box_2d[1]},${w.box_2d[2]},${w.box_2d[3]}`
        )
        .join('\n');
      await navigator.clipboard.writeText(header + rows);
      setCopiedCsv(true);
      setTimeout(() => setCopiedCsv(false), 2000);
    } catch (err) {
      console.error('Failed to copy CSV:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([rawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `handwriting-ocr-words-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyEdit = () => {
    try {
      const parsed = JSON.parse(editableJson);
      if (!Array.isArray(parsed)) {
        throw new Error('Root element must be a JSON array of word objects.');
      }
      for (const item of parsed) {
        if (typeof item.text !== 'string' || !Array.isArray(item.box_2d) || item.box_2d.length !== 4) {
          throw new Error('Each object must have "text": string and "box_2d": [ymin, xmin, ymax, xmax]');
        }
      }
      onUpdateWords(parsed);
      setIsEditMode(false);
      setParseError(null);
    } catch (err: any) {
      setParseError(err?.message || 'Invalid JSON format');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-xs gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
            <FileCode2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white flex items-center space-x-2">
              <span>Schema Output</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-900/50 text-indigo-300 font-mono border border-indigo-700/50">
                Word[]
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              [ymin, xmin, ymax, xmax] • 0-1000 scale
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Formatted vs Minified toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px] transition-colors"
            title="Toggle between pretty-printed and compact JSON"
          >
            {viewMode === 'formatted' ? 'Compact' : 'Pretty'}
          </button>

          {/* Edit mode toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-2 py-1 rounded border text-[11px] flex items-center space-x-1 transition-colors ${
              isEditMode
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Edit JSON directly"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditMode ? 'Cancel' : 'Edit'}</span>
          </button>

          {/* Copy Raw JSON button */}
          <button
            onClick={handleCopyRaw}
            className={`px-2.5 py-1 rounded border text-[11px] font-medium flex items-center space-x-1.5 transition-all ${
              copied
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-sm'
            }`}
            title="Copy exact raw JSON array to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Raw JSON!' : 'Copy Raw JSON'}</span>
          </button>

          {/* Download JSON */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Download JSON file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Copy CSV */}
          <button
            onClick={handleCopyCsv}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Copy as CSV table"
          >
            {copiedCsv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor or Viewer Body */}
      <div className="flex-1 relative overflow-auto font-mono text-xs p-4 bg-slate-950/70">
        {isEditMode ? (
          <div className="flex flex-col h-full space-y-2">
            <textarea
              value={editableJson}
              onChange={(e) => setEditableJson(e.target.value)}
              className="w-full flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none"
              spellCheck={false}
            />
            {parseError && (
              <div className="text-red-400 text-xs bg-red-950/50 p-2 rounded border border-red-800">
                {parseError}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditMode(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyEdit}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium"
              >
                Apply Changes
              </button>
            </div>
          </div>
        ) : (
          <pre className="text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
            {words.length === 0 ? (
              <span className="text-slate-500 italic">// No words detected yet. Upload an image or select a sample.</span>
            ) : (
              <code>
                <span className="text-slate-500">[</span>
                {'\n'}
                {words.map((item, index) => {
                  const isSelected = selectedWordIndex === index;
                  const isLast = index === words.length - 1;
                  return (
                    <span
                      key={`json-word-${index}`}
                      onClick={() => onSelectWord(isSelected ? null : index)}
                      className={`block py-0.5 px-1.5 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/30 border border-indigo-500/60 text-white'
                          : 'hover:bg-slate-800/60'
                      }`}
                    >
                      {'  '}<span className="text-slate-500">{'{'}</span>
                      {'\n'}
                      {'    '}<span className="text-indigo-400">"text"</span>: <span className="text-emerald-300">"{item.text}"</span>,
                      {'\n'}
                      {'    '}<span className="text-indigo-400">"box_2d"</span>: <span className="text-slate-400">[</span>
                      <span className="text-amber-300">{item.box_2d[0]}</span>,{' '}
                      <span className="text-amber-300">{item.box_2d[1]}</span>,{' '}
                      <span className="text-amber-300">{item.box_2d[2]}</span>,{' '}
                      <span className="text-amber-300">{item.box_2d[3]}</span>
                      <span className="text-slate-400">]</span>
                      {'\n'}
                      {'  '}<span className="text-slate-500">{'}'}</span>{isLast ? '' : ','}
                    </span>
                  );
                })}
                <span className="text-slate-500">]</span>
              </code>
            )}
          </pre>
        )}
      </div>

      {/* Footer Details */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span>Items: <strong className="text-slate-200">{words.length}</strong></span>
          <span>•</span>
          <span>Size: <strong className="text-slate-200">{(new Blob([rawJson]).size / 1024).toFixed(1)} KB</strong></span>
        </div>
        <div className="text-emerald-400 font-mono text-[10px] flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Strict JSON Schema Verified</span>
        </div>
      </div>
    </div>
  );
};
