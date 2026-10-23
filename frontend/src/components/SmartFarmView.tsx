import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Droplets,
  Thermometer,
  Wind,
  Activity,
  AlertOctagon,
  Play,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { Language, LiveOverview, PolyhouseSettings } from '../types';
import { translations } from '../data/translations';
import {
  getLiveOverview,
  controlActuator,
  getPolyhouseSettings,
  updatePolyhouseSettings
} from '../services/api';

interface SmartFarmViewProps {
  language: Language;
}

export const SmartFarmView: React.FC<SmartFarmViewProps> = ({ language }) => {
  const t = translations[language];
  const tp = t.polyhouse;

  // Live state
  const [liveData, setLiveData] = useState<LiveOverview | null>(null);
  const [settings, setSettings] = useState<PolyhouseSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Pump countdown timer during manual 20s run
  const [pumpCountdown, setPumpCountdown] = useState<number>(0);

  const loadData = async () => {
    try {
      const [overviewRes, settingsRes] = await Promise.all([
        getLiveOverview('esp32-polyhouse-demo'),
        getPolyhouseSettings('esp32-polyhouse-demo')
      ]);
      setLiveData(overviewRes);
      if (settingsRes.success && settingsRes.settings) {
        setSettings(settingsRes.settings);
      }
    } catch (err: any) {
      console.error('Error fetching farm data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown hook for pump
  useEffect(() => {
    if (pumpCountdown <= 0) return;
    const timer = setInterval(() => {
      setPumpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [pumpCountdown]);

  const handleActuator = async (
    actuator: 'pump' | 'fan' | 'emergency_stop',
    state: boolean,
    durationSeconds?: number
  ) => {
    setActionMessage(null);
    setActionError(null);
    try {
      const res = await controlActuator(actuator, state, durationSeconds);
      if (res.success) {
        setActionMessage(res.message);
        if (actuator === 'pump' && state) {
          setPumpCountdown(durationSeconds || 20);
        } else if (actuator === 'emergency_stop') {
          setPumpCountdown(0);
        }
        await loadData();
      }
    } catch (err: any) {
      setActionError(err.message || 'Actuator control failed');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    setActionMessage(null);
    setActionError(null);
    try {
      const res = await updatePolyhouseSettings(settings);
      if (res.success) {
        setActionMessage(tp.settingsSaved);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const reading = liveData?.latest_reading;
  const actuators = liveData?.actuators;
  const sensorTrust = liveData?.sensor_trust;

  return (
    <div className="space-y-4 pb-4">
      
      {/* 1. View Header */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#142B4A] text-white flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#142B4A] tracking-tight">
              {tp.title}
            </h1>
            <p className="text-xs text-[#506680] mt-0.5">
              {tp.subtitle}
            </p>
          </div>
        </div>

        {/* Feedback message banners */}
        {actionMessage && (
          <div className="mt-3 p-3 rounded-lg bg-[#EBF7EE] border border-[#C6E9CC] text-xs font-bold text-[#15803D] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}
        {actionError && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </section>

      {/* 2. Live Sensor Telemetry Detail Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-xl border border-[#E4E9F0] p-3.5">
          <div className="flex items-center justify-between text-xs text-[#506680] font-bold">
            <span>{tp.soilMoisture}</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-[#142B4A]">
              {reading?.soil_moisture !== undefined ? `${reading.soil_moisture}%` : '--'}
            </span>
          </div>
          <div className="text-[10px] text-[#506680] flex items-center gap-1 font-semibold">
            <span>Status: </span>
            <span className={sensorTrust?.moisture_status === 'healthy' ? 'text-[#2E7D32]' : 'text-amber-600'}>
              {sensorTrust?.moisture_status || 'Checking'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E4E9F0] p-3.5">
          <div className="flex items-center justify-between text-xs text-[#506680] font-bold">
            <span>{tp.airTemp}</span>
            <Thermometer className="w-4 h-4 text-amber-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-[#142B4A]">
              {reading?.temperature !== undefined ? `${reading.temperature}°C` : '--'}
            </span>
          </div>
          <div className="text-[10px] text-[#506680] flex items-center gap-1 font-semibold">
            <span>DHT11: </span>
            <span className={sensorTrust?.dht_status === 'healthy' ? 'text-[#2E7D32]' : 'text-amber-600'}>
              {sensorTrust?.dht_status || 'Checking'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E4E9F0] p-3.5">
          <div className="flex items-center justify-between text-xs text-[#506680] font-bold">
            <span>{tp.humidity}</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-[#142B4A]">
              {reading?.humidity !== undefined ? `${reading.humidity}%` : '--'}
            </span>
          </div>
          <div className="text-[10px] text-[#506680] font-semibold">
            Range: 45 - 85%
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E4E9F0] p-3.5">
          <div className="flex items-center justify-between text-xs text-[#506680] font-bold">
            <span>{tp.vpd}</span>
            <Wind className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-[#142B4A]">
              {reading?.vpd_kpa !== undefined ? `${reading.vpd_kpa} kPa` : '--'}
            </span>
          </div>
          <div className="text-[10px] text-[#2E7D32] font-semibold">
            Healthy Transpiration
          </div>
        </div>
      </section>

      {/* 3. Manual Actuator Control Panel */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-extrabold text-[#142B4A] uppercase tracking-wide">
              {tp.manualControl}
            </h2>
            <p className="text-[11px] text-[#506680]">
              {language === 'hi'
                ? 'मैन्युअल परीक्षण 20 सेकंड के सुरक्षित कटऑफ और एंटी-साइकिल से सुरक्षित हैं।'
                : 'All manual actions obey safe 20s cutoffs and anti-cycling locks.'}
            </p>
          </div>

          {/* Emergency Stop Button */}
          <button
            type="button"
            onClick={() => handleActuator('emergency_stop', true)}
            className="touch-target px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Immediately deactivate all relays"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{tp.emergencyStop}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Water Pump Action Card */}
          <div className="p-3.5 rounded-xl border border-[#E4E9F0] bg-[#F8FAFC] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  actuators?.pump ? 'bg-[#2E7D32] text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#142B4A]">{tp.pump}</h3>
                  <span className={`text-[10px] font-extrabold ${actuators?.pump ? 'text-[#2E7D32]' : 'text-[#506680]'}`}>
                    {actuators?.pump ? tp.pumpStateOn : tp.pumpStateOff}
                  </span>
                </div>
              </div>

              {pumpCountdown > 0 && (
                <span className="text-xs font-black text-[#2E7D32] bg-[#EBF7EE] px-2 py-1 rounded border border-[#C6E9CC]">
                  {pumpCountdown}s left
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleActuator('pump', true, 20)}
                disabled={actuators?.pump || (actuators?.anti_cycle_remaining_sec ?? 0) > 0}
                className="flex-1 touch-target px-3 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#1b5e20] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{pumpCountdown > 0 ? tp.pumpRunning : tp.testPump20s}</span>
              </button>

              {actuators?.pump && (
                <button
                  type="button"
                  onClick={() => handleActuator('pump', false)}
                  className="touch-target px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Stop
                </button>
              )}
            </div>

            {actuators?.anti_cycle_remaining_sec && actuators.anti_cycle_remaining_sec > 0 ? (
              <p className="text-[10px] text-amber-700 font-semibold mt-2">
                Anti-cycle lockout: {actuators.anti_cycle_remaining_sec}s
              </p>
            ) : null}
          </div>

          {/* Ventilation Fan Action Card */}
          <div className="p-3.5 rounded-xl border border-[#E4E9F0] bg-[#F8FAFC] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  actuators?.fan ? 'bg-[#2E7D32] text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#142B4A]">{tp.fan}</h3>
                  <span className={`text-[10px] font-extrabold ${actuators?.fan ? 'text-[#2E7D32]' : 'text-[#506680]'}`}>
                    {actuators?.fan ? tp.fanStateOn : tp.fanStateOff}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleActuator('fan', !actuators?.fan)}
                className={`flex-1 touch-target px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  actuators?.fan
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-[#142B4A] hover:bg-[#1B3B64] text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{actuators?.fan ? 'Turn Fan OFF' : 'Turn Fan ON'}</span>
              </button>
            </div>

            <p className="text-[10px] text-[#506680] mt-2">
              Auto hysteresis triggers at 32.0°C and cools to 29.5°C
            </p>
          </div>
        </div>
      </section>

      {/* 4. Automation Thresholds Configuration Form */}
      {settings && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-[#142B4A]" />
            <h2 className="text-sm font-extrabold text-[#142B4A] uppercase tracking-wide">
              {tp.automationThresholds}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-[#142B4A] mb-1">
                {tp.moistureLowTrigger}
              </label>
              <input
                type="number"
                min="10"
                max="80"
                value={settings.moisture_low_trigger}
                onChange={(e) => setSettings({ ...settings, moisture_low_trigger: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#142B4A] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#142B4A] mb-1">
                {tp.moistureHighCutoff}
              </label>
              <input
                type="number"
                min="40"
                max="95"
                value={settings.moisture_high_cutoff}
                onChange={(e) => setSettings({ ...settings, moisture_high_cutoff: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#142B4A] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#142B4A] mb-1">
                {tp.tempFanStart}
              </label>
              <input
                type="number"
                step="0.5"
                min="20"
                max="45"
                value={settings.temp_fan_start}
                onChange={(e) => setSettings({ ...settings, temp_fan_start: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#142B4A] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#142B4A] mb-1">
                {tp.tempFanStop}
              </label>
              <input
                type="number"
                step="0.5"
                min="18"
                max="40"
                value={settings.temp_fan_stop}
                onChange={(e) => setSettings({ ...settings, temp_fan_stop: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#142B4A] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#142B4A] mb-1">
                {tp.maxPumpDuration}
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={settings.max_pump_duration_seconds}
                onChange={(e) => setSettings({ ...settings, max_pump_duration_seconds: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#142B4A] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#142B4A] mb-1">
                {tp.antiCycleInterval}
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.anti_cycle_interval_minutes}
                onChange={(e) => setSettings({ ...settings, anti_cycle_interval_minutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#142B4A] font-bold"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="touch-target px-4 py-2 rounded-lg bg-[#142B4A] hover:bg-[#1B3B64] text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'Saving...' : tp.saveSettings}</span>
            </button>
          </div>
        </form>
      )}

      {/* 5. Physical Wiring & Pinout Information Card */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 text-xs">
        <div className="flex items-center gap-2 mb-2 font-bold text-[#142B4A]">
          <Info className="w-4 h-4 text-[#2E7D32]" />
          <span>ESP32 Hardware Pin Assignments (Prototype Standard)</span>
        </div>
        <p className="text-[#506680] leading-relaxed">
          DHT11 Data Pin: <span className="font-mono text-[#142B4A] font-bold">GPIO 4</span> (with 4.7kΩ pull-up) • Capacitive Soil Moisture: <span className="font-mono text-[#142B4A] font-bold">GPIO 34 (ADC1)</span> • Relay CH1 (Pump): <span className="font-mono text-[#142B4A] font-bold">GPIO 18</span> • Relay CH2 (Fan): <span className="font-mono text-[#142B4A] font-bold">GPIO 19</span>. All relays are active-low optocoupler isolated.
        </p>
      </section>

    </div>
  );
};
