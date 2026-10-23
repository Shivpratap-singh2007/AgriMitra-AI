import React, { useState } from 'react';
import { updateSystemConfig } from '../services/api';
import { Language } from '../types';
import { Settings, X, Key, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onKeySaved: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setStatusMessage({ text: 'Please enter a valid Gemini API Key', isError: true });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await updateSystemConfig(apiKey.trim());
      if (res.success) {
        setStatusMessage({ text: 'API Key saved successfully to .env and runtime environment!', isError: false });
        onKeySaved();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ text: res.message || 'Failed to update configuration', isError: true });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Error updating API settings', isError: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#E2E8F0] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#5A6B82] hover:text-[#142B4A] rounded-lg hover:bg-[#F3F5F7] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#142B4A] text-white flex items-center justify-center font-bold text-lg">
            <Key className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#142B4A]">
              {language === 'hi' ? 'Google Gemini API सेटिंग्स' : 'Gemini API Settings'}
            </h2>
            <p className="text-xs text-[#5A6B82]">
              {language === 'hi' ? 'AI चौपाल और विज़न के लिए कुंजी दर्ज करें' : 'Configure key for Gemini Vision & Chatbot'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#142B4A] uppercase tracking-wider mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] text-base sm:text-sm font-mono focus:outline-none focus:border-[#142B4A] bg-[#F3F5F7] min-h-[44px]"
            />
          </div>

          <div className="p-3 bg-[#F3F5F7] rounded-lg border border-[#E2E8F0] text-xs text-[#5A6B82] space-y-1.5">
            <p>
              Google Gemini API keys are completely free from Google AI Studio. The key is stored safely on your backend and never exposed to clients.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#142B4A] font-bold hover:underline"
            >
              <span>Get Free Key on Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                statusMessage.isError
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              }`}
            >
              {statusMessage.isError ? (
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#5A6B82] hover:bg-[#F3F5F7] transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] active:bg-[#0F1D30] text-white text-xs font-bold transition-all cursor-pointer min-h-[44px]"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
