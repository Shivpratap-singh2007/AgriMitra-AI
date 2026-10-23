import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Droplets,
  Wind,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Gauge,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Language, FarmingActionItem, PerformanceReport } from '../types';
import { translations } from '../data/translations';
import { getFarmingHistory, getPerformanceReport } from '../services/api';

interface FarmHistoryViewProps {
  language: Language;
}

export const FarmHistoryView: React.FC<FarmHistoryViewProps> = ({ language }) => {
  const t = translations[language];
  const tp = t.polyhouse;

  const [history, setHistory] = useState<FarmingActionItem[]>([]);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [histRes, repRes] = await Promise.all([
        getFarmingHistory('esp32-polyhouse-demo', 50),
        getPerformanceReport('esp32-polyhouse-demo')
      ]);
      if (histRes.success) {
        setHistory(histRes.history);
      }
      if (repRes.success) {
        setReport(repRes.metrics);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="space-y-4 pb-4">
      
      {/* 1. Header with Core USP description */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] bg-[#EBF7EE] px-2.5 py-1 rounded-md border border-[#C6E9CC] mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{tp.uspSubtitle}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#142B4A] tracking-tight">
              {tp.farmResponseTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#506680] mt-1 max-w-xl">
              {language === 'hi'
                ? 'सिर्फ रिले ऑन करने से सफलता नहीं मानी जाती। हमारा सिस्टम पानी रिसने और मिट्टी में वास्तविक नमी वृद्धि की पुष्टि करता है।'
                : 'Closing the agricultural loop: every action is audited against subsequent sensor response to verify actual soil moisture percolation.'}
            </p>
          </div>

          <button
            type="button"
            onClick={loadHistory}
            disabled={loading}
            className="touch-target px-3 py-1.5 rounded-lg border border-[#E4E9F0] bg-[#F8FAFC] hover:bg-[#E4E9F0] text-xs font-bold text-[#142B4A] flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{language === 'hi' ? 'ताजा करें' : 'Refresh'}</span>
          </button>
        </div>
      </section>

      {/* 2. Measurable Farm Results Cards */}
      {report && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white rounded-xl border border-[#E4E9F0] p-3.5">
            <span className="text-xs text-[#506680] font-bold block">{tp.irrigationEvents}</span>
            <span className="text-2xl font-black text-[#142B4A] mt-1 block">
              {report.total_irrigation_actions}
            </span>
            <span className="text-[10px] text-[#2E7D32] font-semibold mt-1 block">
              {report.completion_rate_pct}% completed
            </span>
          </div>

          <div className="bg-white rounded-xl border border-[#E4E9F0] p-3.5">
            <span className="text-xs text-[#506680] font-bold block">{tp.verifiedRate}</span>
            <span className="text-2xl font-black text-[#2E7D32] mt-1 block">
              {report.effective_verification_rate_pct}%
            </span>
            <span className="text-[10px] text-[#506680] font-semibold mt-1 block">
              Sensor confirmed
            </span>
          </div>

          <div className="bg-white rounded-xl border border-[#E4E9F0] p-3.5">
            <span className="text-xs text-[#506680] font-bold block">{tp.waterUsageEst}</span>
            <span className="text-2xl font-black text-[#142B4A] mt-1 block">
              {report.total_water_liters} L
            </span>
            <span className="text-[10px] text-[#506680] font-semibold mt-1 block">
              Runtime: {report.total_pump_runtime_seconds}s
            </span>
          </div>

          <div className="bg-white rounded-xl border border-[#E4E9F0] p-3.5">
            <span className="text-xs text-[#506680] font-bold block">{tp.sensorFaultsCaught}</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">
              {report.sensor_fault_count}
            </span>
            <span className="text-[10px] text-[#2E7D32] font-semibold mt-1 block">
              {report.sensor_availability_pct}% sensor uptime
            </span>
          </div>
        </section>
      )}

      {/* 3. Chronological Action Timeline */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#142B4A] mb-4">
          {tp.actionTimeline}
        </h2>

        {history.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#506680] space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300" />
            <p>{tp.noActionsYet}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const isEffective = item.verification_status === 'confirmed_effective';
              const isWarning = item.verification_status === 'ineffective_warning';
              const isPending = item.verification_status === 'pending';

              const moistureDelta =
                item.post_moisture !== null && item.pre_moisture !== null
                  ? item.post_moisture - item.pre_moisture
                  : null;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-[#E4E9F0] bg-[#F8FAFC] space-y-2.5 transition-all"
                >
                  {/* Top Bar: Action Type, Trigger, Time, Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#142B4A] text-white flex items-center justify-center font-bold">
                        {item.action_type === 'irrigation_pump' ? (
                          <Droplets className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Wind className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#142B4A]">
                          {item.action_type === 'irrigation_pump' ? 'Water Pump Run' : 'Ventilation Fan Run'}
                        </span>
                        <span className="text-[10px] text-[#506680] ml-2">
                          ({item.duration_seconds}s • {item.trigger_source})
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${
                        isEffective
                          ? 'bg-[#EBF7EE] text-[#15803D] border-[#C6E9CC]'
                          : isWarning
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isPending
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {isEffective && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isWarning && <AlertTriangle className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      <span>
                        {isEffective
                          ? tp.verifiedEffective
                          : isWarning
                          ? tp.ineffectiveWarning
                          : isPending
                          ? tp.pendingVerification
                          : tp.unverifiable}
                      </span>
                    </span>
                  </div>

                  {/* Pre vs Post Sensor Data Audit Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-white border border-[#E4E9F0] text-center text-xs">
                    <div>
                      <p className="text-[10px] text-[#506680]">{tp.preReading}</p>
                      <p className="font-bold text-[#142B4A]">
                        {item.pre_moisture !== null ? `${item.pre_moisture}%` : '--'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[#506680]">{tp.postReading}</p>
                      <p className="font-bold text-[#142B4A]">
                        {item.post_moisture !== null ? `${item.post_moisture}%` : '--'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[#506680]">{tp.changeDelta}</p>
                      <p className={`font-black ${
                        moistureDelta !== null && moistureDelta > 0
                          ? 'text-[#2E7D32]'
                          : 'text-[#506680]'
                      }`}>
                        {moistureDelta !== null
                          ? `${moistureDelta > 0 ? '+' : ''}${moistureDelta}%`
                          : '--'}
                      </p>
                    </div>
                  </div>

                  {/* Outcome Note & Timestamp */}
                  <div className="flex items-center justify-between text-[11px] text-[#506680] pt-1">
                    <span className="italic">
                      {item.outcome_notes || 'Action logged in audit journal.'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
