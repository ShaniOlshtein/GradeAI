import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Layers,
  Move,
  Info,
  CheckCircle2,
  Crosshair
} from 'lucide-react';
import { DetectedWord, ViewerSettings, BoxColorMode } from '../types';

interface DocumentViewerProps {
  imageUrl: string;
  words: DetectedWord[];
  selectedWordIndex: number | null;
  hoveredWordIndex: number | null;
  onSelectWord: (index: number | null) => void;
  onHoverWord: (index: number | null) => void;
  settings: ViewerSettings;
  onUpdateSettings: (settings: Partial<ViewerSettings>) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  imageUrl,
  words,
  selectedWordIndex,
  hoveredWordIndex,
  onSelectWord,
  onHoverWord,
  settings,
  onUpdateSettings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({ width: 1000, height: 680 });

  // Reset view on image change
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  }, [imageUrl]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalDimensions({
      width: img.naturalWidth || 1000,
      height: img.naturalHeight || 680,
    });
    setImageLoaded(true);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.25, 5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.25, 0.4));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary button
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.3, Math.min(5, prev * factor)));
  };

  // Color generator based on mode
  const getBoxColors = (index: number, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) {
      return {
        border: 'rgba(239, 68, 68, 1)', // Red focus
        fill: 'rgba(239, 68, 68, 0.28)',
        badge: 'bg-red-500 text-white',
        glow: 'shadow-[0_0_15px_rgba(239,68,68,0.7)]',
      };
    }
    if (isHovered) {
      return {
        border: 'rgba(234, 179, 8, 1)', // Yellow hover
        fill: 'rgba(234, 179, 8, 0.25)',
        badge: 'bg-yellow-400 text-slate-950 font-bold',
        glow: 'shadow-[0_0_12px_rgba(234,179,8,0.6)]',
      };
    }

    switch (settings.boxColorMode) {
      case 'rainbow': {
        const hue = (index * 42) % 360;
        return {
          border: `hsla(${hue}, 85%, 60%, 0.9)`,
          fill: `hsla(${hue}, 85%, 60%, ${settings.boxFillOpacity})`,
          badge: `bg-[hsl(${hue},85%,45%)] text-white`,
          glow: '',
        };
      }
      case 'emerald':
        return {
          border: 'rgba(16, 185, 129, 0.85)',
          fill: `rgba(16, 185, 129, ${settings.boxFillOpacity})`,
          badge: 'bg-emerald-600 text-white',
          glow: '',
        };
      case 'amber':
        return {
          border: 'rgba(245, 158, 11, 0.85)',
          fill: `rgba(245, 158, 11, ${settings.boxFillOpacity})`,
          badge: 'bg-amber-600 text-white',
          glow: '',
        };
      case 'cyan':
        return {
          border: 'rgba(6, 182, 212, 0.85)',
          fill: `rgba(6, 182, 212, ${settings.boxFillOpacity})`,
          badge: 'bg-cyan-600 text-white',
          glow: '',
        };
      case 'neon-indigo':
      default:
        return {
          border: 'rgba(99, 102, 241, 0.85)',
          fill: `rgba(99, 102, 241, ${settings.boxFillOpacity})`,
          badge: 'bg-indigo-600 text-white',
          glow: '',
        };
    }
  };

  // Image filter class
  const getFilterStyle = () => {
    switch (settings.filter) {
      case 'contrast':
        return 'contrast-150 brightness-95';
      case 'binarized':
        return 'contrast-200 grayscale brightness-110';
      case 'invert':
        return 'invert hue-rotate-180';
      case 'vintage':
        return 'sepia contrast-125 brightness-90';
      case 'normal':
      default:
        return '';
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs text-slate-300 gap-2 z-20">
        {/* Left: View & Zoom Tools */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="px-2 py-1 bg-slate-950/60 rounded-md font-mono text-[11px] text-slate-400 border border-slate-800">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Middle: Overlay Toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUpdateSettings({ showBoxes: !settings.showBoxes })}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              settings.showBoxes
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-medium'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
            }`}
            title="Toggle Bounding Boxes"
          >
            {settings.showBoxes ? <Eye className="w-3.5 h-3.5 text-indigo-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>Boxes ({words.length})</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ showLabels: !settings.showLabels })}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border transition-all ${
              settings.showLabels
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
            }`}
            title="Toggle Word Labels"
          >
            <span>Labels</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ showOrderLines: !settings.showOrderLines })}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border transition-all ${
              settings.showOrderLines
                ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
            }`}
            title="Toggle Reading Sequence Flow Lines"
          >
            <span>Flow</span>
          </button>
        </div>

        {/* Right: Color Scheme & Filter Selector */}
        <div className="flex items-center space-x-2">
          {/* Color Mode */}
          <select
            value={settings.boxColorMode}
            onChange={(e) => onUpdateSettings({ boxColorMode: e.target.value as BoxColorMode })}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="neon-indigo">Neon Indigo</option>
            <option value="rainbow">Rainbow Spectrum</option>
            <option value="emerald">Emerald</option>
            <option value="amber">Amber Gold</option>
            <option value="cyan">Cyan Laser</option>
          </select>

          {/* Filter */}
          <select
            value={settings.filter}
            onChange={(e) => onUpdateSettings({ filter: e.target.value as any })}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="normal">Normal</option>
            <option value="contrast">High Contrast</option>
            <option value="binarized">Binarized / Ink</option>
            <option value="invert">Inverted Dark</option>
            <option value="vintage">Vintage Warm</option>
          </select>
        </div>
      </div>

      {/* Viewport Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative flex-1 overflow-hidden cursor-${isDragging ? 'grabbing' : 'grab'} flex items-center justify-center p-4 bg-slate-950 select-none`}
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(51, 65, 85, 0.3) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Transform Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.08s ease-out',
          }}
          className="relative inline-block max-w-full max-h-full"
        >
          {/* Main Document Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Handwritten document"
            onLoad={handleImageLoad}
            draggable={false}
            className={`rounded-lg shadow-2xl block border border-slate-800 max-h-[72vh] object-contain transition-all duration-200 ${getFilterStyle()}`}
          />

          {/* Reading Order Connection Lines SVG */}
          {settings.showOrderLines && words.length > 1 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
            >
              {words.map((word, idx) => {
                if (idx === words.length - 1) return null;
                const nextWord = words[idx + 1];
                const [y1, x1, y2, x2] = word.box_2d;
                const [ny1, nx1, ny2, nx2] = nextWord.box_2d;
                const startX = (x1 + x2) / 2;
                const startY = (y1 + y2) / 2;
                const endX = (nx1 + nx2) / 2;
                const endY = (ny1 + ny2) / 2;

                return (
                  <g key={`flow-${idx}`}>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="rgba(6, 182, 212, 0.45)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <circle cx={startX} cy={startY} r="3" fill="#06b6d4" opacity="0.7" />
                  </g>
                );
              })}
            </svg>
          )}

          {/* Interactive Bounding Boxes Overlay */}
          {settings.showBoxes && (
            <div className="absolute inset-0 w-full h-full pointer-events-auto z-10">
              {words.map((word, index) => {
                const [ymin, xmin, ymax, xmax] = word.box_2d;
                const isHovered = hoveredWordIndex === index;
                const isSelected = selectedWordIndex === index;
                const colors = getBoxColors(index, isHovered, isSelected);

                // Coordinates normalized 0-1000 to percentages
                const top = `${ymin / 10}%`;
                const left = `${xmin / 10}%`;
                const width = `${Math.max(1, (xmax - xmin) / 10)}%`;
                const height = `${Math.max(1, (ymax - ymin) / 10)}%`;

                return (
                  <div
                    key={`word-box-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWord(isSelected ? null : index);
                    }}
                    onMouseEnter={() => onHoverWord(index)}
                    onMouseLeave={() => onHoverWord(null)}
                    style={{
                      top,
                      left,
                      width,
                      height,
                      borderColor: colors.border,
                      backgroundColor: colors.fill,
                    }}
                    className={`absolute cursor-pointer border rounded-[2px] transition-all duration-150 group ${
                      isSelected ? 'border-2 z-30' : isHovered ? 'border-2 z-20' : 'border z-10'
                    } ${colors.glow}`}
                  >
                    {/* Corner Crosshair Reticles for precision detection feel */}
                    {(isHovered || isSelected) && (
                      <>
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white pointer-events-none" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white pointer-events-none" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white pointer-events-none" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white pointer-events-none" />
                      </>
                    )}

                    {/* Transcribed Word Label Pill */}
                    {settings.showLabels && (
                      <div
                        className={`absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap shadow-md pointer-events-none flex items-center space-x-1 ${
                          colors.badge
                        } ${isHovered || isSelected ? 'scale-110 font-bold z-40' : 'opacity-85'}`}
                      >
                        <span className="font-mono text-[9px] opacity-75">#{index + 1}</span>
                        <span>{word.text}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hover / Selection Word Details Overlay (Bottom Floating HUD) */}
        {(hoveredWordIndex !== null || selectedWordIndex !== null) && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700/80 rounded-xl px-4 py-2 text-xs shadow-2xl backdrop-blur-md flex items-center space-x-4 z-30 animate-in fade-in slide-in-from-bottom-2">
            {(() => {
              const activeIndex = (hoveredWordIndex !== null ? hoveredWordIndex : selectedWordIndex)!;
              const word = words[activeIndex];
              if (!word) return null;
              const [ymin, xmin, ymax, xmax] = word.box_2d;
              const boxW = xmax - xmin;
              const boxH = ymax - ymin;

              return (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-400 font-mono">Word #{activeIndex + 1}:</span>
                    <span className="text-white font-semibold text-sm bg-slate-800 px-2 py-0.5 rounded">
                      "{word.text}"
                    </span>
                  </div>

                  <div className="h-4 w-px bg-slate-700" />

                  <div className="flex items-center space-x-2 text-slate-300 font-mono text-[11px]">
                    <span className="text-slate-500">box_2d:</span>
                    <span className="text-indigo-400">[{ymin}, {xmin}, {ymax}, {xmax}]</span>
                  </div>

                  <div className="h-4 w-px bg-slate-700" />

                  <div className="text-slate-400 font-mono text-[11px]">
                    dim: <span className="text-slate-200">{boxW}×{boxH}</span>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/90 border-t border-slate-800/80 text-[11px] text-slate-400 z-20">
        <div className="flex items-center space-x-3">
          <span>Detected Words: <strong className="text-slate-200">{words.length}</strong></span>
          <span>•</span>
          <span>Intrinsic Canvas: <strong className="text-slate-200">{naturalDimensions.width} × {naturalDimensions.height} px</strong></span>
          <span>•</span>
          <span>Normalized Scale: <strong className="text-indigo-400">0 - 1000</strong></span>
        </div>
        <div className="flex items-center space-x-2 text-slate-500">
          <span>Click word to inspect</span>
          <span>•</span>
          <span>Drag to pan</span>
          <span>•</span>
          <span>Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
};
