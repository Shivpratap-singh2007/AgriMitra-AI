import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  MessageSquare,
  ArrowRight,
  CloudSun,
  Cpu,
  Sparkles,
  RefreshCw,
  Clock,
  ChevronRight,
  Sprout,
  CheckCircle2
} from 'lucide-react';
import { Crop, Language, ActivePage, WeatherData, DiagnosisHistoryItem } from '../types';
import { translations } from '../data/translations';
import { getLiveWeather } from '../services/api';

interface HomeDashboardProps {
  selectedCrop: Crop;
  setSelectedCrop: (crop: Crop) => void;
  language: Language;
  navigateTo: (page: ActivePage) => void;
  hasGeminiKey: boolean;
  isModelReady: boolean;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  selectedCrop,
  setSelectedCrop,
  language,
  navigateTo,
  hasGeminiKey,
  isModelReady,
}) => {
  const t = translations[language];

  // Weather state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLocation, setWeatherLocation] = useState<string>('Kangra, HP');
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Recent Diagnoses from localStorage
  const [recentDiagnoses, setRecentDiagnoses] = useState<DiagnosisHistoryItem[]>([]);

  const fetchWeather = async (loc?: string) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const res = await getLiveWeather(loc || 'Kangra');
      if (res.success && res.data) {
        setWeather(res.data);
        setWeatherLocation(res.location);
      } else {
        setWeatherError(res.message || 'Weather feed unavailable');
      }
    } catch (err: any) {
      setWeatherError('Could not connect to weather feed');
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Kangra');

    // Load recent diagnoses from localStorage
    try {
      const raw = localStorage.getItem('agrimitra_diagnosis_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecentDiagnoses(parsed.slice(0, 3));
        }
      }
    } catch (e) {
      console.warn('Failed reading diagnosis history:', e);
    }
  }, []);

  return (
    <div className="space-y-4 pb-4">
      
      {/* 1. Flat Header Banner with Status Badges */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#15803D] bg-[#EBF7EE] px-2.5 py-1 rounded-md border border-[#C6E9CC] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#15803D]" />
              <span>{language === 'hi' ? 'सत्यापित कृषि निर्णय प्रणाली' : 'Farmer Decision Support System'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F2238] tracking-tight">
              {language === 'hi' ? 'नमस्ते किसान साथी 🙏' : 'Welcome, Kisan Partner'}
            </h1>
            <p className="text-xs sm:text-sm text-[#506680] mt-1 leading-normal max-w-xl">
              {language === 'hi'
                ? 'टमाटर और आलू की फसलों में पत्ती रोगों की सटीक जांच व सत्यापित ICAR/CPRI वैज्ञानिक समाधान।'
                : 'Accurate disease diagnosis and ICAR-verified agronomic support for Tomato and Potato crops.'}
            </p>
          </div>

          {/* Model Status Indicators */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${
                isModelReady
                  ? 'bg-[#EBF7EE] text-[#14532D] border-[#C6E9CC]'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
              title="On-device PyTorch MobileNetV2 Neural Network"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{isModelReady ? 'PyTorch AI: Active' : 'PyTorch: Loading'}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${
                hasGeminiKey
                  ? 'bg-slate-100 text-[#0F2238] border-[#CBD5E1]'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
              title="Google Gemini Vision Model"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              <span>{hasGeminiKey ? 'Gemini: Ready' : 'Gemini: Key needed'}</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Primary Mobile Action Cards (Large Touch-Friendly, Flat UI) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Action 1: Diagnose Crop Leaf */}
        <button
          type="button"
          onClick={() => navigateTo('doctor')}
          className="touch-target bg-[#0F2238] hover:bg-[#142C4C] active:bg-[#0B1C30] text-white p-4.5 rounded-xl border border-[#0F2238] text-left transition-colors cursor-pointer flex items-center justify-between group min-h-[96px]"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#16A34A]">
              <Stethoscope className="w-5 h-5 text-[#16A34A]" />
              <span className="text-xs font-extrabold uppercase tracking-wider">
                {language === 'hi' ? 'कैमरा जांच' : 'Photo Diagnosis'}
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">
              {language === 'hi' ? 'फसल की जांच करें' : 'Diagnose Crop Leaf'}
            </h2>
            <p className="text-xs text-slate-300 line-clamp-1">
              {language === 'hi'
                ? 'पत्ती की फोटो लेकर झुलसा, लीफ मोल्ड व धब्बा रोग पहचानें'
                : 'Instant analysis via MobileNetV2 & Gemini AI'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white flex-shrink-0 ml-2">
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>

        {/* Action 2: Ask AI Assistant */}
        <button
          type="button"
          onClick={() => navigateTo('chat')}
          className="touch-target bg-white hover:bg-[#F1F4F8] active:bg-[#E4E9F0] text-[#0F2238] p-4.5 rounded-xl border-2 border-[#0F2238] text-left transition-colors cursor-pointer flex items-center justify-between group min-h-[96px]"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#15803D]">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-extrabold uppercase tracking-wider">
                {language === 'hi' ? 'किसान चौपाल' : 'Kisan Advisor'}
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-[#0F2238]">
              {language === 'hi' ? 'AI से सवाल पूछें' : 'Ask AI Assistant'}
            </h2>
            <p className="text-xs text-[#506680] line-clamp-1">
              {language === 'hi'
                ? 'बुवाई, खाद, सिंचाई और रोग उपचार पर बोलकर या लिखकर पूछें'
                : 'Bilingual advice grounded in ICAR research'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#F1F4F8] flex items-center justify-center text-[#0F2238] flex-shrink-0 ml-2">
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>

      </section>

      {/* 3. Target Crop Focus (Tomato & Potato) */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-[#0F2238] uppercase tracking-wide">
              {language === 'hi' ? 'सक्रिय फसल (Active Crop)' : 'Select Target Crop'}
            </h2>
            <p className="text-xs text-[#506680]">
              {language === 'hi' ? 'पत्ती जांच और सलाह के लिए फसल चुनें' : 'Switches agronomy focus and disease models'}
            </p>
          </div>
          <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-[#F1F4F8] text-[#0F2238] border border-[#CBD5E1]">
            {selectedCrop}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Tomato Card */}
          <div
            onClick={() => setSelectedCrop('Tomato')}
            className={`p-3.5 rounded-xl border-2 transition-colors cursor-pointer select-none flex flex-col justify-between touch-target ${
              selectedCrop === 'Tomato'
                ? 'border-[#0F2238] bg-[#F1F4F8]'
                : 'border-[#E4E9F0] bg-white hover:border-[#CBD5E1]'
            }`}
            role="button"
            tabIndex={0}
            aria-pressed={selectedCrop === 'Tomato'}
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">🍅</span>
              {selectedCrop === 'Tomato' && (
                <span className="bg-[#0F2238] text-white text-[10px] font-black px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="mt-2">
              <h3 className="font-extrabold text-sm text-[#0F2238]">
                {language === 'hi' ? 'टमाटर (Tomato)' : 'Tomato'}
              </h3>
              <p className="text-xs text-[#506680] mt-0.5 leading-snug">
                {language === 'hi' ? 'अगेती/पछेती झुलसा, लीफ मोल्ड, सेप्टोरिया' : 'Early Blight, Late Blight, Leaf Mold'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#E4E9F0] flex items-center justify-between text-xs font-bold text-[#0F2238]">
              <span>{language === 'hi' ? 'जांच शुरू करें' : 'Diagnose'}</span>
              <ChevronRight className="w-4 h-4 text-[#15803D]" />
            </div>
          </div>

          {/* Potato Card */}
          <div
            onClick={() => setSelectedCrop('Potato')}
            className={`p-3.5 rounded-xl border-2 transition-colors cursor-pointer select-none flex flex-col justify-between touch-target ${
              selectedCrop === 'Potato'
                ? 'border-[#0F2238] bg-[#F1F4F8]'
                : 'border-[#E4E9F0] bg-white hover:border-[#CBD5E1]'
            }`}
            role="button"
            tabIndex={0}
            aria-pressed={selectedCrop === 'Potato'}
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">🥔</span>
              {selectedCrop === 'Potato' && (
                <span className="bg-[#0F2238] text-white text-[10px] font-black px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="mt-2">
              <h3 className="font-extrabold text-sm text-[#0F2238]">
                {language === 'hi' ? 'आलू (Potato)' : 'Potato'}
              </h3>
              <p className="text-xs text-[#506680] mt-0.5 leading-snug">
                {language === 'hi' ? 'पछेती झुलसा, अगेती झुलसा, कंद स्वास्थ्य' : 'Late Blight, Early Blight, Tuber Care'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#E4E9F0] flex items-center justify-between text-xs font-bold text-[#0F2238]">
              <span>{language === 'hi' ? 'जांच शुरू करें' : 'Diagnose'}</span>
              <ChevronRight className="w-4 h-4 text-[#15803D]" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Farm Weather Card (Open-Meteo Integration) */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 border-b border-[#E4E9F0] pb-2.5">
          <div className="flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-[#0F2238]" />
            <h2 className="text-xs sm:text-sm font-extrabold text-[#0F2238] uppercase tracking-wide">
              {t.weather.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => fetchWeather('Kangra')}
            disabled={weatherLoading}
            className="touch-target text-[#506680] hover:text-[#0F2238] p-1.5 rounded transition-colors cursor-pointer flex items-center justify-center"
            title="Refresh weather"
            aria-label="Refresh weather data"
          >
            <RefreshCw className={`w-4 h-4 ${weatherLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {weatherLoading ? (
          <div className="py-6 text-center text-xs text-[#506680]">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0F2238] rounded-full animate-spin mx-auto mb-2" />
            <span>{language === 'hi' ? 'उपग्रह मौसम लोड हो रहा है...' : 'Fetching live satellite weather...'}</span>
          </div>
        ) : weatherError || !weather ? (
          <div className="py-3 px-3 bg-[#F1F4F8] rounded-lg text-xs text-[#506680] flex items-center justify-between">
            <span>{weatherError || 'Weather data unavailable'}</span>
            <button
              type="button"
              onClick={() => fetchWeather('Kangra')}
              className="text-xs font-bold text-[#0F2238] underline ml-2 cursor-pointer touch-target"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#506680] block truncate max-w-[220px]">
                  📍 {weatherLocation}
                </span>
                <span className="text-base sm:text-lg font-black text-[#0F2238] block mt-0.5">
                  {language === 'hi' ? weather.summaryHindi : weather.summary}
                </span>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="text-3xl">{weather.icon}</span>
                <span className="text-2xl font-black text-[#0F2238]">
                  {weather.temperature}°C
                </span>
              </div>
            </div>

            {/* Weather Metrics Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs">
              <div className="bg-[#F1F4F8] p-2 sm:p-2.5 rounded-lg border border-[#E4E9F0]">
                <span className="text-[10px] sm:text-[11px] text-[#506680] block truncate">{t.weather.humidity}</span>
                <strong className="text-xs sm:text-sm font-extrabold text-[#0F2238]">{weather.humidity}%</strong>
              </div>
              <div className="bg-[#F1F4F8] p-2 sm:p-2.5 rounded-lg border border-[#E4E9F0]">
                <span className="text-[10px] sm:text-[11px] text-[#506680] block truncate">{t.weather.rainRisk}</span>
                <strong className="text-xs sm:text-sm font-extrabold text-[#0F2238]">{weather.rainProbability}%</strong>
              </div>
              <div className="bg-[#F1F4F8] p-2 sm:p-2.5 rounded-lg border border-[#E4E9F0]">
                <span className="text-[10px] sm:text-[11px] text-[#506680] block truncate">{t.weather.wind}</span>
                <strong className="text-xs sm:text-sm font-extrabold text-[#0F2238]">{weather.windSpeed} km/h</strong>
              </div>
            </div>

            {/* Spray Guidance Advisory Pill (Restrained Green/Amber) */}
            <div
              className={`p-3 rounded-lg text-xs font-medium border flex items-start gap-2.5 ${
                weather.sprayFavorable
                  ? 'bg-[#EBF7EE] text-[#14532D] border-[#C6E9CC]'
                  : 'bg-amber-50 text-amber-950 border-amber-200'
              }`}
            >
              <span className="text-base mt-0.5">{weather.sprayFavorable ? '✅' : '⚠️'}</span>
              <div>
                <strong className="font-extrabold block text-xs uppercase tracking-wide">
                  {t.weather.sprayTitle}
                </strong>
                <span className="text-xs leading-normal">
                  {language === 'hi' ? weather.sprayAdviceHindi : weather.sprayAdvice}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. Verified Seasonal Advisory Card */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sprout className="w-4.5 h-4.5 text-[#15803D]" />
          <h2 className="text-xs sm:text-sm font-extrabold text-[#0F2238] uppercase tracking-wide">
            {language === 'hi' ? `${selectedCrop === 'Tomato' ? 'टमाटर' : 'आलू'} मौसमी सलाह` : `${selectedCrop} Seasonal Advisory`}
          </h2>
        </div>

        {selectedCrop === 'Tomato' ? (
          <div className="text-xs text-[#506680] space-y-2 leading-relaxed">
            <p>
              • <strong className="text-[#0F2238]">{language === 'hi' ? 'सिंचाई विधि:' : 'Irrigation:'}</strong> {language === 'hi' ? 'फूल आने और फल बनते समय जलभराव से बचें; ड्रिप सिंचाई करें ताकि पत्तियां गीली न हों।' : 'Maintain uniform moisture during flowering. Use drip irrigation to prevent foliar blight.'}
            </p>
            <p>
              • <strong className="text-[#0F2238]">{language === 'hi' ? 'रोग रोकथाम:' : 'Blight Alert:'}</strong> {language === 'hi' ? 'निचली संक्रमित पत्तियों को समय पर काटकर हटाएं और नीम का तेल (5ml/L) छिड़कें।' : 'Prune lower leaves touching soil. Spray cold-pressed Neem oil (5ml/L) as a prophylactic barrier.'}
            </p>
          </div>
        ) : (
          <div className="text-xs text-[#506680] space-y-2 leading-relaxed">
            <p>
              • <strong className="text-[#0F2238]">{language === 'hi' ? 'मिट्टी चढ़ाना (Earthing Up):' : 'Earthing Up:'}</strong> {language === 'hi' ? 'बुवाई के 30-35 दिन बाद कंदों को धूप से बचाने हेतु अच्छी मिट्टी चढ़ाएं।' : 'Mandatory earthing up at 30-35 days prevents greening and solanine buildup in tubers.'}
            </p>
            <p>
              • <strong className="text-[#0F2238]">{language === 'hi' ? 'पछेती झुलसा बचाव:' : 'Late Blight:'}</strong> {language === 'hi' ? 'लगातार 2 दिन कोहरा या रिमझिम बारिश होने पर कॉपर फफूंदनाशी का सुरक्षात्मक छिड़काव करें।' : 'If continuous fog or drizzle persists for 2 days, apply protective copper spray.'}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigateTo('guide')}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2238] hover:text-[#15803D] cursor-pointer touch-target"
        >
          <span>{language === 'hi' ? 'संपूर्ण वैज्ञानिक गाइड देखें' : 'View Complete Agronomic Guide'}</span>
          <ChevronRight className="w-4 h-4 text-[#15803D]" />
        </button>
      </section>

      {/* 6. Recent Diagnoses Section (Natural Scrolling) */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 border-b border-[#E4E9F0] pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#506680]" />
            <h2 className="text-xs sm:text-sm font-extrabold text-[#0F2238] uppercase tracking-wide">
              {language === 'hi' ? 'हाल की जांचें' : 'Recent Diagnoses'}
            </h2>
          </div>
          {recentDiagnoses.length > 0 && (
            <button
              type="button"
              onClick={() => navigateTo('profile')}
              className="text-xs font-bold text-[#0F2238] hover:underline cursor-pointer touch-target flex items-center"
            >
              {language === 'hi' ? 'सभी देखें' : 'View all'}
            </button>
          )}
        </div>

        {recentDiagnoses.length === 0 ? (
          <div className="py-5 px-4 bg-[#F1F4F8] rounded-lg text-center text-xs text-[#506680] space-y-2">
            <p>{language === 'hi' ? 'अभी तक कोई पत्ती स्कैन नहीं की गई है।' : 'No leaf diagnoses recorded yet.'}</p>
            <button
              type="button"
              onClick={() => navigateTo('doctor')}
              className="touch-target px-4 py-2.5 bg-[#0F2238] text-white rounded-lg text-xs font-bold hover:bg-[#142C4C] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4 text-[#16A34A]" />
              <span>{language === 'hi' ? 'पहला फोटो स्कैन करें' : 'Diagnose Your First Leaf'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentDiagnoses.map((item) => (
              <div
                key={item.id}
                onClick={() => navigateTo('doctor')}
                className="p-3 bg-[#F1F4F8] hover:bg-[#E4E9F0] rounded-lg border border-[#E4E9F0] flex items-center justify-between transition-colors cursor-pointer touch-target"
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-white border border-[#CBD5E1] flex items-center justify-center text-base flex-shrink-0">
                    {item.crop === 'Tomato' ? '🍅' : '🥔'}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0F2238]">
                      {language === 'hi' ? item.diseaseHindi || item.disease : item.disease}
                    </h4>
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

