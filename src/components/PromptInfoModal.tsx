import React, { useState } from 'react';
import { Terminal, Copy, Check, X, ShieldCheck, Box, Info, Sparkles, BookOpen } from 'lucide-react';

interface PromptInfoModalProps {
  onClose: () => void;
}

export const PromptInfoModal: React.FC<PromptInfoModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const exactSystemPrompt = `You are an expert Automated Grading and Vision OCR System.

You will receive two input documents:
1. Question Paper: Contains the exam questions.
2. Student Answer Sheet: Contains the handwritten student responses.

Your Task:
1. Analyze the Question Paper to independently determine the correct criteria and solutions for each question.
2. Perform Handwriting OCR on the Student Answer Sheet to transcribe responses and locate their position on the page.
3. Locate the precise bounding box (box_2d) of each handwritten response on the Student Answer Sheet.
4. Grade each response as "correct", "incorrect", or "partial". Provide concise feedback and point deduction reasons where applicable.
5. Assign a confidence score (0-100) representing your visual OCR transcription accuracy for each detected answer.

Return ONLY a valid JSON object matching this exact structure:
{
  "total_score": 85,
  "max_score": 100,
  "questions": [
    {
      "question_number": "1",
      "page_number": 1,
      "confidence_score": 95,
      "question_text": "Brief description of the question",
      "expected_answer": "Correct answer derived from Question Paper",
      "student_answer_text": "Transcribed handwritten answer or LaTeX equation",
      "status": "correct",
      "score_given": 10,
      "max_score": 10,
      "feedback": "Concise grading feedback",
      "box_2d": [ymin, xmin, ymax, xmax]
    }
  ]
}

Requirements:
- Normalize coordinates (box_2d) to an integer scale of 0 to 1000 [ymin, xmin, ymax, xmax] relative to the Student Answer Sheet image.
- "status" MUST strictly be one of: "correct", "incorrect", or "partial".
- Include "page_number" (1-indexed) indicating which page of the Student Answer Sheet the box_2d belongs to.
- Ensure every detected question response has a box_2d with valid non-zero integer coordinates.
- Output ONLY pure raw JSON. Absolute prohibition on markdown formatting (DO NOT use \`\`\`json or \`\`\`).`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exactSystemPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Automated Grading &amp; Handwriting OCR Prompt Specification</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold">
                <Box className="w-3.5 h-3.5" />
                <span>Two-Input Pipeline</span>
              </div>
              <p className="text-[11px] text-slate-400">
                1. Question Paper (source of truth)<br />
                2. Student Handwritten Answer Sheet
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Strict Evaluation</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Status enum: "correct" | "incorrect" | "partial", normalized 0-1000 box_2d coordinates
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini 3.8 Flash</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Multi-modal vision tokens with zero markdown fence raw JSON schema
              </p>
            </div>
          </div>

          {/* Exact System Prompt */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Production System Prompt &amp; Instructions:</span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>

            <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto select-text">
              {exactSystemPrompt}
            </pre>
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
