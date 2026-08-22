// =====================================================
// AGRIMITRA AI - FRONTEND DASHBOARD
// =====================================================


// ================= SENSOR DATA =================

let sensorData = {

    temperature: 28,

    humidity: 65,

    soilMoisture: 42,

    rainExpected: false,

    pump: false,

    fan: false
};


// ================= AUTO MODE =================

let autoMode = true;


// ================= INITIAL LOAD =================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateDashboard();

        console.log(
            "🌱 AgriMitra AI Dashboard Started"
        );

    }
);


// ================= UPDATE DASHBOARD =================

function updateDashboard() {

    document.getElementById(
        "temperature"
    ).textContent =
        sensorData.temperature + "°C";


    document.getElementById(
        "humidity"
    ).textContent =
        sensorData.humidity + "%";


    document.getElementById(
        "soilMoisture"
    ).textContent =
        sensorData.soilMoisture + "%";


    document.getElementById(
        "temperatureBar"
    ).style.width =
        Math.min(
            sensorData.temperature * 2.5,
            100
        ) + "%";


    document.getElementById(
        "humidityBar"
    ).style.width =
        sensorData.humidity + "%";


    document.getElementById(
        "soilBar"
    ).style.width =
        sensorData.soilMoisture + "%";


    updateSoilStatus();

    updateAutomaticActions();

    updateAdvisory();

}


// ================= SOIL STATUS =================

function updateSoilStatus() {

    const element =
        document.getElementById(
            "soilStatus"
        );


    if (
        sensorData.soilMoisture < 30
    ) {

        element.textContent =
            "⚠️ Soil is Dry";

        element.style.color =
            "#dc2626";

    }

    else if (
        sensorData.soilMoisture < 45
    ) {

        element.textContent =
            "Moderately Moist";

        element.style.color =
            "#ca8a04";

    }

    else {

        element.textContent =
            "Normal";

        element.style.color =
            "#16a34a";
    }

}


// ================= AUTO ACTIONS =================

function updateAutomaticActions() {

    if (!autoMode) {

        return;

    }


    // Pump logic

    if (
        sensorData.soilMoisture < 30
    ) {

        sensorData.pump = true;

    }

    else if (
        sensorData.soilMoisture > 45
    ) {

        sensorData.pump = false;

    }


    // Fan logic

    if (
        sensorData.temperature > 30
    ) {

        sensorData.fan = true;

    }

    else if (
        sensorData.temperature < 28
    ) {

        sensorData.fan = false;

    }


    updateDeviceUI();

}


// ================= DEVICE UI =================

function updateDeviceUI() {

    const pumpStatus =
        document.getElementById(
            "pumpStatus"
        );

    const pumpToggle =
        document.getElementById(
            "pumpToggle"
        );


    if (sensorData.pump) {

        pumpStatus.textContent =
            "ON";

        pumpStatus.className =
            "device-status on";

        pumpToggle.classList.add(
            "active"
        );

    }

    else {

        pumpStatus.textContent =
            "OFF";

        pumpStatus.className =
            "device-status off";

        pumpToggle.classList.remove(
            "active"
        );

    }



    const fanStatus =
        document.getElementById(
            "fanStatus"
        );

    const fanToggle =
        document.getElementById(
            "fanToggle"
        );


    if (sensorData.fan) {

        fanStatus.textContent =
            "ON";

        fanStatus.className =
            "device-status on";

        fanToggle.classList.add(
            "active"
        );

    }

    else {

        fanStatus.textContent =
            "OFF";

        fanStatus.className =
            "device-status off";

        fanToggle.classList.remove(
            "active"
        );

    }

}


// ================= MANUAL PUMP =================

function togglePump() {

    autoMode = false;

    sensorData.pump =
        !sensorData.pump;

    updateDeviceUI();

}


// ================= MANUAL FAN =================

function toggleFan() {

    autoMode = false;

    sensorData.fan =
        !sensorData.fan;

    updateDeviceUI();

}


// ================= AUTO MODE =================

function toggleAutoMode() {

    autoMode =
        !autoMode;


    const button =
        document.getElementById(
            "autoModeBtn"
        );


    if (autoMode) {

        button.textContent =
            "🤖 AUTO MODE: ON";

        button.style.background =
            "#dcfce7";

        button.style.color =
            "#15803d";


        updateAutomaticActions();

    }

    else {

        button.textContent =
            "🖐️ MANUAL MODE";

        button.style.background =
            "#fef9c3";

        button.style.color =
            "#854d0e";

    }

}


// ================= CROP IMAGE PREVIEW =================

function previewImage(event) {

    const file =
        event.target.files[0];


    if (!file) {

        return;

    }


    const preview =
        document.getElementById(
            "imagePreview"
        );


    const reader =
        new FileReader();


    reader.onload =
        function (e) {

            preview.src =
                e.target.result;

            preview.style.display =
                "block";

        };


    reader.readAsDataURL(file);

}


// ================= CROP ANALYSIS =================

function analyzeCrop() {

    const file =
        document.getElementById(
            "cropImage"
        ).files[0];


    const status =
        document.getElementById(
            "visionStatus"
        );


    if (!file) {

        alert(
            "Please upload a crop image first."
        );

        return;

    }


    status.textContent =
        "Analyzing...";


    status.style.background =
        "#fef9c3";

    status.style.color =
        "#854d0e";


    /*
        IMPORTANT:

        Abhi real AI/ML model connected nahi hai.

        Ye temporary mock result hai.

        Baad mein:

        Frontend
             ↓
        Backend
             ↓
        AI/ML API
             ↓
        Real prediction
    */


    setTimeout(
        function () {

            document.getElementById(
                "cropName"
            ).textContent =
                "Tomato";


            document.getElementById(
                "cropHealth"
            ).textContent =
                "Healthy";


            document.getElementById(
                "disease"
            ).textContent =
                "None detected";


            document.getElementById(
                "healthScore"
            ).textContent =
                "94%";


            status.textContent =
                "Analysis Complete";


            status.style.background =
                "#dcfce7";

            status.style.color =
                "#15803d";


            document.getElementById(
                "cropAdvice"
            ).textContent =
                "Crop appears healthy. Continue monitoring.";

        },

        1500
    );

}


// ================= CHAT =================

function sendMessage() {

    const input =
        document.getElementById(
            "chatInput"
        );


    const message =
        input.value.trim();


    if (!message) {

        return;

    }


    addUserMessage(message);


    input.value = "";


    /*
        Temporary frontend response.

        Later:

        Frontend
             ↓
        POST /api/chat
             ↓
        Backend
             ↓
        Gemini
             ↓
        Anndata AI
    */


    setTimeout(
        function () {

            addAIMessage(
                generateDemoReply(message)
            );

        },

        700
    );

}


// ================= ENTER KEY =================

function handleChatKey(event) {

    if (
        event.key === "Enter"
    ) {

        sendMessage();

    }

}


// ================= ADD USER MESSAGE =================

function addUserMessage(text) {

    const container =
        document.getElementById(
            "chatMessages"
        );


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "message user-message";


    message.innerHTML = `

        <div class="avatar">
            👨‍🌾
        </div>

        <div>

            <strong>
                Farmer
            </strong>

            <p>
                ${escapeHTML(text)}
            </p>

        </div>

    `;


    container.appendChild(
        message
    );


    container.scrollTop =
        container.scrollHeight;

}


// ================= ADD AI MESSAGE =================

function addAIMessage(text) {

    const container =
        document.getElementById(
            "chatMessages"
        );


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "message ai-message";


    message.innerHTML = `

        <div class="avatar">
            🌱
        </div>

        <div>

            <strong>
                Anndata AI
            </strong>

            <p>
                ${escapeHTML(text)}
            </p>

        </div>

    `;


    container.appendChild(
        message
    );


    container.scrollTop =
        container.scrollHeight;

}


// ================= DEMO AI REPLY =================

function generateDemoReply(message) {

    const text =
        message.toLowerCase();


    if (
        text.includes("yellow") ||
        text.includes("पीला")
    ) {

        return `
            Yellow leaves can have multiple causes.
            Please check soil moisture, watering,
            sunlight and signs of disease.
            Our Vision AI can help inspect the crop image.
        `;

    }


    if (
        text.includes("water") ||
        text.includes("पानी")
    ) {

        return `
            Current soil moisture is
            ${sensorData.soilMoisture}%.
            If the soil is dry, irrigation may be required.
            Avoid over-watering the crop.
        `;

    }


    if (
        text.includes("temperature") ||
        text.includes("गर्मी")
    ) {

        return `
            Current polyhouse temperature is
            ${sensorData.temperature}°C.
            If temperature becomes too high,
            the ventilation fan can be activated.
        `;

    }


    return `
        I received your question.
        Once Gemini AI is connected,
        I will provide a detailed personalized
        recommendation using sensor and crop data.
    `;

}


// ================= SECURITY =================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


// ================= DEMO SENSOR SIMULATION =================

/*
    हर 5 seconds sensor values थोड़े change होंगे।
    बाद में यही data backend से आएगा.
*/

setInterval(
    function () {

        if (!autoMode) {

            return;

        }


        sensorData.temperature =
            Number(
                (
                    27 +
                    Math.random() * 6
                ).toFixed(1)
            );


        sensorData.humidity =
            Math.floor(
                55 +
                Math.random() * 20
            );


        sensorData.soilMoisture =
            Math.floor(
                25 +
                Math.random() * 35
            );


        updateDashboard();

    },

    5000
);


// ================= ADVISORY =================

function updateAdvisory() {

    const irrigation =
        document.getElementById(
            "irrigationAdvice"
        );


    const temperature =
        document.getElementById(
            "temperatureAdvice"
        );


    if (
        sensorData.soilMoisture < 30
    ) {

        irrigation.textContent =
            "Soil moisture is low. Irrigation may be required.";

    }

    else {

        irrigation.textContent =
            "Soil moisture is normal. No immediate irrigation required.";

    }


    if (
        sensorData.temperature > 30
    ) {

        temperature.textContent =
            "Temperature is high. Ventilation is recommended.";

    }

    else {

        temperature.textContent =
            "Temperature is within comfortable range.";

    }

}