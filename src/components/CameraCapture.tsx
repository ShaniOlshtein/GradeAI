import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Sparkles, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Rear camera preferred on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setError(err?.message || 'Unable to access camera. Please allow camera permissions.');
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <Camera className="w-4 h-4 text-indigo-400" />
            <span>Document Camera Capture</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Captured Preview */}
        <div className="relative flex-1 min-h-[380px] bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-center p-6 space-y-3">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <p className="text-slate-300 text-sm max-w-sm">{error}</p>
              <p className="text-slate-500 text-xs">
                Ensure camera permissions are granted in your browser settings.
              </p>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured handwriting" className="max-h-[60vh] object-contain" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
              {/* Document Framing Guidelines */}
              <div className="absolute inset-8 border-2 border-dashed border-indigo-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-4">
                <span className="text-[11px] text-indigo-300 font-mono bg-slate-950/70 px-2 py-0.5 rounded self-start">
                  Align handwritten note inside frame
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {capturedImage ? 'Review photo before analyzing' : 'Hold document steady in good lighting'}
          </div>

          <div className="flex items-center space-x-3">
            {capturedImage ? (
              <>
                <button
                  onClick={handleRetake}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Handwriting</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleTakePhoto}
                disabled={Boolean(error)}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Snapshot</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
