export type Crop = 'Tomato' | 'Potato';
export type Language = 'en' | 'hi';
export type AnalysisMode = 'custom' | 'gemini' | 'compare';
export type ActivePage = 'home' | 'doctor' | 'chat' | 'guide' | 'profile' | 'about';

export interface ProbabilityItem {
  crop: string;
  disease: string;
  disease_hi: string;
  probability: number;
  percentage: number;
}

export interface CustomModelResult {
  success: boolean;
  model_ready: boolean;
  model_name?: string;
  raw_class?: string;
  crop?: string;
  selected_crop?: string;
  disease?: string;
  disease_hindi?: string;
  confidence?: number;
  confidence_percentage?: number;
  is_uncertain?: boolean;
  crop_mismatch?: boolean;
  uncertainty_warning?: string | null;
  crop_mismatch_warning?: string | null;
  probabilities?: Record<string, ProbabilityItem>;
  next_steps?: string[];
  prevention_tips?: string[];
  disclaimer?: string;
  message?: string;
  training_guide?: string;
}

export interface GeminiResult {
  success: boolean;
  model_name?: string;
  is_clear?: boolean;
  crop?: string;
  selected_crop?: string;
  disease?: string;
  disease_hindi?: string;
  confidence?: number;
  confidence_percentage?: number;
  symptoms?: string[];
  explanation?: string;
  explanation_hindi?: string;
  next_steps?: string[];
  prevention_tips?: string[];
  uncertainty_notes?: string;
  disclaimer?: string;
  message?: string;
  api_key_missing?: boolean;
}

export interface CompareResult {
  success: boolean;
  selected_crop: string;
  comparison: {
    agreement: boolean;
    agreement_status: 'AGREE' | 'DISAGREE' | 'PARTIAL' | 'UNKNOWN';
    summary: string;
    disagreement_explanation?: string | null;
    low_confidence_warning: boolean;
    warning_notes: string[];
    safety_recommendation: string;
  };
  custom_model: CustomModelResult;
  gemini_model: GeminiResult;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  crop?: string;
  isError?: boolean;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  weatherCode: number;
  summary: string;
  summaryHindi: string;
  icon: string;
  sprayFavorable: boolean;
  blightRisk: boolean;
  sprayAdvice: string;
  sprayAdviceHindi: string;
}

export interface WeatherResponse {
  success: boolean;
  provider: string;
  location: string;
  coordinates?: { latitude: number; longitude: number };
  data?: WeatherData;
  message?: string;
}

export interface DiagnosisHistoryItem {
  id: string;
  timestamp: string;
  crop: Crop;
  disease: string;
  diseaseHindi: string;
  confidence: number;
  mode: AnalysisMode;
  imagePreview?: string;
  agreementStatus?: string;
  symptoms?: string[];
  nextSteps?: string[];
}

export interface SystemConfig {
  custom_model: {
    is_loaded: boolean;
    architecture: string;
    supported_classes: string[];
    weights_path: string;
    status_message: string;
  };
  gemini: {
    has_key: boolean;
    model: string;
    status_message: string;
  };
  crops_supported: string[];
}
