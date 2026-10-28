import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import {
  ShieldCheck,
  Cpu,
  Sparkles,
  CircuitBoard,
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
            ? 'भारतीय किसानों के लिए पारदर्शी और जिम्मेदार स्मार्ट पॉलीहाउस एवं फार्म इंटेलिजेंस'
            : 'Transparent and responsible smart polyhouse and farm intelligence for Indian farmers'}
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

      {/* System Architecture */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 space-y-3">
        <h2 className="text-base font-extrabold text-[#0F2238] flex items-center gap-2">
          <CircuitBoard className="w-4 h-4 text-[#0F2238]" />
          <span>{t.whyDualAiTitle}</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#1E293B] leading-relaxed">
          {t.whyDualAiText}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
          <div className="p-3 bg-[#F1F4F8] rounded-lg border border-[#E4E9F0]">
            <strong className="text-[#0F2238] flex items-center gap-1.5 mb-1 font-extrabold">
              <Cpu className="w-4 h-4 text-[#15803D]" />
              <span>1. ESP32-WROOM-32 Edge Controller</span>
            </strong>
            <p className="text-[#506680] leading-relaxed text-xs">
              Autonomous micro-climate monitoring with soil moisture probes, temperature sensors, and relay controls.
            </p>
          </div>

          <div className="p-3 bg-[#F1F4F8] rounded-lg border border-[#E4E9F0]">
            <strong className="text-[#0F2238] flex items-center gap-1.5 mb-1 font-extrabold">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>2. AI Kisan Chaupal</span>
            </strong>
            <p className="text-[#506680] leading-relaxed text-xs">
              Context-aware agricultural advisor grounded in real-time sensor readings and verified ICAR agronomic guidance.
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
            <span className="text-[#1E293B]">Hardware Safety: Maximum pump runtimes and anti-cycling locks prevent flooding.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0" />
            <span className="text-[#1E293B]">Sensor Fault Detection: Frozen or implausible readings immediately lock irrigation.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0" />
            <span className="text-[#1E293B]">Agronomic Grounding: Factual recommendations verified against agricultural standards.</span>
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
          Dedicated to Indian smallholder farmers cultivating polyhouse crops.
        </p>
      </section>
    </div>
  );
};
