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

  // Unit / Crop Category 1 vs 2
  const isCategory1 = selectedCrop === 'Tomato';

  return (
    <div className="space-y-4 pb-6">
      
      {/* 1. Header & Polyhouse Category Switcher */}
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
                isCategory1
                  ? 'bg-white text-[#0F2238] border border-[#CBD5E1]'
                  : 'text-[#506680] hover:text-[#0F2238]'
              }`}
            >
              <span>🌱</span>
              <span>{language === 'hi' ? 'पॉलीहाउस मुख्य फसलें' : 'Polyhouse Main Crops'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCrop('Potato')}
              className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                !isCategory1
                  ? 'bg-white text-[#0F2238] border border-[#CBD5E1]'
                  : 'text-[#506680] hover:text-[#0F2238]'
              }`}
            >
              <span>🌿</span>
              <span>{language === 'hi' ? 'पत्तेदार व बेलदार' : 'Greens & Vines'}</span>
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
            {isCategory1 ? '21°C – 28°C' : '18°C – 24°C'}
          </strong>
          <span className="text-[11px] text-[#506680]">
            {isCategory1
              ? (language === 'hi' ? 'वानस्पतिक वृद्धि एवं फूल' : 'Vegetative & Flower Set')
              : (language === 'hi' ? 'पत्तेदार व कोमल टहनियां' : 'Foliage & Rapid Growth')}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E4E9F0]">
          <div className="flex items-center gap-1.5 text-[#15803D] text-[11px] font-bold uppercase mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'मिट्टी का pH' : 'Soil / Media pH'}</span>
          </div>
          <strong className="text-sm font-extrabold text-[#0F2238] block">
            {isCategory1 ? '6.0 – 6.8' : '5.8 – 6.6'}
          </strong>
          <span className="text-[11px] text-[#506680]">
            {isCategory1
              ? (language === 'hi' ? 'जीवांश युक्त दोमट' : 'Loamy with rich organic humus')
              : (language === 'hi' ? 'कोकोपीट व परलाइट' : 'Cocopeat & light soil')}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E4E9F0]">
          <div className="flex items-center gap-1.5 text-[#15803D] text-[11px] font-bold uppercase mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'फसल अवधि' : 'Crop Cycle'}</span>
          </div>
          <strong className="text-sm font-extrabold text-[#0F2238] block">
            {isCategory1 ? '90 – 140 Days' : '45 – 85 Days'}
          </strong>
          <span className="text-[11px] text-[#506680]">
            {isCategory1
              ? (language === 'hi' ? 'दीर्घकालीन उत्पादन' : 'Extended harvest cycle')
              : (language === 'hi' ? 'अल्पकालिक चक्र' : 'Fast-turnaround batches')}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E4E9F0]">
          <div className="flex items-center gap-1.5 text-[#15803D] text-[11px] font-bold uppercase mb-1">
            <Droplets className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सिंचाई विधि' : 'Irrigation'}</span>
          </div>
          <strong className="text-sm font-extrabold text-[#0F2238] block">
            {isCategory1
              ? (language === 'hi' ? 'माइक्रो-ड्रिप' : 'Micro-Drip')
              : (language === 'hi' ? 'ड्रिप एवं फॉगर' : 'Drip & Foggers')}
          </strong>
          <span className="text-[11px] text-[#506680]">
            {isCategory1
              ? (language === 'hi' ? 'जड़ों तक सीधा पानी' : 'Root-zone hydration')
              : (language === 'hi' ? 'माइक्रो-क्लाइमेट नियंत्रण' : 'VPD-balanced spraying')}
          </span>
        </div>
      </section>

      {/* 3. Accordion Guides */}
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
              {isCategory1 ? (
                <>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      {language === 'hi' ? 'उत्तर एवं मध्य भारतीय क्षेत्र (North & Central Plains)' : 'North & Central Plains'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'शरदकालीन चक्र: नर्सरी सितम्बर-अक्टूबर, रोपाई अक्टूबर-नवंबर। बसंतकालीन चक्र: नर्सरी जनवरी, रोपाई फरवरी-मार्च।'
                        : 'Autumn Cycle: Nursery Sep-Oct, transplanting Oct-Nov. Spring Cycle: Nursery Jan, transplanting Feb-Mar.'}
                    </p>
                  </div>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      {language === 'hi' ? 'पहाड़ी एवं नियंत्रित जलवायु क्षेत्र (Hills & Protected Structures)' : 'Hills & Protected Structures'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'बुवाई मार्च-अप्रैल, रोपाई अप्रैल-मई। पॉलीहाउस में पाले और अतिवृष्टि से सुरक्षित रहकर बेमौसम गुणवत्तापूर्ण उत्पादन प्राप्त होता है।'
                        : 'Planting March-April for off-season harvest protected from frost and unseasonal rainfall.'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      {language === 'hi' ? 'शीतकालीन सुरक्षित उत्पादन (Rabi / Winter Protected Cycle)' : 'Rabi / Winter Protected Cycle'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'अक्टूबर से फरवरी: नियंत्रित तापमान (18-22°C) में निरंतर कटाई। कम धूप में ग्रो-लाइट्स व तापमान प्रबंधन उपयोगी रहता है।'
                        : 'October to February: Continuous harvest under regulated temperature (18-22°C).'}
                    </p>
                  </div>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      {language === 'hi' ? 'ग्रीष्मकालीन एवं वर्षा चक्र (Spring & Monsoon Cycles)' : 'Spring & Monsoon Cycles'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'शेडनेट व फॉगर तकनीक द्वारा तापमान 30°C से नीचे बनाए रखकर पूरे वर्ष ताजी फसल ली जा सकती है।'
                        : 'Utilize 50% shade nets and micro-foggers to keep ambient temperature under 30°C year-round.'}
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
              {isCategory1 ? (
                <div className="bg-[#EBF7EE] p-3 rounded-lg border border-[#C6E9CC] space-y-1.5 leading-relaxed">
                  <p>
                    • <strong className="text-[#14532D]">{language === 'hi' ? 'ड्रिप सिंचाई प्रबंधन:' : 'Drip Irrigation Management:'}</strong> {language === 'hi' ? 'पत्तियों को गीला किए बिना ड्रिप से सीधे जड़ क्षेत्र में पानी दें। इससे फफूंद जनित रोगों का जोखिम 60% घट जाता है।' : 'Drip irrigation supplies moisture directly to root zones without wetting foliage, cutting fungal risk significantly.'}
                  </p>
                  <p>
                    • <strong className="text-[#14532D]">{language === 'hi' ? 'संवेदनशील अवस्थाएं:' : 'Critical Stages:'}</strong> {language === 'hi' ? 'रोपाई के तुरंत बाद, फूल आते समय, और फल बनते समय समान नमी बनाए रखें ताकि फल फटने की समस्या न हो।' : 'Maintain consistent moisture during transplanting, flowering, and fruit development to avoid splitting.'}
                  </p>
                </div>
              ) : (
                <div className="bg-[#EBF7EE] p-3 rounded-lg border border-[#C6E9CC] space-y-1.5 leading-relaxed">
                  <p>
                    • <strong className="text-[#14532D]">{language === 'hi' ? 'माइक्रो-स्प्रिंकलर एवं ड्रिप विधि:' : 'Method:'}</strong> {language === 'hi' ? 'सुबह के समय हल्की व नियमित सिंचाई करें। शाम को अधिक पानी देने से बचें ताकि रात में जड़ों में अतिरिक्त नमी न रहे।' : 'Irrigate early morning to prevent overnight root-zone waterlogging.'}
                  </p>
                  <p>
                    • <strong className="text-[#14532D]">{language === 'hi' ? 'कटाई पूर्व नियंत्रण:' : 'Pre-harvest regulation:'}</strong> {language === 'hi' ? 'कटाई से 24 घंटे पहले सिंचाई नियंत्रित करें ताकि ताजी पत्तियों व उपज की शेल्फ-लाइफ और कुरकुरापन बना रहे।' : 'Regulate watering 24 hours prior to harvest to maximize post-harvest shelf life.'}
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
              {isCategory1 ? (
                <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0] space-y-1.5 leading-relaxed">
                  <p>
                    • <strong className="text-[#0F2238]">NPK (19:19:19 Fertigation):</strong> {language === 'hi' ? 'रोपाई के 15 दिन बाद ड्रिप द्वारा 19:19:19 जल-घुलनशील खाद दें। फूल व फल बनने पर 13:0:45 (पोटैशियम नाइट्रेट) का प्रयोग करें।' : 'Apply 19:19:19 water-soluble fertigation during vegetative stages, shifting to 13:0:45 at flowering.'}
                  </p>
                  <p>
                    • <strong className="text-[#0F2238]">{language === 'hi' ? 'कैल्शियम व सूक्ष्म पोषक:' : 'Calcium & Micronutrients:'}</strong> {language === 'hi' ? 'ब्लॉसम एंड रॉट रोकने और तने की मजबूती के लिए फल बनने पर कैल्शियम नाइट्रेट (0.5%) व बोरॉन का पर्णीय छिड़काव करें।' : 'Foliar Calcium Nitrate (0.5%) and Boron prevent blossom-end rot and boost skin integrity.'}
                  </p>
                </div>
              ) : (
                <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0] space-y-1.5 leading-relaxed">
                  <p>
                    • <strong className="text-[#0F2238]">NPK संतुलित पोषण:</strong> {language === 'hi' ? 'पत्तियों के विकास हेतु नाइट्रोजन एवं फास्फोरस का संतुलित फर्टिगेशन दें। अत्यधिक यूरिया से बचें।' : 'Deliver balanced nitrogen and phosphorus for vegetative foliage without excess nitrogen.'}
                  </p>
                  <p>
                    • <strong className="text-[#0F2238]">{language === 'hi' ? 'जीवामृत व जैविक संवर्धन:' : 'Bio-enhancers:'}</strong> {language === 'hi' ? '15 दिन के अंतराल पर ड्रिप द्वारा जीवामृत या वर्मीवाश देने से सूक्ष्मजीवी सक्रियता और रोग प्रतिरोधकता बढ़ती है।' : 'Apply bio-fertilizer or vermiwash every 15 days to enrich media microbiome.'}
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
              {isCategory1 ? (
                <>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      1. {language === 'hi' ? 'अगेती व पछेती झुलसा (Blight Diseases)' : 'Early & Late Blight'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'लक्षण: निचली पत्तियों पर भूरे-काले छल्लेदार गोल धब्बे या पानी से भीगे धब्बे। रोकथाम: निचली प्रभावित पत्तियां हटाएं, वेंटिलेशन बढ़ाएं, नीम तेल 5ml/L या कॉपर ऑक्सीक्लोराइड का छिड़काव करें।'
                        : 'Symptoms: Concentric dark brown lesions or water-soaked patches. Action: Prune lower leaves, improve polyhouse exhaust ventilation, apply bio-fungicide.'}
                    </p>
                  </div>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      2. {language === 'hi' ? 'पाउडरी मिल्ड्यू (Powdery Mildew)' : 'Powdery Mildew'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'लक्षण: पत्तियों की सतह पर सफेद पाउडर जैसा जमाव। रोकथाम: आर्द्रता 70% से नीचे रखें और सल्फर युक्त या जैविक कवकनाशी का समय पर छिड़काव करें।'
                        : 'Symptoms: White powdery patches on leaf surfaces. Action: Maintain RH below 70% and spray organic or wettable sulfur.'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      1. {language === 'hi' ? 'डाउनी मिल्ड्यू व आर्द्रता जनित सड़न (Downy Mildew & Damping Off)' : 'Downy Mildew & Damping Off'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'लगातार उच्च आर्द्रता (>85%) और बंद हवा में तेजी से फैलता है। रोकथाम: एग्जॉस्ट पंखे चलाकर पॉलीहाउस में वायु संचार बनाए रखें और ट्राइकोडर्मा का प्रयोग करें।'
                        : 'Rapidly triggers under stagnant humidity above 85%. Run circulation fans to keep leaves dry.'}
                    </p>
                  </div>
                  <div className="bg-[#F1F4F8] p-3 rounded-lg border border-[#E4E9F0]">
                    <strong className="text-[#0F2238] block mb-1">
                      2. {language === 'hi' ? 'रस चूसक कीट - सफेद मक्खी व थ्रिप्स (Whitefly & Thrips)' : 'Sucking Pests (Whitefly & Thrips)'}
                    </strong>
                    <p className="text-[#506680] leading-relaxed">
                      {language === 'hi'
                        ? 'पॉलीहाउस में पीले व नीले चिपचिपे कार्ड (Sticky Traps) लगाएं। जैविक नियंत्रण हेतु 10,000 PPM नीम तेल का नियमित छिड़काव करें।'
                        : 'Install yellow and blue sticky traps across the greenhouse. Apply cold-pressed neem oil at 10,000 PPM.'}
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
          • IIHR – Indian Institute of Horticultural Research, Hessaraghatta, Bengaluru<br />
          • NHB – National Horticulture Board, Ministry of Agriculture, Govt. of India
        </p>
      </section>

    </div>
  );
};
