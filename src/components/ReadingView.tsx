import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  AlignLeft,
  Clock,
  Type,
  Play,
  Square
} from 'lucide-react';
import { DetectedWord } from '../types';

interface ReadingViewProps {
  words: DetectedWord[];
  selectedWordIndex: number | null;
  hoveredWordIndex: number | null;
  onSelectWord: (index: number | null) => void;
  onHoverWord: (index: number | null) => void;
}

export const ReadingView: React.FC<ReadingViewProps> = ({
  words,
  selectedWordIndex,
  hoveredWordIndex,
  onSelectWord,
  onHoverWord,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [readingWordIndex, setReadingWordIndex] = useState<number | null>(null);

  // Group words into lines based on vertical overlap / proximity of ymin
  const lines: { word: DetectedWord; originalIndex: number }[][] = [];

  if (words.length > 0) {
    // Sort words primarily by vertical position with a vertical tolerance, then xmin
    const indexedWords = words.map((w, i) => ({ word: w, originalIndex: i }));
    
    // Sort by y center
    const sorted = [...indexedWords].sort((a, b) => {
      const aYCenter = (a.word.box_2d[0] + a.word.box_2d[2]) / 2;
      const bYCenter = (b.word.box_2d[0] + b.word.box_2d[2]) / 2;
      const aHeight = a.word.box_2d[2] - a.word.box_2d[0];
      const threshold = Math.max(15, aHeight * 0.45);

      if (Math.abs(aYCenter - bYCenter) < threshold) {
        return a.word.box_2d[1] - b.word.box_2d[1]; // Same line, sort left-to-right
      }
      return aYCenter - bYCenter; // Different lines, sort top-to-bottom
    });

    let currentLine: { word: DetectedWord; originalIndex: number }[] = [];
    let currentLineY = -1;

    for (const item of sorted) {
      const yCenter = (item.word.box_2d[0] + item.word.box_2d[2]) / 2;
      const height = item.word.box_2d[2] - item.word.box_2d[0];
      const threshold = Math.max(18, height * 0.5);

      if (currentLineY === -1 || Math.abs(yCenter - currentLineY) < threshold) {
        currentLine.push(item);
        if (currentLineY === -1) currentLineY = yCenter;
      } else {
        // Sort line items left to right
        currentLine.sort((a, b) => a.word.box_2d[1] - b.word.box_2d[1]);
        lines.push(currentLine);
        currentLine = [item];
        currentLineY = yCenter;
      }
    }
    if (currentLine.length > 0) {
      currentLine.sort((a, b) => a.word.box_2d[1] - b.word.box_2d[1]);
      lines.push(currentLine);
    }
  }

  // Full raw text reconstructed
  const fullText = words.map((w) => w.text).join(' ');

  const handleCopyFullText = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy full text:', err);
    }
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setReadingWordIndex(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = 0.95;

      utterance.onboundary = (e) => {
        if (e.name === 'word') {
          // Approximate current word
          const charIndex = e.charIndex;
          let runningChars = 0;
          for (let i = 0; i < words.length; i++) {
            runningChars += words[i].text.length + 1;
            if (runningChars >= charIndex) {
              setReadingWordIndex(i);
              break;
            }
          }
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setReadingWordIndex(null);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setReadingWordIndex(null);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const readingTimeSeconds = Math.max(1, Math.round((words.length / 180) * 60));

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
            <AlignLeft className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white">Synthesized Reading Flow</div>
            <div className="text-[11px] text-slate-400">
              Interactive document transcript with speech synthesis
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleSpeech}
            disabled={words.length === 0}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-all ${
              isPlaying
                ? 'bg-amber-600 border-amber-500 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isPlaying ? 'Stop TTS' : 'Read Aloud'}</span>
          </button>

          <button
            onClick={handleCopyFullText}
            disabled={words.length === 0}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      {/* Reconstructed Document Body */}
      <div className="flex-1 overflow-y-auto p-5 text-slate-200 text-sm leading-relaxed space-y-4">
        {words.length === 0 ? (
          <div className="text-slate-500 text-center py-12 italic text-xs">
            No words available to read.
          </div>
        ) : (
          lines.map((line, lineIdx) => (
            <div key={`line-${lineIdx}`} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
              {line.map(({ word, originalIndex }) => {
                const isSelected = selectedWordIndex === originalIndex;
                const isHovered = hoveredWordIndex === originalIndex;
                const isSpeaking = readingWordIndex === originalIndex;

                return (
                  <span
                    key={`read-word-${originalIndex}`}
                    onClick={() => onSelectWord(isSelected ? null : originalIndex)}
                    onMouseEnter={() => onHoverWord(originalIndex)}
                    onMouseLeave={() => onHoverWord(null)}
                    className={`cursor-pointer px-1 py-0.5 rounded transition-all select-text ${
                      isSpeaking
                        ? 'bg-amber-500 text-slate-950 font-bold scale-105 shadow-md'
                        : isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : isHovered
                        ? 'bg-yellow-400/30 text-yellow-200 ring-1 ring-yellow-400'
                        : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    {word.text}
                  </span>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer statistics */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <Type className="w-3 h-3 text-slate-500" />
            <span>Words: <strong className="text-slate-200">{words.length}</strong></span>
          </span>
          <span>•</span>
          <span>Characters: <strong className="text-slate-200">{fullText.length}</strong></span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Reading time: ~{readingTimeSeconds}s</span>
        </div>
      </div>
    </div>
  );
};
