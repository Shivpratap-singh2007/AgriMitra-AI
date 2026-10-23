import React from 'react';
import {
  Sprout,
  Home,
  Stethoscope,
  MessageSquare,
  BookOpen,
  User,
  Settings,
  Languages
} from 'lucide-react';
import { ActivePage, Crop, Language } from '../types';
import { translations } from '../data/translations';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedCrop: Crop;
  setSelectedCrop: (crop: Crop) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  openSettings: () => void;
  hasGeminiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  selectedCrop,
  setSelectedCrop,
  language,
  setLanguage,
  openSettings,
  hasGeminiKey,
}) => {
  const t = translations[language];

  const navItems = [
    { id: 'home' as ActivePage, label: t.nav.home, icon: <Home className="w-4 h-4" /> },
    { id: 'doctor' as ActivePage, label: t.nav.doctor, icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'chat' as ActivePage, label: t.nav.chat, icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'guide' as ActivePage, label: t.nav.guide, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'profile' as ActivePage, label: t.nav.profile, icon: <User className="w-4 h-4" /> },
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E4E9F0]">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-15 gap-2 sm:gap-4">
          
          {/* Brand Logo & Title */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0 touch-target"
            role="button"
            tabIndex={0}
            aria-label="AgriMitra AI Home"
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-[#0F2238] text-white flex items-center justify-center font-bold">
              <Sprout className="w-4.5 h-4.5 text-[#16A34A]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#0F2238]">
                  AgriMitra <span className="text-[#15803D]">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-[#F1F4F8] text-[#0F2238] px-1.5 py-0.5 rounded border border-[#E4E9F0]">
                  Kisan
                </span>
              </div>
              <p className="text-[11px] text-[#506680] leading-none mt-1 hidden xs:block">
                {language === 'hi' ? 'भारतीय कृषि निर्णय प्रणाली' : 'Crop Health & Decision AI'}
              </p>
            </div>
          </div>

          {/* Quick Crop Selector Pill - Large touch friendly & responsive */}
          <div className="flex items-center bg-[#F1F4F8] p-0.5 sm:p-1 rounded-lg border border-[#E4E9F0]">
            <button
              type="button"
              onClick={() => setSelectedCrop('Tomato')}
              className={`min-h-[36px] px-2.5 sm:px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                selectedCrop === 'Tomato'
                  ? 'bg-white text-[#0F2238] border border-[#CBD5E1] shadow-xs'
                  : 'text-[#506680] hover:text-[#0F2238]'
              }`}
              title={language === 'hi' ? 'टमाटर चुनें' : 'Select Tomato'}
            >
              <span className="text-sm">🍅</span>
              <span className="hidden sm:inline text-xs font-bold">{language === 'hi' ? 'टमाटर' : 'Tomato'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCrop('Potato')}
              className={`min-h-[36px] px-2.5 sm:px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                selectedCrop === 'Potato'
                  ? 'bg-white text-[#0F2238] border border-[#CBD5E1] shadow-xs'
                  : 'text-[#506680] hover:text-[#0F2238]'
              }`}
              title={language === 'hi' ? 'आलू चुनें' : 'Select Potato'}
            >
              <span className="text-sm">🥔</span>
              <span className="hidden sm:inline text-xs font-bold">{language === 'hi' ? 'आलू' : 'Potato'}</span>
            </button>
          </div>

          {/* Desktop Navigation Links (Functional desktop experience) */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Desktop Navigation">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[38px] ${
                    isActive
                      ? 'bg-[#0F2238] text-white'
                      : 'text-[#506680] hover:text-[#0F2238] hover:bg-[#F1F4F8]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Tools: Language Switcher & Settings */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Language Toggle with 44px touch target */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F4F8] hover:bg-[#E4E9F0] border border-[#E4E9F0] text-xs font-bold text-[#0F2238] transition-colors cursor-pointer"
              title="Change Language / भाषा बदलें"
              aria-label="Toggle language between English and Hindi"
            >
              <Languages className="w-4 h-4 text-[#15803D]" />
              <span className="text-xs font-extrabold">{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* API Settings Modal Trigger */}
            <button
              type="button"
              onClick={openSettings}
              className={`touch-target p-2 rounded-lg border text-xs font-bold transition-colors cursor-pointer relative flex items-center justify-center ${
                hasGeminiKey
                  ? 'bg-[#F1F4F8] hover:bg-[#E4E9F0] text-[#0F2238] border-[#E4E9F0]'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
              }`}
              title="API Configuration"
              aria-label="Open API settings modal"
            >
              <Settings className="w-4.5 h-4.5" />
              {!hasGeminiKey && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-600" />
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

