// --------------------------------------------------------------------
// Smart Irrigation System - NodeMCU Firmware (Web Server Edition v3.4)
// --------------------------------------------------------------------
// v3.4: Fixed relay inversion for active-LOW relays and added real-time
//       moisture data display in the Serial Monitor for easy debugging.
// --------------------------------------------------------------------

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>

// --- PIN CONFIGURATION ---
const int SENSOR_PIN = A0;
const int RELAY_PIN  = 5;

// --- RELAY CONFIGURATION ---
// Most ESP8266 relay modules are active-LOW (LOW = ON, HIGH = OFF)
const bool RELAY_ACTIVE_LOW = true;

// --- WIFI CONFIGURATION ---
const char* ssid     = "abc";       // <-- REPLACE with your Wi-Fi name
const char* password = "21701002";  // <-- REPLACE with your Wi-Fi password

// --- IRRIGATION LOGIC ---
const int AIR_VALUE = 750;   // ADC value when soil is completely dry
const int WATER_VALUE = 350; // ADC value when soil is completely wet
const int MOISTURE_TARGET_PERCENT = 70; // Target soil moisture level (%)

// --- GLOBAL VARIABLES ---
ESP8266WebServer server(80);
bool isPumpOn = false;
int currentMoisturePercent = 0;
int lastSensorValue = 0;

// ====================================================================
// SETUP FUNCTION
// ====================================================================
void setup() {
  Serial.begin(9600);
  Serial.println("\n==============================");
  Serial.println("Smart Irrigation System v3.4");
  Serial.println("==============================");

  // Prepare relay pin and ensure the pump starts OFF
  pinMode(RELAY_PIN, OUTPUT);
  setPumpPin(false);   // enforce OFF at boot (handles active-LOW/active-HIGH)

  connectToWiFi();
  startServer();
}

// ====================================================================
// MAIN LOOP
// ====================================================================
void loop() {
  server.handleClient();
  readAndProcessMoisture();

  // Show live sensor data on Serial Monitor
  Serial.print("Sensor Value: ");
  Serial.print(lastSensorValue);
  Serial.print(" | Moisture: ");
  Serial.print(currentMoisturePercent);
  Serial.print("% | Pump: ");
  Serial.println(isPumpOn ? "ON" : "OFF");

  // Automatic pump-off condition
  if (isPumpOn && currentMoisturePercent >= MOISTURE_TARGET_PERCENT) {
    Serial.println(">>> Moisture target reached. Automatically turning pump OFF.");
    setPumpState(false);
  }

  delay(1000);  // Update every 1 second
}

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

void connectToWiFi() {
  delay(1000);
  Serial.println("\nConnecting to WiFi...");
  Serial.print("SSID: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.println("--------------------------");
}

void readAndProcessMoisture() {
  lastSensorValue = analogRead(SENSOR_PIN);
  currentMoisturePercent = map(lastSensorValue, AIR_VALUE, WATER_VALUE, 0, 100);
  if (currentMoisturePercent > 100) currentMoisturePercent = 100;
  if (currentMoisturePercent < 0)   currentMoisturePercent = 0;
}

// --- Relay Control Functions ---
void setPumpPin(bool turnOn) {
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(RELAY_PIN, turnOn ? LOW : HIGH);  // LOW = ON, HIGH = OFF
  } else {
    digitalWrite(RELAY_PIN, turnOn ? HIGH : LOW);  // HIGH = ON, LOW = OFF
  }
}

void setPumpState(bool turnOn) {
  isPumpOn = turnOn;
  setPumpPin(turnOn);
  Serial.print("Pump turned ");
  Serial.println(turnOn ? "ON" : "OFF");
}

// --- CORS & SERVER HANDLERS ---
void addCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handleOptions() {
  addCorsHeaders();
  server.send(204);
}

void startServer() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/status", HTTP_GET, handleGetStatus);
  server.on("/pump", HTTP_POST, handlePumpControl);

  // Pre-flight handlers
  server.on("/status", HTTP_OPTIONS, handleOptions);
  server.on("/pump", HTTP_OPTIONS, handleOptions);

  server.begin();
  Serial.println("HTTP server started.");
  Serial.println("Web App Connection Status: WAITING FOR CONNECTION...");
  Serial.println("--------------------------");
}

void handleRoot() {
  Serial.println("Web app request received for path: /");
  addCorsHeaders();
  server.send(200, "text/plain", "Smart Irrigation Module is Online!");
}

void handleGetStatus() {
  Serial.println("Web app request received for path: /status");
  addCorsHeaders();

  StaticJsonDocument<200> doc;
  doc["moisture"] = currentMoisturePercent;
  doc["sensorValue"] = lastSensorValue;
  doc["pumpStatus"] = isPumpOn ? "ON" : "OFF";

  String response;
  serializeJson(doc, response);

  server.send(200, "application/json", response);
}

void handlePumpControl() {
  Serial.println("Web app request received for path: /pump");
  addCorsHeaders();

  if (!server.hasArg("plain")) {
    server.send(400, "text/plain", "Body not received");
    return;
  }

  StaticJsonDocument<128> doc;
  DeserializationError err = deserializeJson(doc, server.arg("plain"));
  if (err) {
    server.send(400, "text/plain", "Invalid JSON");
    return;
  }

  const char* state = doc["state"];
  if (!state) {
    server.send(400, "text/plain", "Missing 'state' field");
    return;
  }

  if (strcmp(state, "ON") == 0) {
    Serial.println(">>> Pump turned ON by web command.");
    setPumpState(true);
    server.send(200, "text/plain", "Pump turned ON");
  } else if (strcmp(state, "OFF") == 0) {
    Serial.println(">>> Pump turned OFF by web command.");
    setPumpState(false);
    server.send(200, "text/plain", "Pump turned OFF");
  } else {
    server.send(400, "text/plain", "Invalid state");
  }
}
