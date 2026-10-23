import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import {
  ShieldCheck,
  Cpu,
  Sparkles,
  GitCompare,
  CheckCircle2,
  Users
} from 'lucide-react';

interface AboutViewProps {
  language: Language;
}

export const AboutView: React.FC<AboutViewProps> = ({ language }) => {
  const t = translations[language].about;

  return (
    <div className="space-y-4 pb-6 max-w-3xl mx-auto">
      {/* Title */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 text-center">
        <h1 className="text-xl sm:text-2xl font-black text-[#0F2238] tracking-tight">
          {t.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#506680] mt-1 max-w-lg mx-auto">
          {language === 'hi'
            ? 'भारतीय किसानों के लिए पारदर्शी और जिम्मेदार दोहरी AI कृषि तकनीक'
            : 'Transparent and responsible dual AI agricultural intelligence for Indian farmers'}
        </p>
      </section>

      {/* Mission */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 space-y-2">
        <h2 className="text-base font-extrabold text-[#0F2238] flex items-center gap-2">
          <span>🌱</span>
          <span>{t.missionTitle}</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#1E293B] leading-relaxed">
          {t.missionText}
        </p>
      </section>

      {/* Why Dual AI */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 space-y-3">
        <h2 className="text-base font-extrabold text-[#0F2238] flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-[#0F2238]" />
          <span>{t.whyDualAiTitle}</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#1E293B] leading-relaxed">
          {t.whyDualAiText}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
          <div className="p-3 bg-[#F1F4F8] rounded-lg border border-[#E4E9F0]">
            <strong className="text-[#0F2238] flex items-center gap-1.5 mb-1 font-extrabold">
              <Cpu className="w-4 h-4 text-[#15803D]" />
              <span>1. Custom PyTorch AI</span>
            </strong>
            <p className="text-[#506680] leading-relaxed text-xs">
              Lightweight MobileNetV2 trained on PlantVillage for fast, on-device disease classification.
            </p>
          </div>

          <div className="p-3 bg-[#F1F4F8] rounded-lg border border-[#E4E9F0]">
            <strong className="text-[#0F2238] flex items-center gap-1.5 mb-1 font-extrabold">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>2. Google Gemini Vision</span>
            </strong>
            <p className="text-[#506680] leading-relaxed text-xs">
              High-capacity cloud multimodal reasoning analyzing visual lesion morphology and symptoms.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Commitment */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 space-y-3">
        <h2 className="text-base font-extrabold text-[#0F2238] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#15803D]" />
          <span>{t.safetyTitle}</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#1E293B] leading-relaxed">
          {t.safetyText}
        </p>

        <div className="space-y-1.5 text-xs text-[#506680]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0" />
            <span className="text-[#1E293B]">Zero Fake AI: Real PyTorch neural network and real Gemini API.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0" />
            <span className="text-[#1E293B]">Uncertainty detection: Low confidence predictions are clearly flagged.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0" />
            <span className="text-[#1E293B]">Agronomic Safety: Chemical pesticide dosages are never fabricated.</span>
          </div>
        </div>
      </section>

      {/* Team Credits */}
      <section className="bg-[#F1F4F8] rounded-xl border border-[#E4E9F0] p-4 text-center text-xs text-[#506680] space-y-1">
        <div className="flex items-center justify-center gap-1.5 font-extrabold text-[#0F2238]">
          <Users className="w-4 h-4 text-[#506680]" />
          <span>AgriMitra AI Project • Open Agriculture Initiative</span>
        </div>
        <p className="text-[11px] text-[#506680]">
          Dedicated to Indian smallholder farmers cultivating Tomato and Potato crops.
        </p>
      </section>
    </div>
  );
};

