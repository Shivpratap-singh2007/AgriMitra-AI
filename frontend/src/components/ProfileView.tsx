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
  CheckCircle2
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

  const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showAndroidSteps, setShowAndroidSteps] = useState(false);

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

  const clearHistory = () => {
    if (window.confirm(language === 'hi' ? 'क्या आप सभी सहेजे गए निदान रिकॉर्ड मिटाना चाहते हैं?' : 'Clear all diagnosis history records?')) {
      localStorage.removeItem('agrimitra_diagnosis_history');
      setHistory([]);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      
      {/* 1. Profile Header */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0F2238] text-white flex items-center justify-center font-bold text-xl">
            👨‍🌾
          </div>
          <div>
            <h1 className="text-lg font-black text-[#0F2238]">
              {t.farmerName}
            </h1>
            <p className="text-xs text-[#506680]">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Language Preference Selector (44px Touch Targets) */}
        <div className="mt-4 pt-3.5 border-t border-[#E4E9F0] flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#0F2238] flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-[#15803D]" />
            <span>{t.languagePref}</span>
          </span>

          <div className="flex items-center bg-[#F1F4F8] p-1 rounded-lg border border-[#E4E9F0]">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-[#0F2238] border border-[#CBD5E1]'
                  : 'text-[#506680] hover:text-[#0F2238]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                language === 'hi'
                  ? 'bg-white text-[#0F2238] border border-[#CBD5E1]'
                  : 'text-[#506680] hover:text-[#0F2238]'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </section>

      {/* 2. Android App Installation Card (PWA) */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0F2238] text-white flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0F2238]">
                {language === 'hi' ? 'एंड्रॉयड फोन पर ऐप इंस्टॉल करें' : 'Install on Android Phone'}
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
              className="touch-target w-full py-3 px-4 bg-[#0F2238] hover:bg-[#142C4C] active:bg-[#0B1C30] text-white text-xs font-extrabold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Download className="w-4 h-4 text-[#16A34A]" />
              <span>{language === 'hi' ? 'फोन पर ऐप इंस्टॉल करें' : 'Install App on Phone'}</span>
            </button>

            {showAndroidSteps && (
              <div className="mt-3 p-3 bg-[#F1F4F8] border border-[#CBD5E1] rounded-lg text-xs text-[#0F2238] space-y-1.5">
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

      {/* 3. Official Kisan Helpline Card */}
      <section className="bg-[#EBF7EE] rounded-xl border border-[#C6E9CC] p-4 sm:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#15803D] text-white flex items-center justify-center flex-shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#14532D]">
              {t.helplineTitle}
            </h2>
            <span className="text-lg font-black text-[#15803D] block tracking-wide mt-0.5">
              {t.helplineNumber}
            </span>
            <p className="text-xs text-[#14532D] mt-0.5 leading-relaxed">
              {t.helplineDesc}
            </p>
          </div>
        </div>

        <a
          href="tel:18001801551"
          className="touch-target w-full py-3 px-4 bg-[#15803D] hover:bg-[#14532D] active:bg-[#14532D] text-white text-xs font-extrabold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{t.callBtn}</span>
        </a>
      </section>

      {/* 3. System Diagnostics & API Settings */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E4E9F0] pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F2238]" />
            <h2 className="text-xs sm:text-sm font-extrabold text-[#0F2238] uppercase tracking-wide">
              {t.systemStatus}
            </h2>
          </div>

          <button
            type="button"
            onClick={openSettings}
            className="touch-target text-xs font-bold text-[#0F2238] hover:text-[#15803D] flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>{t.openSettings}</span>
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {/* Custom Model */}
          <div className="p-3 bg-[#F1F4F8] rounded-lg border border-[#E4E9F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-[#15803D]" />
              <div>
                <span className="font-extrabold text-[#0F2238] block">{t.modelStatus}</span>
                <span className="text-[11px] text-[#506680]">
                  {config?.custom_model.is_loaded ? 'Loaded (8 Classes: Tomato & Potato)' : 'Model loading'}
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-[10px] font-black ${
                config?.custom_model.is_loaded ? 'bg-[#EBF7EE] text-[#14532D] border border-[#C6E9CC]' : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {config?.custom_model.is_loaded ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* Gemini API */}
          <div className="p-3 bg-[#F1F4F8] rounded-lg border border-[#E4E9F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-extrabold text-[#0F2238] block">{t.geminiStatus}</span>
                <span className="text-[11px] text-[#506680]">
                  {config?.gemini.has_key ? 'Google Gemini 2.5 / 3.8 Flash' : 'API Key Missing'}
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-[10px] font-black ${
                config?.gemini.has_key ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {config?.gemini.has_key ? 'CONNECTED' : 'NOT SET'}
            </span>
          </div>

          {/* Weather Feed */}
          <div className="p-3 bg-[#F1F4F8] rounded-lg border border-[#E4E9F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CloudSun className="w-4 h-4 text-[#0F2238]" />
              <div>
                <span className="font-extrabold text-[#0F2238] block">{t.weatherProvider}</span>
                <span className="text-[11px] text-[#506680]">
                  Open-Meteo Satellite Feed (Zero API Key)
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-black bg-[#EBF7EE] text-[#14532D] border border-[#C6E9CC]">
              LIVE
            </span>
          </div>
        </div>
      </section>

      {/* 4. Saved Diagnosis History (Natural Unclipped Scrolling) */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E4E9F0] pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0F2238]" />
            <h2 className="text-xs sm:text-sm font-extrabold text-[#0F2238] uppercase tracking-wide">
              {t.recentDiagnoses}
            </h2>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="touch-target text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearHistory}</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-6 px-4 bg-[#F1F4F8] rounded-lg text-center text-xs text-[#506680] space-y-2">
            <p>{t.noDiagnoses}</p>
            <button
              type="button"
              onClick={() => navigateTo('doctor')}
              className="touch-target px-4 py-2 bg-[#0F2238] text-white rounded-lg text-xs font-bold hover:bg-[#142C4C] transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'क्रॉप डॉक्टर पर जाएं' : 'Open Crop Doctor'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => navigateTo('doctor')}
                className="p-3 bg-[#F1F4F8] hover:bg-[#E4E9F0] rounded-lg border border-[#E4E9F0] flex items-center justify-between transition-colors cursor-pointer touch-target"
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-3">
                  {item.imagePreview ? (
                    <img
                      src={item.imagePreview}
                      alt={item.disease}
                      className="w-10 h-10 rounded-md object-cover border border-[#CBD5E1] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-white border border-[#CBD5E1] flex items-center justify-center text-lg flex-shrink-0">
                      {item.crop === 'Tomato' ? '🍅' : '🥔'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-extrabold text-[#0F2238]">
                      {language === 'hi' ? item.diseaseHindi || item.disease : item.disease}
                    </h3>
                    <span className="text-[11px] text-[#506680]">
                      {item.crop} • {item.timestamp}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-[#15803D]">
                    {item.confidence}%
                  </span>
                  <span className="text-[10px] text-[#506680] block capitalize">
                    {item.mode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

