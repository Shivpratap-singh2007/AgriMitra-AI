// ============================================================
// ANNDATA AI - BACKEND SERVER
// Express + CORS + Sensors + Pump + Fan + Auto Control + AI
// ============================================================

"use strict";

const express = require("express");
const cors = require("cors");

// ============================================================
// APP CONFIGURATION
// ============================================================

const app = express();

const PORT = 5000;

// IMPORTANT:
// 0.0.0.0 ka matlab hai server network ke sabhi interfaces
// par listen karega.
const HOST = "0.0.0.0";

// ============================================================
// MIDDLEWARE
// ============================================================

// Allow frontend requests
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"]
    })
);

// JSON request body read karne ke liye
app.use(
    express.json()
);

// URL encoded data
app.use(
    express.urlencoded({
        extended: true
    })
);


// ============================================================
// SENSOR / DEVICE STATE
// ============================================================

let sensorData = {

    temperature: 28,

    humidity: 65,

    soilMoisture: 42,

    rainExpected: false,

    pump: false,

    fan: false

};


// ============================================================
// SERVER START TIME
// ============================================================

const serverStartedAt =
    new Date();


// ============================================================
// HOME / HEALTH CHECK
// ============================================================

app.get(
    "/",
    function (req, res) {

        res.json({

            success: true,

            message:
                "🌱 Anndata AI Backend is running!",

            backend:
                "Anndata AI",

            port:
                PORT,

            host:
                HOST,

            status:
                "online",

            startedAt:
                serverStartedAt

        });

    }
);


// ============================================================
// HEALTH API
// ============================================================

app.get(
    "/api/health",
    function (req, res) {

        res.json({

            success: true,

            status:
                "online",

            message:
                "Backend connection successful",

            timestamp:
                new Date()

        });

    }
);


// ============================================================
// GET SENSOR DATA
// ============================================================

app.get(
    "/api/sensors",
    function (req, res) {

        console.log(
            "📡 GET /api/sensors"
        );

        res.json({

            success: true,

            data: sensorData

        });

    }
);


// ============================================================
// UPDATE SENSOR DATA
// ============================================================

app.post(
    "/api/sensors",
    function (req, res) {

        console.log(
            "📡 POST /api/sensors",
            req.body
        );

        const data =
            req.body || {};


        // Only update values that are provided

        if (
            data.temperature !== undefined
        ) {

            sensorData.temperature =
                Number(
                    data.temperature
                );

        }


        if (
            data.humidity !== undefined
        ) {

            sensorData.humidity =
                Number(
                    data.humidity
                );

        }


        if (
            data.soilMoisture !== undefined
        ) {

            sensorData.soilMoisture =
                Number(
                    data.soilMoisture
                );

        }


        if (
            data.rainExpected !== undefined
        ) {

            sensorData.rainExpected =
                Boolean(
                    data.rainExpected
                );

        }


        if (
            data.pump !== undefined
        ) {

            sensorData.pump =
                Boolean(
                    data.pump
                );

        }


        if (
            data.fan !== undefined
        ) {

            sensorData.fan =
                Boolean(
                    data.fan
                );

        }


        res.json({

            success: true,

            message:
                "Sensor data updated",

            data:
                sensorData

        });

    }
);


// ============================================================
// PUMP CONTROL
// ============================================================

app.post(
    "/api/device/pump",
    function (req, res) {

        console.log(
            "💧 Pump request:",
            req.body
        );


        if (
            req.body &&
            typeof req.body.state === "boolean"
        ) {

            sensorData.pump =
                req.body.state;

        } else {

            return res.status(400).json({

                success: false,

                message:
                    "state must be true or false"

            });

        }


        console.log(
            "💧 Pump:",
            sensorData.pump
                ? "ON"
                : "OFF"
        );


        res.json({

            success: true,

            message:
                sensorData.pump
                    ? "Pump turned ON"
                    : "Pump turned OFF",

            state:
                sensorData.pump,

            data:
                sensorData

        });

    }
);


// ============================================================
// FAN CONTROL
// ============================================================

app.post(
    "/api/device/fan",
    function (req, res) {

        console.log(
            "🌀 Fan request:",
            req.body
        );


        if (
            req.body &&
            typeof req.body.state === "boolean"
        ) {

            sensorData.fan =
                req.body.state;

        } else {

            return res.status(400).json({

                success: false,

                message:
                    "state must be true or false"

            });

        }


        console.log(
            "🌀 Fan:",
            sensorData.fan
                ? "ON"
                : "OFF"
        );


        res.json({

            success: true,

            message:
                sensorData.fan
                    ? "Fan turned ON"
                    : "Fan turned OFF",

            state:
                sensorData.fan,

            data:
                sensorData

        });

    }
);


// ============================================================
// AUTOMATIC CONTROL
// ============================================================

app.post(
    "/api/auto-control",
    function (req, res) {

        console.log(
            "🤖 Auto control requested"
        );


        // ----------------------------------------------------
        // PUMP LOGIC
        // ----------------------------------------------------

        if (
            sensorData.soilMoisture < 30
        ) {

            sensorData.pump =
                true;

        } else if (
            sensorData.soilMoisture > 45
        ) {

            sensorData.pump =
                false;

        }


        // ----------------------------------------------------
        // FAN LOGIC
        // ----------------------------------------------------

        if (
            sensorData.temperature > 30
        ) {

            sensorData.fan =
                true;

        } else if (
            sensorData.temperature < 28
        ) {

            sensorData.fan =
                false;

        }


        console.log(
            "🤖 Auto result:",
            {
                pump:
                    sensorData.pump,
                fan:
                    sensorData.fan
            }
        );


        res.json({

            success: true,

            message:
                "Automatic control applied",

            data:
                sensorData

        });

    }
);


// ============================================================
// GEMINI CONFIGURATION
// ============================================================

// IMPORTANT:
// Gemini API key environment variable se lena better hai.
//
// Windows CMD:
// set GEMINI_API_KEY=YOUR_API_KEY
//
// PowerShell:
// $env:GEMINI_API_KEY="YOUR_API_KEY"
//
// Permanent project ke liye .env bhi use kar sakte ho.

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY || "";


// Gemini model
const GEMINI_MODEL =
    "gemini-2.5-flash";


// ============================================================
// AI CHAT
// ============================================================

app.post(
    "/api/ai/chat",
    async function (req, res) {

        try {

            const message =
                req.body &&
                req.body.message;


            // ------------------------------------------------
            // Validate message
            // ------------------------------------------------

            if (
                !message ||
                typeof message !== "string"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide a valid message"

                });

            }


            console.log(
                "🤖 AI Question:",
                message
            );


            // ------------------------------------------------
            // If Gemini API key is not configured
            // ------------------------------------------------

            if (!GEMINI_API_KEY) {

                console.warn(
                    "⚠️ GEMINI_API_KEY not configured"
                );


                return res.json({

                    success: true,

                    reply:
                        getFallbackAIReply(
                            message
                        ),

                    source:
                        "local-fallback"

                });

            }


            // ------------------------------------------------
            // System context for Anndata AI
            // ------------------------------------------------

            const systemInstruction = `

You are Anndata AI, an intelligent Indian farming assistant.

Answer farmers in simple Hindi/Hinglish.

Give practical and easy-to-understand farming advice.

Current farm sensor data:

Temperature:
${sensorData.temperature} °C

Humidity:
${sensorData.humidity} %

Soil Moisture:
${sensorData.soilMoisture} %

Rain Expected:
${sensorData.rainExpected ? "Yes" : "No"}

Pump:
${sensorData.pump ? "ON" : "OFF"}

Fan:
${sensorData.fan ? "ON" : "OFF"}

If the question is about the current farm condition,
use the sensor values above.

Do not pretend that you have real-world sensor data
other than the values provided above.

Keep answers concise and useful.

`;


            // ------------------------------------------------
            // Gemini REST API
            // ------------------------------------------------

            const url =
                "https://generativelanguage.googleapis.com/v1beta/models/" +
                GEMINI_MODEL +
                ":generateContent?key=" +
                encodeURIComponent(
                    GEMINI_API_KEY
                );


            const geminiResponse =
                await fetch(
                    url,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                system_instruction: {

                                    parts: [

                                        {
                                            text:
                                                systemInstruction
                                        }

                                    ]

                                },

                                contents: [

                                    {

                                        role:
                                            "user",

                                        parts: [

                                            {
                                                text:
                                                    message
                                            }

                                        ]

                                    }

                                ],

                                generationConfig: {

                                    temperature:
                                        0.7,

                                    maxOutputTokens:
                                        500

                                }

                            })

                    }
                );


            // ------------------------------------------------
            // Gemini error
            // ------------------------------------------------

            if (
                !geminiResponse.ok
            ) {

                const errorText =
                    await geminiResponse.text();


                console.error(
                    "❌ Gemini API Error:",
                    errorText
                );


                return res.status(502).json({

                    success: false,

                    message:
                        "Gemini AI request failed",

                    error:
                        errorText

                });

            }


            // ------------------------------------------------
            // Parse Gemini response
            // ------------------------------------------------

            const geminiData =
                await geminiResponse.json();


            const reply =
                geminiData
                    ?.candidates?.[0]
                    ?.content?.parts?.[0]
                    ?.text;


            if (!reply) {

                console.error(
                    "❌ Gemini returned empty response"
                );


                return res.status(502).json({

                    success: false,

                    message:
                        "AI returned an empty response"

                });

            }


            console.log(
                "🤖 AI Reply:",
                reply
            );


            res.json({

                success: true,

                reply:
                    reply,

                source:
                    "gemini"

            });


        } catch (error) {

            console.error(
                "❌ AI Chat Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "AI server error",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// FALLBACK AI RESPONSE
// ============================================================

function getFallbackAIReply(
    message
) {

    const text =
        message.toLowerCase();


    // Soil related

    if (
        text.includes("soil") ||
        text.includes("mitti") ||
        text.includes("moisture") ||
        text.includes("pani")
    ) {

        if (
            sensorData.soilMoisture < 30
        ) {

            return (
                "🌱 Soil moisture abhi low hai (" +
                sensorData.soilMoisture +
                "%). Irrigation ki zarurat ho sakti hai. " +
                "Pehle soil condition check karein."
            );

        }


        if (
            sensorData.soilMoisture > 45
        ) {

            return (
                "💧 Soil moisture abhi sufficient hai (" +
                sensorData.soilMoisture +
                "%). " +
                "Abhi unnecessary irrigation avoid karein."
            );

        }


        return (
            "🌱 Soil moisture moderate hai (" +
            sensorData.soilMoisture +
            "%). " +
            "Regular monitoring continue karein."
        );

    }


    // Temperature

    if (
        text.includes("temperature") ||
        text.includes("garmi") ||
        text.includes("heat")
    ) {

        if (
            sensorData.temperature > 30
        ) {

            return (
                "🌡️ Temperature high hai (" +
                sensorData.temperature +
                "°C). " +
                "Polyhouse ventilation/fan check karein."
            );

        }


        return (
            "🌡️ Current temperature " +
            sensorData.temperature +
            "°C hai. " +
            "Temperature abhi comfortable range mein hai."
        );

    }


    // Pump

    if (
        text.includes("pump") ||
        text.includes("motor")
    ) {

        return (
            "💧 Pump abhi " +
            (
                sensorData.pump
                    ? "ON"
                    : "OFF"
            ) +
            " hai."
        );

    }


    // Fan

    if (
        text.includes("fan") ||
        text.includes("ventilation")
    ) {

        return (
            "🌀 Fan abhi " +
            (
                sensorData.fan
                    ? "ON"
                    : "OFF"
            ) +
            " hai."
        );

    }


    // Rain

    if (
        text.includes("rain") ||
        text.includes("barish")
    ) {

        return (
            "🌧️ Rain status: " +
            (
                sensorData.rainExpected
                    ? "Rain expected"
                    : "No rain expected"
            ) +
            "."
        );

    }


    // Default

    return (
        "🌱 Namaste! Main Anndata AI hoon. " +
        "Aap crop, soil moisture, temperature, " +
        "irrigation, pump, fan ya farming problem ke baare mein pooch sakte hain."
    );

}


// ============================================================
// 404 HANDLER
// ============================================================

app.use(
    function (req, res) {

        res.status(404).json({

            success: false,

            message:
                "API route not found",

            path:
                req.originalUrl

        });

    }
);


// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
    function (
        error,
        req,
        res,
        next
    ) {

        console.error(
            "❌ Server Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Internal server error",

            error:
                error.message

        });

    }
);


// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    HOST,
    function () {

        console.log("");
        console.log(
            "=============================================="
        );

        console.log(
            "🌱 ANNDATA AI BACKEND"
        );

        console.log(
            "=============================================="
        );

        console.log(
            `🚀 Server running on port ${PORT}`
        );

        console.log(
            `🏠 Local: http://localhost:${PORT}`
        );

        console.log(
            `🌐 Network: http://10.12.52.67:${PORT}`
        );

        console.log(
            `❤️ Health: http://10.12.52.67:${PORT}/api/health`
        );

        console.log(
            `📡 Sensors: http://10.12.52.67:${PORT}/api/sensors`
        );

        console.log(
            `🤖 Gemini: ${
                GEMINI_API_KEY
                    ? "CONFIGURED"
                    : "NOT CONFIGURED"
            }`
        );

        console.log(
            "=============================================="
        );

        console.log("");

    }
);


// ============================================================
// SERVER ERROR HANDLERS
// ============================================================

process.on(
    "uncaughtException",
    function (error) {

        console.error(
            "❌ Uncaught Exception:",
            error
        );

    }
);


process.on(
    "unhandledRejection",
    function (error) {

        console.error(
            "❌ Unhandled Promise Rejection:",
            error
        );

    }
);