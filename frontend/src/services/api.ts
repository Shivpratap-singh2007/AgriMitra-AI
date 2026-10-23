import {
  CustomModelResult,
  GeminiResult,
  CompareResult,
  SystemConfig,
  WeatherResponse
} from '../types';

// Supports configurable backend base URL for production deployments (e.g., https://api.yourdomain.com/api)
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

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

