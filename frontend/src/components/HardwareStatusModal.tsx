import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Activity,
  Radio,
  Zap,
  X,
  Droplets,
  Thermometer,
  ShieldCheck,
  Usb,
  CircuitBoard
} from 'lucide-react';
import { Language, HardwareStatusResponse } from '../types';
import { getHardwareStatus, pingHardware } from '../services/api';

interface HardwareStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HardwareStatusModal: React.FC<HardwareStatusModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [data, setData] = useState<HardwareStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pinging, setPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const isHindi = language === 'hi';

  const fullServerUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/iot/telemetry`
    : 'https://agrimitra-ai.onrender.com/api/iot/telemetry';

  const fetchStatus = async () => {
    try {
      const res = await getHardwareStatus();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.warn('Failed to load hardware status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handlePing = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const res = await pingHardware(data?.device_id || 'esp32-polyhouse-01');
      if (res.success) {
        setPingResult(isHindi ? 'सफल! सर्वर ऑनलाइन है और सिग्नल ले रहा है।' : 'Success! Server is online and receiving signals.');
        await fetchStatus();
      }
    } catch (err: any) {
      setPingResult(err.message || 'Ping failed');
    } finally {
      setPinging(false);
    }
  };

  const copyToClipboard = (text: string, isUrl: boolean) => {
    navigator.clipboard.writeText(text);
    if (isUrl) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  if (!isOpen) return null;

  const isConnected = data?.connected && data?.is_physical_hardware;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#E4E9F0] overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E4E9F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isConnected ? 'bg-[#EBF7EE] text-[#15803D]' : 'bg-amber-50 text-amber-700'
            }`}>
              {isConnected ? <Radio className="w-5 h-5 animate-pulse" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#142B4A]">
                {isHindi ? 'हार्डवेयर कनेक्शन स्थिति एवं डायग्नोस्टिक्स' : 'Hardware Connection & Diagnostics'}
              </h2>
              <p className="text-xs text-[#506680]">
                {isHindi ? 'ESP32-WROOM-32 (USB-C) कंट्रोलर की लाइव स्थिति' : 'ESP32-WROOM-32 (USB-C) Edge Controller'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#506680] hover:bg-[#E4E9F0] hover:text-[#142B4A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* 1. Big Live Connection Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isConnected
              ? 'bg-[#EBF7EE] border-[#C6E9CC] text-[#15803D]'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {isConnected ? (
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600"></span>
                  </span>
                ) : (
                  <span className="inline-block h-3.5 w-3.5 rounded-full bg-amber-500"></span>
                )}
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base">
                  {isConnected
                    ? (isHindi ? '🟢 हार्डवेयर लाइव कनेक्टेड है' : '🟢 Hardware Live & Connected')
                    : (isHindi ? '🟡 कोई हार्डवेयर कनेक्ट नहीं है (डेमो मोड चालू है)' : '🟡 No Hardware Detected (Demo Mode Active)')}
                </div>
                <div className="text-xs mt-0.5 opacity-90">
                  {isConnected
                    ? (isHindi
                        ? `डिवाइस: ${data?.device_id} • आखरी सिग्नल: ${data?.seconds_since_last_seen}s पहले प्राप्त`
                        : `Device: ${data?.device_id} • Last packet: ${data?.seconds_since_last_seen}s ago`)
                    : (isHindi
                        ? 'ESP32 से अभी तक कोई वास्तविक सिग्नल नहीं मिला। डैशबोर्ड पर सिमुलेटेड डेटा दिख रहा है।'
                        : 'No physical packets received yet. Dashboard is showing simulated farm data.')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePing}
              disabled={pinging}
              className="px-3 py-1.5 rounded-lg bg-white border shadow-xs text-xs font-bold text-[#142B4A] hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
              <span>{isHindi ? 'टेस्ट पिंग भेजें' : 'Send Test Ping'}</span>
            </button>
          </div>

          {pingResult && (
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{pingResult}</span>
            </div>
          )}

          {/* 1b. ESP32 Board Info Card */}
          <div className="p-3.5 rounded-xl border border-[#E4E9F0] bg-gradient-to-br from-[#F8FAFC] to-white space-y-2.5">
            <h3 className="font-black text-xs uppercase tracking-wider text-[#142B4A] flex items-center gap-1.5">
              <CircuitBoard className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{isHindi ? 'माइक्रोकंट्रोलर बोर्ड विवरण' : 'Microcontroller Board Details'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {/* Board Model */}
              <div className="p-2.5 rounded-lg bg-white border border-[#E4E9F0]">
                <div className="text-[10px] text-[#506680] font-semibold uppercase">
                  {isHindi ? 'बोर्ड मॉडल' : 'Board Model'}
                </div>
                <div className="text-xs font-extrabold text-[#142B4A] mt-0.5">
                  ESP32-WROOM-32
                </div>
              </div>

              {/* USB Connection */}
              <div className="p-2.5 rounded-lg bg-white border border-[#E4E9F0]">
                <div className="text-[10px] text-[#506680] font-semibold uppercase flex items-center gap-1">
                  <Usb className="w-3 h-3" />
                  {isHindi ? 'USB कनेक्शन' : 'USB Interface'}
                </div>
                <div className={`text-xs font-extrabold mt-0.5 flex items-center gap-1 ${
                  isConnected ? 'text-[#15803D]' : 'text-[#142B4A]'
                }`}>
                  <span>USB Type-C</span>
                  {isConnected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
                  )}
                </div>
              </div>

              {/* Firmware Version */}
              <div className="p-2.5 rounded-lg bg-white border border-[#E4E9F0]">
                <div className="text-[10px] text-[#506680] font-semibold uppercase">
                  {isHindi ? 'फर्मवेयर वर्ज़न' : 'Firmware Version'}
                </div>
                <div className="text-xs font-extrabold text-[#142B4A] mt-0.5">
                  {data?.firmware_version || 'v1.0.0'}
                </div>
              </div>

              {/* Connection Status */}
              <div className="p-2.5 rounded-lg bg-white border border-[#E4E9F0]">
                <div className="text-[10px] text-[#506680] font-semibold uppercase">
                  {isHindi ? 'कनेक्शन स्थिति' : 'Connection Status'}
                </div>
                <div className={`text-xs font-extrabold mt-0.5 ${
                  isConnected ? 'text-[#15803D]' : data?.status === 'stale' ? 'text-amber-700' : 'text-red-700'
                }`}>
                  {isConnected 
                    ? (isHindi ? '🟢 लाइव (ऑनलाइन)' : '🟢 Live (Online)')
                    : data?.status === 'stale' 
                      ? (isHindi ? '🟡 रुका हुआ (Stale)' : '🟡 Stale')
                      : (isHindi ? '🔴 ऑफलाइन' : '🔴 Offline')}
                </div>
              </div>
            </div>

            {/* Connection info when connected */}
            {isConnected && (
              <div className="p-2.5 rounded-lg bg-[#EBF7EE] border border-[#C6E9CC] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0" />
                <span className="text-xs font-bold text-[#15803D]">
                  {isHindi 
                    ? `ESP32-WROOM-32 (USB-C) सफलतापूर्वक कनेक्ट है • Device ID: ${data?.device_id} • ${data?.seconds_since_last_seen}s पहले डेटा प्राप्त`
                    : `ESP32-WROOM-32 (USB-C) connected successfully • Device: ${data?.device_id} • Last data ${data?.seconds_since_last_seen}s ago`}
                </span>
              </div>
            )}

            {/* Not connected helper */}
            {!isConnected && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  {isHindi ? 'ESP32 कनेक्ट करने के लिए:' : 'To connect your ESP32-WROOM-32:'}
                </div>
                <ol className="list-decimal list-inside space-y-0.5 pl-1 text-[11px]">
                  <li>{isHindi ? 'ESP32-WROOM-32 बोर्ड को USB Type-C केबल से कंप्यूटर में लगाएं' : 'Connect ESP32-WROOM-32 board via USB Type-C cable to your computer'}</li>
                  <li>{isHindi ? 'Arduino IDE में नीचे दिए गए सर्वर URL और सीक्रेट कुंजी डालें' : 'Flash the firmware with Server URL and Secret Key shown below'}</li>
                  <li>{isHindi ? 'ESP32 को अपने WiFi नेटवर्क से जोड़ें' : 'Connect ESP32 to your WiFi network'}</li>
                  <li>{isHindi ? 'बोर्ड हर 15 सेकंड में सर्वर को डेटा भेजेगा' : 'Board will transmit telemetry every 15 seconds'}</li>
                </ol>
              </div>
            )}
          </div>

          {/* 2. Sensor & Pin Health Grid */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-wider text-[#142B4A] mb-2">
              {isHindi ? 'सेंसर एवं रिले स्थिति (Pin Diagnostics)' : 'Sensors & Actuators Status'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              
              {/* Soil Probe */}
              <div className="p-2.5 rounded-xl border border-[#E4E9F0] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#142B4A]">
                      {isHindi ? 'मिट्टी की नमी सेंसर' : 'Soil Moisture Probe'}
                    </div>
                    <div className="text-[10px] text-[#506680]">GPIO 34 (ADC1)</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    data?.sensors?.soil_moisture?.status === 'ok'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {data?.sensors?.soil_moisture?.value !== null && data?.sensors?.soil_moisture?.value !== undefined
                      ? `${data.sensors.soil_moisture.value}%`
                      : 'No Signal'}
                  </span>
                </div>
              </div>

              {/* Air Temperature */}
              <div className="p-2.5 rounded-xl border border-[#E4E9F0] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#142B4A]">
                      {isHindi ? 'हवा का तापमान (DHT)' : 'Air Temperature'}
                    </div>
                    <div className="text-[10px] text-[#506680]">GPIO 4 (Digital)</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    data?.sensors?.temperature?.status === 'ok'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {data?.sensors?.temperature?.value !== null && data?.sensors?.temperature?.value !== undefined
                      ? `${data.sensors.temperature.value}°C`
                      : 'No Signal'}
                  </span>
                </div>
              </div>

              {/* Humidity */}
              <div className="p-2.5 rounded-xl border border-[#E4E9F0] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#142B4A]">
                      {isHindi ? 'हवा की नमी (Humidity)' : 'Relative Humidity'}
                    </div>
                    <div className="text-[10px] text-[#506680]">GPIO 4 (Digital)</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    data?.sensors?.humidity?.status === 'ok'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {data?.sensors?.humidity?.value !== null && data?.sensors?.humidity?.value !== undefined
                      ? `${data.sensors.humidity.value}%`
                      : 'No Signal'}
                  </span>
                </div>
              </div>

              {/* Pump Relay */}
              <div className="p-2.5 rounded-xl border border-[#E4E9F0] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#142B4A]">
                      {isHindi ? '12V वाटर पंप रिले' : '12V Water Pump Relay'}
                    </div>
                    <div className="text-[10px] text-[#506680]">GPIO 26 (Relay 1)</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    data?.sensors?.pump_relay?.state
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {data?.sensors?.pump_relay?.state ? 'ACTIVE (ON)' : 'STANDBY (OFF)'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* 3. Credentials to Put in ESP32 Code */}
          <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E4E9F0] space-y-2.5">
            <h3 className="font-black text-xs uppercase tracking-wider text-[#142B4A]">
              {isHindi ? 'ESP32 कोड में क्या डालना है? (Copy & Paste)' : 'Firmware Credentials (Arduino IDE)'}
            </h3>

            {/* Server URL */}
            <div>
              <label className="text-[11px] font-bold text-[#506680] block mb-1">
                Server Telemetry URL (सर्वर लिंक):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={fullServerUrl}
                  className="w-full font-mono text-[11px] bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-[#142B4A]"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(fullServerUrl, true)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-slate-50 text-xs font-bold text-[#142B4A] flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Device Key */}
            <div>
              <label className="text-[11px] font-bold text-[#506680] block mb-1">
                Device Secret Key (सीक्रेट कोड):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value="agrimitra_polyhouse_secret_2026"
                  className="w-full font-mono text-[11px] bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-[#142B4A]"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard('agrimitra_polyhouse_secret_2026', false)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-slate-50 text-xs font-bold text-[#142B4A] flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Live Telemetry Stream Log */}
          {data?.recent_packets && data.recent_packets.length > 0 && (
            <div>
              <h3 className="font-black text-xs uppercase tracking-wider text-[#142B4A] mb-1.5">
                {isHindi ? 'हाल ही में प्राप्त पैकेट्स (Live Incoming Packets)' : 'Recent Received Packets'}
              </h3>
              <div className="bg-slate-900 rounded-xl p-3 font-mono text-[11px] text-emerald-400 space-y-1 overflow-x-auto">
                {data.recent_packets.map((pkt, idx) => (
                  <div key={pkt.id || idx} className="flex items-center justify-between border-b border-slate-800 pb-1 last:border-none">
                    <span>
                      [{new Date(pkt.created_at).toLocaleTimeString()}] Soil: {pkt.soil_moisture}% | Temp: {pkt.temperature}°C | Hum: {pkt.humidity}%
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      Pump: {pkt.pump_state ? 'ON' : 'OFF'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-[#E4E9F0] bg-[#F8FAFC] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#142B4A] text-white text-xs font-bold hover:bg-[#1C3B64] transition-colors cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
