import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  RotateCcw,
  Trash2,
  Sparkles,
  Palette,
  Check,
  CircleDot
} from 'lucide-react';

interface DrawingCanvasProps {
  onAnalyzeDrawing: (imageBase64: string) => void;
  isProcessing: boolean;
}

type PaperType = 'lined' | 'grid' | 'blank' | 'legal';

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onAnalyzeDrawing,
  isProcessing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [strokeColor, setStrokeColor] = useState<string>('#1e3a8a'); // Classic blue ink
  const [strokeWidth, setStrokeWidth] = useState<number>(3.5);
  const [paperType, setPaperType] = useState<PaperType>('legal');
  const [hasStrokes, setHasStrokes] = useState<boolean>(false);

  // Redraw paper background
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    if (paperType === 'legal') {
      // Yellow legal pad
      ctx.fillStyle = '#fef9c3';
      ctx.fillRect(0, 0, width, height);

      // Red vertical margin
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(80, 0);
      ctx.lineTo(80, height);
      ctx.stroke();

      // Blue ruled lines
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1;
      for (let y = 60; y < height; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (paperType === 'lined') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Blue lines
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      for (let y = 50; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (paperType === 'grid') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.8;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else {
      // Blank white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    canvas.width = 900;
    canvas.height = 550;
    drawBackground(ctx, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  useEffect(() => {
    initCanvas();
  }, [paperType]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setLastPoint(coords);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPoint = getCanvasCoords(e);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    setLastPoint(currentPoint);
    setHasStrokes(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const handleClear = () => {
    initCanvas();
  };

  const handleAnalyze = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    onAnalyzeDrawing(base64);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Canvas Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs gap-3">
        {/* Paper style selector */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Paper:</span>
          <select
            value={paperType}
            onChange={(e) => setPaperType(e.target.value as PaperType)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
          >
            <option value="legal">Legal Yellow Pad</option>
            <option value="lined">Standard Ruled</option>
            <option value="grid">Math / Graph Grid</option>
            <option value="blank">Blank White</option>
          </select>
        </div>

        {/* Ink Colors */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Ink:</span>
          <div className="flex items-center space-x-1.5">
            {[
              { label: 'Blue', color: '#1e3a8a' },
              { label: 'Black', color: '#0f172a' },
              { label: 'Crimson', color: '#991b1b' },
              { label: 'Emerald', color: '#065f46' },
            ].map((ink) => (
              <button
                key={ink.color}
                onClick={() => setStrokeColor(ink.color)}
                style={{ backgroundColor: ink.color }}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  strokeColor === ink.color ? 'ring-2 ring-white scale-110 border-white' : 'border-slate-600 opacity-80'
                }`}
                title={ink.label}
              />
            ))}
          </div>

          <span className="text-slate-500 mx-1">|</span>

          {/* Stroke Width */}
          <div className="flex items-center space-x-1">
            {[
              { size: 2.5, label: 'Fine' },
              { size: 4, label: 'Medium' },
              { size: 6, label: 'Bold' },
            ].map((pen) => (
              <button
                key={pen.size}
                onClick={() => setStrokeWidth(pen.size)}
                className={`px-2 py-0.5 rounded text-[11px] border ${
                  strokeWidth === pen.size
                    ? 'bg-indigo-600 border-indigo-500 text-white font-medium'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {pen.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClear}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleAnalyze}
            disabled={!hasStrokes || isProcessing}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium shadow-md transition-all ${
              !hasStrokes || isProcessing
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 hover:shadow-indigo-500/25'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isProcessing ? 'Grading...' : 'Grade Handwritten Answers'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Drawing Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-slate-950/60 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="border border-slate-700 rounded-lg shadow-2xl cursor-crosshair max-w-full max-h-[65vh] object-contain touch-none"
        />
      </div>

      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Handwrite answers (e.g. "Q1. F = 16 N", "Q2. KE = 160 kJ") on the pad</span>
        <span>Click "Grade Handwritten Answers" to test multi-input OCR and scoring</span>
      </div>
    </div>
  );
};
