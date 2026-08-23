const API_URL = "http://10.102.246.67:5000";


// ===============================
// GET SENSOR DATA
// ===============================

async function getSensorData() {

    try {

        const response = await fetch(`${API_URL}/api/sensors`);

        const result = await response.json();

        console.log("Sensor Data:", result);

        if (result.success) {

            const data = result.data;

            updateDashboard(data);
        }

    } catch (error) {

        console.error("Backend connection error:", error);

    }
}


// ===============================
// UPDATE DASHBOARD
// ===============================

function updateDashboard(data) {

    // Temperature
    const temperatureElement =
        document.getElementById("temperature");

    if (temperatureElement) {
        temperatureElement.innerText =
            `${data.temperature}°C`;
    }


    // Humidity
    const humidityElement =
        document.getElementById("humidity");

    if (humidityElement) {
        humidityElement.innerText =
            `${data.humidity}%`;
    }


    // Soil Moisture
    const soilElement =
        document.getElementById("soilMoisture");

    if (soilElement) {
        soilElement.innerText =
            `${data.soilMoisture}%`;
    }


    // Rain
    const rainElement =
        document.getElementById("rain");

    if (rainElement) {

        if (data.rainExpected) {
            rainElement.innerText = "Rain Expected";
        } else {
            rainElement.innerText = "No Rain";
        }

    }


    // Pump
    const pumpElement =
        document.getElementById("pumpStatus");

    if (pumpElement) {

        pumpElement.innerText =
            data.pump ? "ON" : "OFF";

    }


    // Fan
    const fanElement =
        document.getElementById("fanStatus");

    if (fanElement) {

        fanElement.innerText =
            data.fan ? "ON" : "OFF";

    }
}


// ===============================
// START
// ===============================

getSensorData();


// Update every 3 seconds
setInterval(() => {

    getSensorData();

}, 3000); 