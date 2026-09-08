// =====================================================
// ANNDATA AI - FRONTEND JAVASCRIPT (Local AI - Ollama)
// =====================================================

const API_URL = window.location.protocol === "file:"
    ? "http://localhost:5000"
    : `${window.location.protocol}//${window.location.host}`;

// =====================================================
// GLOBAL STATE
// =====================================================

let autoMode = false;
let pumpState = false;
let fanState = false;
let selectedImageFile = null;
let isSendingMessage = false;
let selectedLanguage = "Hindi";
let farmerProfile = {};
let activePage = "home";
let activeRecognition = null;
const notificationCooldown = new Map();
const originalTextNodes = new WeakMap();
let localSensors = {
    temperature: 28,
    humidity: 65,
    soilMoisture: 42,
    rainExpected: false,
    pump: false,
    fan: false
};
const languageVoiceCodes = {
    Hindi: "hi-IN",
    English: "en-IN",
    Punjabi: "pa-IN",
    Tamil: "ta-IN",
    Marathi: "mr-IN"
};

const translations = {
    English: {
        "WELCOME TO AGRIMITRA": "WELCOME TO AGRIMITRA",
        "Smart Farming with": "Smart Farming with",
        "AI & IoT": "AI & IoT",
        "Monitor your polyhouse, detect crop health problems and get intelligent farming advice.": "Monitor your polyhouse, detect crop health problems and get intelligent farming advice.",
        "Live Sensor Data": "Live Sensor Data",
        "Real-time polyhouse environmental conditions": "Real-time polyhouse environmental conditions",
        "Automatic Actions": "Automatic Actions",
        "Smart control based on sensor conditions": "Smart control based on sensor conditions",
        "Water Pump": "Water Pump",
        "Automatic irrigation": "Automatic irrigation",
        "Ventilation Fan": "Ventilation Fan",
        "Temperature control": "Temperature control",
        "Crop Vision AI": "Crop Vision AI",
        "Upload a crop image for health analysis": "Upload a crop image for health analysis",
        "Upload Crop Image": "Upload Crop Image",
        "JPG, PNG up to 10MB": "JPG, PNG up to 10MB",
        "Choose Image": "Choose Image",
        "AI Analysis": "AI Analysis",
        "Confidence": "Confidence",
        "Crop": "Crop",
        "Health": "Health",
        "Possible Disease": "Possible Disease",
        "None detected": "None detected",
        "Analyze Crop": "Analyze Crop",
        "Your intelligent farmer assistant": "Your intelligent farmer assistant",
        "Irrigation": "Irrigation",
        "Temperature": "Temperature",
        "Crop Health": "Crop Health",
        "Smart Advisory": "Smart Advisory",
        "AI-generated recommendations": "AI-generated recommendations",
        "Smart technology for smarter farming.": "Smart technology for smarter farming.",
        "Anndata AI • AI + IoT • Smart Polyhouse": "Anndata AI • AI + IoT • Smart Polyhouse",
        "Manual control active: pump aur fan toggles ready hain.": "Manual control active: pump and fan toggles are ready.",
        "Ask Anndata AI about your crop...": "Ask Anndata AI about your crop..."
    },
    Hindi: {
        "WELCOME TO AGRIMITRA": "AGRIMITRA में आपका स्वागत है",
        "Smart Farming with": "स्मार्ट खेती",
        "AI & IoT": "AI और IoT के साथ",
        "Monitor your polyhouse, detect crop health problems and get intelligent farming advice.": "अपने पॉलीहाउस की निगरानी करें, फसल की समस्या पहचानें और स्मार्ट खेती की सलाह पाएं।",
        "Live Sensor Data": "लाइव सेंसर डेटा",
        "Real-time polyhouse environmental conditions": "पॉलीहाउस की वास्तविक समय की स्थिति",
        "Automatic Actions": "ऑटोमैटिक एक्शन",
        "Smart control based on sensor conditions": "सेंसर की स्थिति के आधार पर स्मार्ट नियंत्रण",
        "Water Pump": "पानी का पंप",
        "Automatic irrigation": "ऑटोमैटिक सिंचाई",
        "Ventilation Fan": "वेंटिलेशन पंखा",
        "Temperature control": "तापमान नियंत्रण",
        "Crop Vision AI": "फसल विज़न AI",
        "Upload a crop image for health analysis": "फसल की जांच के लिए फोटो अपलोड करें",
        "Upload Crop Image": "फसल की फोटो अपलोड करें",
        "JPG, PNG up to 10MB": "JPG, PNG अधिकतम 10MB",
        "Choose Image": "फोटो चुनें",
        "AI Analysis": "AI विश्लेषण",
        "Confidence": "विश्वसनीयता",
        "Crop": "फसल",
        "Health": "स्वास्थ्य",
        "Possible Disease": "संभावित बीमारी",
        "None detected": "कुछ नहीं मिला",
        "Analyze Crop": "फसल की जांच करें",
        "Your intelligent farmer assistant": "आपका स्मार्ट किसान सहायक",
        "Irrigation": "सिंचाई",
        "Temperature": "तापमान",
        "Crop Health": "फसल का स्वास्थ्य",
        "Smart Advisory": "स्मार्ट सलाह",
        "AI-generated recommendations": "AI द्वारा बनाई गई सलाह",
        "Smart technology for smarter farming.": "स्मार्ट खेती के लिए स्मार्ट तकनीक।",
        "Anndata AI • AI + IoT • Smart Polyhouse": "Anndata AI • AI + IoT • स्मार्ट पॉलीहाउस",
        "Manual control active: pump aur fan toggles ready hain.": "मैनुअल कंट्रोल चालू है: पंप और पंखे के स्विच तैयार हैं।",
        "Ask Anndata AI about your crop...": "अपनी फसल के बारे में Anndata AI से पूछें..."
    },
    Punjabi: {
        "WELCOME TO AGRIMITRA": "AGRIMITRA ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ",
        "Smart Farming with": "ਸਮਾਰਟ ਖੇਤੀ",
        "AI & IoT": "AI ਅਤੇ IoT ਨਾਲ",
        "Monitor your polyhouse, detect crop health problems and get intelligent farming advice.": "ਆਪਣੇ ਪੋਲੀਹਾਊਸ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ ਅਤੇ ਸਮਾਰਟ ਖੇਤੀ ਸਲਾਹ ਲਵੋ।",
        "Live Sensor Data": "ਲਾਈਵ ਸੈਂਸਰ ਡਾਟਾ",
        "Real-time polyhouse environmental conditions": "ਪੋਲੀਹਾਊਸ ਦੀ ਅਸਲ ਸਮੇਂ ਦੀ ਸਥਿਤੀ",
        "Automatic Actions": "ਆਟੋਮੈਟਿਕ ਕਾਰਵਾਈ",
        "Smart control based on sensor conditions": "ਸੈਂਸਰ ਦੀ ਸਥਿਤੀ ਅਨੁਸਾਰ ਸਮਾਰਟ ਕੰਟਰੋਲ",
        "Water Pump": "ਪਾਣੀ ਦਾ ਪੰਪ",
        "Automatic irrigation": "ਆਟੋਮੈਟਿਕ ਸਿੰਚਾਈ",
        "Ventilation Fan": "ਹਵਾਦਾਰੀ ਪੱਖਾ",
        "Temperature control": "ਤਾਪਮਾਨ ਕੰਟਰੋਲ",
        "Crop Vision AI": "ਫਸਲ ਵਿਜ਼ਨ AI",
        "Upload a crop image for health analysis": "ਫਸਲ ਦੀ ਜਾਂਚ ਲਈ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
        "Upload Crop Image": "ਫਸਲ ਦੀ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
        "Choose Image": "ਤਸਵੀਰ ਚੁਣੋ",
        "AI Analysis": "AI ਜਾਂਚ",
        "Confidence": "ਭਰੋਸੇਯੋਗਤਾ",
        "Crop": "ਫਸਲ",
        "Health": "ਸਿਹਤ",
        "Possible Disease": "ਸੰਭਾਵਿਤ ਬਿਮਾਰੀ",
        "None detected": "ਕੁਝ ਨਹੀਂ ਮਿਲਿਆ",
        "Analyze Crop": "ਫਸਲ ਦੀ ਜਾਂਚ ਕਰੋ",
        "Your intelligent farmer assistant": "ਤੁਹਾਡਾ ਸਮਾਰਟ ਕਿਸਾਨ ਸਹਾਇਕ",
        "Smart Advisory": "ਸਮਾਰਟ ਸਲਾਹ",
        "AI-generated recommendations": "AI ਦੁਆਰਾ ਸਲਾਹ",
        "Smart technology for smarter farming.": "ਸਮਾਰਟ ਖੇਤੀ ਲਈ ਸਮਾਰਟ ਤਕਨਾਲੋਜੀ।",
        "Manual control active: pump aur fan toggles ready hain.": "ਮੈਨੂਅਲ ਕੰਟਰੋਲ ਚਾਲੂ ਹੈ: ਪੰਪ ਅਤੇ ਪੱਖੇ ਦੇ ਸਵਿੱਚ ਤਿਆਰ ਹਨ।",
        "Ask Anndata AI about your crop...": "ਆਪਣੀ ਫਸਲ ਬਾਰੇ Anndata AI ਨੂੰ ਪੁੱਛੋ..."
    },
    Tamil: {
        "WELCOME TO AGRIMITRA": "AGRIMITRA உங்களை வரவேற்கிறது",
        "Smart Farming with": "ஸ்மார்ட் விவசாயம்",
        "AI & IoT": "AI மற்றும் IoT உடன்",
        "Monitor your polyhouse, detect crop health problems and get intelligent farming advice.": "உங்கள் பாலிஹவுஸை கண்காணித்து, பயிர் பிரச்சினைகளை கண்டறிந்து ஆலோசனை பெறுங்கள்.",
        "Live Sensor Data": "நேரடி சென்சார் தரவு",
        "Real-time polyhouse environmental conditions": "பாலிஹவுஸின் நேரடி சுற்றுச்சூழல் நிலை",
        "Automatic Actions": "தானியங்கி செயல்கள்",
        "Smart control based on sensor conditions": "சென்சார் நிலை அடிப்படையிலான கட்டுப்பாடு",
        "Water Pump": "நீர் பம்ப்",
        "Automatic irrigation": "தானியங்கி நீர்ப்பாசனம்",
        "Ventilation Fan": "காற்றோட்ட விசிறி",
        "Temperature control": "வெப்பநிலை கட்டுப்பாடு",
        "Crop Vision AI": "பயிர் விஷன் AI",
        "Upload a crop image for health analysis": "பயிர் பரிசோதனைக்கு புகைப்படம் பதிவேற்றவும்",
        "Upload Crop Image": "பயிர் புகைப்படத்தை பதிவேற்றவும்",
        "Choose Image": "புகைப்படத்தை தேர்வு செய்க",
        "AI Analysis": "AI ஆய்வு",
        "Confidence": "நம்பகத்தன்மை",
        "Crop": "பயிர்",
        "Health": "ஆரோக்கியம்",
        "Possible Disease": "சாத்தியமான நோய்",
        "None detected": "எதுவும் கண்டறியப்படவில்லை",
        "Analyze Crop": "பயிரை ஆய்வு செய்க",
        "Your intelligent farmer assistant": "உங்கள் ஸ்மார்ட் விவசாய உதவியாளர்",
        "Smart Advisory": "ஸ்மார்ட் ஆலோசனை",
        "AI-generated recommendations": "AI பரிந்துரைகள்",
        "Smart technology for smarter farming.": "சிறந்த விவசாயத்திற்கான ஸ்மார்ட் தொழில்நுட்பம்.",
        "Manual control active: pump aur fan toggles ready hain.": "மேனுவல் கட்டுப்பாடு இயக்கத்தில் உள்ளது: பம்ப் மற்றும் விசிறி தயாராக உள்ளன.",
        "Ask Anndata AI about your crop...": "உங்கள் பயிரைப் பற்றி Anndata AI-யிடம் கேளுங்கள்..."
    },
    Marathi: {
        "WELCOME TO AGRIMITRA": "AGRIMITRA मध्ये आपले स्वागत आहे",
        "Smart Farming with": "स्मार्ट शेती",
        "AI & IoT": "AI आणि IoT सह",
        "Monitor your polyhouse, detect crop health problems and get intelligent farming advice.": "पॉलीहाऊसचे निरीक्षण करा, पिकांच्या समस्या ओळखा आणि स्मार्ट शेतीचा सल्ला मिळवा.",
        "Live Sensor Data": "थेट सेन्सर डेटा",
        "Real-time polyhouse environmental conditions": "पॉलीहाऊसची थेट पर्यावरणीय स्थिती",
        "Automatic Actions": "स्वयंचलित कृती",
        "Smart control based on sensor conditions": "सेन्सरच्या स्थितीनुसार स्मार्ट नियंत्रण",
        "Water Pump": "पाण्याचा पंप",
        "Automatic irrigation": "स्वयंचलित सिंचन",
        "Ventilation Fan": "हवेचा पंखा",
        "Temperature control": "तापमान नियंत्रण",
        "Crop Vision AI": "पीक व्हिजन AI",
        "Upload a crop image for health analysis": "पिकाच्या तपासणीसाठी फोटो अपलोड करा",
        "Upload Crop Image": "पिकाचा फोटो अपलोड करा",
        "Choose Image": "फोटो निवडा",
        "AI Analysis": "AI तपासणी",
        "Confidence": "विश्वास पातळी",
        "Crop": "पीक",
        "Health": "आरोग्य",
        "Possible Disease": "संभाव्य रोग",
        "None detected": "काही आढळले नाही",
        "Analyze Crop": "पिकाची तपासणी करा",
        "Your intelligent farmer assistant": "तुमचा स्मार्ट शेतकरी सहाय्यक",
        "Smart Advisory": "स्मार्ट सल्ला",
        "AI-generated recommendations": "AI कडून शिफारसी",
        "Smart technology for smarter farming.": "स्मार्ट शेतीसाठी स्मार्ट तंत्रज्ञान.",
        "Manual control active: pump aur fan toggles ready hain.": "मॅन्युअल नियंत्रण सुरू आहे: पंप आणि पंखे तयार आहेत.",
        "Ask Anndata AI about your crop...": "तुमच्या पिकाबद्दल Anndata AI ला विचारा..."
    }

};

// =====================================================
// HELPER
// =====================================================

function getElement(id) {
    return document.getElementById(id);
}

function navigateTo(page) {
    if (page === "sensors" && localStorage.getItem("agrimitra-sensors-connected") !== "true") {
        openSensorSetup();
        return;
    }
    activePage = page;
    document.querySelectorAll("[data-page-section]").forEach((section) => {
        section.classList.toggle("is-active", section.dataset.pageSection === page);
    });
    document.querySelectorAll(".nav-item").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.page === page);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function openSensorSetup() {
    getElement("sensorSetupModal").classList.remove("is-hidden");
}

function closeSensorSetup() {
    getElement("sensorSetupModal").classList.add("is-hidden");
}

function completeSensorSetup() {
    const ready = getElement("sensorHardwareReady").checked;
    if (!ready) {
        getElement("sensorSetupHint").textContent = "Pehle checkbox select karke gateway connection confirm karein.";
        return;
    }
    localStorage.setItem("agrimitra-sensors-connected", "true");
    closeSensorSetup();
    navigateTo("sensors");
    fetchSensors();
    showNotification("Polyhouse sensors connected", "Ab live temperature, humidity aur soil data monitor ho raha hai.");
}

function toggleTheme() {
    const light = document.body.classList.toggle("light-theme");
    localStorage.setItem("agrimitra-theme", light ? "light" : "dark");
    const button = getElement("themeToggle");
    if (button) button.textContent = light ? "🌙" : "☀️";
}

function loadTheme() {
    const light = localStorage.getItem("agrimitra-theme") === "light";
    document.body.classList.toggle("light-theme", light);
    const button = getElement("themeToggle");
    if (button) button.textContent = light ? "🌙" : "☀️";
}

function completeOnboarding() {
    const profile = {
        name: getElement("farmerName").value.trim(),
        phone: getElement("farmerPhone").value.trim(),
        location: getElement("farmerLocation").value.trim(),
        crop: getElement("farmerCrop").value.trim(),
        farmSize: getElement("farmerFarmSize").value.trim()
    };
    if (!profile.name || !profile.phone || !profile.location || !profile.crop) {
        getElement("onboardingHint").textContent = "Name, mobile, location aur main crop bharna zaroori hai.";
        return;
    }
    if (!/^[0-9+\-\s]{10,15}$/.test(profile.phone)) {
        getElement("onboardingHint").textContent = "Mobile number sahi format me enter karein.";
        return;
    }
    selectedLanguage = getElement("welcomeLanguage").value;
    getElement("languageSelect").value = selectedLanguage;
    farmerProfile = profile;
    localStorage.setItem("agrimitra-profile", JSON.stringify(profile));
    localStorage.setItem("agrimitra-language", selectedLanguage);
    getElement("onboardingModal").classList.add("is-hidden");
    updateProfileChip();
    translatePage();
}

function updateProfileChip() {
    const name = farmerProfile.name || "Farmer";
    const nameElement = getElement("profileName");
    if (nameElement) nameElement.textContent = name;
    const summary = getElement("profileSummary");
    if (summary) {
        summary.innerHTML = "";
        [
            ["Name", farmerProfile.name],
            ["Mobile", farmerProfile.phone],
            ["Location", farmerProfile.location],
            ["Main crop", farmerProfile.crop],
            ["Farm size", farmerProfile.farmSize || "Not added"]
        ].forEach(([label, value]) => {
            const row = document.createElement("div");
            row.append(document.createTextNode(label));
            const detail = document.createElement("strong");
            detail.textContent = value;
            row.appendChild(detail);
            summary.appendChild(row);
        });
    }
}

function openProfileModal() {
    updateProfileChip();
    getElement("profileModal").classList.remove("is-hidden");
}

function closeProfileModal() {
    getElement("profileModal").classList.add("is-hidden");
}

function setButtonBusy(button, busy, busyText) {
    if (!button) return;
    if (busy) {
        button.dataset.defaultText = button.textContent;
        button.disabled = true;
        button.textContent = busyText;
    } else {
        button.disabled = false;
        button.textContent = button.dataset.defaultText || button.textContent;
    }
}

function updateConnectionStatus(online) {
    const dot = getElement("connectionDot");
    const text = getElement("connectionText");
    if (!dot || !text) return;
    dot.classList.toggle("offline", !online);
    text.textContent = online
        ? getUiText("System Online")
        : getUiText("Offline AI Mode");
}

function getUiText(text) {
    const common = {
        Hindi: {
            "AI will reply in": "AI इस भाषा में जवाब देगा:",
            "AUTO MODE: ON": "ऑटो मोड: चालू",
            "MANUAL MODE: ON": "मैनुअल मोड: चालू",
            "System Online": "सिस्टम ऑनलाइन",
            "Offline AI Mode": "ऑफलाइन AI मोड"
        },
        Punjabi: {
            "AI will reply in": "AI ਇਸ ਭਾਸ਼ਾ ਵਿੱਚ ਜਵਾਬ ਦੇਵੇਗਾ:",
            "AUTO MODE: ON": "ਆਟੋ ਮੋਡ: ਚਾਲੂ",
            "MANUAL MODE: ON": "ਮੈਨੂਅਲ ਮੋਡ: ਚਾਲੂ",
            "System Online": "ਸਿਸਟਮ ਔਨਲਾਈਨ",
            "Offline AI Mode": "ਆਫਲਾਈਨ AI ਮੋਡ"
        },
        Tamil: {
            "AI will reply in": "AI இந்த மொழியில் பதிலளிக்கும்:",
            "AUTO MODE: ON": "ஆட்டோ மோடு: இயக்கம்",
            "MANUAL MODE: ON": "மேனுவல் மோடு: இயக்கம்",
            "System Online": "சிஸ்டம் ஆன்லைன்",
            "Offline AI Mode": "ஆஃப்லைன் AI மோடு"
        },
        Marathi: {
            "AI will reply in": "AI या भाषेत उत्तर देईल:",
            "AUTO MODE: ON": "ऑटो मोड: सुरू",
            "MANUAL MODE: ON": "मॅन्युअल मोड: सुरू",
            "System Online": "सिस्टम ऑनलाइन",
            "Offline AI Mode": "ऑफलाइन AI मोड"
        }
    };
    if (common[selectedLanguage]?.[text]) return common[selectedLanguage][text];
    return translations[selectedLanguage]?.[text] || translations.English[text] || text;
}

function translatePage() {
    const dictionary = translations[selectedLanguage] || translations.English;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
        if (node.parentElement?.closest("script, style, select")) continue;
        nodes.push(node);
    }

    nodes.forEach((textNode) => {
        const raw = originalTextNodes.get(textNode) || textNode.nodeValue || "";
        originalTextNodes.set(textNode, raw);
        const value = raw.trim();
        if (!value) return;
        const exact = dictionary[value];
        if (exact) {
            textNode.nodeValue = raw.replace(value, exact);
            return;
        }

        const match = Object.keys(dictionary).find((key) => value.endsWith(key));
        if (match) {
            textNode.nodeValue = raw.replace(value, value.slice(0, -match.length) + dictionary[match]);
        }
    });

    document.documentElement.lang = selectedLanguage === "Hindi" ? "hi" :
        selectedLanguage === "Punjabi" ? "pa" :
        selectedLanguage === "Tamil" ? "ta" :
        selectedLanguage === "Marathi" ? "mr" : "en";
    updateDynamicLanguage();
}

function updateDynamicLanguage() {
    const languageButton = getElement("autoModeBtn");
    if (languageButton) {
        languageButton.textContent = autoMode
            ? `🤖 ${getUiText("AUTO MODE: ON")}`
            : `🖐️ ${getUiText("MANUAL MODE: ON")}`;
    }
    const language = getElement("languageSelect")?.value || selectedLanguage;
    const status = getElement("languageStatus");
    if (status) status.textContent = `${getUiText("AI will reply in")} ${language}`;
    const input = getElement("chatInput");
    if (input) input.placeholder = getUiText("Ask Anndata AI about your crop...");

    const labels = {
        temperature: { English: "TEMPERATURE", Hindi: "तापमान", Punjabi: "ਤਾਪਮਾਨ", Tamil: "வெப்பநிலை", Marathi: "तापमान" },
        humidity: { English: "HUMIDITY", Hindi: "नमी", Punjabi: "ਨਮੀ", Tamil: "ஈரப்பதம்", Marathi: "आर्द्रता" },
        soil: { English: "SOIL MOISTURE", Hindi: "मिट्टी की नमी", Punjabi: "ਮਿੱਟੀ ਦੀ ਨਮੀ", Tamil: "மண் ஈரப்பதம்", Marathi: "मातीतील ओलावा" },
        weather: { English: "WEATHER", Hindi: "मौसम", Punjabi: "ਮੌਸਮ", Tamil: "வானிலை", Marathi: "हवामान" }
    };
    Object.entries(labels).forEach(([className, values]) => {
        const label = document.querySelector(`.${className} .sensor-label`);
        if (label) label.textContent = values[selectedLanguage] || values.English;
    });
}

// =====================================================
// SENSOR DATA
// =====================================================

async function fetchSensors() {
    try {
        const res = await fetch(`${API_URL}/api/sensors`);
        const data = await res.json();

        if (data.success) {
            updateSensorUI(data.data);
            updateConnectionStatus(true);
        }
    } catch (err) {
        updateSensorUI(localSensors);
        updateConnectionStatus(false);
        console.info("Using offline demo sensors:", err.message);
    }
}

function updateSensorUI(sensors) {
    localSensors = { ...localSensors, ...sensors };
    getElement("temperature").textContent = `${sensors.temperature}°C`;
    getElement("humidity").textContent = `${sensors.humidity}%`;
    getElement("soilMoisture").textContent = `${sensors.soilMoisture}%`;
    getElement("rainStatus").textContent = sensors.rainExpected ? "Rain Expected" : "No Rain";

    getElement("temperatureBar").style.width = `${Math.min(sensors.temperature * 2, 100)}%`;
    getElement("humidityBar").style.width = `${sensors.humidity}%`;
    getElement("soilBar").style.width = `${sensors.soilMoisture}%`;

    const soilStatus = getElement("soilStatus");
    if (sensors.soilMoisture < 30) {
        soilStatus.textContent = "Low - Irrigation Needed";
    } else if (sensors.soilMoisture > 45) {
        soilStatus.textContent = "High - Well Watered";
    } else {
        soilStatus.textContent = "Normal";
    }

    pumpState = sensors.pump;
    fanState = sensors.fan;
    updateDeviceUI("pump", pumpState);
    updateDeviceUI("fan", fanState);

    updateAdvisory(sensors);
    if (sensors.soilMoisture < 25) {
        showCooldownNotification("soil-low", "AgriMitra irrigation alert", "मिट्टी की नमी बहुत कम है। हल्की सिंचाई करें और pump/drainage check करें।");
    }
    if (sensors.temperature > 35) {
        showCooldownNotification("heat", "AgriMitra heat alert", "तापमान बहुत अधिक है। Polyhouse ventilation और fan तुरंत check करें।");
    }
}

function updateDeviceUI(device, state) {
    const statusEl = getElement(`${device}Status`);
    const toggleEl = getElement(`${device}Toggle`);

    if (state) {
        statusEl.textContent = "ON";
        statusEl.className = "device-status on";
        toggleEl.classList.add("active");
    } else {
        statusEl.textContent = "OFF";
        statusEl.className = "device-status off";
        toggleEl.classList.remove("active");
    }
}

// =====================================================
// DEVICE CONTROL
// =====================================================

async function togglePump() {
    if (autoMode) {
        setControlHint("Auto mode ON hai. Manual control ke liye AUTO MODE button dabao.");
        return;
    }

    const nextState = !pumpState;

    try {
        const res = await fetch(`${API_URL}/api/device/pump`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: nextState })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || "Pump control request failed");
        }
        pumpState = data.state;
        updateDeviceUI("pump", pumpState);
    } catch (err) {
        pumpState = nextState;
        localSensors.pump = pumpState;
        updateDeviceUI("pump", pumpState);
        updateConnectionStatus(false);
        setControlHint(`Backend offline: Pump ${pumpState ? "ON" : "OFF"} local demo me set hai.`);
        console.error("Failed to toggle pump:", err);
    }
}

async function toggleFan() {
    if (autoMode) {
        setControlHint("Auto mode ON hai. Manual control ke liye AUTO MODE button dabao.");
        return;
    }

    const nextState = !fanState;

    try {
        const res = await fetch(`${API_URL}/api/device/fan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: nextState })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || "Fan control request failed");
        }
        fanState = data.state;
        updateDeviceUI("fan", fanState);
    } catch (err) {
        fanState = nextState;
        localSensors.fan = fanState;
        updateDeviceUI("fan", fanState);
        updateConnectionStatus(false);
        setControlHint(`Backend offline: Fan ${fanState ? "ON" : "OFF"} local demo me set hai.`);
        console.error("Failed to toggle fan:", err);
    }
}

function toggleAutoMode() {
    autoMode = !autoMode;
    const btn = getElement("autoModeBtn");
    btn.setAttribute("aria-pressed", String(autoMode));
    updateDynamicLanguage();
    setControlHint(autoMode
        ? "Auto control active: sensors pump aur fan ko manage karenge."
        : "Manual control active: pump aur fan toggles ready hain.");
}

function setControlHint(message) {
    const hint = getElement("controlHint");
    const localized = {
        "Auto control active: sensors pump aur fan ko manage karenge.": {
            Hindi: "ऑटो कंट्रोल चालू है: सेंसर पंप और पंखे को नियंत्रित करेंगे।",
            English: "Auto control is active: sensors will manage the pump and fan.",
            Punjabi: "ਆਟੋ ਕੰਟਰੋਲ ਚਾਲੂ ਹੈ: ਸੈਂਸਰ ਪੰਪ ਅਤੇ ਪੱਖੇ ਨੂੰ ਚਲਾਉਣਗੇ।",
            Tamil: "ஆட்டோ கட்டுப்பாடு இயங்குகிறது: சென்சார்கள் பம்ப் மற்றும் விசிறியை நிர்வகிக்கும்.",
            Marathi: "ऑटो नियंत्रण सुरू आहे: सेन्सर पंप आणि पंखा नियंत्रित करतील."
        },
        "Manual control active: pump aur fan toggles ready hain.": {
            Hindi: "मैनुअल कंट्रोल चालू है: पंप और पंखे के स्विच तैयार हैं।",
            English: "Manual control is active: pump and fan toggles are ready.",
            Punjabi: "ਮੈਨੂਅਲ ਕੰਟਰੋਲ ਚਾਲੂ ਹੈ: ਪੰਪ ਅਤੇ ਪੱਖੇ ਦੇ ਸਵਿੱਚ ਤਿਆਰ ਹਨ।",
            Tamil: "மேனுவல் கட்டுப்பாடு இயங்குகிறது: பம்ப் மற்றும் விசிறி தயாராக உள்ளன.",
            Marathi: "मॅन्युअल नियंत्रण सुरू आहे: पंप आणि पंखे तयार आहेत."
        }
    };
    if (hint) hint.textContent = localized[message]?.[selectedLanguage] || message;
}

async function runAutoControl() {
    if (!autoMode) return;

    try {
        const res = await fetch(`${API_URL}/api/auto-control`, {
            method: "POST"
        });

        const data = await res.json();
        if (data.success) {
            updateSensorUI(data.data);
        }
    } catch (err) {
        console.error("Auto control failed:", err);
    }
}

// =====================================================
// ADVISORY
// =====================================================

function updateAdvisory(sensors) {
    const irrigationEl = getElement("irrigationAdvice");
    const tempEl = getElement("temperatureAdvice");
    const advice = {
        Hindi: {
            low: "मिट्टी की नमी कम है। तुरंत सिंचाई की जरूरत है।",
            high: "मिट्टी में नमी ज्यादा है। अभी सिंचाई की जरूरत नहीं।",
            normal: "मिट्टी की नमी सामान्य है। अभी सिंचाई की जरूरत नहीं।",
            hot: "तापमान ज्यादा है। वेंटिलेशन पंखा चलाने की सलाह है।",
            cold: "तापमान कम है। ठंड से फसल को बचाएं।",
            comfortable: "तापमान आरामदायक सीमा में है।"
        },
        English: {
            low: "Soil moisture is low. Irrigation is needed now.",
            high: "Soil moisture is high. No irrigation is needed now.",
            normal: "Soil moisture is normal. No immediate irrigation is needed.",
            hot: "Temperature is high. Run the ventilation fan.",
            cold: "Temperature is low. Protect the crop from cold stress.",
            comfortable: "Temperature is in the comfortable range."
        },
        Punjabi: {
            low: "ਮਿੱਟੀ ਦੀ ਨਮੀ ਘੱਟ ਹੈ। ਹੁਣ ਸਿੰਚਾਈ ਦੀ ਲੋੜ ਹੈ।",
            high: "ਮਿੱਟੀ ਦੀ ਨਮੀ ਜ਼ਿਆਦਾ ਹੈ। ਹੁਣ ਸਿੰਚਾਈ ਦੀ ਲੋੜ ਨਹੀਂ।",
            normal: "ਮਿੱਟੀ ਦੀ ਨਮੀ ਠੀਕ ਹੈ। ਤੁਰੰਤ ਸਿੰਚਾਈ ਦੀ ਲੋੜ ਨਹੀਂ।",
            hot: "ਤਾਪਮਾਨ ਜ਼ਿਆਦਾ ਹੈ। ਹਵਾਦਾਰੀ ਪੱਖਾ ਚਲਾਓ।",
            cold: "ਤਾਪਮਾਨ ਘੱਟ ਹੈ। ਫਸਲ ਨੂੰ ਠੰਡ ਤੋਂ ਬਚਾਓ।",
            comfortable: "ਤਾਪਮਾਨ ਠੀਕ ਸੀਮਾ ਵਿੱਚ ਹੈ।"
        },
        Tamil: {
            low: "மண் ஈரப்பதம் குறைவு. இப்போது நீர்ப்பாசனம் தேவை.",
            high: "மண் ஈரப்பதம் அதிகம். இப்போது நீர்ப்பாசனம் வேண்டாம்.",
            normal: "மண் ஈரப்பதம் இயல்பாக உள்ளது. உடனடி நீர்ப்பாசனம் வேண்டாம்.",
            hot: "வெப்பநிலை அதிகம். காற்றோட்ட விசிறியை இயக்கவும்.",
            cold: "வெப்பநிலை குறைவு. பயிரை குளிரிலிருந்து பாதுகாக்கவும்.",
            comfortable: "வெப்பநிலை ஏற்ற நிலையில் உள்ளது."
        },
        Marathi: {
            low: "मातीतील ओलावा कमी आहे. आता सिंचन आवश्यक आहे.",
            high: "मातीतील ओलावा जास्त आहे. आता सिंचनाची गरज नाही.",
            normal: "मातीतील ओलावा सामान्य आहे. त्वरित सिंचनाची गरज नाही.",
            hot: "तापमान जास्त आहे. हवेचा पंखा चालू करा.",
            cold: "तापमान कमी आहे. पिकाचे थंडीपासून संरक्षण करा.",
            comfortable: "तापमान आरामदायी मर्यादेत आहे."
        }
    }[selectedLanguage] || {};
    irrigationEl.textContent = sensors.soilMoisture < 30 ? advice.low :
        sensors.soilMoisture > 45 ? advice.high : advice.normal;
    tempEl.textContent = sensors.temperature > 30 ? advice.hot :
        sensors.temperature < 28 ? advice.cold : advice.comfortable;
}

// =====================================================
// CHAT
// =====================================================

function appendMessage(sender, text) {
    const chatMessages = getElement("chatMessages");

    const messageDiv = document.createElement("div");
    messageDiv.className = sender === "user" ? "message user-message" : "message ai-message";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = sender === "user" ? "🧑‍🌾" : "🌱";

    const content = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = sender === "user" ? "You" : "Anndata AI";
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    content.append(name, paragraph);
    messageDiv.append(avatar, content);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}

async function sendMessage() {
    if (isSendingMessage) return;
    const input = getElement("chatInput");
    const message = input.value.trim();

    if (!message) return;

    appendMessage("user", message);
    input.value = "";
    isSendingMessage = true;
    const sendButton = input.parentElement.querySelector("button:last-child");
    setButtonBusy(sendButton, true, "Sending...");

    const selectedLanguage = getElement("languageSelect")?.value || "Hindi";
    const typingMsg = appendMessage("ai", getThinkingText(selectedLanguage));

    try {
        // Local rule-based AI is the primary assistant, so chat works without any API.
        await new Promise((resolve) => window.setTimeout(resolve, 450));
        typingMsg.remove();
        const reply = getOfflineReply(message, selectedLanguage);
        appendMessage("ai", reply);
        speakReply(reply, selectedLanguage);
        const status = getElement("languageStatus");
        if (status) status.textContent = `Local AI • ${selectedLanguage}`;
    } finally {
        isSendingMessage = false;
        setButtonBusy(sendButton, false);
    }

}

function speakReply(text, language) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageVoiceCodes[language] || "hi-IN";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    const chooseVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const prefix = (languageVoiceCodes[language] || "hi-IN").toLowerCase().split("-")[0];
        const voice = voices.find((item) => item.lang.toLowerCase() === languageVoiceCodes[language].toLowerCase()) ||
            voices.find((item) => item.lang.toLowerCase().startsWith(prefix));
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
    };
    if (window.speechSynthesis.getVoices().length) chooseVoice();
    else window.speechSynthesis.addEventListener("voiceschanged", chooseVoice, { once: true });
}

function getOfflineReply(message, language) {
    const lowerMessage = message.toLowerCase();
    const soilLow = localSensors.soilMoisture < 30;
    const hot = localSensors.temperature > 30;
    const irrigation = lowerMessage.includes("irrig") || lowerMessage.includes("पानी") ||
        lowerMessage.includes("ਸਿੰਚ") || lowerMessage.includes("நீர்") || lowerMessage.includes("पाणी");

    const replies = {
        Hindi: irrigation || soilLow
            ? `ऑफलाइन सलाह: मिट्टी की नमी ${localSensors.soilMoisture}% है। अभी हल्की सिंचाई करें और पानी जमा न होने दें।`
            : hot
                ? `ऑफलाइन सलाह: तापमान ${localSensors.temperature}°C है। वेंटिलेशन बढ़ाएं और दोपहर में पौधों पर नजर रखें।`
                : `ऑफलाइन सलाह: तापमान ${localSensors.temperature}°C, नमी ${localSensors.humidity}% और मिट्टी की नमी ${localSensors.soilMoisture}% है। फसल अभी सामान्य लग रही है।`,
        English: irrigation || soilLow
            ? `Offline advice: soil moisture is ${localSensors.soilMoisture}%. Give light irrigation and avoid waterlogging.`
            : hot
                ? `Offline advice: temperature is ${localSensors.temperature}°C. Increase ventilation and monitor the crop at noon.`
                : `Offline advice: temperature ${localSensors.temperature}°C, humidity ${localSensors.humidity}%, soil moisture ${localSensors.soilMoisture}%. Conditions look stable.`,
        Punjabi: irrigation || soilLow
            ? `ਆਫਲਾਈਨ ਸਲਾਹ: ਮਿੱਟੀ ਦੀ ਨਮੀ ${localSensors.soilMoisture}% ਹੈ। ਹਲਕੀ ਸਿੰਚਾਈ ਕਰੋ ਅਤੇ ਪਾਣੀ ਖੜ੍ਹਾ ਨਾ ਹੋਣ ਦਿਓ।`
            : hot
                ? `ਆਫਲਾਈਨ ਸਲਾਹ: ਤਾਪਮਾਨ ${localSensors.temperature}°C ਹੈ। ਹਵਾ ਦਾ ਵਹਾਅ ਵਧਾਓ ਅਤੇ ਦੁਪਹਿਰ ਨੂੰ ਫਸਲ ਵੇਖੋ।`
                : `ਆਫਲਾਈਨ ਸਲਾਹ: ਤਾਪਮਾਨ ${localSensors.temperature}°C, ਨਮੀ ${localSensors.humidity}% ਅਤੇ ਮਿੱਟੀ ਦੀ ਨਮੀ ${localSensors.soilMoisture}% ਹੈ।`,
        Tamil: irrigation || soilLow
            ? `ஆஃப்லைன் ஆலோசனை: மண் ஈரப்பதம் ${localSensors.soilMoisture}% உள்ளது. லேசாக நீர் பாய்ச்சி, நீர் தேங்காமல் பார்த்துக்கொள்ளுங்கள்.`
            : hot
                ? `ஆஃப்லைன் ஆலோசனை: வெப்பநிலை ${localSensors.temperature}°C. காற்றோட்டத்தை அதிகரித்து மதியத்தில் பயிரை கண்காணிக்கவும்.`
                : `ஆஃப்லைன் ஆலோசனை: வெப்பநிலை ${localSensors.temperature}°C, ஈரப்பதம் ${localSensors.humidity}%, மண் ஈரப்பதம் ${localSensors.soilMoisture}%.`,
        Marathi: irrigation || soilLow
            ? `ऑफलाइन सल्ला: मातीतील ओलावा ${localSensors.soilMoisture}% आहे. हलके पाणी द्या आणि पाणी साचू देऊ नका.`
            : hot
                ? `ऑफलाइन सल्ला: तापमान ${localSensors.temperature}°C आहे. हवा खेळती ठेवा आणि दुपारी पिकाची पाहणी करा.`
                : `ऑफलाइन सल्ला: तापमान ${localSensors.temperature}°C, आर्द्रता ${localSensors.humidity}% आणि मातीतील ओलावा ${localSensors.soilMoisture}% आहे.`
    };
    return replies[language] || replies.Hindi;
}

function getThinkingText(language) {
    const thinking = {
        Hindi: "Soch raha hoon...",
        English: "Thinking...",
        Punjabi: "ਸੋਚ ਰਿਹਾ ਹਾਂ...",
        Tamil: "யோசித்து கொண்டிருக்கிறேன்...",
        Marathi: "विचार करत आहे..."
    };
    return thinking[language] || thinking.Hindi;
}

function changeAssistantLanguage() {
    selectedLanguage = getElement("languageSelect")?.value || "Hindi";
    translatePage();
    updateAdvisory(localSensors);
}

function useQuickPrompt(prompt) {
    const input = getElement("chatInput");
    input.value = prompt;
    input.focus();
}

function handleChatKey(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// =====================================================
// VOICE INPUT
// =====================================================

function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice input is browser me support nahi hai. Chrome try karo.");
        return;
    }

    if (activeRecognition) {
        activeRecognition.stop();
        activeRecognition = null;
        return;
    }

    const recognition = new SpeechRecognition();
    activeRecognition = recognition;
    const language = getElement("languageSelect")?.value || "Hindi";
    recognition.lang = languageVoiceCodes[language] || "hi-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    const micButton = getElement("micButton");
    micButton.textContent = "🔴";

    try {
        recognition.start();
    } catch (error) {
        micButton.textContent = "🎤";
        activeRecognition = null;
        console.warn("Voice input could not start:", error.message);
    }

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        getElement("chatInput").value = transcript;
        micButton.textContent = "🎤";
        activeRecognition = null;
        sendMessage();
    };

    recognition.onerror = (event) => {
        micButton.textContent = "🎤";
        activeRecognition = null;
        if (event.error !== "no-speech" && event.error !== "aborted") {
            getElement("languageStatus").textContent = `Mic error: ${event.error}`;
        }
    };

    recognition.onend = () => {
        micButton.textContent = "🎤";
        activeRecognition = null;
    };
}

// =====================================================
// CROP VISION (Image Upload + AI Analysis)
// =====================================================

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    selectedImageFile = file;

    const preview = getElement("imagePreview");
    const reader = new FileReader();

    reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = "block";
    };

    reader.readAsDataURL(file);
}

async function analyzeCrop() {
    if (!selectedImageFile) {
        alert("Pehle ek crop image select karo.");
        return;
    }

    const statusEl = getElement("visionStatus");
    statusEl.textContent = "Analyzing...";

    const formData = new FormData();
    formData.append("image", selectedImageFile);

    try {
        const res = await fetch(`${API_URL}/api/analyze`, {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            getElement("cropName").textContent = data.crop || "Unknown";
            getElement("healthScore").textContent = `${data.confidence || 0}%`;

            const healthEl = getElement("cropHealth");
            healthEl.textContent = data.health || "Unknown";
            healthEl.className = data.health === "Healthy" ? "healthy" : "";

            getElement("disease").textContent = data.disease || "None detected";
            statusEl.textContent = "Done";
        } else {
            statusEl.textContent = "Failed";
            alert("Analysis failed: " + (data.message || "Unknown error"));
        }
    } catch (err) {
        statusEl.textContent = "Error";
        getElement("cropName").textContent = "Demo crop";
        getElement("healthScore").textContent = "82%";
        getElement("cropHealth").textContent = "Needs review";
        getElement("cropHealth").className = "";
        getElement("disease").textContent = "Offline mode: close photo inspection needed";
        statusEl.textContent = "Offline demo";
        updateConnectionStatus(false);
        console.error("Crop analysis error:", err);
    }
}

function showNotification(title, body) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
        new Notification(title, { body, icon: "🌱" });
    }
}

function showCooldownNotification(key, title, body) {
    const now = Date.now();
    const lastShown = notificationCooldown.get(key) || 0;
    if (now - lastShown < 30 * 60 * 1000) return;
    notificationCooldown.set(key, now);
    showNotification(title, body);
}

async function enableWeatherNotifications() {
    if (!("Notification" in window) || Notification.permission !== "default") return;
    try {
        await Notification.requestPermission();
    } catch (error) {
        console.info("Weather notifications permission was not granted:", error.message);
    }
}

function updateSeasonPlanner(weather = null) {
    const month = new Date().getMonth() + 1;
    const monsoon = month >= 6 && month <= 9;
    const crop = farmerProfile.crop || "आपकी मुख्य फसल";
    const seasonTitle = getElement("seasonTitle");
    const seasonAdvice = getElement("seasonAdvice");
    const cropPlan = getElement("cropPlanAdvice");
    const fertilizer = getElement("fertilizerAdvice");
    const location = getElement("seasonLocation");
    if (!seasonTitle || !seasonAdvice || !cropPlan || !fertilizer) return;
    seasonTitle.textContent = monsoon ? "Monsoon planning" : "Rabi / summer planning";
    seasonAdvice.textContent = monsoon
        ? "भारी बारिश से पहले drainage साफ रखें और खेत में पानी जमा न होने दें।"
        : "बुवाई से पहले मिट्टी की जांच, बीज उपचार और सिंचाई schedule तैयार करें।";
    cropPlan.textContent = `${crop} के लिए स्थानीय कृषि अधिकारी की variety और मौसम के अनुसार बुवाई करें; जल्दी वाली फसल को प्राथमिकता दें।`;
    fertilizer.textContent = "मिट्टी की जांच के बिना भारी dose न दें। Nitrogen को 2–3 हिस्सों में दें और फूल/फल के समय potassium पर ध्यान दें।";
    if (location) location.textContent = farmerProfile.location
        ? `${farmerProfile.location} • local crop calendar`
        : "Location-based farming guidance";
    if (weather) {
        const alert = weather.rain > 8 || weather.wind > 35 || weather.code >= 95;
        const badge = getElement("weatherAlertBadge");
        if (badge) {
            badge.textContent = alert ? "⚠️ Weather alert" : "✓ Weather stable";
            badge.classList.toggle("is-alert", alert);
        }
        if (alert) {
            showNotification("AgriMitra weather alert", "बारिश या तेज हवा आने वाली है। Polyhouse vents और drainage check करें।");
        }
    }
}

function requestWeatherUpdate() {
    updateSeasonPlanner();
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation,wind_speed_10m,weather_code&timezone=auto`);
            if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
            const data = await response.json();
            updateSeasonPlanner({
                rain: Number(data.current?.precipitation || 0),
                wind: Number(data.current?.wind_speed_10m || 0),
                code: Number(data.current?.weather_code || 0)
            });
        } catch (error) {
            console.info("Live weather unavailable; using seasonal planner:", error.message);
        }
    }, () => {
        updateSeasonPlanner();
    }, { enableHighAccuracy: false, timeout: 7000, maximumAge: 900000 });
}

// =====================================================
// INIT
// =====================================================

window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("is-loading");
    loadTheme();
    enableWeatherNotifications();
    const savedLanguage = localStorage.getItem("agrimitra-language");
    if (savedLanguage && languageVoiceCodes[savedLanguage]) {
        selectedLanguage = savedLanguage;
        getElement("languageSelect").value = savedLanguage;
        getElement("welcomeLanguage").value = savedLanguage;
    }
    const savedProfile = localStorage.getItem("agrimitra-profile");
    if (savedProfile) {
        try {
            farmerProfile = JSON.parse(savedProfile);
            getElement("onboardingModal").classList.add("is-hidden");
            updateProfileChip();
        } catch (error) {
            localStorage.removeItem("agrimitra-profile");
            console.warn("Saved farmer profile was invalid:", error.message);
        }
    }
    getElement("welcomeLanguage").addEventListener("change", (event) => {
        selectedLanguage = event.target.value;
        getElement("languageSelect").value = selectedLanguage;
        translatePage();
    });
    translatePage();
    requestWeatherUpdate();
    fetchSensors();
    setInterval(fetchSensors, 5000);
    setInterval(runAutoControl, 8000);
    enable3DInteractions();

    window.setTimeout(() => {
        document.body.classList.remove("is-loading");
        const loader = getElement("appLoader");
        if (loader) loader.classList.add("is-hidden");
    }, 1100);
});

function enable3DInteractions() {
    const hero = getElement("hero3d");
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    hero.addEventListener("pointermove", (event) => {
        const bounds = hero.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        hero.style.setProperty("--tilt-x", `${y * -12}deg`);
        hero.style.setProperty("--tilt-y", `${x * 14}deg`);
        hero.style.setProperty("--shift-x", `${x * 12}px`);
        hero.style.setProperty("--shift-y", `${y * 12}px`);
    });

    hero.addEventListener("pointerleave", () => {
        hero.style.setProperty("--tilt-x", "0deg");
        hero.style.setProperty("--tilt-y", "0deg");
        hero.style.setProperty("--shift-x", "0px");
        hero.style.setProperty("--shift-y", "0px");
    });

    document.querySelectorAll(".sensor-card, .action-card, .advisory-card").forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const bounds = card.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            card.style.setProperty("--card-rotate-x", `${y * -4}deg`);
            card.style.setProperty("--card-rotate-y", `${x * 5}deg`);
        });
        card.addEventListener("pointerleave", () => {
            card.style.setProperty("--card-rotate-x", "0deg");
            card.style.setProperty("--card-rotate-y", "0deg");
        });
    });
}