import React, { useState, useEffect } from 'react';
import { Crop, Language, ActivePage, SystemConfig } from './types';
import { getSystemConfig } from './services/api';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { SmartFarmView } from './components/SmartFarmView';
import { Chatbot } from './components/Chatbot';
import { FarmHistoryView } from './components/FarmHistoryView';
import { CropDoctor } from './components/CropDoctor';
import { CropGuide } from './components/CropGuide';
import { ProfileView } from './components/ProfileView';
import { AboutView } from './components/AboutView';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { Footer } from './components/Footer';
import { WifiOff } from 'lucide-react';

export function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedCrop, setSelectedCrop] = useState<Crop>('Tomato');
  const [language, setLanguage] = useState<Language>('en');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [chatPrefill, setChatPrefill] = useState<string | undefined>(undefined);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const fetchConfig = async () => {
    try {
      const res = await getSystemConfig();
      if (res.success) {
        setConfig(res.config);
      }
    } catch (err) {
      console.warn('Could not load system config:', err);
    }
  };

  useEffect(() => {
    fetchConfig();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const navigateTo = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToChatWithQuestion = (diseaseName?: string) => {
    setChatPrefill(diseaseName);
    setActivePage('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-[#0F1D30] flex flex-col font-sans selection:bg-[#142B4A] selection:text-white">
      
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 sticky top-0 z-50 shadow-xs">
          <WifiOff className="w-3.5 h-3.5" />
          <span>
            {language === 'hi'
              ? 'आप अभी ऑफलाइन हैं। सहेजा गया इतिहास और गाइड बिना इंटरनेट उपलब्ध हैं।'
              : 'You are currently offline. Saved history and guide remain accessible.'}
          </span>
        </div>
      )}

      {/* Top Header Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        selectedCrop={selectedCrop}
        setSelectedCrop={setSelectedCrop}
        language={language}
        setLanguage={setLanguage}
        openSettings={() => setIsSettingsOpen(true)}
        hasGeminiKey={Boolean(config?.gemini.has_key)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-4 pb-mobile-nav">
        {activePage === 'home' && (
          <HomeDashboard
            selectedCrop={selectedCrop}
            setSelectedCrop={setSelectedCrop}
            language={language}
            navigateTo={navigateTo}
            hasGeminiKey={Boolean(config?.gemini.has_key)}
            isModelReady={Boolean(config?.custom_model.is_loaded)}
          />
        )}

        {activePage === 'farm' && (
          <SmartFarmView language={language} />
        )}

        {activePage === 'chat' && (
          <Chatbot
            selectedCrop={selectedCrop}
            setSelectedCrop={setSelectedCrop}
            language={language}
            openSettings={() => setIsSettingsOpen(true)}
            hasGeminiKey={Boolean(config?.gemini.has_key)}
            prefillQuestion={chatPrefill}
          />
        )}

        {activePage === 'history' && (
          <FarmHistoryView language={language} />
        )}

        {activePage === 'doctor' && (
          <CropDoctor
            selectedCrop={selectedCrop}
            setSelectedCrop={setSelectedCrop}
            language={language}
            onNavigateToChat={handleNavigateToChatWithQuestion}
          />
        )}

        {activePage === 'guide' && (
          <CropGuide
            selectedCrop={selectedCrop}
            setSelectedCrop={setSelectedCrop}
            language={language}
          />
        )}

        {activePage === 'profile' && (
          <ProfileView
            language={language}
            setLanguage={setLanguage}
            openSettings={() => setIsSettingsOpen(true)}
            config={config}
            navigateTo={navigateTo}
          />
        )}

        {activePage === 'about' && (
          <AboutView language={language} />
        )}
      </main>

      {/* Site Footer */}
      <Footer language={language} />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav
        activePage={activePage}
        setActivePage={setActivePage}
        language={language}
      />

      {/* Gemini API Key Settings Modal */}
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onKeySaved={fetchConfig}
      />

    </div>
  );
}

export default App;
