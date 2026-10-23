import React, { useState } from 'react';
import { Crop, Language } from '../types';
import { translations } from '../data/translations';
import {
  Thermometer,
  Layers,
  Calendar,
  Droplets,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

interface CropGuideProps {
  selectedCrop: Crop;
  setSelectedCrop: (crop: Crop) => void;
  language: Language;
}

export const CropGuide: React.FC<CropGuideProps> = ({
  selectedCrop,
  setSelectedCrop,
  language,
}) => {
  const t = translations[language].guide;

  // Active accordion section
  const [openSection, setOpenSection] = useState<string>('calendar');

  const toggleSection = (sec: string) => {
    setOpenSection(openSection === sec ? '' : sec);
  };

  return (
    <div className="space-y-4 pb-6">
      
      {/* 1. Header & Crop Switcher */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F2238] tracking-tight">
              {t.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#506680] mt-0.5">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F1F4F8] p-1 rounded-lg border border-[#E4E9F0] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedCrop('Tomato')}
              className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCrop === 'Tomato'
                  ? 'bg-white text-[#0F2238] border border-[#CBD5E1]'
                  : 'text-[#506680] hover:text-[#0F2238]'
              }`}
            >
              <span>🍅</span>
              <span>{language === 'hi' ? 'टमाटर' : 'Tomato'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCrop('Potato')}
              className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCrop === 'Potato'
                  ? 'bg-white text-[#0F2238] border border-[#CBD5E1]'
                  : 'text-[#506680] hover:text-[#0F2238]'
              }`}
            >
              <span>🥔</span>
              <span>{language === 'hi' ? 'आलू' : 'Potato'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Key Vital Metrics Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-[#E4E9F0]">
          <div className="flex items-center gap-1.5 text-[#15803D] text-[11px] font-bold uppercase mb-1">
            <Thermometer className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'तापमान' : 'Optimal Temp'}</span>
          </div>
          <strong className="text-sm font-extrabold text-[#0F2238] block">
            {selectedCrop === 'Tomato' ? '21°C – 28°C' : '15°C – 22°C'}
          </strong>
          <span className="text-[11px] text-[#506680]">
            {selectedCrop === 'Tomato' ? 'Growth & Flower Set' : 'Crucial for Tuber Bulking'}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E4E9F0]">
          <div className="flex items-center gap-1.5 text-[#15803D] text-[11px] font-bold uppercase mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'मिट्टी का pH' : 'Soil pH'}</span>
          </div>
          <strong className="text-sm font-extrabold text-[#0F2238] block">
            {selectedCrop === 'Tomato' ? '6.0 – 7.0' : '5.2 – 6.4'}
          </strong>
          <span className="text-[11px] text-[#506680]">
            {selectedCrop === 'Tomato' ? 'Sandy Loam with Humus' : 'Slightly acidic avoids Scab'}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E4E9F0]">
          <div className="flex items-center gap-1.5 text-[#15803D] text-[11px] font-bold uppercase mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'फसल अवधि' : 'Crop Duration'}</span>
          </div>
          <strong className="text-sm font-extrabold text-[#0F2238] block">
            {selectedCrop === 'Tomato' ? '90 – 140 Days' : '75 – 120 Days'}
          </strong>
          <span className="text-[11px] text-[#506680]">
            {selectedCrop === 'Tomato' ? 'Hybrid indeterminate' : 'Early vs main crop'}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E4E9F0]">
          <div className="flex items-center gap-1.5 text-[#15803D] text-[11px] font-bold uppercase mb-1">
            <Droplets className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सिंचाई विधि' : 'Irrigation'}</span>
          </div>
          <strong className="text-sm font-extrabold text-[#0F2238] block">
            {selectedCrop === 'Tomato' ? 'Drip Method' : 'Furrow 2/3 Height'}
          </strong>
          <span className="text-[11px] text-[#506680]">
            {selectedCrop === 'Tomato' ? 'Prevents foliar mold' : 'Never submerge ridges'}
          </span>
        </div>
      </section>

      {/* 3. Accordion Guides (Touch-friendly 44px+ headers) */}
      <div className="space-y-3">
        
        {/* Accordion 1: Regional Sowing Calendar */}
        <div className="bg-white rounded-xl border border-[#E4E9F0] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('calendar')}
            className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-[#0F2238] hover:bg-[#F1F4F8] transition-colors cursor-pointer touch-target"
            aria-expanded={openSection === 'calendar'}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0F2238]" />
              <span>{t.sowingCal}</span>
            </div>
            {openSection === 'calendar' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'calendar' && (
            <div className="p-4 pt-0 border-t border-[#E4E9F0] text-xs text-[#1E293B] space-y-3">
              {selectedCrop === 'Tomato' ? (
                <>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      {language === 'hi' ? 'उत्तर भारतीय मैदान (North Indian Plains)' : 'North Indian Plains'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'शरदकालीन (Autumn): नर्सरी सितम्बर-अक्टूबर, रोपाई अक्टूबर-नवंबर। बसंतकालीन (Spring): नर्सरी जनवरी, रोपाई फरवरी।'
                        : 'Autumn crop: Nursery Sep-Oct, transplanting Oct-Nov. Spring crop: Nursery Jan, transplanting Feb.'}
                    </p>
                  </div>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      {language === 'hi' ? 'पहाड़ी क्षेत्र (Hills: HP, Uttarakhand, Kashmir)' : 'Hill Regions'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'बुवाई मार्च-अप्रैल, रोपाई अप्रैल-मई। वर्षाऋतु में पाले से सुरक्षित बेमौसम फसल ली जाती है।'
                        : 'Sowing March-April, transplanting April-May for off-season summer harvest.'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      {language === 'hi' ? 'सिंधु-गंगा के मैदान (Indo-Gangetic Plains: UP, Bihar, Punjab, Bengal)' : 'Indo-Gangetic Plains'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'मुख्य रबी फसल: 15 अक्टूबर से 5 नवंबर (कुफरी बहार, कुफरी पोखराज)। अगेती फसल: मध्य सितम्बर से 5 अक्टूबर।'
                        : 'Main Rabi Crop: 15 October to 5 November. Early crop: Mid-September to 5 October.'}
                    </p>
                  </div>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      {language === 'hi' ? 'पठारी क्षेत्र (Plateau: Maharashtra, MP, Karnataka)' : 'Plateau & Central India'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'खरीफ बुवाई: जून-जुलाई। रबी बुवाई: अक्टूबर-नवंबर। कंद बनने के समय रात का तापमान 21°C से कम आवश्यक है।'
                        : 'Kharif planting: June-July. Rabi planting: October-November.'}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Accordion 2: Water & Irrigation Management */}
        <div className="bg-white rounded-xl border border-[#E4E9F0] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('water')}
            className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-[#0F2238] hover:bg-[#F1F4F8] transition-colors cursor-pointer touch-target"
            aria-expanded={openSection === 'water'}
          >
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#0F2238]" />
              <span>{t.waterMgmt}</span>
            </div>
            {openSection === 'water' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'water' && (
            <div className="p-4 pt-0 border-t border-[#E4E9F0] text-xs text-[#1E293B] space-y-2.5">
              {selectedCrop === 'Tomato' ? (
                <div className="bg-[#EBF7EE] p-3 rounded-lg border border-[#C6E9CC] space-y-1.5 leading-relaxed">
                  <p>
                    • <strong className="text-[#14532D]">{language === 'hi' ? 'ड्रिप सिंचाई:' : 'Drip Irrigation:'}</strong> {language === 'hi' ? 'पत्तियों को गीला किए बिना ड्रिप से सिंचाई करें। इससे अगेती व पछेती झुलसा का खतरा 60% घटता है।' : 'Drip irrigation avoids wetting foliage, cutting fungal blight transmission significantly.'}
                  </p>
                  <p>
                    • <strong className="text-[#14532D]">{language === 'hi' ? 'महत्वपूर्ण अवस्था:' : 'Critical Stages:'}</strong> {language === 'hi' ? 'रोपाई के 3 दिन बाद, फूल आते समय, और फल बनते समय। फल पकते समय हल्की सिंचाई करें ताकि फल फटने (Cracking) से बचें।' : 'Transplanting, flowering, and fruit sizing. Maintain uniform moisture to prevent fruit cracking and blossom end rot.'}
                  </p>
                </div>
              ) : (
                <div className="bg-[#EBF7EE] p-3 rounded-lg border border-[#C6E9CC] space-y-1.5 leading-relaxed">
                  <p>
                    • <strong className="text-[#14532D]">{language === 'hi' ? 'सिंचाई विधि:' : 'Method:'}</strong> {language === 'hi' ? 'मेड़ की ऊंचाई के दो-तिहाई हिस्से तक ही पानी दें। मेड़ के ऊपर पानी चढ़ने से कंद सड़न और पछेती झुलसा का खतरा बढ़ता है।' : 'Water should reach only 2/3rd up the ridge. Never over-flood or submerge tops of ridges.'}
                  </p>
                  <p>
                    • <strong className="text-[#14532D]">{language === 'hi' ? 'खुदाई से पूर्व रोक:' : 'Pre-harvest stoppage:'}</strong> {language === 'hi' ? 'आलू की खुदाई से 10-12 दिन पहले पानी पूरी तरह बंद कर दें ताकि कंद की छाल कठोर हो सके।' : 'Stop irrigation 10-12 days before harvest to allow tuber skins to harden and prevent rotting.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accordion 3: Nutrient & Fertilizer Management */}
        <div className="bg-white rounded-xl border border-[#E4E9F0] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('fertilizer')}
            className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-[#0F2238] hover:bg-[#F1F4F8] transition-colors cursor-pointer touch-target"
            aria-expanded={openSection === 'fertilizer'}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0F2238]" />
              <span>{t.nutrientMgmt}</span>
            </div>
            {openSection === 'fertilizer' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'fertilizer' && (
            <div className="p-4 pt-0 border-t border-[#E4E9F0] text-xs text-[#1E293B] space-y-2.5">
              {selectedCrop === 'Tomato' ? (
                <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0] space-y-1.5 leading-relaxed">
                  <p>
                    • <strong className="text-[#0F2238]">NPK (100:60:60 kg/ha):</strong> {language === 'hi' ? 'रोपाई के समय पूरी फास्फोरस व पोटाश और आधी नाइट्रोजन दें। शेष नाइट्रोजन को 30 व 50 दिन पर टॉप ड्रेसिंग करें।' : 'Full P, full K, and 50% N at planting. Remaining N split at 30 and 50 days after planting.'}
                  </p>
                  <p>
                    • <strong className="text-[#0F2238]">{language === 'hi' ? 'कैल्शियम स्प्रे:' : 'Calcium Spray:'}</strong> {language === 'hi' ? 'ब्लॉसम एंड रॉट (फल का नीचे से काला होना) रोकने के लिए फल बनने पर कैल्शियम नाइट्रेट (0.5%) का छिड़काव करें।' : 'Foliar Calcium Nitrate (0.5%) prevents blossom end rot in developing fruit.'}
                  </p>
                </div>
              ) : (
                <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0] space-y-1.5 leading-relaxed">
                  <p>
                    • <strong className="text-[#0F2238]">NPK (150:100:120 kg/ha):</strong> {language === 'hi' ? 'आलू में पोटाश (K2O) कंद के आकार, वजन और भंडारण क्षमता के लिए अत्यंत आवश्यक है।' : 'Potassium is vital for starch accumulation, skin strength, and cold storage shelf life.'}
                  </p>
                  <p>
                    • <strong className="text-[#0F2238]">{language === 'hi' ? 'मिट्टी चढ़ाना (Earthing Up):' : 'Earthing Up:'}</strong> {language === 'hi' ? '30-35 दिन पर आधी बची यूरिया देकर अच्छी मेड़ बनाएं। धूप लगने से कंद हरे और विषैले (Solanine) हो जाते हैं।' : 'Top-dress remaining nitrogen at 30-35 DAP during earthing up to prevent green tuber formation.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accordion 4: Common Diseases & Management */}
        <div className="bg-white rounded-xl border border-[#E4E9F0] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('diseases')}
            className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-[#0F2238] hover:bg-[#F1F4F8] transition-colors cursor-pointer touch-target"
            aria-expanded={openSection === 'diseases'}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F2238]" />
              <span>{t.diseasesPests}</span>
            </div>
            {openSection === 'diseases' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openSection === 'diseases' && (
            <div className="p-4 pt-0 border-t border-[#E4E9F0] text-xs text-[#1E293B] space-y-3">
              {selectedCrop === 'Tomato' ? (
                <>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      1. {language === 'hi' ? 'अगेती झुलसा (Early Blight - Alternaria solani)' : 'Early Blight'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'लक्षण: निचली पत्तियों पर भूरे-काले छल्लेदार गोल धब्बे (Target-board rings)। रोकथाम: नीम तेल 5ml/L, संक्रमित पत्तियां हटाएं।'
                        : 'Symptoms: Dark brown concentric target-board lesions on lower foliage. Action: Remove lower infected leaves, apply bio-fungicide.'}
                    </p>
                  </div>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      2. {language === 'hi' ? 'पछेती झुलसा (Late Blight - Phytophthora infestans)' : 'Late Blight'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'लक्षण: पत्तियों पर पानी से भीगे भूरे धब्बे, सुबह पत्ती के नीचे सफेद फफूंद। रोकथाम: कॉपर आधारित घोल का तुरंत छिड़काव करें।'
                        : 'Symptoms: Water-soaked lesions with white downy fungal growth under leaves in humid mornings.'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      1. {language === 'hi' ? 'पछेती झुलसा (Potato Late Blight)' : 'Potato Late Blight'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'लगातार 2 दिन कोहरा या रिमझिम बारिश (10-20°C तापमान) होने पर तुरंत फैलता है। खुदाई से 15 दिन पहले बेल काट दें (Dehaulming)।'
                        : 'Rapidly destroys foliage during humid, foggy weather. Dehaulming 15 days before digging prevents tuber contamination.'}
                    </p>
                  </div>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      2. {language === 'hi' ? 'अगेती झुलसा (Potato Early Blight)' : 'Potato Early Blight'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'गर्म व सूखे-गीले मौसम में निचली पत्तियों पर लक्ष्याकार छल्ले। रोकथाम: 2-3 वर्षीय फसल चक्र अपनाएं, संतुलित खाद दें।'
                        : 'Favored by warm fluctuating moisture. Practice crop rotation and maintain uniform soil moisture.'}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>

      {/* 4. Scientific Source Citations */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-4 text-xs text-[#506680] space-y-1">
        <div className="flex items-center gap-1.5 font-extrabold text-[#0F2238] text-xs">
          <FileText className="w-3.5 h-3.5 text-[#15803D]" />
          <span>{t.references}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-[#506680]">
          • ICAR – Indian Council of Agricultural Research, New Delhi<br />
          • CPRI – Central Potato Research Institute, Shimla (Himachal Pradesh)<br />
          • IIHR – Indian Institute of Horticultural Research, Hessaraghatta, Bengaluru
        </p>
      </section>

    </div>
  );
};

