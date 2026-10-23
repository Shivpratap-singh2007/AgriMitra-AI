# 🚀 AgriMitra AI 2.0 — Production Deployment Guide
## एग्रीमित्र AI 2.0 डिप्लॉयमेंट गाइड (Render, Railway, Docker & VPS)

इस गाइड में AgriMitra AI 2.0 को इंटरनेट पर 100% मुफ़्त (Free Tier) में लाइव डिप्लॉय करने का सबसे आसान और सुरक्षित तरीका बताया गया है।

---

## 🌟 आर्किटेक्चर (Architecture Overview)

AgriMitra AI 2.0 एक **Single-Container Full-Stack** आर्किटेक्चर पर काम करता है:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + PWA (स्मार्टफोन रेस्पॉन्सिव).
- **Backend**: FastAPI + Uvicorn + SQLite WAL mode + IoT Telemetry Engine + Gemini AI.
- **Single Service**: FastAPI स्वचालित रूप से `frontend/dist` को रूट `/` पर सर्व करता है। इसका मतलब है कि आपको फ्रंटएंड और बैकएंड के लिए अलग-अलग सर्वर नहीं चाहिए — **एक ही मुफ़्त सर्विस में पूरा सिस्टम लाइव चलेगा!**

---

## ⚡ Option 1: Render.com पर डिप्लॉय करें (अनुशंसित और 100% मुफ़्त)

Render पर हर महीने 750 घंटे मुफ़्त मिलते हैं और यह सीधे GitHub से ऑटो-डिप्लॉय होता है।

### Step 1: Render पर अकाउंट बनाएं
1. [https://render.com](https://render.com) पर जाएं।
2. **"Sign In with GitHub"** चुनकर लॉगिन करें।

### Step 2: नई Web Service जोड़ें
1. Render डैशबोर्ड पर ऊपर दाईं ओर **"New +"** बटन दबाएं और **"Web Service"** चुनें।
2. **"Build and deploy from a Git repository"** चुनें और **Next** पर क्लिक करें।
3. अपनी रिपॉजिटरी चुनें: `Shivpratap-singh2007/AgriMitra-AI` (यदि न दिखे तो GitHub Permissions में इसे Allow करें)।

### Step 3: सेटिंग्स भरें
| फील्ड (Field) | क्या भरें (Value) |
|---|---|
| **Name** | `agrimitra-ai` (या अपनी पसंद का नाम) |
| **Region** | Singapore / Frankfurt / Oregon |
| **Branch** | `main` |
| **Runtime** | **Docker** (Render `Dockerfile` को स्वतः पहचान लेगा) |
| **Instance Type** | **Free** ($0/month) |

### Step 4: Environment Variables (पर्यावरण चर) सेट करें
नीचे **"Environment Variables"** सेक्शन में यह कीज़ जोड़ें:

1. `GEMINI_API_KEY`: अपना Google Gemini API Key डालें (यदि न हो तो खाली छोड़ें, सिस्टम में ऑफ़लाइन AI मॉडल बैकअप मौजूद है)।
2. `DEVICE_SECRET_KEY`: कोई भी सुरक्षित कोड लिखें, जैसे `agrimitra_polyhouse_secret_2026` (यह ESP32 को ऑथेंटिकेट करने के लिए है)।
3. `DATABASE_PATH`: `/app/backend/data/agrimitra_v2.db`

### Step 5: डिप्लॉय करें!
- **"Create Web Service"** बटन पर क्लिक करें।
- Render अपने आप:
  1. Node.js में React 19 फ्रंटएंड बिल्ड करेगा।
  2. Python 3.12 में फ़ास्टएपीआई बैकएंड और CPU-लाइटवेट AI तैयार करेगा।
  3. `/api/health` पर हेल्थ चेक पास करेगा।
- 3 से 5 मिनट के अंदर आपको एक लाइव सुरक्षित HTTPS लिंक मिल जाएगा:
  👉 **`https://agrimitra-ai.onrender.com`**

---

## 🚂 Option 2: Railway.app पर डिप्लॉय करें

1. [https://railway.app](https://railway.app) पर जाएं और GitHub से लॉगिन करें।
2. **"New Project"** -> **"Deploy from GitHub repo"** -> `AgriMitra-AI` चुनें।
3. Railway स्वतः `Dockerfile` का उपयोग करके बिल्ड शुरू कर देगा।
4. **Variables** टैब में `GEMINI_API_KEY` और `DEVICE_SECRET_KEY` जोड़ें।
5. **Settings** -> **Generate Domain** पर क्लिक करके पब्लिक लिंक प्राप्त करें।

---

## 🐳 Option 3: Docker से अपने VPS या लोकल सर्वर पर चलाएं

यदि आपके पास Ubuntu/Debian VPS (AWS EC2, DigitalOcean, Hetzner, आदि) है:

```bash
# 1. रिपॉजिटरी क्लोन करें
git clone https://github.com/Shivpratap-singh2007/AgriMitra-AI.git
cd AgriMitra-AI

# 2. डॉकर इमेज बिल्ड करें
docker build -t agrimitra-ai .

# 3. कंटेनर रन करें
docker run -d \
  --name agrimitra_live \
  -p 5001:5001 \
  -e GEMINI_API_KEY="your-gemini-key-here" \
  -e DEVICE_SECRET_KEY="agrimitra_polyhouse_secret_2026" \
  -v $(pwd)/backend/data:/app/backend/data \
  --restart unless-stopped \
  agrimitra-ai

# 4. सर्वर चालू है या नहीं जांचें
curl http://localhost:5001/api/health
```

---

## 📡 ESP32 हार्डवेयर को लाइव सर्वर से कनेक्ट करना

जब आपकी वेबसाइट इंटरनेट पर लाइव हो जाए, तो पॉलीहाउस के ESP32 को नए लाइव URL से जोड़ें:

1. Arduino IDE में `firmware/agrimitra_esp32_firmware.ino` खोलें।
2. सर्वर URL की लाइन बदलें:
   ```cpp
   // पहले (लोकल IP):
   // const char* serverUrl = "http://192.168.1.100:5001/api/iot/telemetry";

   // अब (लाइव क्लाउड URL):
   const char* serverUrl = "https://agrimitra-ai.onrender.com/api/iot/telemetry";
   const char* deviceSecretKey = "agrimitra_polyhouse_secret_2026";
   ```
3. ESP32 बोर्ड में अपलोड करें।
4. अब आपका पॉलीहाउस दुनिया के किसी भी कोने से सीधे आपकी लाइव वेबसाइट पर सेंसर डेटा (तापमान, नमी, मिट्टी की नमी) भेजेगा और ऑटो-इरिगेशन कमांड प्राप्त करेगा!

---

## 📱 किसान के मोबाइल पर PWA ऐप इंस्टॉल करना (Install App on Phone)

AgriMitra AI 2.0 एक आधुनिक Progressive Web App (PWA) है:

1. किसान अपने मोबाइल के Chrome या Safari ब्राउज़र में लाइव लिंक खोलें (`https://agrimitra-ai.onrender.com`)।
2. स्क्रीन के नीचे **"Install App"** का बैनर दिखेगा, या ब्राउज़र के 3-डॉट मेनू (⋮) में जाकर **"Add to Home screen"** / **"ऐप इंस्टॉल करें"** दबाएं।
3. ऐप किसान के मोबाइल की होम स्क्रीन पर असली Android ऐप की तरह आइकन के साथ जुड़ जाएगी।
4. किसान सीधे कैमरे से फसल की फोटो खींचकर रोग पहचान सकते हैं और पॉलीहाउस की मोटर को दूर बैठकर भी चालू/बंद कर सकते हैं।

---

## 🛠️ मेंटेनेंस और समस्या निवारण (Troubleshooting)

- **Render Free Tier Sleep Mode**: मुफ़्त टियर पर 15 मिनट इनएक्टिव रहने के बाद सर्वर स्लीप में जाता है और पहली रिक्वेस्ट पर 30-40 सेकंड में जाग जाता है। इसे हमेशा एक्टिव रखने के लिए ESP32 का 15-सेकंड टेलीमेट्री लूप सर्वर को लगातार एक्टिव रखता है!
- **डेटाबेस बैकअप**: SQLite डेटाबेस फ़ाइल कंटेनर के अंदर `/app/backend/data/agrimitra_v2.db` में सुरक्षित रहती है।
- **हेल्थ चेक**: आप कभी भी `https://your-domain.com/api/health` पर जाकर सर्वर की स्थिति देख सकते हैं।
