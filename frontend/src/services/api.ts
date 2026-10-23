import {
  CustomModelResult,
  GeminiResult,
  CompareResult,
  SystemConfig,
  WeatherResponse,
  LiveOverview,
  PolyhouseSettings,
  FarmingActionItem,
  PerformanceReport,
  SensorAlert
} from '../types';

// Configurable backend base URL (e.g. for production web deployment or local dev)
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

// --- AgriMitra 2.0 Smart Polyhouse & Farm Response Intelligence APIs ---

export async function getLiveOverview(deviceId: string = 'esp32-polyhouse-demo'): Promise<LiveOverview> {
  const res = await fetch(`${API_BASE}/iot/live?device_id=${encodeURIComponent(deviceId)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch live overview (${res.status})`);
  }
  return res.json();
}

export async function controlActuator(
  actuator: 'pump' | 'fan' | 'emergency_stop',
  state: boolean,
  durationSeconds?: number,
  deviceId: string = 'esp32-polyhouse-demo'
): Promise<{ success: boolean; message: string; action_id?: number }> {
  const res = await fetch(`${API_BASE}/iot/devices/${encodeURIComponent(deviceId)}/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      actuator,
      state,
      duration_seconds: durationSeconds
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Actuator control failed');
  }
  return data;
}

export async function simulateTelemetry(
  scenario: 'normal' | 'dry_soil' | 'heat_stress' | 'sensor_fault',
  deviceId: string = 'esp32-polyhouse-demo'
): Promise<{ success: boolean; message: string; reading: any }> {
  const res = await fetch(`${API_BASE}/iot/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario, device_id: deviceId })
  });
  if (!res.ok) {
    throw new Error('Simulation failed');
  }
  return res.json();
}

export async function getPolyhouseSettings(deviceId: string = 'esp32-polyhouse-demo'): Promise<{ success: boolean; settings: PolyhouseSettings }> {
  const res = await fetch(`${API_BASE}/polyhouse/settings?device_id=${encodeURIComponent(deviceId)}`);
  if (!res.ok) {
    throw new Error('Failed to load polyhouse settings');
  }
  return res.json();
}

export async function updatePolyhouseSettings(settings: PolyhouseSettings): Promise<{ success: boolean; settings: PolyhouseSettings }> {
  const res = await fetch(`${API_BASE}/polyhouse/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) {
    throw new Error('Failed to update polyhouse settings');
  }
  return res.json();
}

export async function getFarmingHistory(deviceId: string = 'esp32-polyhouse-demo', limit: number = 30): Promise<{ success: boolean; history: FarmingActionItem[] }> {
  const res = await fetch(`${API_BASE}/polyhouse/history?device_id=${encodeURIComponent(deviceId)}&limit=${limit}`);
  if (!res.ok) {
    throw new Error('Failed to fetch farming history');
  }
  return res.json();
}

export async function getPerformanceReport(deviceId: string = 'esp32-polyhouse-demo'): Promise<{ success: boolean; metrics: PerformanceReport }> {
  const res = await fetch(`${API_BASE}/polyhouse/reports?device_id=${encodeURIComponent(deviceId)}`);
  if (!res.ok) {
    throw new Error('Failed to load performance report');
  }
  return res.json();
}

export async function getSensorAlerts(deviceId: string = 'esp32-polyhouse-demo'): Promise<{ success: boolean; alerts: SensorAlert[] }> {
  const res = await fetch(`${API_BASE}/polyhouse/alerts?device_id=${encodeURIComponent(deviceId)}`);
  if (!res.ok) {
    throw new Error('Failed to load sensor alerts');
  }
  return res.json();
}

export async function resolveSensorAlert(alertId: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/polyhouse/alerts/${alertId}/resolve`, {
    method: 'POST'
  });
  return res.json();
}

// --- Retained Plant Pathology & Diagnostics APIs ---

export async function predictCustomModel(
  file: File,
  crop: string,
  threshold: number = 0.55
): Promise<CustomModelResult> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('crop', crop);
  formData.append('confidence_threshold', threshold.toString());

  const res = await fetch(`${API_BASE}/predict/custom-model`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to analyze with Custom Model');
  }
  return res.json();
}

export async function predictGemini(
  file: File,
  crop: string,
  language: string = 'en'
): Promise<GeminiResult> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('crop', crop);
  formData.append('language', language);

  const res = await fetch(`${API_BASE}/predict/gemini`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to analyze with Gemini AI');
  }
  return res.json();
}

export async function predictCompare(
  file: File,
  crop: string,
  language: string = 'en',
  threshold: number = 0.55
): Promise<CompareResult> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('crop', crop);
  formData.append('language', language);
  formData.append('confidence_threshold', threshold.toString());

  const res = await fetch(`${API_BASE}/predict/compare`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to run Dual AI comparison');
  }
  return res.json();
}

export async function sendChatMessage(
  message: string,
  crop: string,
  language: string = 'en'
): Promise<{ success: boolean; reply: string; crop: string; apiKeyMissing?: boolean }> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, crop, language }),
  });
  return res.json();
}

export async function getCrops(): Promise<any> {
  const res = await fetch(`${API_BASE}/crops`);
  return res.json();
}

export async function getCropDetails(cropName: string): Promise<any> {
  const res = await fetch(`${API_BASE}/crops/${cropName.toLowerCase()}`);
  return res.json();
}

export async function getLiveWeather(
  location?: string,
  lat?: number,
  lon?: number
): Promise<WeatherResponse> {
  const params = new URLSearchParams();
  if (location) params.append('location', location);
  if (lat !== undefined && lon !== undefined) {
    params.append('lat', lat.toString());
    params.append('lon', lon.toString());
  }
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/weather${queryString}`);
  return res.json();
}

export async function getSystemConfig(): Promise<{ success: boolean; config: SystemConfig }> {
  const res = await fetch(`${API_BASE}/config`);
  const data = await res.json();
  return {
    success: data.success,
    config: {
      custom_model: data.custom_model,
      gemini: data.gemini,
      crops_supported: data.crops_supported
    }
  };
}

export async function updateSystemConfig(geminiApiKey: string): Promise<any> {
  const res = await fetch(`${API_BASE}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gemini_api_key: geminiApiKey }),
  });
  return res.json();
}
