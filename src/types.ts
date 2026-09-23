export interface WordDetection {
  text: string;
  confidence_score: number; // 0-100 OCR transcription accuracy
  page_number: number;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0 to 1000
}

export interface DetectedWord {
  text: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0 to 1000
}

export interface GradedQuestion {
  question_number: string;
  question_text: string;
  expected_answer: string;
  status: 'correct' | 'incorrect' | 'partial';
  score_given: number;
  max_score: number;
  feedback: string;
  word_detections?: WordDetection[];

  // Optional / helper fields for computed rendering and crop view
  student_answer_text?: string;
  page_number?: number;
  confidence_score?: number; // 0-100 average OCR transcription accuracy
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0 to 1000
}

export interface GradingReport {
  total_score: number;
  max_score: number;
  questions: GradedQuestion[];
}

export interface ExamSetSample {
  id: string;
  title: string;
  subject: string;
  studentName: string;
  description: string;
  questionPaperUrl: string;
  answerSheetUrl: string;
  report: GradingReport;
}

export interface DocumentSample {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  words: DetectedWord[];
}

export type BoxColorMode = 'status-coded' | 'neon-indigo' | 'rainbow' | 'emerald' | 'amber' | 'cyan';

export type ImageFilterMode = 'normal' | 'contrast' | 'binarized' | 'invert' | 'vintage';

export interface ViewerSettings {
  showBoxes: boolean;
  showLabels: boolean;
  showOrderLines: boolean;
  showWordIndices: boolean;
  boxColorMode: BoxColorMode;
  boxFillOpacity: number;
  filter: ImageFilterMode;
}


export interface OCRStats {
  totalWords: number;
  totalCharacters: number;
  estimatedLines: number;
  averageWordWidth: number;
  averageWordHeight: number;
}

export interface GradingApiResponse {
  success: boolean;
  report: GradingReport;
  rawJsonString: string;
  modelUsed?: string;
  fallbackUsed?: boolean;
  notice?: string;
  error?: string;
}
