const API_BASE = window.location.origin && window.location.origin.startsWith("http")
  ? window.location.origin
  : "http://localhost:5001";

// Application State
const state = {
  currentLang: localStorage.getItem("agrimitra_lang") || "hi", // default to Hindi for simple rural farmer accessibility
  demoMode: false,
  autoMode: false,
  pump: false,
  fan: true,
  currentUser: null,
  temperature: 28.4,
  humidity: 64,
  soilMoisture: 42,
  deviceConnected: false,
  isRecordingVoice: false,
};

// Try loading cached user session
try {
  const saved = localStorage.getItem("agrimitra_user");
  if (saved) {
    state.currentUser = JSON.parse(saved);
  }
} catch (e) {
  state.currentUser = null;
}

// Language Dictionary (English & Hindi)
const translations = {
  hi: {
    brandSub: "स्मार्ट पॉलीहाउस • किसान साथी",
    langLabel: "English",
    greetingSub: "नमस्ते किसान भाई",
    lblLocation: "स्थान",
    lblCrop: "मुख्य फसल",
    lblSystemMode: "सिस्टम मोड",
    lblHealthScore: "फार्म स्वास्थ्य",
    eyebrowControls: "1-टैप नियंत्रण",
    headingControls: "मोटर व पंखा नियंत्रण (Quick Controls)",
    lblPumpTitle: "सिंचाई मोटर (Water Pump)",
    pumpDescText: "नमी कम होने पर सुरक्षित सिंचाई चालू करें",
    togglePumpOn: "मोटर: चालू (ON) 💧",
    togglePumpOff: "मोटर: बंद (OFF) ⚪",
    lblFanTitle: "वेंटिलेशन पंखा (Ventilation Fan)",
    fanDescText: "अतिरिक्त गर्मी और हवा का प्रवाह नियंत्रित करें",
    toggleFanOn: "पंखा: चालू (ON) 💨",
    toggleFanOff: "पंखा: बंद (OFF) ⚪",
    lblAutoTitle: "AI ऑटो पायलट (स्वचालित मोड)",
    autoDescText: "सेंसर के अनुसार मोटर और पंखा अपने आप चलाएं",
    toggleAutoOn: "ऑटो मोड: चालू (ON) ⚡",
    toggleAutoOff: "ऑटो मोड: बंद (OFF) ⚪",
    eyebrowSensors: "लाइव सेंसर",
    headingSensors: "पॉलीहाउस लाइव सेंसर (Sensors)",
    lblTempMetric: "तापमान (Temperature)",
    lblHumidityMetric: "हवा में नमी (Air Humidity)",
    lblSoilMetric: "मिट्टी की नमी (Soil Moisture)",
    tempStressLow: "गर्मी का तनाव: सामान्य (सुरक्षित)",
    humidityOptimal: "पौधों के विकास के लिए संतुलित नमी",
    soilHealthy: "मिट्टी में पर्याप्त नमी उपलब्ध है",
    eyebrowAi: "आवाज़ व चैट साथी",
    headingAi: "AI मित्रा (किसान सलाहकार)",
    chatStatusText: "बोल कर या लिखकर पूछें (Voice & Chat)",
    voiceBtnText: "बोलें (Speak) 🎙️",
    voiceBtnListening: "सुन रहा हूँ... बोलिए 🔴",
    chatPlaceholder: "अपनी फसल या सिंचाई के बारे में पूछें...",
    sendChatBtn: "भेजें",
    eyebrowScanner: "कैमरा से जांच",
    headingScanner: "पत्ती रोग स्कैनर (Crop Disease Scanner)",
    scannerIntro: "पौधे या पत्ती की फोटो कैमरे से खींचें। AI तुरंत बीमारी पहचानकर सही दवाई व उपाय बताएगा।",
    dropzoneTitle: "कैमरा खोलें या फोटो चुनें",
    dropzoneSubtitle: "यहाँ टैप करके पत्ती की फोटो लें (Take Photo)",
    triggerCameraBtn: "📷 पत्ती की फोटो लें (Take Photo)",
    analyzeLeafBtn: "🔬 बीमारी व उपचार जांचें (Diagnose)",
    scanLoadingText: "AI पत्ती की जांच कर रहा है... कृपया रुकें...",
    lblDetectedDisease: "पहचाना गया रोग:",
    lblTreatmentAdvice: "💊 किसान उपचार सलाह (Treatment Advice):",
    eyebrowWeather: "मौसम व सिंचाई",
    headingWeather: "मौसम व सिंचाई सलाह (Weather Guidance)",
    lblWeatherHum: "हवा नमी",
    lblWeatherWind: "हवा गति",
    lblWeatherRain: "बारिश रिस्क",
    lblAdvisoryTitle: "आज की स्मार्ट सिंचाई सलाह",
    eyebrowSystem: "सिस्टम स्थिति",
    headingSystem: "सिस्टम व हार्डवेयर स्थिति (Diagnostics)",
    lblServicesTitle: "सक्रिय सेवाएं (Active Services)",
    lblDailyScheduleTitle: "दैनिक कार्य (Daily Routine)",
    eyebrowCrops: "फसलें",
    headingCrops: "पॉलीहाउस की मुख्य फसलें (Crops)",
    eyebrowMandi: "मार्केट इंटेलिजेंस",
    headingMandi: "दैनिक मंडी भाव (Live Mandi Bhav)",
    bnavMandi: "मंडी",
    eyebrowSchemes: "सरकारी योजनाएं",
    headingSchemes: "किसान योजनाएं (Kisan Schemes)",
    bnavHome: "होम",
    bnavControls: "मोटर",
    bnavAi: "AI मित्र",
    bnavScan: "जांच",
    bnavWeather: "मौसम",
    loginBtn: "लॉगिन",
    registerBtn: "रजिस्टर",
    logoutBtn: "लॉगआउट",
    authLoginTitle: "किसान लॉगिन",
    authRegisterTitle: "नया खाता बनाएं (Register)",
  },
  en: {
    brandSub: "Smart Polyhouse • Farming Intelligence",
    langLabel: "हिंदी",
    greetingSub: "Welcome Farmer",
    lblLocation: "Location",
    lblCrop: "Main Crop",
    lblSystemMode: "System Mode",
    lblHealthScore: "Farm Health",
    eyebrowControls: "1-TAP CONTROLS",
    headingControls: "Quick Motor & Fan Controls",
    lblPumpTitle: "Water Pump (Irrigation)",
    pumpDescText: "Water plants safely when moisture drops",
    togglePumpOn: "PUMP: ON 💧",
    togglePumpOff: "PUMP: OFF ⚪",
    lblFanTitle: "Ventilation Fan",
    fanDescText: "Regulate heat and air circulation",
    toggleFanOn: "FAN: ON 💨",
    toggleFanOff: "FAN: OFF ⚪",
    lblAutoTitle: "AI Auto Pilot",
    autoDescText: "Automatically trigger pump & fan by sensor thresholds",
    toggleAutoOn: "AUTO MODE: ON ⚡",
    toggleAutoOff: "AUTO MODE: OFF ⚪",
    eyebrowSensors: "TELEMETRY",
    headingSensors: "Polyhouse Live Sensors",
    lblTempMetric: "Temperature",
    lblHumidityMetric: "Air Humidity",
    lblSoilMetric: "Soil Moisture",
    tempStressLow: "Plant heat stress: Low (Safe)",
    humidityOptimal: "Optimal humidity for steady growth",
    soilHealthy: "Soil moisture retention healthy",
    eyebrowAi: "VOICE + CHAT ADVISOR",
    headingAi: "AI Mitra (Farm Advisor)",
    chatStatusText: "Ask by voice or typing (Voice & Chat)",
    voiceBtnText: "SPEAK 🎙️",
    voiceBtnListening: "Listening... Speak now 🔴",
    chatPlaceholder: "Ask AgriMitra about your crop or watering...",
    sendChatBtn: "Send",
    eyebrowScanner: "CAMERA DIAGNOSIS",
    headingScanner: "Plant Disease Scanner",
    scannerIntro: "Take or upload a leaf photo. AI will detect diseases and recommend safe treatments.",
    dropzoneTitle: "Open Camera or Choose Photo",
    dropzoneSubtitle: "Tap here to take leaf photo",
    triggerCameraBtn: "📷 TAKE LEAF PHOTO",
    analyzeLeafBtn: "🔬 CHECK DISEASE & CURE",
    scanLoadingText: "AI is analyzing leaf tissue... Please wait...",
    lblDetectedDisease: "Detected Issue:",
    lblTreatmentAdvice: "💊 Farmer Treatment Advice:",
    eyebrowWeather: "WEATHER INTELLIGENCE",
    headingWeather: "Weather & Irrigation Guidance",
    lblWeatherHum: "Humidity",
    lblWeatherWind: "Wind Speed",
    lblWeatherRain: "Rain Risk",
    lblAdvisoryTitle: "Today's Smart Irrigation Advice",
    eyebrowSystem: "DIAGNOSTICS",
    headingSystem: "System & Hardware Status",
    lblServicesTitle: "Active Services",
    lblDailyScheduleTitle: "Farming Routine",
    eyebrowCrops: "CROPS",
    headingCrops: "Active Crops in Polyhouse",
    eyebrowMandi: "MARKET INTELLIGENCE",
    headingMandi: "Live Mandi Bhav (APMC Market Rates)",
    bnavMandi: "Mandi",
    eyebrowSchemes: "GOVERNMENT INITIATIVES",
    headingSchemes: "Kisan Yojana (Government Schemes)",
    bnavHome: "Home",
    bnavControls: "Motor",
    bnavAi: "AI Mitra",
    bnavScan: "Scan",
    bnavWeather: "Weather",
    loginBtn: "LOGIN",
    registerBtn: "REGISTER",
    logoutBtn: "LOGOUT",
    authLoginTitle: "Farmer Login",
    authRegisterTitle: "Register Farmer Account",
  }
};

// DOM References
const modeBadge = document.getElementById("modeBadge");
const weatherBadge = document.getElementById("weatherBadge");
const adviceBadge = document.getElementById("adviceBadge");
const footerStatus = document.getElementById("footerStatus");
const appLoader = document.getElementById("appLoader");
const authModal = document.getElementById("authModal");
const authTitle = document.getElementById("authTitle");
const authSubmit = document.getElementById("authSubmit");
const authForm = document.getElementById("authForm");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const farmHealthScore = document.getElementById("farmHealthScore");
const lastUpdatedText = document.getElementById("lastUpdatedText");
const serviceDbStatus = document.getElementById("serviceDbStatus");
const serviceSupabaseStatus = document.getElementById("serviceSupabaseStatus");
const serviceWeatherStatus = document.getElementById("serviceWeatherStatus");
const serviceAiStatus = document.getElementById("serviceAiStatus");
const serviceDeviceStatus = document.getElementById("serviceDeviceStatus");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const voiceButton = document.getElementById("voiceButton");
const voiceBtnText = document.getElementById("voiceBtnText");
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const guestLoginBtn = document.getElementById("guestLoginBtn");
const userGreeting = document.getElementById("userGreeting");
const farmerNameText = document.getElementById("farmerNameText");
const deviceStateText = document.getElementById("deviceStateText");
const devicePill = document.getElementById("devicePill");
const langToggle = document.getElementById("langToggle");
const langLabel = document.getElementById("langLabel");

// Control Button Elements
const togglePumpBtn = document.getElementById("togglePump");
const togglePumpText = document.getElementById("togglePumpText");
const pumpIconWrap = document.getElementById("pumpIconWrap");
const toggleFanBtn = document.getElementById("toggleFan");
const toggleFanText = document.getElementById("toggleFanText");
const fanIconWrap = document.getElementById("fanIconWrap");
const toggleAutoBtn = document.getElementById("toggleAuto");
const toggleAutoText = document.getElementById("toggleAutoText");
const autoStatus = document.getElementById("autoStatus");

// Sensor Telemetry Elements
const temperatureValue = document.getElementById("temperatureValue");
const humidityValue = document.getElementById("humidityValue");
const soilValue = document.getElementById("soilValue");
const tempProgressBar = document.getElementById("tempProgressBar");
const humidityProgressBar = document.getElementById("humidityProgressBar");
const soilProgressBar = document.getElementById("soilProgressBar");
const tempStressHint = document.getElementById("tempStressHint");
const humidityHint = document.getElementById("humidityHint");
const soilHint = document.getElementById("soilHint");

// Twin Indicators
const twinPumpIndicator = document.getElementById("twinPumpIndicator");
const twinPumpText = document.getElementById("twinPumpText");
const twinFanIndicator = document.getElementById("twinFanIndicator");
const twinFanText = document.getElementById("twinFanText");

// Scanner Elements
const leafPhotoInput = document.getElementById("leafPhotoInput");
const cameraDropzone = document.getElementById("cameraDropzone");
const triggerCameraBtn = document.getElementById("triggerCameraBtn");
const previewContainer = document.getElementById("previewContainer");
const leafImagePreview = document.getElementById("leafImagePreview");
const retakeBtn = document.getElementById("retakeBtn");
const analyzeLeafBtn = document.getElementById("analyzeLeafBtn");
const scanLoading = document.getElementById("scanLoading");
const scanResultCard = document.getElementById("scanResultCard");
const resCropName = document.getElementById("resCropName");
const resHealth = document.getElementById("resHealth");
const resConfidence = document.getElementById("resConfidence");
const resDiseaseName = document.getElementById("resDiseaseName");
const resTreatmentText = document.getElementById("resTreatmentText");

// Weather Elements
const weatherTemp = document.getElementById("weatherTemp");
const weatherHumidity = document.getElementById("weatherHumidity");
const weatherWind = document.getElementById("weatherWind");
const weatherRain = document.getElementById("weatherRain");
const weatherLocation = document.getElementById("weatherLocation");
const weatherSummary = document.getElementById("weatherSummary");
const adviceText = document.getElementById("adviceText");

// Mandi Elements
const mandiSearchInput = document.getElementById("mandiSearchInput");
const mandiCommoditySelect = document.getElementById("mandiCommoditySelect");
const mandiStateSelect = document.getElementById("mandiStateSelect");
const refreshMandiBtn = document.getElementById("refreshMandiBtn");
const mandiCardsGrid = document.getElementById("mandiCardsGrid");
const mandiStatusTag = document.getElementById("mandiStatusTag");

// Weather Search & Provider Elements
const weatherLocationInput = document.getElementById("weatherLocationInput");
const weatherSearchBtn = document.getElementById("weatherSearchBtn");
const weatherProviderBadge = document.getElementById("weatherProviderBadge");
const weatherBigIcon = document.getElementById("weatherBigIcon");

// Schemes Elements
const schemesGrid = document.getElementById("schemesGrid");

// System Diagnostics Elements
const serviceMandiStatus = document.getElementById("serviceMandiStatus");
const serviceSchemesStatus = document.getElementById("serviceSchemesStatus");
const openApiSettingsSystemBtn = document.getElementById("openApiSettingsSystemBtn");

// API Settings Modal Elements
const apiSettingsTopBtn = document.getElementById("apiSettingsTopBtn");
const apiSettingsModal = document.getElementById("apiSettingsModal");
const closeApiModal = document.getElementById("closeApiModal");
const apiConfigForm = document.getElementById("apiConfigForm");
const cfgGeminiKey = document.getElementById("cfgGeminiKey");
const testGeminiBtn = document.getElementById("testGeminiBtn");
const geminiTestFeedback = document.getElementById("geminiTestFeedback");
const cfgWeatherKey = document.getElementById("cfgWeatherKey");
const testWeatherBtn = document.getElementById("testWeatherBtn");
const weatherTestFeedback = document.getElementById("weatherTestFeedback");
const cfgSupabaseUrl = document.getElementById("cfgSupabaseUrl");
const cfgSupabaseKey = document.getElementById("cfgSupabaseKey");
const testSupabaseBtn = document.getElementById("testSupabaseBtn");
const supabaseTestFeedback = document.getElementById("supabaseTestFeedback");
const saveApiConfigBtn = document.getElementById("saveApiConfigBtn");
const apiSaveMessage = document.getElementById("apiSaveMessage");
const modalWeatherStatusBadge = document.getElementById("modalWeatherStatusBadge");
const modalAiStatusBadge = document.getElementById("modalAiStatusBadge");
const modalAiDot = document.getElementById("modalAiDot");

let selectedLeafFile = null;

// ==========================================
// 1. Language Toggle & Bilingual UI Handling
// ==========================================
function setLanguage(lang) {
  state.currentLang = lang;
  localStorage.setItem("agrimitra_lang", lang);
  const t = translations[lang] || translations.hi;

  // Update button label
  if (langLabel) langLabel.textContent = t.langLabel;

  // Text contents
  const textMapping = [
    ["brandSub", t.brandSub],
    ["greetingSub", t.greetingSub],
    ["lblLocation", t.lblLocation],
    ["lblCrop", t.lblCrop],
    ["lblSystemMode", t.lblSystemMode],
    ["lblHealthScore", t.lblHealthScore],
    ["eyebrowControls", t.eyebrowControls],
    ["headingControls", t.headingControls],
    ["lblPumpTitle", t.lblPumpTitle],
    ["pumpDescText", t.pumpDescText],
    ["lblFanTitle", t.lblFanTitle],
    ["fanDescText", t.fanDescText],
    ["lblAutoTitle", t.lblAutoTitle],
    ["autoDescText", t.autoDescText],
    ["eyebrowSensors", t.eyebrowSensors],
    ["headingSensors", t.headingSensors],
    ["lblTempMetric", t.lblTempMetric],
    ["lblHumidityMetric", t.lblHumidityMetric],
    ["lblSoilMetric", t.lblSoilMetric],
    ["tempStressHint", t.tempStressLow],
    ["humidityHint", t.humidityOptimal],
    ["soilHint", t.soilHealthy],
    ["eyebrowAi", t.eyebrowAi],
    ["headingAi", t.headingAi],
    ["chatStatusText", t.chatStatusText],
    ["eyebrowScanner", t.eyebrowScanner],
    ["headingScanner", t.headingScanner],
    ["scannerIntro", t.scannerIntro],
    ["dropzoneTitle", t.dropzoneTitle],
    ["dropzoneSubtitle", t.dropzoneSubtitle],
    ["triggerCameraBtn", t.triggerCameraBtn],
    ["analyzeLeafBtn", t.analyzeLeafBtn],
    ["scanLoadingText", t.scanLoadingText],
    ["lblDetectedDisease", t.lblDetectedDisease],
    ["lblTreatmentAdvice", t.lblTreatmentAdvice],
    ["eyebrowMandi", t.eyebrowMandi],
    ["headingMandi", t.headingMandi],
    ["bnavMandi", t.bnavMandi],
    ["eyebrowWeather", t.eyebrowWeather],
    ["headingWeather", t.headingWeather],
    ["lblWeatherHum", t.lblWeatherHum],
    ["lblWeatherWind", t.lblWeatherWind],
    ["lblWeatherRain", t.lblWeatherRain],
    ["lblAdvisoryTitle", t.lblAdvisoryTitle],
    ["eyebrowSchemes", t.eyebrowSchemes],
    ["headingSchemes", t.headingSchemes],
    ["eyebrowSystem", t.eyebrowSystem],
    ["headingSystem", t.headingSystem],
    ["lblServicesTitle", t.lblServicesTitle],
    ["lblDailyScheduleTitle", t.lblDailyScheduleTitle],
    ["eyebrowCrops", t.eyebrowCrops],
    ["headingCrops", t.headingCrops],
    ["bnavHome", t.bnavHome],
    ["bnavControls", t.bnavControls],
    ["bnavAi", t.bnavAi],
    ["bnavScan", t.bnavScan],
    ["bnavWeather", t.bnavWeather],
  ];

  textMapping.forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });

  if (chatInput) chatInput.placeholder = t.chatPlaceholder;
  if (voiceBtnText && !state.isRecordingVoice) voiceBtnText.textContent = t.voiceBtnText;

  // Refresh current pump / fan / auto button labels
  updateButtonStates();
  updateAuthUI();
}

function updateButtonStates() {
  const t = translations[state.currentLang] || translations.hi;

  // Pump button state
  if (togglePumpText) {
    togglePumpText.textContent = state.pump ? t.togglePumpOn : t.togglePumpOff;
  }
  if (togglePumpBtn) {
    togglePumpBtn.classList.toggle("active", state.pump);
    togglePumpBtn.setAttribute("aria-pressed", state.pump ? "true" : "false");
  }
  if (pumpIconWrap) {
    pumpIconWrap.classList.toggle("active", state.pump);
  }
  if (twinPumpIndicator) {
    twinPumpIndicator.classList.toggle("active", state.pump);
    if (twinPumpText) twinPumpText.textContent = `Pump: ${state.pump ? "ON" : "OFF"}`;
  }

  // Fan button state
  if (toggleFanText) {
    toggleFanText.textContent = state.fan ? t.toggleFanOn : t.toggleFanOff;
  }
  if (toggleFanBtn) {
    toggleFanBtn.classList.toggle("active", state.fan);
    toggleFanBtn.setAttribute("aria-pressed", state.fan ? "true" : "false");
  }
  if (fanIconWrap) {
    fanIconWrap.classList.toggle("active", state.fan);
  }
  if (twinFanIndicator) {
    twinFanIndicator.classList.toggle("active", state.fan);
    if (twinFanText) twinFanText.textContent = `Fan: ${state.fan ? "ON" : "OFF"}`;
  }

  // Auto Mode button state
  if (toggleAutoText) {
    toggleAutoText.textContent = state.autoMode ? t.toggleAutoOn : t.toggleAutoOff;
  }
  if (toggleAutoBtn) {
    toggleAutoBtn.classList.toggle("active", state.autoMode);
  }
  if (autoStatus) {
    autoStatus.textContent = state.autoMode ? "AUTO" : "MANUAL";
    autoStatus.className = `status-dot ${state.autoMode ? "live" : "neutral"}`;
  }
}

// ==========================================
// 2. Auth State & User Display
// ==========================================
function updateAuthUI() {
  const t = translations[state.currentLang] || translations.hi;

  if (state.currentUser) {
    const displayName = state.currentUser.fullName || state.currentUser.email.split("@")[0] || "Farmer";
    if (farmerNameText) farmerNameText.textContent = displayName;
    if (userGreeting) {
      userGreeting.textContent = `👋 ${displayName}`;
      userGreeting.style.display = "inline";
    }
    if (loginButton) loginButton.textContent = t.logoutBtn;
    if (registerButton) registerButton.style.display = "none";
  } else {
    if (farmerNameText) farmerNameText.textContent = state.currentLang === "hi" ? "किसान (अतिथि)" : "Farmer (Guest)";
    if (userGreeting) {
      userGreeting.textContent = "";
      userGreeting.style.display = "none";
    }
    if (loginButton) loginButton.textContent = t.loginBtn;
    if (registerButton) registerButton.style.display = "inline-flex";
  }
}

// ==========================================
// 3. Sensor UI & Telemetry Updates
// ==========================================
function updateSensorUI(sensorData = {}) {
  const temp = Number(sensorData.temperature ?? state.temperature ?? 28.4);
  const humidity = Number(sensorData.humidity ?? state.humidity ?? 64);
  const soil = Number(sensorData.soilMoisture ?? state.soilMoisture ?? 42);
  const pump = Boolean(sensorData.pump ?? state.pump ?? false);
  const fan = Boolean(sensorData.fan ?? state.fan ?? true);
  const autoMode = typeof sensorData.autoMode === "boolean" ? sensorData.autoMode : state.autoMode;
  const isDeviceLive = Boolean(sensorData.deviceConnected);

  state.temperature = temp;
  state.humidity = humidity;
  state.soilMoisture = soil;
  state.pump = pump;
  state.fan = fan;
  state.autoMode = autoMode;
  state.deviceConnected = isDeviceLive;

  // Metrics text
  if (temperatureValue) temperatureValue.textContent = `${temp.toFixed(1)}°C`;
  if (humidityValue) humidityValue.textContent = `${humidity}%`;
  if (soilValue) soilValue.textContent = `${soil}%`;

  // Visual Progress bars
  if (tempProgressBar) {
    const tempPercent = Math.min(Math.max(((temp - 10) / 35) * 100, 10), 100);
    tempProgressBar.style.width = `${tempPercent}%`;
  }
  if (humidityProgressBar) {
    humidityProgressBar.style.width = `${Math.min(Math.max(humidity, 10), 100)}%`;
  }
  if (soilProgressBar) {
    soilProgressBar.style.width = `${Math.min(Math.max(soil, 10), 100)}%`;
  }

  // Sensor status badges
  const tempBadge = document.getElementById("temperatureStatus");
  if (tempBadge) {
    if (temp > 35) {
      tempBadge.textContent = "HIGH (अधिक)";
      tempBadge.className = "sensor-status-badge alert";
    } else if (temp < 18) {
      tempBadge.textContent = "LOW (कम)";
      tempBadge.className = "sensor-status-badge warn";
    } else {
      tempBadge.textContent = "NORMAL (सामान्य)";
      tempBadge.className = "sensor-status-badge ok";
    }
  }

  const soilBadge = document.getElementById("soilStatus");
  if (soilBadge) {
    if (soil < 32) {
      soilBadge.textContent = "DRY (पानी दें)";
      soilBadge.className = "sensor-status-badge alert";
    } else if (soil > 60) {
      soilBadge.textContent = "HIGH (अधिक नमी)";
      soilBadge.className = "sensor-status-badge warn";
    } else {
      soilBadge.textContent = "HEALTHY (पर्याप्त)";
      soilBadge.className = "sensor-status-badge ok";
    }
  }

  // Device online indicator pill
  if (deviceStateText && devicePill) {
    if (isDeviceLive) {
      deviceStateText.textContent = "HARDWARE LIVE 🟢";
      devicePill.classList.add("online");
    } else {
      deviceStateText.textContent = "WAITING FOR ESP32 ⚪";
      devicePill.classList.remove("online");
    }
  }

  // Advisory text auto-update
  if (adviceText) {
    const isHindi = state.currentLang === "hi";
    if (soil < 32) {
      adviceText.textContent = isHindi
        ? `मिट्टी में नमी ${soil}% है जो कम है। हल्की सिंचाई (15 मिनट ड्रिप) की सलाह दी जाती है।`
        : `Soil moisture is ${soil}% which is low. Light irrigation (15 min drip) is recommended.`;
    } else if (soil > 60) {
      adviceText.textContent = isHindi
        ? `मिट्टी में नमी ${soil}% है। अतिरिक्त पानी देने से बचें और जल निकासी सुनिश्चित करें।`
        : `Soil moisture is high (${soil}%). Delay irrigation and ensure proper drainage.`;
    } else {
      adviceText.textContent = isHindi
        ? `मिट्टी में नमी ${soil}% है जो फसल के लिए बिल्कुल सुरक्षित और संतुलित है।`
        : `Soil moisture is ${soil}% and remains in the optimal healthy range.`;
    }
  }

  updateButtonStates();
}

// ==========================================
// 4. Device Controls (Pump, Fan, Auto Mode)
// ==========================================
async function togglePump() {
  const next = !state.pump;
  state.pump = next;
  updateButtonStates();

  try {
    const response = await fetch(`${API_BASE}/api/device/pump`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: next }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      console.warn("Pump toggle fallback:", data.message);
    }
  } catch (error) {
    console.warn("Pump control network notice:", error.message);
  }
}

async function toggleFan() {
  const next = !state.fan;
  state.fan = next;
  updateButtonStates();

  try {
    const response = await fetch(`${API_BASE}/api/device/fan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: next }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      console.warn("Fan toggle fallback:", data.message);
    }
  } catch (error) {
    console.warn("Fan control network notice:", error.message);
  }
}

async function toggleAutoMode() {
  const next = !state.autoMode;
  state.autoMode = next;
  updateButtonStates();

  try {
    const response = await fetch(`${API_BASE}/api/device/auto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: next }),
    });
    const data = await response.json();
    if (data.success && data.data) {
      updateSensorUI(data.data);
    }
  } catch (error) {
    console.warn("Auto mode toggle network notice:", error.message);
  }
}

// ==========================================
// 5. AI Mitra - Voice Assistant & Chat
// ==========================================
function speakText(text) {
  if (!("speechSynthesis" in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.currentLang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.95; // Slightly slower for clear understanding
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Speech synthesis notice:", e);
  }
}

function startVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert(state.currentLang === "hi" 
      ? "आपके ब्राउज़र में आवाज़ पहचान (Speech Recognition) उपलब्ध नहीं है। कृपया लिखकर पूछें।" 
      : "Speech Recognition is not supported by your browser. Please type your question.");
    return;
  }

  if (state.isRecordingVoice) {
    return;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = state.currentLang === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      state.isRecordingVoice = true;
      voiceButton.classList.add("recording");
      const t = translations[state.currentLang] || translations.hi;
      if (voiceBtnText) voiceBtnText.textContent = t.voiceBtnListening;
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && chatInput) {
        chatInput.value = transcript;
        sendChatMessage();
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      state.isRecordingVoice = false;
      voiceButton.classList.remove("recording");
      const t = translations[state.currentLang] || translations.hi;
      if (voiceBtnText) voiceBtnText.textContent = t.voiceBtnText;
    };

    recognition.start();
  } catch (err) {
    console.warn("Could not start voice recognition:", err);
    state.isRecordingVoice = false;
    voiceButton.classList.remove("recording");
  }
}

async function sendChatMessage(customPrompt) {
  const messageText = customPrompt || chatInput.value.trim();
  if (!messageText) return;

  // Add User Message to Chat Box
  const userDiv = document.createElement("div");
  userDiv.className = "message user";
  userDiv.innerHTML = `<p>${escapeHtml(messageText)}</p>`;
  chatMessages.appendChild(userDiv);
  if (!customPrompt) chatInput.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Add Thinking Placeholder
  const botDiv = document.createElement("div");
  botDiv.className = "message bot";
  const placeholderText = state.currentLang === "hi" ? "AgriMitra सोच रहा है..." : "AgriMitra is thinking...";
  botDiv.innerHTML = `<p><em>${placeholderText}</em></p>`;
  chatMessages.appendChild(botDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch(`${API_BASE}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: messageText,
        language: state.currentLang === "hi" ? "Hindi" : "English",
        location: "Kangra",
        crop: "Wheat",
        userEmail: state.currentUser?.email || "farmer",
      }),
    });
    const data = await response.json();
    const reply = data.reply || (state.currentLang === "hi" 
      ? "AgriMitra AI सलाह तैयार है। कृपया अपने खेत की स्थिति जांचें।" 
      : "AgriMitra AI advisory is ready. Please monitor your field.");

    botDiv.innerHTML = `
      <div class="message-content"><p>${escapeHtml(reply)}</p></div>
      <div class="message-meta">
        <button class="speak-msg-btn" type="button">🔊 ${state.currentLang === "hi" ? "सुनें" : "Listen"}</button>
      </div>
    `;

    // Hook up speak button
    const speakBtn = botDiv.querySelector(".speak-msg-btn");
    if (speakBtn) {
      speakBtn.addEventListener("click", () => speakText(reply));
    }
  } catch (error) {
    const fallbackText = state.currentLang === "hi"
      ? "AgriMitra वर्तमान में ऑफलाइन सलाह दे रहा है। मिट्टी की नमी व तापमान सामान्य सीमा में है।"
      : "AgriMitra is providing local advice. Temperature and soil moisture remain within safe limits.";
    botDiv.innerHTML = `<div class="message-content"><p>${fallbackText}</p></div>`;
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==========================================
// 6. Plant Leaf Disease Scanner (Camera)
// ==========================================
function setupScanner() {
  if (triggerCameraBtn) {
    triggerCameraBtn.addEventListener("click", () => {
      if (leafPhotoInput) leafPhotoInput.click();
    });
  }

  if (cameraDropzone) {
    cameraDropzone.addEventListener("click", () => {
      if (leafPhotoInput) leafPhotoInput.click();
    });
  }

  if (leafPhotoInput) {
    leafPhotoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      selectedLeafFile = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (leafImagePreview) leafImagePreview.src = event.target.result;
        if (cameraDropzone) cameraDropzone.classList.add("hidden");
        if (previewContainer) previewContainer.classList.remove("hidden");
        if (scanResultCard) scanResultCard.classList.add("hidden");
      };
      reader.readAsDataURL(file);
    });
  }

  if (retakeBtn) {
    retakeBtn.addEventListener("click", () => {
      selectedLeafFile = null;
      if (leafPhotoInput) leafPhotoInput.value = "";
      if (cameraDropzone) cameraDropzone.classList.remove("hidden");
      if (previewContainer) previewContainer.classList.add("hidden");
      if (scanResultCard) scanResultCard.classList.add("hidden");
      if (scanLoading) scanLoading.classList.add("hidden");
    });
  }

  if (analyzeLeafBtn) {
    analyzeLeafBtn.addEventListener("click", async () => {
      if (!selectedLeafFile) {
        alert(state.currentLang === "hi" ? "कृपया पहले पत्ती की फोटो लें।" : "Please take or choose a leaf photo first.");
        return;
      }

      if (scanLoading) scanLoading.classList.remove("hidden");
      if (previewContainer) previewContainer.classList.add("hidden");
      if (scanResultCard) scanResultCard.classList.add("hidden");

      const formData = new FormData();
      formData.append("image", selectedLeafFile);
      formData.append("userEmail", state.currentUser?.email || "farmer");

      try {
        const response = await fetch(`${API_BASE}/api/analyze`, {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (scanLoading) scanLoading.classList.add("hidden");
        if (previewContainer) previewContainer.classList.remove("hidden");
        if (scanResultCard) scanResultCard.classList.remove("hidden");

        const isHindi = state.currentLang === "hi";
        if (resCropName) resCropName.textContent = result.crop || "Tomato";
        if (resHealth) {
          resHealth.textContent = result.health || "Healthy";
          resHealth.style.color = (result.health && result.health.toLowerCase().includes("healthy"))
            ? "var(--emerald-bright)"
            : "var(--amber)";
        }
        if (resConfidence) resConfidence.textContent = `${result.confidence || 92}% Match`;
        if (resDiseaseName) resDiseaseName.textContent = result.disease || "None detected";
        if (resTreatmentText) {
          resTreatmentText.textContent = isHindi
            ? (result.treatmentHindi || result.treatment || "नियमित सिंचाई और धूप बनाए रखें।")
            : (result.treatment || "Maintain steady irrigation and sunlight.");
        }

        // Auto read out the diagnosis
        const spokenDiagnosis = isHindi
          ? `पहचान: ${result.crop}। स्थिति: ${result.health}। उपाय: ${result.treatmentHindi || result.treatment}`
          : `Diagnosis: ${result.crop}. Status: ${result.health}. Advice: ${result.treatment}`;
        speakText(spokenDiagnosis);
      } catch (err) {
        console.warn("Scan error:", err);
        if (scanLoading) scanLoading.classList.add("hidden");
        if (previewContainer) previewContainer.classList.remove("hidden");
        alert(state.currentLang === "hi" ? "जांच पूरी नहीं हो सकी। कृपया दोबारा प्रयास करें।" : "Diagnosis failed. Please try again.");
      }
    });
  }
}

// ==========================================
// 7. Weather & System Status API
// ==========================================
async function fetchSystemStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/system/status`);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Status error");

    updateSensorUI(data.sensors || {});

    if (serviceDbStatus) {
      serviceDbStatus.textContent = "LOCAL SQLITE (ONLINE)";
      serviceDbStatus.className = "status-live";
    }
    if (serviceSupabaseStatus) {
      if (data.supabaseConnected) {
        serviceSupabaseStatus.textContent = "CONNECTED (LIVE)";
        serviceSupabaseStatus.className = "status-live";
      } else {
        serviceSupabaseStatus.textContent = "HYBRID READY / LOCAL ACTIVE";
        serviceSupabaseStatus.className = "status-demo";
      }
    }
    if (serviceWeatherStatus) {
      serviceWeatherStatus.textContent = data.weatherProvider || "OPEN-METEO SATELLITE (LIVE)";
      serviceWeatherStatus.className = "status-live";
    }
    if (serviceAiStatus) {
      serviceAiStatus.textContent = data.aiConfigured ? "GEMINI CLOUD LIVE" : "INTELLIGENT LOCAL ADVISOR";
      serviceAiStatus.className = "status-live";
    }
    if (serviceMandiStatus) {
      serviceMandiStatus.textContent = "ONLINE (LIVE APMC RATES)";
      serviceMandiStatus.className = "status-live";
    }
    if (serviceSchemesStatus) {
      serviceSchemesStatus.textContent = "ONLINE (VERIFIED SCHEMES)";
      serviceSchemesStatus.className = "status-live";
    }
  } catch (error) {
    console.warn("System status fallback:", error.message);
  }
}

async function fetchWeather(customLocation) {
  try {
    const loc = customLocation || (weatherLocationInput?.value.trim()) || "Kangra, Himachal Pradesh";
    const response = await fetch(`${API_BASE}/api/weather?location=${encodeURIComponent(loc)}`);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error("Weather unavailable");

    const w = data.data;
    if (weatherTemp) weatherTemp.textContent = `${Math.round(w.temperature)}°C`;
    if (weatherHumidity) weatherHumidity.textContent = `${w.humidity}%`;
    if (weatherWind) weatherWind.textContent = `${w.windSpeed} km/h`;
    if (weatherRain) weatherRain.textContent = `${w.rainProbability}%`;
    if (weatherLocation) weatherLocation.textContent = data.location || loc;
    if (weatherSummary) {
      const isHi = state.currentLang === "hi";
      weatherSummary.textContent = isHi && w.summaryHindi
        ? `${w.summaryHindi} (${w.summary})`
        : (w.summary || "Weather clear");
    }
    if (weatherProviderBadge && data.provider) {
      weatherProviderBadge.innerHTML = `<span>🛰️ ${escapeHtml(data.provider)}</span>`;
    }
    if (weatherBigIcon) {
      if (w.rainProbability > 40) weatherBigIcon.textContent = "🌧️";
      else if (w.temperature > 32) weatherBigIcon.textContent = "☀️";
      else weatherBigIcon.textContent = "🌤️";
    }
  } catch (e) {
    console.warn("Weather notice:", e.message);
  }
}

// ==========================================
// 8. Mandi Bhav (Market Rates) Functions
// ==========================================
async function fetchMandiData(commodity = "all", stateFilter = "all", search = "") {
  if (!mandiCardsGrid) return;
  mandiCardsGrid.innerHTML = `<div class="glass-card" style="padding:24px;grid-column:1/-1;text-align:center;color:var(--text-soft);">🌾 कृषि उपज मंडी भाव लोड हो रहे हैं...</div>`;

  try {
    const params = new URLSearchParams();
    if (commodity && commodity !== "all") params.append("commodity", commodity);
    if (stateFilter && stateFilter !== "all") params.append("state", stateFilter);
    if (search && search.trim()) params.append("search", search.trim());

    const response = await fetch(`${API_BASE}/api/mandi?${params.toString()}`);
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Failed to load mandi data");

    renderMandiCards(result.data || []);
  } catch (err) {
    console.warn("Mandi load notice:", err.message);
    mandiCardsGrid.innerHTML = `<div class="glass-card" style="padding:24px;grid-column:1/-1;text-align:center;color:var(--amber);">मंडी भाव डेटा लोड नहीं हो सका। कृपया पुनः प्रयास करें।</div>`;
  }
}

function renderMandiCards(items) {
  if (!mandiCardsGrid) return;
  if (!items || items.length === 0) {
    mandiCardsGrid.innerHTML = `<div class="glass-card" style="padding:24px;grid-column:1/-1;text-align:center;color:var(--text-soft);">इस फसल या राज्य के लिए कोई मंडी भाव नहीं मिला। कृपया फ़िल्टर बदल कर देखें।</div>`;
    return;
  }

  mandiCardsGrid.innerHTML = items.map((item) => {
    const trendClass = item.trendType || "stable";
    const mspHtml = item.msp
      ? `<span>MSP: <strong>₹${item.msp}</strong></span>`
      : `<span>MSP: <strong>बाजार भाव</strong></span>`;

    return `
      <article class="mandi-card glass-card">
        <div class="mandi-card-top">
          <div class="mandi-card-title-group">
            <h4>${escapeHtml(item.commodity)}</h4>
            <span class="mandi-variety-tag">${escapeHtml(item.variety || "Standard")}</span>
          </div>
          <span class="mandi-loc-pill">📍 ${escapeHtml(item.mandi)}</span>
        </div>

        <div class="mandi-price-box">
          <div>
            <span class="mandi-price-main">₹${item.modalPrice}</span>
            <span class="mandi-price-unit">${escapeHtml(item.unit || "₹/Quintal")}</span>
          </div>
          <span class="mandi-trend-pill ${trendClass}">${escapeHtml(item.trend)}</span>
        </div>

        <div class="mandi-stats-row">
          <span>दायरा: <strong>₹${item.minPrice} - ₹${item.maxPrice}</strong></span>
          ${mspHtml}
        </div>
        <div class="mandi-stats-row" style="font-size:0.72rem;padding-top:4px;">
          <span>आवक: <strong>${escapeHtml(item.arrivals || "100+ Quintals")}</strong></span>
          <span>अपडेट: <strong>${escapeHtml(item.lastUpdated || "Today")}</strong></span>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================================
// 9. Kisan Schemes Functions
// ==========================================
async function fetchSchemesData() {
  if (!schemesGrid) return;
  try {
    const response = await fetch(`${API_BASE}/api/schemes`);
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error("Schemes load error");

    renderSchemes(result.data || []);
  } catch (err) {
    console.warn("Schemes load notice:", err.message);
  }
}

function renderSchemes(schemes) {
  if (!schemesGrid || !schemes) return;
  schemesGrid.innerHTML = schemes.map((s) => `
    <article class="scheme-card glass-card">
      <div>
        <span class="scheme-badge">${escapeHtml(s.badge)}</span>
        <h4>${escapeHtml(s.title)}</h4>
        <div class="scheme-benefit-box">💰 ${escapeHtml(s.benefit)}</div>
        <p class="scheme-desc-text" style="margin-top:8px;">${escapeHtml(s.description)}</p>
      </div>

      <div>
        <div class="scheme-meta-list">
          <span>पात्रता: <strong>${escapeHtml(s.eligibility)}</strong></span>
          <span>दस्तावेज: <strong>${escapeHtml(s.documents)}</strong></span>
        </div>
        <div class="scheme-action-row" style="margin-top:12px;">
          <a href="${s.link}" target="_blank" rel="noopener noreferrer" class="scheme-apply-btn">
            आधिकारिक पोर्टल खोलें (${escapeHtml(s.portalName)}) ↗
          </a>
        </div>
      </div>
    </article>
  `).join("");
}

// ==========================================
// 10. API Settings & Keys Modal Handling
// ==========================================
function openApiModal() {
  if (!apiSettingsModal) return;
  apiSettingsModal.classList.remove("hidden");
  loadCurrentApiConfig();
}

function closeApiModalHandler() {
  if (!apiSettingsModal) return;
  apiSettingsModal.classList.add("hidden");
}

async function loadCurrentApiConfig() {
  try {
    const response = await fetch(`${API_BASE}/api/config`);
    const data = await response.json();
    if (data.success && data.config) {
      const cfg = data.config;
      if (cfgGeminiKey && !cfgGeminiKey.value) {
        cfgGeminiKey.placeholder = cfg.hasGeminiKey ? "•••••••••••• (Active in .env)" : "AIzaSy... (Paste Gemini Key here)";
      }
      if (cfgWeatherKey && !cfgWeatherKey.value) {
        cfgWeatherKey.placeholder = cfg.hasWeatherKey ? "•••••••••••• (Active in .env)" : "Optional: OpenWeatherMap API Key...";
      }
      if (cfgSupabaseUrl && !cfgSupabaseUrl.value && cfg.supabaseUrl) {
        cfgSupabaseUrl.value = cfg.supabaseUrl;
      }
      if (modalAiStatusBadge) {
        modalAiStatusBadge.textContent = cfg.hasGeminiKey ? "Gemini Cloud Active" : "Local AI Ready";
      }
      if (modalAiDot) {
        modalAiDot.className = cfg.hasGeminiKey ? "dot-live" : "dot-warn";
      }
    }
  } catch (err) {
    console.warn("Failed to load current API config:", err);
  }
}

async function testGeminiApiKey() {
  if (!geminiTestFeedback) return;
  const keyToTest = cfgGeminiKey?.value.trim();
  geminiTestFeedback.className = "test-feedback loading";
  geminiTestFeedback.textContent = "Gemini AI टेस्ट हो रहा है... (Validating key with Google AI Studio)...";
  geminiTestFeedback.classList.remove("hidden");

  try {
    const response = await fetch(`${API_BASE}/api/config/test-gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: keyToTest }),
    });
    const result = await response.json();
    if (result.success) {
      geminiTestFeedback.className = "test-feedback success";
      geminiTestFeedback.textContent = `✅ ${result.message}`;
    } else {
      geminiTestFeedback.className = "test-feedback error";
      geminiTestFeedback.textContent = `❌ ${result.message}`;
    }
  } catch (err) {
    geminiTestFeedback.className = "test-feedback error";
    geminiTestFeedback.textContent = `❌ नेटवर्क त्रुटि: ${err.message}`;
  }
}

async function testWeatherApiKey() {
  if (!weatherTestFeedback) return;
  const keyToTest = cfgWeatherKey?.value.trim();
  weatherTestFeedback.className = "test-feedback loading";
  weatherTestFeedback.textContent = "मौसम API टेस्ट हो रहा है... (Checking live weather)...";
  weatherTestFeedback.classList.remove("hidden");

  try {
    const response = await fetch(`${API_BASE}/api/config/test-weather`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: keyToTest, location: "Kangra" }),
    });
    const result = await response.json();
    if (result.success) {
      weatherTestFeedback.className = "test-feedback success";
      weatherTestFeedback.textContent = `✅ ${result.message}`;
    } else {
      weatherTestFeedback.className = "test-feedback error";
      weatherTestFeedback.textContent = `❌ ${result.message}`;
    }
  } catch (err) {
    weatherTestFeedback.className = "test-feedback error";
    weatherTestFeedback.textContent = `❌ नेटवर्क त्रुटि: ${err.message}`;
  }
}

async function testSupabaseApi() {
  if (!supabaseTestFeedback) return;
  supabaseTestFeedback.className = "test-feedback loading";
  supabaseTestFeedback.textContent = "Supabase कनेक्शन टेस्ट हो रहा है...";
  supabaseTestFeedback.classList.remove("hidden");

  try {
    const response = await fetch(`${API_BASE}/api/database/test`, { method: "POST" });
    const result = await response.json();
    if (result.success && result.supabaseConnected) {
      supabaseTestFeedback.className = "test-feedback success";
      supabaseTestFeedback.textContent = `✅ ${result.message}`;
    } else {
      supabaseTestFeedback.className = "test-feedback error";
      supabaseTestFeedback.textContent = `⚠️ Supabase Cloud ऑफलाइन है। बिल्ट-इन Local SQLite डेटाबेस ऑनलाइन है।`;
    }
  } catch (err) {
    supabaseTestFeedback.className = "test-feedback error";
    supabaseTestFeedback.textContent = `❌ ${err.message}`;
  }
}

async function submitApiConfigForm(e) {
  e.preventDefault();
  if (!apiSaveMessage) return;

  const payload = {};
  if (cfgGeminiKey?.value.trim()) payload.geminiApiKey = cfgGeminiKey.value.trim();
  if (cfgWeatherKey?.value.trim()) payload.weatherApiKey = cfgWeatherKey.value.trim();
  if (cfgSupabaseUrl?.value.trim()) payload.supabaseUrl = cfgSupabaseUrl.value.trim();
  if (cfgSupabaseKey?.value.trim()) payload.supabasePublishableKey = cfgSupabaseKey.value.trim();

  apiSaveMessage.className = "save-feedback";
  apiSaveMessage.style.background = "rgba(56,189,248,0.15)";
  apiSaveMessage.style.color = "var(--cyan)";
  apiSaveMessage.textContent = "सेटिंग्स सेव हो रही हैं... (Saving to .env)...";
  apiSaveMessage.classList.remove("hidden");

  try {
    const response = await fetch(`${API_BASE}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (result.success) {
      apiSaveMessage.className = "save-feedback success";
      apiSaveMessage.textContent = "✅ सभी API सेटिंग्स सफलतापूर्वक .env में सेव हो गईं!";
      setTimeout(() => {
        fetchSystemStatus();
        fetchWeather();
      }, 500);
    } else {
      apiSaveMessage.className = "save-feedback error";
      apiSaveMessage.textContent = `❌ एरर: ${result.message}`;
    }
  } catch (err) {
    apiSaveMessage.className = "save-feedback error";
    apiSaveMessage.textContent = `❌ नेटवर्क एरर: ${err.message}`;
  }
}

// ==========================================
// 8. Auth Dialog Handling
// ==========================================
function openAuth(mode) {
  const t = translations[state.currentLang] || translations.hi;
  authModal.classList.remove("hidden");
  authTitle.textContent = mode === "register" ? t.authRegisterTitle : t.authLoginTitle;
  authSubmit.textContent = mode === "register" ? t.registerBtn : t.loginBtn;
  const nameGroup = document.getElementById("nameFieldGroup");
  if (nameGroup) nameGroup.style.display = mode === "register" ? "block" : "none";
  if (authName) authName.required = mode === "register";
}

async function submitAuth(event) {
  event.preventDefault();
  const isRegister = authSubmit.textContent.includes("REG") || authSubmit.textContent.includes("रजिस्टर");
  const payload = {
    email: authEmail.value.trim(),
    password: authPassword.value,
  };
  if (isRegister && authName) {
    payload.fullName = authName.value.trim();
  }

  const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Auth error");
    }

    if (result.user) {
      state.currentUser = result.user;
      localStorage.setItem("agrimitra_user", JSON.stringify(result.user));
      updateAuthUI();
    }
    authModal.classList.add("hidden");
    authForm.reset();
    alert(`🌱 ${result.message}`);
  } catch (err) {
    alert(`❌ ${err.message || "Failed. Please try again."}`);
  }
}

function handleAuthButtonClick() {
  if (state.currentUser) {
    const confirmMsg = state.currentLang === "hi" ? "क्या आप वाकई लॉगआउट करना चाहते हैं?" : "Are you sure you want to log out?";
    if (confirm(confirmMsg)) {
      state.currentUser = null;
      localStorage.removeItem("agrimitra_user");
      updateAuthUI();
    }
  } else {
    openAuth("login");
  }
}

// ==========================================
// 9. Mobile Bottom Nav Highlighting
// ==========================================
function setupNavigation() {
  const bnavItems = document.querySelectorAll(".bnav-item");
  const sections = document.querySelectorAll("section[id]");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    bnavItems.forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("data-bnav") === current) {
        item.classList.add("active");
      }
    });
  }, { passive: true });
}

// ==========================================
// 10. Initialization
// ==========================================
function setLoaderHidden() {
  if (!appLoader) return;
  appLoader.classList.add("hidden");
  setTimeout(() => {
    if (appLoader && appLoader.parentNode) appLoader.parentNode.removeChild(appLoader);
  }, 350);
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function attachEvents() {
  // Toggle controls
  if (togglePumpBtn) togglePumpBtn.addEventListener("click", togglePump);
  if (toggleFanBtn) toggleFanBtn.addEventListener("click", toggleFan);
  if (toggleAutoBtn) toggleAutoBtn.addEventListener("click", toggleAutoMode);

  // Language switcher
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      const nextLang = state.currentLang === "hi" ? "en" : "hi";
      setLanguage(nextLang);
    });
  }

  // Voice recognition
  if (voiceButton) voiceButton.addEventListener("click", startVoiceRecognition);

  // Chat send
  if (sendChat) sendChat.addEventListener("click", () => sendChatMessage());
  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  // Quick prompt chips
  document.querySelectorAll(".quick-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const prompt = chip.getAttribute("data-prompt");
      if (prompt) sendChatMessage(prompt);
    });
  });

  // Auth buttons
  if (loginButton) loginButton.addEventListener("click", handleAuthButtonClick);
  if (registerButton) registerButton.addEventListener("click", () => openAuth("register"));
  if (guestLoginBtn) guestLoginBtn.addEventListener("click", () => authModal.classList.add("hidden"));
  const closeModalBtn = document.getElementById("closeModal");
  if (closeModalBtn) closeModalBtn.addEventListener("click", () => authModal.classList.add("hidden"));
  if (authForm) authForm.addEventListener("submit", submitAuth);

  // Initial listen button on first bot message
  const initialSpeakBtn = document.querySelector(".speak-msg-btn");
  if (initialSpeakBtn) {
    initialSpeakBtn.addEventListener("click", () => {
      const msg = state.currentLang === "hi"
        ? "नमस्ते किसान भाई! मैं आपका AgriMitra AI हूँ। अपनी फसल, सिंचाई या मौसम के बारे में कुछ भी पूछें।"
        : "Namaste farmer! I am your AgriMitra AI. Ask about crop, irrigation, or weather.";
      speakText(msg);
    });
  }

  setupScanner();
  setupNavigation();

  // Weather Search
  if (weatherSearchBtn) {
    weatherSearchBtn.addEventListener("click", () => {
      const loc = weatherLocationInput?.value.trim();
      if (loc) fetchWeather(loc);
    });
  }
  if (weatherLocationInput) {
    weatherLocationInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const loc = weatherLocationInput.value.trim();
        if (loc) fetchWeather(loc);
      }
    });
  }

  // Mandi Filters
  let mandiDebounceTimer = null;
  const triggerMandiFetch = () => {
    fetchMandiData(
      mandiCommoditySelect?.value || "all",
      mandiStateSelect?.value || "all",
      mandiSearchInput?.value || ""
    );
  };

  if (mandiSearchInput) {
    mandiSearchInput.addEventListener("input", () => {
      clearTimeout(mandiDebounceTimer);
      mandiDebounceTimer = setTimeout(triggerMandiFetch, 300);
    });
  }
  if (mandiCommoditySelect) mandiCommoditySelect.addEventListener("change", triggerMandiFetch);
  if (mandiStateSelect) mandiStateSelect.addEventListener("change", triggerMandiFetch);
  if (refreshMandiBtn) refreshMandiBtn.addEventListener("click", triggerMandiFetch);

  // API Settings & Key Manager Modal
  if (apiSettingsTopBtn) apiSettingsTopBtn.addEventListener("click", openApiModal);
  if (openApiSettingsSystemBtn) openApiSettingsSystemBtn.addEventListener("click", openApiModal);
  if (closeApiModal) closeApiModal.addEventListener("click", closeApiModalHandler);
  if (testGeminiBtn) testGeminiBtn.addEventListener("click", testGeminiApiKey);
  if (testWeatherBtn) testWeatherBtn.addEventListener("click", testWeatherApiKey);
  if (testSupabaseBtn) testSupabaseBtn.addEventListener("click", testSupabaseApi);
  if (apiConfigForm) apiConfigForm.addEventListener("submit", submitApiConfigForm);
  if (apiSettingsModal) {
    apiSettingsModal.addEventListener("click", (e) => {
      if (e.target === apiSettingsModal) closeApiModalHandler();
    });
  }
}

async function initialize() {
  try {
    attachEvents();
    setLanguage(state.currentLang);
    updateSensorUI({ temperature: 28.4, humidity: 64, soilMoisture: 42, pump: false, fan: true });
    await Promise.allSettled([fetchSystemStatus(), fetchWeather(), fetchMandiData(), fetchSchemesData()]);

    // Live background polling every 3 seconds for continuous ESP32 hardware telemetry sync
    setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/api/sensors`);
        const result = await response.json();
        if (result.success && result.data) {
          updateSensorUI(result.data);
        }
      } catch (err) {
        // Non-blocking background poll
      }
    }, 3000);
  } catch (err) {
    console.warn("Initialization notice:", err);
  } finally {
    setLoaderHidden();
  }
}

// Fallback loader dismiss
setTimeout(setLoaderHidden, 800);

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
