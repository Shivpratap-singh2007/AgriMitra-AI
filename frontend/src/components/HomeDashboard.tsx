import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Droplets,
  Thermometer,
  Wind,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  BookOpen,
  RefreshCw,
  Sliders,
  ShieldCheck,
  ChevronRight,
  Play,
  CloudSun,
  Radio
} from 'lucide-react';
import { Crop, Language, ActivePage, LiveOverview, WeatherData } from '../types';
import { translations } from '../data/translations';
import { HardwareStatusModal } from './HardwareStatusModal';
import { getLiveOverview, simulateTelemetry, getLiveWeather } from '../services/api';

interface HomeDashboardProps {
  selectedCrop: Crop;
  setSelectedCrop: (crop: Crop) => void;
  language: Language;
  navigateTo: (page: ActivePage) => void;
  hasGeminiKey: boolean;
  }

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  selectedCrop,
  setSelectedCrop,
  language,
  navigateTo,
  hasGeminiKey,
}) => {
  const t = translations[language];
  const tp = t.polyhouse;

  // Live IoT Overview state
  const [liveData, setLiveData] = useState<LiveOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);

  // Weather state
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const fetchOverview = async () => {
    try {
      setError(null);
      const res = await getLiveOverview('esp32-polyhouse-demo');
      setLiveData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Polyhouse service');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      const res = await getLiveWeather('Kangra');
      if (res.success && res.data) {
        setWeather(res.data);
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchWeather();

    // Auto-refresh live data every 6 seconds
    const interval = setInterval(fetchOverview, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async (scenario: 'normal' | 'dry_soil' | 'heat_stress' | 'sensor_fault') => {
    setSimulating(true);
    try {
      await simulateTelemetry(scenario);
      await fetchOverview();
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setSimulating(false);
    }
  };

  const reading = liveData?.latest_reading;
  const actuators = liveData?.actuators;
  const sensorTrust = liveData?.sensor_trust;
  const advisory = liveData?.advisory?.[0];

  return (
    <div className="space-y-4 pb-4">
      
      {/* 1. Header Card with Live Status & Mode Badge */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Liveness & Hardware Badge (Clickable for Diagnostics) */}
              <button
                type="button"
                onClick={() => setIsHardwareModalOpen(true)}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                  liveData?.hardware_connected
                    ? 'bg-[#EBF7EE] text-[#15803D] border-[#C6E9CC] hover:bg-[#dcf3e1]'
                    : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                }`}
                title="Click to view Hardware Connection & Diagnostics"
              >
                <span className={`w-2 h-2 rounded-full ${
                  liveData?.hardware_connected
                    ? 'bg-[#2E7D32] animate-pulse'
                    : 'bg-amber-500'
                }`} />
                <span>
                  {liveData?.hardware_connected
                    ? (language === 'hi' ? '🟢 हार्डवेयर लाइव' : '🟢 Hardware Live')
                    : (language === 'hi' ? '🟡 डेमो मोड (हार्डवेयर जांचें)' : '🟡 Demo Mode (Check Hardware)')}
                </span>
                <Radio className="w-3 h-3 opacity-70 ml-0.5" />
              </button>

              {/* Crop indicator */}
              <span className="text-xs font-bold text-[#142B4A] bg-[#F1F4F8] px-2.5 py-1 rounded-md border border-[#E4E9F0]">
                {selectedCrop === 'Tomato' ? '🍅 Tomato (टमाटर)' : '🥔 Potato (आलू)'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#142B4A] tracking-tight">
              {language === 'hi' ? 'स्मार्ट पॉलीहाउस डैशबोर्ड' : 'Smart Polyhouse Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-[#506680] mt-1 leading-normal max-w-xl">
              {language === 'hi'
                ? 'ESP32 सेंसर आधारित स्वचालित सिंचाई, तापमान नियंत्रण एवं फार्म रिस्पांस इंटेलिजेंस।'
                : 'Autonomous ESP32 micro-climate monitoring, safe irrigation, and Farm Response Intelligence.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={fetchOverview}
              disabled={loading}
              className="touch-target px-3 py-1.5 rounded-lg border border-[#E4E9F0] bg-[#F8FAFC] hover:bg-[#E4E9F0] text-xs font-bold text-[#142B4A] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{language === 'hi' ? 'ताजा करें' : 'Refresh'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('farm')}
              className="touch-target px-3 py-1.5 rounded-lg bg-[#142B4A] hover:bg-[#1B3B64] text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'कंट्रोल' : 'Controls'}</span>
            </button>
          </div>
        </div>

        {/* Device Last Seen Notice */}
        {reading?.timestamp && (
          <div className="mt-3 pt-3 border-t border-[#F1F4F8] flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {language === 'hi' ? 'अंतिम अपडेट: ' : 'Last reading: '}
                {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </span>
            <span className="font-semibold text-[#142B4A]">
              ID: {liveData?.device_id || 'esp32-polyhouse-demo'}
            </span>
          </div>
        )}
      </section>

      {/* 2. Live Telemetry Metric Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Soil Moisture */}
        <div className="bg-white rounded-xl border border-[#E4E9F0] p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#506680] font-semibold">
            <span>{tp.soilMoisture}</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-[#142B4A]">
              {reading?.soil_moisture !== undefined ? `${reading.soil_moisture}%` : '--'}
            </span>
          </div>
          <div className="text-[11px] font-bold text-[#2E7D32] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
            <span>Target: 55 - 75%</span>
          </div>
        </div>

        {/* Air Temperature */}
        <div className="bg-white rounded-xl border border-[#E4E9F0] p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#506680] font-semibold">
            <span>{tp.airTemp}</span>
            <Thermometer className="w-4 h-4 text-amber-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-[#142B4A]">
              {reading?.temperature !== undefined ? `${reading.temperature}°C` : '--'}
            </span>
          </div>
          <div className="text-[11px] font-bold text-[#506680]">
            Fan Trigger: &gt; 32.0°C
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-white rounded-xl border border-[#E4E9F0] p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#506680] font-semibold">
            <span>{tp.humidity}</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-[#142B4A]">
              {reading?.humidity !== undefined ? `${reading.humidity}%` : '--'}
            </span>
          </div>
          <div className="text-[11px] font-bold text-[#506680]">
            Blight Risk: &gt; 80%
          </div>
        </div>

        {/* VPD Vapor Deficit */}
        <div className="bg-white rounded-xl border border-[#E4E9F0] p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#506680] font-semibold">
            <span>{tp.vpd}</span>
            <Wind className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-[#142B4A]">
              {reading?.vpd_kpa !== undefined ? `${reading.vpd_kpa} kPa` : '--'}
            </span>
          </div>
          <div className="text-[11px] font-bold text-[#2E7D32]">
            Transpiration: Ideal
          </div>
        </div>
      </section>

      {/* 3. Actuator States Banner (Pump & Fan) */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#506680]">
            {language === 'hi' ? 'सक्रिय रिले उपकरण स्थिति' : 'Active Actuator States'}
          </h2>
          <span className="text-[11px] font-bold text-[#2E7D32] bg-[#EBF7EE] px-2 py-0.5 rounded border border-[#C6E9CC]">
            Auto Safe-Cycle
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pump Status Card */}
          <div className={`p-3 rounded-lg border flex items-center justify-between ${
            actuators?.pump
              ? 'bg-[#EBF7EE] border-[#C6E9CC]'
              : 'bg-[#F8FAFC] border-[#E4E9F0]'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                actuators?.pump
                  ? 'bg-[#2E7D32] text-white animate-pulse'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#142B4A]">{tp.pump}</p>
                <p className="text-[11px] text-[#506680]">
                  {actuators?.pump ? tp.pumpStateOn : tp.pumpStateOff}
                </p>
              </div>
            </div>
            <span className={`text-xs font-extrabold px-2 py-1 rounded ${
              actuators?.pump ? 'bg-[#2E7D32] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {actuators?.pump ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>

          {/* Fan Status Card */}
          <div className={`p-3 rounded-lg border flex items-center justify-between ${
            actuators?.fan
              ? 'bg-[#EBF7EE] border-[#C6E9CC]'
              : 'bg-[#F8FAFC] border-[#E4E9F0]'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                actuators?.fan
                  ? 'bg-[#2E7D32] text-white animate-pulse'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#142B4A]">{tp.fan}</p>
                <p className="text-[11px] text-[#506680]">
                  {actuators?.fan ? tp.fanStateOn : tp.fanStateOff}
                </p>
              </div>
            </div>
            <span className={`text-xs font-extrabold px-2 py-1 rounded ${
              actuators?.fan ? 'bg-[#2E7D32] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {actuators?.fan ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Sensor Trust / Warnings Alert (if any) */}
      {sensorTrust?.warnings && sensorTrust.warnings.length > 0 && (
        <section className="bg-amber-50 rounded-xl border border-amber-300 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                {language === 'hi' ? 'सेंसर चेतावनी / त्रुटि पहचान' : 'Sensor Trust & Health Notice'}
              </h3>
              <ul className="text-xs text-amber-800 list-disc list-inside space-y-0.5">
                {sensorTrust.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-700 pt-1">
                {language === 'hi'
                  ? 'सुरक्षा नियम: अमान्य या रुका हुआ मान मिलने पर स्वतः सिंचाई अवरुद्ध रहेगी।'
                  : 'Safety Policy: Irrigation will remain locked until healthy, valid readings are restored.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 5. Explainable AI Recommendation Card (USP) */}
      {advisory && (
        <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] bg-[#EBF7EE] px-2.5 py-1 rounded-md border border-[#C6E9CC]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'स्पष्टीकरणीय कृषि सलाह' : 'Explainable Agronomic Advisory'}</span>
            </div>
            <span className="text-xs font-bold text-[#506680]">
              Confidence: {Math.round(advisory.confidence * 100)}%
            </span>
          </div>

          <h3 className="text-base font-extrabold text-[#142B4A] mt-1">
            {language === 'hi' ? advisory.title_hi : advisory.title}
          </h3>

          <div className="mt-2 p-3 rounded-lg bg-[#F8FAFC] border border-[#E4E9F0] space-y-2 text-xs">
            <div>
              <span className="font-bold text-[#142B4A]">
                {language === 'hi' ? 'सिफारिश (What): ' : 'Recommendation: '}
              </span>
              <span className="text-[#334155]">
                {language === 'hi' ? advisory.recommendation_hi : advisory.recommendation}
              </span>
            </div>
            <div>
              <span className="font-bold text-[#142B4A]">
                {language === 'hi' ? 'कारण (Why): ' : 'Reason: '}
              </span>
              <span className="text-[#506680]">
                {language === 'hi' ? advisory.reason_hi : advisory.reason}
              </span>
            </div>
            <div>
              <span className="font-bold text-[#142B4A]">
                {language === 'hi' ? 'अगला सत्यापन (Next Check): ' : 'Verification Check: '}
              </span>
              <span className="text-[#2E7D32] font-semibold">
                {advisory.next_check}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigateTo('chat')}
              className="touch-target px-3 py-1.5 rounded-lg border border-[#E4E9F0] text-xs font-bold text-[#142B4A] hover:bg-[#F1F4F8] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{language === 'hi' ? 'AI चौपाल में पूछें' : 'Discuss with AI'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('history')}
              className="touch-target px-3 py-1.5 rounded-lg bg-[#142B4A] text-xs font-bold text-white hover:bg-[#1B3B64] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{language === 'hi' ? 'सत्यापन इतिहास' : 'View History'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* 6. Interactive Simulator Bar for Testing Autonomy & Safety */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#142B4A] flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{tp.simulationMode}</span>
            </h2>
            <p className="text-[11px] text-[#506680] mt-0.5">
              {tp.simulationDesc}
            </p>
          </div>
          {simulating && (
            <span className="text-[11px] font-bold text-amber-700 animate-pulse">
              Injecting Telemetry...
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleSimulate('normal')}
            disabled={simulating}
            className="touch-target px-2.5 py-2 rounded-lg bg-[#F8FAFC] hover:bg-[#EBF7EE] hover:border-[#C6E9CC] border border-[#E4E9F0] text-left transition-colors cursor-pointer"
          >
            <p className="text-xs font-bold text-[#142B4A]">{tp.simNormal}</p>
            <p className="text-[10px] text-[#506680]">Moist 62% • Temp 27°C</p>
          </button>

          <button
            type="button"
            onClick={() => handleSimulate('dry_soil')}
            disabled={simulating}
            className="touch-target px-2.5 py-2 rounded-lg bg-[#F8FAFC] hover:bg-blue-50 hover:border-blue-300 border border-[#E4E9F0] text-left transition-colors cursor-pointer"
          >
            <p className="text-xs font-bold text-blue-900">{tp.simDry}</p>
            <p className="text-[10px] text-blue-700">Moist 22% • Safe Pump</p>
          </button>

          <button
            type="button"
            onClick={() => handleSimulate('heat_stress')}
            disabled={simulating}
            className="touch-target px-2.5 py-2 rounded-lg bg-[#F8FAFC] hover:bg-amber-50 hover:border-amber-300 border border-[#E4E9F0] text-left transition-colors cursor-pointer"
          >
            <p className="text-xs font-bold text-amber-900">{tp.simHeat}</p>
            <p className="text-[10px] text-amber-700">Temp 34.5°C • Fan Auto</p>
          </button>

          <button
            type="button"
            onClick={() => handleSimulate('sensor_fault')}
            disabled={simulating}
            className="touch-target px-2.5 py-2 rounded-lg bg-[#F8FAFC] hover:bg-red-50 hover:border-red-300 border border-[#E4E9F0] text-left transition-colors cursor-pointer"
          >
            <p className="text-xs font-bold text-red-900">{tp.simFault}</p>
            <p className="text-[10px] text-red-700">Frozen • Pump Lock</p>
          </button>
        </div>
      </section>

      {/* 7. Quick Navigation to Core Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Ask AI Chaupal */}
        <div
          onClick={() => navigateTo('chat')}
          className="bg-white rounded-xl border border-[#E4E9F0] p-4 hover:border-[#142B4A] transition-all cursor-pointer flex items-center justify-between touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF7EE] text-[#2E7D32] flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#142B4A]">
                {language === 'hi' ? 'AI किसान चौपाल' : 'AI Farmer Assistant'}
              </h3>
              <p className="text-[11px] text-[#506680]">
                {language === 'hi' ? 'पॉलीहाउस डेटा आधारित हिंदी/अंग्रेजी संवाद' : 'Grounded in live polyhouse sensor telemetry'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#506680]" />
        </div>

        {/* Crop Doctor / Disease Diagnosis */}
        <div
          onClick={() => navigateTo('guide')}
          className="bg-white rounded-xl border border-[#E4E9F0] p-4 hover:border-[#142B4A] transition-all cursor-pointer flex items-center justify-between touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#142B4A]">
                {language === 'hi' ? 'फसल मार्गदर्शिका (ICAR गाइड)' : 'Crop Cultivation Guide'}
              </h3>
              <p className="text-[11px] text-[#506680]">
                {language === 'hi' ? 'वैज्ञानिक बुवाई, खाद, सिंचाई और देखभाल गाइड' : 'ICAR-CPRI verified agronomic crop practices'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#506680]" />
        </div>
      </section>

      {/* 8. Satellite Agro-Weather Feed Card */}
      {weather && (
        <section className="bg-white rounded-xl border border-[#E4E9F0] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-[#142B4A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#142B4A]">
                {language === 'hi' ? 'क्षेत्रीय उपग्रह मौसम' : 'Satellite Agro-Weather'}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-[#506680]">
              {language === 'hi' ? 'कांगड़ा क्षेत्र' : 'Kangra Region'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2 text-center border-y border-[#F1F4F8]">
            <div>
              <p className="text-[10px] text-[#506680]">{t.weather.humidity}</p>
              <p className="text-sm font-bold text-[#142B4A]">{weather.humidity}%</p>
            </div>
            <div>
              <p className="text-[10px] text-[#506680]">{t.weather.rainRisk}</p>
              <p className="text-sm font-bold text-[#142B4A]">{weather.rainProbability}%</p>
            </div>
            <div>
              <p className="text-[10px] text-[#506680]">{t.weather.wind}</p>
              <p className="text-sm font-bold text-[#142B4A]">{weather.windSpeed} km/h</p>
            </div>
          </div>

          <p className="text-xs text-[#334155] mt-2 font-medium">
            {language === 'hi' ? weather.sprayAdviceHindi : weather.sprayAdvice}
          </p>
        </section>
      )}

      {/* Hardware Connection Diagnostics Modal */}
      <HardwareStatusModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        language={language}
      />

    </div>
  );
};
