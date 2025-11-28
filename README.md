# Automated Drip Irrigation with Weather Prediction

A modern, browser‑based smart irrigation dashboard built with React, TypeScript, and Vite. It connects to an ESP32‑based soil sensor and pump controller for live operation, or runs in a safe Demo mode to simulate and demonstrate AI‑assisted irrigation decisions without hardware.

## Table of Contents
- [Demo User Interface](#demo-user-interface)
- [Key Features](#key-features)
- [Architecture Overview](#architecture-overview)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Build & Preview](#build--preview)
- [Live vs Demo Mode](#live-vs-demo-mode)
- [ESP32 Integration](#esp32-integration)
- [ESP8266 Firmware (NodeMCU)](#esp8266-firmware-nodemcu)
  - [Build & Upload](#build--upload)
  - [Arduino IDE Setup](#arduino-ide-setup)
- [AI Insights](#ai-insights)
- [Environment Variables](#environment-variables)
- [Weather Data](#weather-data)
- [Pump Control Logic](#pump-control-logic)
- [Scripts](#scripts)
- [Project Structure (Partial)](#project-structure-partial)
- [Security & Privacy](#security--privacy)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Team](#team)
- [Supervisor](#supervisor)

## Demo User Interface
- View a walkthrough of the app’s UI and flows: [Smart_Irrigation_System_Reordered_Presentation.pdf](Smart_Irrigation_System_Reordered_Presentation.pdf)

## Key Features
- Live and Demo modes for soil moisture
  - Live: Read‑only, realtime values from ESP32, clearly tagged “Live”.
  - Demo: Manual slider to simulate soil moisture, clearly tagged “Demo”.
- AI agronomist insights using Google Gemini
  - Actionable recommendation: “Irrigate” or “Hold” with a reason.
  - Confidence score and concise analysis points.
  - Auto‑refresh mode with lightweight updates and periodic full refreshes.
- Weather‑aware decisions
  - Live weather and 5‑day forecast via OpenWeather.
  - Regional selection (Country → Division → Zilla → Upazila) for quick location targeting.
- Pump control with safety rails
  - Manual toggles and AI mode with hysteresis and minimum ON/OFF times.
  - Clear activity log for traceability.
- Clean, responsive UI with charts and history
  - Moisture, temperature, and humidity display.
  - Time‑series chart of recent sensor readings.

## Architecture Overview
- Frontend: React 19 + TypeScript + Vite 6
- Charts: Recharts
- AI: `@google/genai` (Gemini 2.5 Flash)
- Weather: OpenWeather Geocoding, Current Weather, and 5‑Day/3‑Hour Forecast APIs
- Device: ESP32 HTTP endpoints (local network)

### Core Modules
- `App.tsx` — App state, routing of data, Live/Demo mode control.
- `components/SensorDisplay.tsx` — Moisture/Temp/Humidity + Live/Demo UI and slider.
- `components/AIInsights.tsx` — AI recommendation, auto‑refresh controls, status.
- `components/ControlPanel.tsx` — Pump ON/OFF and AI mode toggle.
- `components/WeatherDisplay.tsx` — Current/forecast weather.
- `components/DataChart.tsx` — Recent sensor data line chart.
- `services/geminiService.ts` — Gemini client + structured JSON response.
- `services/weatherService.ts` — OpenWeather geocoding + forecast aggregation.
- `types.ts` — Shared type definitions.

## Requirements
- Node.js 18+ (recommended 20+)
- npm 9+
- Google Gemini API key
- OpenWeather API key (recommended for production)
- Optional: ESP32 device on the same LAN exposing the endpoints below

## Quick Start
- Install dependencies: `npm install`
- Configure env vars:
  - Create `.env.local` in project root:
    - `VITE_GEMINI_API_KEY=your_gemini_api_key`
    - `VITE_API_URL=http://localhost:4000`
  - Backend (in `server/`): set `MONGODB_URI` and `JWT_SECRET` in `server/.env`.
- Start backend: `cd server && npm run dev`
- Run the app: `npm run dev` then open `http://localhost:3000`
- Optional device connect: In the UI, enter ESP32 IP (e.g., `192.168.1.123`) and click Connect.

## Build & Preview
- Build: `npm run build`
- Preview: `npm run preview`

## Live vs Demo Mode
- Connected to ESP32 (Live): moisture bar is read‑only, shows “Live”, and updates from the device.
- Disconnected (Demo): moisture shows a “Demo” tag and a slider; chart and AI insights update in real time based on the simulated value.

## ESP32 Integration
- Endpoints expected by the UI:
  - GET `/status` → current state, e.g. `{ "moisture": 47.5, "pumpStatus": "OFF" }`
  - POST `/pump` → body `{ "state": "ON" }` or `{ "state": "OFF" }`
- Notes
  - App polls `/status` roughly every 2 seconds when connected.
  - Ensure ESP32 includes CORS headers (e.g., `Access-Control-Allow-Origin: *`).
  - Your computer and the ESP32 must be on the same network.

## ESP8266 Firmware (NodeMCU)
- Location: `esp8266_irrigation_system/esp8266_irrigation_system.ino`
- What it does
  - Hosts a lightweight HTTP server on the ESP8266 (NodeMCU) to expose soil moisture and control a pump relay.
  - Endpoints match the UI expectations: GET `/status`, POST `/pump` with CORS enabled.
  - Reads soil moisture from `A0`, maps to 0–100% using calibration values, and supports active‑LOW relays.
- Hardware
  - Board: ESP8266 (e.g., NodeMCU/Amica).
  - Sensor: Analog soil moisture sensor to `A0` (`3.3V` supply, `GND`).
  - Relay module: Signal to `D1` (GPIO 5), `VCC` to `3.3V` or module spec, `GND` to common ground.
- Configuration
  - Wi‑Fi: update `ssid` and `password` in the sketch.
  - Relay type: set `RELAY_ACTIVE_LOW` (`true` for most ESP8266 relay boards).
  - Moisture calibration: adjust `AIR_VALUE` (dry) and `WATER_VALUE` (wet) to your sensor/soil.
  - Auto‑off: `MOISTURE_TARGET_PERCENT` controls when the pump turns off automatically.

### Build & Upload
 - IDE: Arduino IDE with “ESP8266 by ESP8266 Community” boards installed.
 - Libraries: `ESP8266WiFi`, `ESP8266WebServer`, `ArduinoJson` (v6+ via Library Manager).
 - Select the correct board (e.g., NodeMCU 1.0) and port, then Upload.
  
### Arduino IDE Setup
- Install Arduino IDE: download from arduino.cc and install for your OS.
- Install ESP8266 board package
  - Arduino IDE → `File` → `Preferences` → `Additional Boards Manager URLs` → add:
    - `http://arduino.esp8266.com/stable/package_esp8266com_index.json`
  - Then `Tools` → `Board` → `Boards Manager…` → search “ESP8266” → install “ESP8266 by ESP8266 Community”.
- Select board and port
  - `Tools` → `Board` → pick “NodeMCU 1.0 (ESP-12E Module)” (or your ESP8266 variant).
  - `Tools` → `Port` → select the USB serial port of your board.
  - Driver note: some boards need CH340 or CP210x USB‑to‑serial drivers installed.
- Install required libraries
  - `ESP8266WiFi` and `ESP8266WebServer` are included with the ESP8266 core.
  - Install `ArduinoJson` v6+: `Tools` → `Manage Libraries…` → search “ArduinoJson” by Benoit Blanchon → Install.
- Open and upload the sketch
  - Open `esp8266_irrigation_system/esp8266_irrigation_system.ino` in Arduino IDE.
  - Update `ssid` and `password`, adjust calibration if needed, then click `Upload`.
  - Open `Tools` → `Serial Monitor` at 9600 baud to read the printed IP address and live diagnostics.
- Find device IP
  - Open Serial Monitor at 9600 baud; after connecting to Wi‑Fi it prints the local IP.
- API details (served by the firmware)
  - GET `/status` → `{"moisture": <int>, "sensorValue": <int>, "pumpStatus": "ON|OFF"}`
  - POST `/pump` with body `{"state":"ON"}` or `{"state":"OFF"}` → text response
  - Example:
    - `curl http://<ESP8266_IP>/status`
    - `curl -X POST http://<ESP8266_IP>/pump -H 'Content-Type: application/json' -d '{"state":"ON"}'`
- Notes
  - The firmware prints live readings and pump state every second to Serial for debugging.
  - CORS headers are included so the React app can call the device directly from the browser.
  - Ensure your computer and the ESP8266 are on the same Wi‑Fi network.

## AI Insights
- Model: Gemini 2.5 Flash via `@google/genai`.
- Prompt returns strict JSON with:
  - `decision`: `Irrigate` or `Hold`
  - `reason`: brief explanation
  - `analysis_points`: 2–3 short bullets
  - `confidence_score`: 0.0–1.0
- Auto‑refresh: frequent lightweight updates, periodic full refresh.
- Crop‑aware thresholds: set crop type in Location Settings.

## Environment Variables
- Frontend: `VITE_GEMINI_API_KEY`, `VITE_API_URL`
- Server: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`

## Weather Data
- OpenWeather sources: Geocoding, Current Weather, 5‑Day/3‑Hour Forecast
- Region selector assists (Country/Division/Zilla/Upazila)
- Production note: `services/weatherService.ts` has a default key for convenience; replace with your own before deploying.

## Pump Control Logic
- Hysteresis and safety timers (subject to code):
  - Turn ON if moisture ≤ ~30% and AI recommends `Irrigate` (min OFF cooldown applies).
  - Turn OFF if moisture ≥ ~55% or AI recommends `Hold` (min ON runtime applies).
- All actions are added to the Activity Log.

## Scripts
- `npm run dev` — Start dev server at `http://localhost:3000`.
- `npm run build` — Production build with Vite.
- `npm run preview` — Preview the built app locally.

## Project Structure (Partial)
```
smart-irrigation-system/
├─ components/
│  ├─ AIInsights.tsx
│  ├─ ControlPanel.tsx
│  ├─ DataChart.tsx
│  ├─ Header.tsx
│  ├─ HistoryLog.tsx
│  ├─ RegionSelector.tsx
│  ├─ SensorDisplay.tsx
│  └─ WeatherDisplay.tsx
├─ services/
│  ├─ geminiService.ts
│  └─ weatherService.ts
├─ data/regions.ts
├─ App.tsx
├─ index.tsx
├─ index.html
├─ types.ts
├─ vite.config.ts
└─ .env.local (not committed)
```

## Security & Privacy
- Do not commit `.env.local` or any API keys to version control.
- If hosting, configure secrets in your platform’s environment settings.
- The app makes direct requests from the browser to ESP32 and OpenWeather; avoid exposing your device publicly.

## Troubleshooting
- ESP32 connection issues: verify IP, same Wi‑Fi, and CORS headers.
- AI key errors: ensure `.env.local` has `VITE_GEMINI_API_KEY` and restart dev server after changes.
- Weather errors or wrong location: adjust Location Settings and try a more precise name.

## Roadmap
- Use environment variables for OpenWeather API key.
- Offline caching and PWA mode for field use.
- Multi‑device management and role‑based auth.
- Calibrations per soil/plant type.

## Team
- Minhajul Islam — GitHub: [MI-Minhaj](https://github.com/MI-Minhaj)
- Aong Cho Thing Marma — GitHub: [AongCho880](https://github.com/AongCho880)
- Jahirul Islam — GitHub: [jahir2665](https://github.com/jahir2665)
- Md. Arman — GitHub: [username](https://github.com/username)

## Supervisor
- Dr. Mohammad Shahadat Hossain
- Professor, Department of Computer Science & Engineering
- University of Chittagong

---
This project is for educational and prototyping purposes. Verify recommendations with local agronomy best practices before acting in production.
#   A g r o S m a r t - I r r i g a t i o n -  
 