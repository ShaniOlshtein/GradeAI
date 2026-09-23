import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Volume2,
  Edit2,
  Check,
  X,
  Target,
  ArrowUpDown,
  Filter,
  Sparkles,
  Maximize
} from 'lucide-react';
import { DetectedWord } from '../types';

interface WordListExplorerProps {
  words: DetectedWord[];
  sourceImageUrl: string;
  selectedWordIndex: number | null;
  hoveredWordIndex: number | null;
  onSelectWord: (index: number | null) => void;
  onHoverWord: (index: number | null) => void;
  onUpdateWordText: (index: number, newText: string) => void;
}

export const WordListExplorer: React.FC<WordListExplorerProps> = ({
  words,
  sourceImageUrl,
  selectedWordIndex,
  hoveredWordIndex,
  onSelectWord,
  onHoverWord,
  onUpdateWordText,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  // Load the source image into an offscreen element for canvas crop extraction
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceImageUrl;
    img.onload = () => setImageElement(img);
  }, [sourceImageUrl]);

  const handleStartEdit = (index: number, currentText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingIndex(index);
    setEditText(currentText);
  };

  const handleSaveEdit = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editText.trim().length > 0) {
      onUpdateWordText(index, editText.trim());
    }
    setEditingIndex(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingIndex(null);
  };

  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filter words by search term
  const filteredWords = words
    .map((word, originalIndex) => ({ word, originalIndex }))
    .filter(({ word, originalIndex }) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        word.text.toLowerCase().includes(term) ||
        (originalIndex + 1).toString().includes(term)
      );
    });

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Top Search & Filter Bar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search detected words..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="text-xs text-slate-400 font-mono px-2 py-1 bg-slate-800/80 rounded-md border border-slate-700">
          {filteredWords.length} / {words.length}
        </div>
      </div>

      {/* Words Grid / List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredWords.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No words match "{searchTerm}"
          </div>
        ) : (
          filteredWords.map(({ word, originalIndex }) => {
            const isSelected = selectedWordIndex === originalIndex;
            const isHovered = hoveredWordIndex === originalIndex;
            const [ymin, xmin, ymax, xmax] = word.box_2d;
            const width = xmax - xmin;
            const height = ymax - ymin;

            return (
              <div
                key={`word-item-${originalIndex}`}
                onClick={() => onSelectWord(isSelected ? null : originalIndex)}
                onMouseEnter={() => onHoverWord(originalIndex)}
                onMouseLeave={() => onHoverWord(null)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500 shadow-md'
                    : isHovered
                    ? 'bg-slate-800/80 border-slate-600'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Left: Index badge and Word */}
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                      #{originalIndex + 1}
                    </span>

                    {editingIndex === originalIndex ? (
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(originalIndex, e as any);
                            if (e.key === 'Escape') handleCancelEdit(e as any);
                          }}
                        />
                        <button
                          onClick={(e) => handleSaveEdit(originalIndex, e)}
                          className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-semibold text-sm text-slate-100 truncate">
                        {word.text}
                      </span>
                    )}
                  </div>

                  {/* Actions (TTS, Edit, Focus) */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={(e) => handleSpeak(word.text, e)}
                      className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                      title="Pronounce word aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    {editingIndex !== originalIndex && (
                      <button
                        onClick={(e) => handleStartEdit(originalIndex, word.text, e)}
                        className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                        title="Edit transcription"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Crop Preview of the handwritten ink */}
                <div className="mt-2 flex items-center space-x-3">
                  <div className="h-9 w-24 bg-slate-900 rounded border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 relative">
                    <WordCropCanvas
                      imageElement={imageElement}
                      box_2d={word.box_2d}
                    />
                  </div>

                  {/* Coordinates pill */}
                  <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                    <div>
                      <span className="text-slate-500">box_2d: </span>
                      <span className="text-indigo-300">[{ymin}, {xmin}, {ymax}, {xmax}]</span>
                    </div>
                    <div>
                      <span className="text-slate-500">size: </span>
                      <span className="text-slate-300">{width} × {height}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Sub-component to render cropped slice of handwritten word
const WordCropCanvas: React.FC<{
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
    const imgH = imageElement.naturalHeight || 680;

    // Convert normalized 0-1000 scale to pixel source coordinates
    const sx = (xmin / 1000) * imgW;
    const sy = (ymin / 1000) * imgH;
    const sw = Math.max(1, ((xmax - xmin) / 1000) * imgW);
    const sh = Math.max(1, ((ymax - ymin) / 1000) * imgH);

    canvas.width = canvas.parentElement?.clientWidth || 96;
    canvas.height = canvas.parentElement?.clientHeight || 36;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw cropped region scaled to fit canvas with padding
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
