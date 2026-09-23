import React, { useState, useRef } from 'react';
import {
  Upload,
  FileQuestion,
  FileCheck2,
  X,
  Sparkles,
  Camera,
  PenTool,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface UploadExamModalProps {
  onGradeCustomExam: (
    questionPaperBase64: string,
    answerSheetBase64: string,
    examTitle: string,
    studentName: string
  ) => void;
  onOpenSketchpad: () => void;
  onClose: () => void;
  isProcessing: boolean;
}

export const UploadExamModal: React.FC<UploadExamModalProps> = ({
  onGradeCustomExam,
  onOpenSketchpad,
  onClose,
  isProcessing,
}) => {
  const [questionPaperUrl, setQuestionPaperUrl] = useState<string | null>(null);
  const [answerSheetUrl, setAnswerSheetUrl] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState<string>('Custom Exam Assessment');
  const [studentName, setStudentName] = useState<string>('Student Submission');
  const [validationError, setValidationError] = useState<string | null>(null);

  const questionInputRef = useRef<HTMLInputElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  const handleQuestionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setQuestionPaperUrl(event.target?.result as string);
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnswerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAnswerSheetUrl(event.target?.result as string);
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!questionPaperUrl) {
      setValidationError('Please upload or provide the Question Paper image.');
      return;
    }
    if (!answerSheetUrl) {
      setValidationError('Please upload or provide the Student Answer Sheet image.');
      return;
    }
    onGradeCustomExam(questionPaperUrl, answerSheetUrl, examTitle, studentName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Upload New Exam for Automated Grading</span>
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
          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Exam / Course Title</label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g. Physics Midterm Exam"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Student Name / ID</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Two Input Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input 1: Question Paper */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center space-x-2 text-white font-semibold mb-1">
                  <FileQuestion className="w-4 h-4 text-indigo-400" />
                  <span>Input 1: Question Paper</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The original exam document with question prompts, formulas, and point allocations.
                </p>
              </div>

              {questionPaperUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black max-h-40 flex items-center justify-center">
                  <img src={questionPaperUrl} alt="Question Paper Preview" className="max-h-40 object-contain" />
                  <button
                    onClick={() => setQuestionPaperUrl(null)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Attached</span>
                  </span>
                </div>
              ) : (
                <div
                  onClick={() => questionInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-slate-900/50"
                >
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <span className="font-semibold text-slate-200 block">Click to Upload Question Paper</span>
                  <span className="text-[10px] text-slate-500">PNG, JPG, WEBP</span>
                </div>
              )}
              <input
                ref={questionInputRef}
                type="file"
                accept="image/*"
                onChange={handleQuestionUpload}
                className="hidden"
              />
            </div>

            {/* Input 2: Student Answer Sheet */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center space-x-2 text-white font-semibold mb-1">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Input 2: Student Answer Sheet</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The handwritten response sheet submitted by the student to transcribe and grade.
                </p>
              </div>

              {answerSheetUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black max-h-40 flex items-center justify-center">
                  <img src={answerSheetUrl} alt="Answer Sheet Preview" className="max-h-40 object-contain" />
                  <button
                    onClick={() => setAnswerSheetUrl(null)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Attached</span>
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    onClick={() => answerInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-emerald-500/80 rounded-xl p-5 text-center cursor-pointer transition-all hover:bg-slate-900/50"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <span className="font-semibold text-slate-200 block">Click to Upload Answer Sheet</span>
                    <span className="text-[10px] text-slate-500">Handwritten scan or photo</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSketchpad();
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <PenTool className="w-3.5 h-3.5 text-amber-400" />
                    <span>Or Handwrite Answers on Digital Pad</span>
                  </button>
                </div>
              )}
              <input
                ref={answerInputRef}
                type="file"
                accept="image/*"
                onChange={handleAnswerUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Powered by Gemini 3.8 Flash multi-modal reasoning &amp; OCR
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex items-center space-x-1.5 px-5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isProcessing ? 'Grading & Locating Answers...' : 'Run Automated Grading'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
