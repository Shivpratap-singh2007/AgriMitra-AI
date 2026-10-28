export type Crop = 'Tomato' | 'Potato';
export type Language = 'en' | 'hi';
export type ActivePage = 'home' | 'farm' | 'chat' | 'history' | 'profile' | 'guide' | 'about';

// --- AgriMitra AI Smart Polyhouse & Farm Response Intelligence Types ---

export interface TelemetryReading {
  temperature: number;
  humidity: number;
  soil_moisture: number;
  vpd_kpa: number;
  pump_state: boolean;
  fan_state: boolean;
  timestamp: string;
  is_demo: boolean;
}

export interface ActuatorState {
  pump: boolean;
  fan: boolean;
  emergency_stop: boolean;
  auto_mode: boolean;
  last_pump_activation: string | null;
  anti_cycle_remaining_sec: number;
}

export interface SensorTrust {
  device_connected: boolean;
  last_seen_seconds_ago: number;
  liveness_status: 'live' | 'stale' | 'offline';
  hardware_connected?: boolean;
  is_physical_hardware?: boolean;
  dht_status: 'healthy' | 'implausible' | 'frozen' | 'missing';
  moisture_status: 'healthy' | 'implausible' | 'frozen' | 'missing';
  warnings: string[];
}

export interface AdvisoryItem {
  title: string;
  title_hi: string;
  recommendation: string;
  recommendation_hi: string;
  reason: string;
  reason_hi: string;
  supporting_data: Record<string, any>;
  action_type: 'irrigate' | 'ventilate' | 'inspect' | 'maintain' | 'monitor';
  suggested_duration_sec?: number;
  confidence: number;
  next_check: string;
}

export interface LiveOverview {
  success: boolean;
  device_id: string;
  device_name: string;
  latest_reading: TelemetryReading | null;
  actuators: ActuatorState;
  sensor_trust: SensorTrust;
  advisory: AdvisoryItem[];
  active_alerts_count: number;
  is_demo: boolean;
  is_physical_hardware?: boolean;
  hardware_connected?: boolean;
  seconds_since_last_seen?: number;
}

export interface HardwareStatusResponse {
  success: boolean;
  connected: boolean;
  is_physical_hardware: boolean;
  status: 'live' | 'stale' | 'offline';
  device_id: string;
  device_name: string;
  firmware_version?: string;
  last_seen_at?: string;
  seconds_since_last_seen: number;
  human_time: string;
  sensors: {
    soil_moisture: { name: string; pin: string; status: string; value: number | null; unit: string };
    temperature: { name: string; pin: string; status: string; value: number | null; unit: string };
    humidity: { name: string; pin: string; status: string; value: number | null; unit: string };
    pump_relay: { name: string; pin: string; status: string; state: boolean };
    fan_relay: { name: string; pin: string; status: string; state: boolean };
  };
  recent_packets: Array<{
    id: number;
    temperature: number;
    humidity: number;
    soil_moisture: number;
    pump_state: boolean;
    fan_state: boolean;
    voltage: number;
    created_at: string;
  }>;
  api_endpoint: string;
}

export interface FarmingActionItem {
  id: number;
  device_id: string;
  action_type: string;
  trigger_source: 'automated' | 'manual_farmer' | 'ai_advisory';
  crop: string;
  crop_stage: string;
  pre_moisture: number;
  pre_temperature: number;
  duration_seconds: number;
  status: 'completed' | 'in_progress' | 'failed' | 'aborted_safety';
  post_moisture: number | null;
  post_temperature: number | null;
  verified_at: string | null;
  verification_status: 'pending' | 'confirmed_effective' | 'ineffective_warning' | 'unverifiable';
  outcome_notes: string | null;
  created_at: string;
}

export interface PolyhouseSettings {
  device_id: string;
  crop_type: string;
  crop_stage: string;
  substrate: string;
  moisture_low_trigger: number;
  moisture_high_cutoff: number;
  temp_fan_start: number;
  temp_fan_stop: number;
  max_pump_duration_seconds: number;
  anti_cycle_interval_minutes: number;
  auto_irrigation_enabled: boolean;
  auto_ventilation_enabled: boolean;
  emergency_stop: boolean;
  water_flow_rate_lpm: number;
}

export interface PerformanceReport {
  total_irrigation_actions: number;
  completed_actions: number;
  completion_rate_pct: number;
  verified_effective_actions: number;
  effective_verification_rate_pct: number;
  total_pump_runtime_seconds: number;
  total_water_liters: number;
  sensor_fault_count: number;
  active_alerts_count: number;
  sensor_availability_pct: number;
}

export interface SensorAlert {
  id: number;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggested_action: string;
  created_at: string;
  resolved_at: string | null;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  crop?: string;
  isError?: boolean;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  weatherCode: number;
  summary: string;
  summaryHindi: string;
  icon: string;
  sprayFavorable: boolean;
  blightRisk: boolean;
  sprayAdvice: string;
  sprayAdviceHindi: string;
}

export interface WeatherResponse {
  success: boolean;
  provider: string;
  location: string;
  coordinates?: { latitude: number; longitude: number };
  data?: WeatherData;
  message?: string;
}

export interface SystemConfig {
  gemini: {
    has_key: boolean;
    model: string;
    status_message: string;
  };
  crops_supported: string[];
}
