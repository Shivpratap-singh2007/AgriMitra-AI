import React, { useState, useEffect } from 'react';
import {
  Settings,
  Languages,
  PhoneCall,
  Trash2,
  Cpu,
  Sparkles,
  CloudSun,
  ShieldCheck,
  Clock,
  Smartphone,
  Download,
  CheckCircle2,
  Sliders,
  Layers,
  HardDrive
} from 'lucide-react';
import { Language, DiagnosisHistoryItem, SystemConfig, ActivePage } from '../types';
import { translations } from '../data/translations';

interface ProfileViewProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  openSettings: () => void;
  config: SystemConfig | null;
  navigateTo: (page: ActivePage) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  language,
  setLanguage,
  openSettings,
  config,
  navigateTo,
}) => {
  const t = translations[language].profile;
  const tp = translations[language].polyhouse;

  const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showAndroidSteps, setShowAndroidSteps] = useState(false);

  // Polyhouse setup preferences stored in localStorage
  const [polyCrop, setPolyCrop] = useState<string>(() => localStorage.getItem('agrimitra_poly_crop') || 'Vegetables');
  const [polySubstrate, setPolySubstrate] = useState<string>(() => localStorage.getItem('agrimitra_poly_substrate') || 'Cocopeat');

  useEffect(() => {
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isRunningStandalone);

    try {
      const raw = localStorage.getItem('agrimitra_diagnosis_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read history:', e);
    }
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredInstallPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        (window as any).deferredInstallPrompt = null;
        setIsStandalone(true);
      }
    } else {
      setShowAndroidSteps((prev) => !prev);
    }
  };

  const handleSavePolyConfig = (crop: string, substrate: string) => {
    setPolyCrop(crop);
    setPolySubstrate(substrate);
    localStorage.setItem('agrimitra_poly_crop', crop);
    localStorage.setItem('agrimitra_poly_substrate', substrate);
  };

  const clearHistory = () => {
    if (window.confirm(language === 'hi' ? 'क्या आप सभी सहेजे गए रिकॉर्ड मिटाना चाहते हैं?' : 'Clear all saved diagnosis records?')) {
      localStorage.removeItem('agrimitra_diagnosis_history');
      setHistory([]);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      
      {/* 1. Profile Header & Language Selection */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#142B4A] text-white flex items-center justify-center font-bold text-xl">
            👨‍🌾
          </div>
          <div>
            <h1 className="text-lg font-black text-[#142B4A]">
              {t.farmerName}
            </h1>
            <p className="text-xs text-[#506680]">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Language Preference Selector */}
        <div className="mt-4 pt-3.5 border-t border-[#E4E9F0] flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#142B4A] flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-[#2E7D32]" />
            <span>{t.languagePref}</span>
          </span>

          <div className="flex items-center bg-[#F1F4F8] p-1 rounded-lg border border-[#E4E9F0]">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-[#142B4A] border border-[#CBD5E1]'
                  : 'text-[#506680] hover:text-[#142B4A]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                language === 'hi'
                  ? 'bg-white text-[#142B4A] border border-[#CBD5E1]'
                  : 'text-[#506680] hover:text-[#142B4A]'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </section>

      {/* 2. Polyhouse Configuration & Crop Setup */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-[#E4E9F0] pb-2">
          <Sliders className="w-4 h-4 text-[#142B4A]" />
          <h2 className="text-sm font-extrabold text-[#142B4A] uppercase tracking-wide">
            {language === 'hi' ? 'पॉलीहाउस फसल एवं माध्यम चयन' : 'Polyhouse Crop & Growing Medium'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-[#142B4A] mb-1">
              {language === 'hi' ? 'सक्रिय फसल (Crop)' : 'Polyhouse Crop'}
            </label>
            <select
              value={polyCrop}
              onChange={(e) => handleSavePolyConfig(e.target.value, polySubstrate)}
              className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#142B4A] font-bold"
            >
              <option value="Vegetables">🌱 Polyhouse Vegetables (पॉलीहाउस मौसमी सब्जियां)</option>
              <option value="BellPepper">🫑 Bell Pepper (शिमला मिर्च - Capsicum)</option>
              <option value="Cucumber">🥒 Cucumber (खीरा - Cucumis sativus)</option>
              <option value="ExoticGreens">🥬 Exotic Greens (पत्तेदार हाइड्रोपोनिक फसलें)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#142B4A] mb-1">
              {language === 'hi' ? 'माध्यम (Substrate)' : 'Growing Medium'}
            </label>
            <select
              value={polySubstrate}
              onChange={(e) => handleSavePolyConfig(polyCrop, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#142B4A] font-bold"
            >
              <option value="Cocopeat">Cocopeat + Perlite (कोकोपीट)</option>
              <option value="SoilLoam">Sandy Loam Soil (दोमट मिट्टी)</option>
              <option value="Hydroponic">Hydroponic / Rockwool (हाइड्रोपोनिक्स)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. ESP32 Hardware Diagnostics & Wiring Summary */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-[#E4E9F0] pb-2">
          <HardDrive className="w-4 h-4 text-[#142B4A]" />
          <h2 className="text-sm font-extrabold text-[#142B4A] uppercase tracking-wide">
            {language === 'hi' ? 'IoT हार्डवेयर विनिर्देश' : 'IoT Hardware & Firmware'}
          </h2>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E4E9F0] flex items-center justify-between">
            <div>
              <span className="font-extrabold text-[#142B4A] block">Device ID: esp32-polyhouse-demo</span>
              <span className="text-[10px] text-[#506680]">Firmware: v1.0.0-ino • Protocol: REST / JSON / Opto-Isolated</span>
            </div>
            <span className="text-[10px] font-black text-[#2E7D32] bg-[#EBF7EE] px-2 py-0.5 rounded border border-[#C6E9CC]">
              READY
            </span>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E4E9F0] flex items-center justify-between">
            <div>
              <span className="font-extrabold text-[#142B4A] block">Wiring & Pinout:</span>
              <span className="text-[10px] text-[#506680]">
                DHT11: GPIO 4 • Soil Sensor: GPIO 34 • Pump Relay: GPIO 18 • Fan Relay: GPIO 19
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#142B4A]">
              Optocoupler isolated
            </span>
          </div>
        </div>
      </section>

      {/* 4. Android App Installation Card (PWA) */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#142B4A] text-white flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#142B4A]">
                {language === 'hi' ? 'एंड्रॉयड फोन पर ऐप इंस्टॉल करें (PWA)' : 'Install on Android Phone (PWA)'}
              </h2>
              <p className="text-xs text-[#506680] mt-0.5 leading-relaxed">
                {isStandalone
                  ? (language === 'hi' ? '✓ ऐप आपके फोन पर पहले से इंस्टॉल है।' : '✓ App is currently running in standalone installed mode.')
                  : (language === 'hi'
                      ? 'बिना प्ले स्टोर के सीधे फोन स्क्रीन पर ऐप जैसा अनुभव, फुल-स्क्रीन कैमरा व ऑफलाइन सपोर्ट।'
                      : 'Add to home screen for full-screen camera, instant access, and offline crop guide.')}
              </p>
            </div>
          </div>

          {isStandalone && (
            <span className="px-2.5 py-1 rounded bg-[#EBF7EE] text-[#14532D] border border-[#C6E9CC] text-[10px] font-black flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>INSTALLED</span>
            </span>
          )}
        </div>

        {!isStandalone && (
          <div>
            <button
              type="button"
              onClick={handleInstallClick}
              className="touch-target w-full py-3 px-4 bg-[#142B4A] hover:bg-[#1B3B64] text-white text-xs font-extrabold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Download className="w-4 h-4 text-[#2E7D32]" />
              <span>{language === 'hi' ? 'फोन पर ऐप इंस्टॉल करें' : 'Install App on Phone'}</span>
            </button>

            {showAndroidSteps && (
              <div className="mt-3 p-3 bg-[#F1F4F8] border border-[#CBD5E1] rounded-lg text-xs text-[#142B4A] space-y-1.5">
                <span className="font-bold block">
                  {language === 'hi' ? 'Chrome ब्राउज़र में 2 आसान कदम:' : 'Easy 2-step install in Chrome:'}
                </span>
                <ol className="list-decimal list-inside space-y-1 text-[#506680]">
                  <li>
                    {language === 'hi'
                      ? 'ऊपर दाईं ओर 3-डॉट्स मेनू (⋮) पर टैप करें।'
                      : 'Tap the top-right 3-dots menu (⋮) in Chrome.'}
                  </li>
                  <li>
                    {language === 'hi'
                      ? '"ऐप इंस्टॉल करें" या "होम स्क्रीन पर जोड़ें" चुनें।'
                      : 'Select "Install app" or "Add to Home screen".'}
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. Official Kisan Helpline Card */}
      <section className="bg-[#EBF7EE] rounded-xl border border-[#C6E9CC] p-4 sm:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#2E7D32] text-white flex items-center justify-center flex-shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#14532D]">
              {t.helplineTitle}
            </h2>
            <span className="text-lg font-black text-[#2E7D32] block tracking-wide mt-0.5">
              {t.helplineNumber}
            </span>
            <p className="text-xs text-[#14532D] mt-0.5 leading-relaxed">
              {t.helplineDesc}
            </p>
          </div>
        </div>

        <a
          href="tel:18001801551"
          className="touch-target w-full py-3 px-4 bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-extrabold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{t.callBtn}</span>
        </a>
      </section>

      {/* 6. System Diagnostics & API Settings */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E4E9F0] pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#142B4A]" />
            <h2 className="text-xs sm:text-sm font-extrabold text-[#142B4A] uppercase tracking-wide">
              {t.systemStatus}
            </h2>
          </div>

          <button
            type="button"
            onClick={openSettings}
            className="touch-target text-xs font-bold text-[#142B4A] hover:text-[#2E7D32] flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>{t.openSettings}</span>
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {/* Gemini API */}
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E4E9F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#2E7D32]" />
              <div>
                <span className="font-extrabold text-[#142B4A] block">{t.geminiStatus}</span>
                <span className="text-[10px] text-[#506680]">{config?.gemini.model || 'Gemini 2.5 Flash'}</span>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                config?.gemini.has_key
                  ? 'bg-[#EBF7EE] text-[#14532D] border-[#C6E9CC]'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              {config?.gemini.has_key ? 'ACTIVE' : 'KEY MISSING'}
            </span>
          </div>
        </div>
      </section>

      {/* 7. Clear History */}
      {history.length > 0 && (
        <section className="flex justify-end pt-2">
          <button
            type="button"
            onClick={clearHistory}
            className="touch-target px-3 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.clearHistory}</span>
          </button>
        </section>
      )}

    </div>
  );
};
