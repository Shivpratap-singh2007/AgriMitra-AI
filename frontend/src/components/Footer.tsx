import React from 'react';
import { Language } from '../types';
import { Sprout, Shield } from 'lucide-react';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-auto py-6 mb-16 md:mb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5A6B82]">
          <div className="flex items-center gap-2 font-medium">
            <div className="w-6 h-6 rounded-md bg-[#142B4A] flex items-center justify-center text-white text-xs">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <strong className="font-extrabold text-[#142B4A]">AgriMitra AI</strong>
            <span>•</span>
            <span>{language === 'hi' ? 'किसानों का डिजिटल साथी' : 'Dual AI Crop Disease Detection'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#5A6B82]">
            <span>Dedicated to Indian Farmers • Open Agri-Tech</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#5A6B82]">
            <Shield className="w-3 h-3 text-[#2E7D32]" />
            <span>ICAR & CPRI Knowledge Grounded</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
