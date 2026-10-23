import React from 'react';
import { Crop, Language } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface CropSelectorProps {
  selectedCrop: Crop;
  onSelectCrop: (crop: Crop) => void;
  language: Language;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  selectedCrop,
  onSelectCrop,
  language,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {/* Tomato Card */}
      <div
        onClick={() => onSelectCrop('Tomato')}
        className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-between overflow-hidden ${
          selectedCrop === 'Tomato'
            ? 'border-green-600 bg-green-50/70 ring-2 ring-green-600/20'
            : 'border-gray-200 bg-white hover:border-green-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-3xl shrink-0 shadow-inner">
            🍅
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">
                {language === 'hi' ? 'टमाटर (Tomato)' : 'Tomato (टमाटर)'}
              </h3>
              <span className="text-xs bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-md border border-red-200">
                Solanum lycopersicum
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
              {language === 'hi'
                ? 'अगेती/पछेती झुलसा, लीफ मोल्ड, सेप्टोरिया रोग जांच'
                : 'Early & Late Blight, Leaf Mold, Septoria detection'}
            </p>
          </div>
        </div>

        <div className="shrink-0 pl-2">
          {selectedCrop === 'Tomato' ? (
            <div className="flex items-center gap-1.5 text-green-700 font-bold text-xs bg-white px-3 py-1.5 rounded-full border border-green-300 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 fill-green-600 text-white" />
              <span>{language === 'hi' ? 'सक्रिय' : 'Active'}</span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-gray-400 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50">
              {language === 'hi' ? 'चुनें' : 'Select'}
            </span>
          )}
        </div>
      </div>

      {/* Potato Card */}
      <div
        onClick={() => onSelectCrop('Potato')}
        className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-between overflow-hidden ${
          selectedCrop === 'Potato'
            ? 'border-green-600 bg-green-50/70 ring-2 ring-green-600/20'
            : 'border-gray-200 bg-white hover:border-green-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shrink-0 shadow-inner">
            🥔
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">
                {language === 'hi' ? 'आलू (Potato)' : 'Potato (आलू)'}
              </h3>
              <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-md border border-amber-200">
                Solanum tuberosum
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
              {language === 'hi'
                ? 'पछेती झुलसा, अगेती झुलसा एवं कंद स्वास्थ्य जांच'
                : 'Late Blight, Early Blight & tuber pathology'}
            </p>
          </div>
        </div>

        <div className="shrink-0 pl-2">
          {selectedCrop === 'Potato' ? (
            <div className="flex items-center gap-1.5 text-green-700 font-bold text-xs bg-white px-3 py-1.5 rounded-full border border-green-300 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 fill-green-600 text-white" />
              <span>{language === 'hi' ? 'सक्रिय' : 'Active'}</span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-gray-400 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50">
              {language === 'hi' ? 'चुनें' : 'Select'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
