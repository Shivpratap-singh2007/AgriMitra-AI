import React, { useState, useRef } from 'react';
import {
  Crop,
  Language,
  AnalysisMode,
  CustomModelResult,
  GeminiResult,
  CompareResult,
  DiagnosisHistoryItem
} from '../types';
import { translations } from '../data/translations';
import {
  predictCustomModel,
  predictGemini,
  predictCompare
} from '../services/api';
import {
  Camera,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Cpu,
  Sparkles,
  GitCompare,
  Check,
  Stethoscope,
  X
} from 'lucide-react';

interface CropDoctorProps {
  selectedCrop: Crop;
  setSelectedCrop: (crop: Crop) => void;
  language: Language;
  onNavigateToChat?: (prefillQuestion?: string) => void;
}

export const CropDoctor: React.FC<CropDoctorProps> = ({
  selectedCrop,
  setSelectedCrop,
  language,
  onNavigateToChat,
}) => {
  const t = translations[language].doctor;
  const tc = translations[language].compare;

  const [mode, setMode] = useState<AnalysisMode>('compare');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [threshold] = useState<number>(0.55);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Results for each mode
  const [customResult, setCustomResult] = useState<CustomModelResult | null>(null);
  const [geminiResult, setGeminiResult] = useState<GeminiResult | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const saveToHistory = (
    crop: Crop,
    disease: string,
    diseaseHindi: string,
    confidence: number,
    analysisMode: AnalysisMode,
    preview?: string
  ) => {
    try {
      const historyItem: DiagnosisHistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        crop,
        disease,
        diseaseHindi,
        confidence,
        mode: analysisMode,
        imagePreview: preview,
      };

      const existingRaw = localStorage.getItem('agrimitra_diagnosis_history');
      const existing: DiagnosisHistoryItem[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [historyItem, ...existing.filter((item) => item.id !== historyItem.id)].slice(0, 20);
      localStorage.setItem('agrimitra_diagnosis_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save diagnosis history:', e);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(language === 'hi' ? 'कृपया केवल JPG, PNG या WEBP फोटो चुनें।' : 'Please upload a valid JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError(language === 'hi' ? 'फोटो का आकार 15MB से कम होना चाहिए।' : 'Image size must be less than 15MB.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Reset previous results
    setCustomResult(null);
    setGeminiResult(null);
    setCompareResult(null);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCustomResult(null);
    setGeminiResult(null);
    setCompareResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError(language === 'hi' ? 'कृपया पहले पत्ती की फोटो लें या अपलोड करें।' : 'Please capture or select a leaf photo first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'custom') {
        const res = await predictCustomModel(selectedFile, selectedCrop, threshold);
        setCustomResult(res);
        if (res.success && res.disease) {
          saveToHistory(
            selectedCrop,
            res.disease,
            res.disease_hindi || res.disease,
            res.confidence_percentage || 85,
            'custom',
            previewUrl || undefined
          );
        }
      } else if (mode === 'gemini') {
        const res = await predictGemini(selectedFile, selectedCrop, language);
        setGeminiResult(res);
        if (res.success && res.disease) {
          saveToHistory(
            selectedCrop,
            res.disease,
            res.disease_hindi || res.disease,
            res.confidence_percentage || 85,
            'gemini',
            previewUrl || undefined
          );
        }
      } else {
        const res = await predictCompare(selectedFile, selectedCrop, language, threshold);
        setCompareResult(res);
        if (res.success) {
          const topDisease = res.custom_model?.disease || res.gemini_model?.disease || 'Diagnosed';
          const topDiseaseHi = res.custom_model?.disease_hindi || res.gemini_model?.disease_hindi || topDisease;
          const topConf = Math.max(
            res.custom_model?.confidence_percentage || 0,
            res.gemini_model?.confidence_percentage || 0
          ) || 85;
          saveToHistory(selectedCrop, topDisease, topDiseaseHi, topConf, 'compare', previewUrl || undefined);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const activeResultDisease =
    mode === 'custom'
      ? customResult?.disease
      : mode === 'gemini'
      ? geminiResult?.disease
      : compareResult?.custom_model?.disease || compareResult?.gemini_model?.disease;

  return (
    <div className="space-y-4 pb-6">
      
      {/* 1. Header & Crop Toggle */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F2238] tracking-tight">
              {t.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#506680] mt-0.5">
              {t.subtitle}
            </p>
          </div>

          {/* Active Crop Selection Switcher */}
          <div className="flex items-center gap-1.5 bg-[#F1F4F8] p-1 rounded-lg border border-[#E4E9F0] self-start sm:self-auto">
            <span className="text-xs font-bold text-[#506680] px-2">
              {language === 'hi' ? 'फसल:' : 'Crop:'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCrop('Tomato')}
              className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCrop === 'Tomato'
                  ? 'bg-white text-[#0F2238] border border-[#CBD5E1]'
                  : 'text-[#506680] hover:text-[#0F2238]'
              }`}
            >
              <span>🍅</span>
              <span>{language === 'hi' ? 'टमाटर' : 'Tomato'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCrop('Potato')}
              className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCrop === 'Potato'
                  ? 'bg-white text-[#0F2238] border border-[#CBD5E1]'
                  : 'text-[#506680] hover:text-[#0F2238]'
              }`}
            >
              <span>🥔</span>
              <span>{language === 'hi' ? 'आलू' : 'Potato'}</span>
            </button>
          </div>
        </div>

        {/* 2. Analysis Engine Mode Selector (Flat segmented tabs) */}
        <div className="mt-4 pt-3.5 border-t border-[#E4E9F0]">
          <span className="text-xs font-extrabold text-[#0F2238] uppercase tracking-wide block mb-2">
            {t.modeSelection}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            
            {/* Mode C: Compare Both */}
            <button
              type="button"
              onClick={() => setMode('compare')}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between touch-target ${
                mode === 'compare'
                  ? 'border-[#0F2238] bg-[#0F2238] text-white'
                  : 'border-[#E4E9F0] bg-white text-[#0F2238] hover:bg-[#F1F4F8]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold flex items-center gap-1.5">
                  <GitCompare className="w-4 h-4 text-[#16A34A]" />
                  <span>{language === 'hi' ? 'मोड C: दोनों AI तुलना' : 'Mode C: Dual AI Compare'}</span>
                </span>
                {mode === 'compare' && <Check className="w-4 h-4 text-[#16A34A]" />}
              </div>
              <p className={`text-[11px] leading-snug ${mode === 'compare' ? 'text-slate-200' : 'text-[#506680]'}`}>
                {language === 'hi' ? 'PyTorch व Gemini दोनों की राय व सहमति देखें' : 'Side-by-side consensus & discrepancy check'}
              </p>
            </button>

            {/* Mode A: Custom PyTorch */}
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between touch-target ${
                mode === 'custom'
                  ? 'border-[#0F2238] bg-[#0F2238] text-white'
                  : 'border-[#E4E9F0] bg-white text-[#0F2238] hover:bg-[#F1F4F8]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#16A34A]" />
                  <span>{language === 'hi' ? 'मोड A: अपना PyTorch AI' : 'Mode A: MobileNetV2'}</span>
                </span>
                {mode === 'custom' && <Check className="w-4 h-4 text-[#16A34A]" />}
              </div>
              <p className={`text-[11px] leading-snug ${mode === 'custom' ? 'text-slate-200' : 'text-[#506680]'}`}>
                {language === 'hi' ? '8 रोग श्रेणियों पर ऑन-डिवाइस प्रशिक्षित मॉडल' : 'Trained on PlantVillage dataset (8 classes)'}
              </p>
            </button>

            {/* Mode B: Google Gemini */}
            <button
              type="button"
              onClick={() => setMode('gemini')}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between touch-target ${
                mode === 'gemini'
                  ? 'border-[#0F2238] bg-[#0F2238] text-white'
                  : 'border-[#E4E9F0] bg-white text-[#0F2238] hover:bg-[#F1F4F8]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>{language === 'hi' ? 'मोड B: Google Gemini' : 'Mode B: Gemini Vision'}</span>
                </span>
                {mode === 'gemini' && <Check className="w-4 h-4 text-blue-400" />}
              </div>
              <p className={`text-[11px] leading-snug ${mode === 'gemini' ? 'text-slate-200' : 'text-[#506680]'}`}>
                {language === 'hi' ? 'मल्टीमॉडल विज़न व विस्तृत रोग लक्षण विश्लेषण' : 'Multimodal cloud reasoning & symptoms'}
              </p>
            </button>

          </div>
        </div>
      </section>

      {/* 3. Image Capture & Upload Section */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 space-y-4">
        
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
          aria-hidden="true"
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
          aria-hidden="true"
        />

        {!previewUrl ? (
          <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-5 sm:p-8 text-center bg-[#F1F4F8] space-y-4">
            <div className="w-14 h-14 rounded-full bg-white border border-[#CBD5E1] text-2xl flex items-center justify-center mx-auto">
              📷
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F2238]">
                {language === 'hi' ? 'पत्ती की फोटो लें या अपलोड करें' : 'Capture Photo or Choose from Gallery'}
              </h3>
              <p className="text-xs text-[#506680] mt-1 max-w-sm mx-auto leading-relaxed">
                {language === 'hi'
                  ? 'रोग प्रभावित पत्ती को अच्छी रोशनी में केंद्रित रखें। साफ फोटो से सटीक परिणाम मिलते हैं।'
                  : 'Place affected leaf in clear natural light. Supports JPG, PNG, WEBP up to 15MB.'}
              </p>
            </div>

            {/* Mobile Touch Action Buttons (Min 44px) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#0F2238] hover:bg-[#142C4C] active:bg-[#0B1C30] text-white text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-2 touch-target"
              >
                <Camera className="w-4.5 h-4.5 text-[#16A34A]" />
                <span>{t.cameraBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-3 rounded-lg bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#0F2238] text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-2 touch-target"
              >
                <Upload className="w-4.5 h-4.5 text-[#506680]" />
                <span>{t.galleryBtn}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Image Preview Box */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-[#E4E9F0] max-h-80 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Selected leaf preview"
                className="max-h-80 w-auto object-contain mx-auto"
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="touch-target absolute top-2.5 right-2.5 bg-black/80 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>{t.changePhoto}</span>
              </button>
            </div>

            {/* Submit Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
              <div className="text-xs text-[#506680]">
                <span>{language === 'hi' ? 'जांच हेतु फसल:' : 'Target Crop:'}</span>
                <strong className="text-[#0F2238] font-extrabold ml-1">{selectedCrop}</strong>
                {selectedFile && (
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type.split('/')[1]?.toUpperCase()}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#15803D] hover:bg-[#14532D] active:bg-[#14532D] disabled:bg-slate-400 text-white font-extrabold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 touch-target"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    <span>{t.analyzingBtn}</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4.5 h-4.5" />
                    <span>{t.analyzeBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error message banner */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}
      </section>

      {/* 4. Results Rendering (Natural Unclipped Scrolling) */}
      
      {/* MODE C: Dual AI Comparison Result */}
      {mode === 'compare' && compareResult && (
        <section className="bg-white rounded-xl border border-[#E4E9F0] overflow-hidden space-y-4">
          
          {/* Consensus Flat Banner */}
          <div
            className={`p-4 border-b flex items-start gap-3 ${
              compareResult.comparison.agreement
                ? 'bg-[#EBF7EE] border-[#C6E9CC] text-[#14532D]'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            {compareResult.comparison.agreement ? (
              <CheckCircle2 className="w-5 h-5 text-[#15803D] flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider block">
                {tc.agreementTitle}
              </span>
              <h3 className="text-base font-black">
                {compareResult.comparison.agreement ? tc.agreeMsg : tc.disagreeMsg}
              </h3>
              <p className="text-xs mt-1 leading-relaxed">
                {compareResult.comparison.summary}
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            
            {/* Side-by-Side Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Custom PyTorch Card */}
              <div className="p-3.5 rounded-lg border border-[#E4E9F0] bg-[#F1F4F8]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#0F2238] flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#15803D]" />
                    <span>{tc.customCardTitle}</span>
                  </span>
                  <span className="text-xs font-black text-[#0F2238]">
                    {compareResult.custom_model.confidence_percentage}% Match
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-[#0F2238]">
                  {language === 'hi'
                    ? compareResult.custom_model.disease_hindi || compareResult.custom_model.disease
                    : compareResult.custom_model.disease}
                </h4>
                <p className="text-[11px] text-[#506680] mt-1 leading-normal">
                  {compareResult.custom_model.is_uncertain
                    ? '⚠️ Low confidence pattern (<55%)'
                    : 'Classified using MobileNetV2 architecture'}
                </p>
              </div>

              {/* Gemini Vision Card */}
              <div className="p-3.5 rounded-lg border border-[#E4E9F0] bg-[#F1F4F8]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#0F2238] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>{tc.geminiCardTitle}</span>
                  </span>
                  <span className="text-xs font-black text-[#0F2238]">
                    {compareResult.gemini_model.confidence_percentage}% Match
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-[#0F2238]">
                  {language === 'hi'
                    ? compareResult.gemini_model.disease_hindi || compareResult.gemini_model.disease
                    : compareResult.gemini_model.disease}
                </h4>
                <p className="text-[11px] text-[#506680] mt-1 leading-normal">
                  {compareResult.gemini_model.explanation || 'Visual symptom evaluation'}
                </p>
              </div>

            </div>

            {/* Disagreement explanation if models differ */}
            {compareResult.comparison.disagreement_explanation && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 leading-relaxed">
                <strong className="font-bold">Why predictions differ:</strong> {compareResult.comparison.disagreement_explanation}
              </div>
            )}

            {/* Symptoms & Cultural Actions */}
            {(compareResult.gemini_model.symptoms?.length || compareResult.custom_model.next_steps?.length) && (
              <div className="space-y-3 pt-1">
                {compareResult.gemini_model.symptoms && compareResult.gemini_model.symptoms.length > 0 && (
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0F2238] uppercase tracking-wide mb-1.5">
                      {t.observedSymptoms}
                    </h4>
                    <ul className="list-disc list-inside text-xs text-[#1E293B] space-y-1 bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                      {compareResult.gemini_model.symptoms.map((s, idx) => (
                        <li key={idx} className="leading-relaxed">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {compareResult.custom_model.next_steps && compareResult.custom_model.next_steps.length > 0 && (
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0F2238] uppercase tracking-wide mb-1.5">
                      {t.immediateSteps}
                    </h4>
                    <ul className="list-disc list-inside text-xs text-[#14532D] space-y-1 bg-[#EBF7EE] p-3 rounded-lg border border-[#C6E9CC]">
                      {compareResult.custom_model.next_steps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Safety Disclaimer */}
            <div className="p-3 bg-[#F1F4F8] border border-[#CBD5E1] rounded-lg text-[11px] text-[#506680] leading-relaxed">
              <strong className="text-[#0F2238]">{language === 'hi' ? 'कृषि सुरक्षा सूचना:' : 'Safety Notice:'}</strong> {t.safetyDisclaimer}
            </div>

            {/* Follow-up button */}
            <button
              type="button"
              onClick={() => onNavigateToChat?.(activeResultDisease)}
              className="touch-target w-full py-3 px-4 rounded-lg bg-[#0F2238] hover:bg-[#142C4C] active:bg-[#0B1C30] text-white text-xs font-extrabold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#16A34A]" />
              <span>{t.followUpChatBtn}</span>
            </button>

          </div>
        </section>
      )}

      {/* MODE A: Custom PyTorch Result */}
      {mode === 'custom' && customResult && (
        <section className="bg-white rounded-xl border border-[#E4E9F0] overflow-hidden">
          <div className="bg-[#0F2238] text-white p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#16A34A] font-extrabold uppercase tracking-wider block">
                {customResult.model_name || 'PyTorch MobileNetV2'}
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                {language === 'hi' ? customResult.disease_hindi || customResult.disease : customResult.disease}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-300 block">{t.confidence}</span>
              <span className="text-2xl font-black text-[#16A34A]">
                {customResult.confidence_percentage}%
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {customResult.is_uncertain && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{customResult.uncertainty_warning}</span>
              </div>
            )}

            {customResult.crop_mismatch && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{customResult.crop_mismatch_warning}</span>
              </div>
            )}

            {customResult.next_steps && customResult.next_steps.length > 0 && (
              <div>
                <h4 className="text-xs font-extrabold text-[#0F2238] uppercase tracking-wide mb-1.5">
                  {t.immediateSteps}
                </h4>
                <ul className="list-disc list-inside text-xs text-[#14532D] space-y-1 bg-[#EBF7EE] p-3 rounded-lg border border-[#C6E9CC]">
                  {customResult.next_steps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {customResult.prevention_tips && customResult.prevention_tips.length > 0 && (
              <div>
                <h4 className="text-xs font-extrabold text-[#0F2238] uppercase tracking-wide mb-1.5">
                  {t.preventionTips}
                </h4>
                <ul className="list-disc list-inside text-xs text-[#1E293B] space-y-1 bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                  {customResult.prevention_tips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-[#F1F4F8] border border-[#CBD5E1] rounded-lg text-[11px] text-[#506680] leading-relaxed">
              <strong className="text-[#0F2238]">{language === 'hi' ? 'कृषि सुरक्षा सूचना:' : 'Safety Notice:'}</strong> {t.safetyDisclaimer}
            </div>

            <button
              type="button"
              onClick={() => onNavigateToChat?.(customResult.disease)}
              className="touch-target w-full py-3 px-4 rounded-lg bg-[#0F2238] hover:bg-[#142C4C] active:bg-[#0B1C30] text-white text-xs font-extrabold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#16A34A]" />
              <span>{t.followUpChatBtn}</span>
            </button>
          </div>
        </section>
      )}

      {/* MODE B: Gemini Vision Result */}
      {mode === 'gemini' && geminiResult && (
        <section className="bg-white rounded-xl border border-[#E4E9F0] overflow-hidden">
          <div className="bg-[#0F2238] text-white p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-blue-300 font-extrabold uppercase tracking-wider block">
                {geminiResult.model_name || 'Google Gemini Vision'}
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                {language === 'hi' ? geminiResult.disease_hindi || geminiResult.disease : geminiResult.disease}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-300 block">{t.confidence}</span>
              <span className="text-2xl font-black text-blue-300">
                {geminiResult.confidence_percentage}%
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {geminiResult.explanation && (
              <p className="text-xs text-[#1E293B] bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0] leading-relaxed">
                {geminiResult.explanation}
              </p>
            )}

            {geminiResult.symptoms && geminiResult.symptoms.length > 0 && (
              <div>
                <h4 className="text-xs font-extrabold text-[#0F2238] uppercase tracking-wide mb-1.5">
                  {t.observedSymptoms}
                </h4>
                <ul className="list-disc list-inside text-xs text-[#1E293B] space-y-1 bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                  {geminiResult.symptoms.map((s, idx) => (
                    <li key={idx} className="leading-relaxed">{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {geminiResult.next_steps && geminiResult.next_steps.length > 0 && (
              <div>
                <h4 className="text-xs font-extrabold text-[#0F2238] uppercase tracking-wide mb-1.5">
                  {t.immediateSteps}
                </h4>
                <ul className="list-disc list-inside text-xs text-[#14532D] space-y-1 bg-[#EBF7EE] p-3 rounded-lg border border-[#C6E9CC]">
                  {geminiResult.next_steps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-[#F1F4F8] border border-[#CBD5E1] rounded-lg text-[11px] text-[#506680] leading-relaxed">
              <strong className="text-[#0F2238]">{language === 'hi' ? 'कृषि सुरक्षा सूचना:' : 'Safety Notice:'}</strong> {t.safetyDisclaimer}
            </div>

            <button
              type="button"
              onClick={() => onNavigateToChat?.(geminiResult.disease)}
              className="touch-target w-full py-3 px-4 rounded-lg bg-[#0F2238] hover:bg-[#142C4C] active:bg-[#0B1C30] text-white text-xs font-extrabold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#16A34A]" />
              <span>{t.followUpChatBtn}</span>
            </button>
          </div>
        </section>
      )}

    </div>
  );
};

