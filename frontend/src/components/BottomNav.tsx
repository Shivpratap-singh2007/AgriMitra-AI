import React from 'react';
import {
  Home,
  Cpu,
  MessageSquare,
  Clock,
  Sliders
} from 'lucide-react';
import { ActivePage, Language } from '../types';
import { translations } from '../data/translations';

interface BottomNavProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activePage,
  setActivePage,
  language,
}) => {
  const t = translations[language].nav;

  const navItems = [
    {
      id: 'home' as ActivePage,
      label: t.home,
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'farm' as ActivePage,
      label: t.farm,
      icon: <Cpu className="w-5 h-5" />,
    },
    {
      id: 'chat' as ActivePage,
      label: t.chat,
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: 'history' as ActivePage,
      label: t.history,
      icon: <Clock className="w-5 h-5" />,
    },
    {
      id: 'profile' as ActivePage,
      label: t.profile,
      icon: <Sliders className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E4E9F0] bottom-nav-safe"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14.5 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 touch-target rounded-md transition-colors cursor-pointer select-none relative ${
                isActive
                  ? 'text-[#0F2238] font-extrabold'
                  : 'text-[#64748B] hover:text-[#0F2238]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#2E7D32] rounded-full" />
              )}
              
              <div className={`p-1 rounded ${isActive ? 'text-[#142B4A]' : 'text-[#64748B]'}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] sm:text-[11px] tracking-tight leading-tight truncate max-w-full px-0.5 ${isActive ? 'text-[#142B4A] font-black' : 'font-semibold'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
