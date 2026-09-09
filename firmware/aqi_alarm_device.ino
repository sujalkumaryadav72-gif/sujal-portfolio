/*
 * ============================================================================
 * Project: AQI Detection Alarm Device
 * Author: Sujal Kumar
 * Description: Electronic air-quality monitoring system with real-time alerts.
 * Components:
 *   - Microcontroller (Arduino Uno / Nano / ESP32)
 *   - Air Quality / Gas Sensor (MQ-135 / Optical Dust Sensor) on Analog Pin A0
 *   - Piezo Buzzer on Digital Pin 8
 *   - RGB / Status Indicator LEDs (Green: Pin 9, Red: Pin 10)
 *   - Predefined Threshold: 150 AQI (Customizable)
 * ============================================================================
 */

// Pin Definitions
const int SENSOR_PIN = A0;       // Analog pin connected to MQ-135 sensor
const int BUZZER_PIN = 8;        // Digital pin for piezo alarm buzzer
const int LED_GREEN_PIN = 9;     // Normal air quality indicator LED
const int LED_RED_PIN = 10;      // Pollution alarm indicator LED

// Predefined Safety Thresholds
const int AQI_ALARM_THRESHOLD = 150;  // Threshold to trigger alert
const int SAMPLE_COUNT = 10;          // Samples averaged for sensor stability

// Calibration constants
const float V_REF = 5.0;              // Operating voltage (5V)
const float ADC_RESOLUTION = 1023.0;  // 10-bit ADC

void setup() {
  // Initialize Serial Monitor for real-time telemetry
  Serial.begin(9600);
  while (!Serial) {
    ; // Wait for serial port to connect
  }

  // Configure I/O pins
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);

  // Initial self-test sequence
  Serial.println("==================================================");
  Serial.println("   AQI DETECTION ALARM DEVICE - SYSTEM BOOT   ");
  Serial.println("   Author: Sujal Kumar                            ");
  Serial.println("==================================================");
  Serial.println("[INFO] Warming up sensor and testing alarm...");

  digitalWrite(LED_GREEN_PIN, HIGH);
  digitalWrite(LED_RED_PIN, HIGH);
  tone(BUZZER_PIN, 1000, 150);
  delay(300);
  digitalWrite(LED_GREEN_PIN, LOW);
  digitalWrite(LED_RED_PIN, LOW);

  Serial.println("[INFO] Setup complete. Monitoring ambient AQI levels...");
}

// Convert raw analog reading to approximate AQI value
int readCalculatedAQI() {
  long rawSum = 0;
  for (int i = 0; i < SAMPLE_COUNT; i++) {
    rawSum += analogRead(SENSOR_PIN);
    delay(10);
  }
  float rawAverage = (float)rawSum / SAMPLE_COUNT;
  float voltage = (rawAverage / ADC_RESOLUTION) * V_REF;

  // Approximate linear calibration curve for MQ-135 ambient air index:
  // Baseline clean air ~0.5V (30-40 AQI), polluted air ~3.0V+ (>250 AQI)
  int estimatedAQI = (int)((voltage / V_REF) * 450.0);
  if (estimatedAQI < 10) estimatedAQI = 10;

  return estimatedAQI;
}

void loop() {
  int currentAQI = readCalculatedAQI();

  // Print telemetry to Serial Monitor
  Serial.print("[TELEMETRY] Current AQI: ");
  Serial.print(currentAQI);
  Serial.print(" | Threshold: ");
  Serial.print(AQI_ALARM_THRESHOLD);

  // Check if AQI exceeds predefined limit
  if (currentAQI >= AQI_ALARM_THRESHOLD) {
    // --- HAZARD ALERT TRIGGERED ---
    Serial.println(" -> [STATUS: ALERT! POLLUTION LIMIT EXCEEDED]");

    digitalWrite(LED_GREEN_PIN, LOW);
    
    // Pulsing visual alarm
    digitalWrite(LED_RED_PIN, HIGH);

    // Audible alarm alert (warbling tone)
    tone(BUZZER_PIN, 1800, 200);
    delay(200);
    tone(BUZZER_PIN, 2400, 200);
    delay(200);
    digitalWrite(LED_RED_PIN, LOW);
    delay(100);
  } else {
    // --- NORMAL AIR QUALITY ---
    Serial.println(" -> [STATUS: NORMAL]");

    noTone(BUZZER_PIN);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_RED_PIN, LOW);
    digitalWrite(LED_GREEN_PIN, HIGH);

    delay(1000); // 1-second sampling cycle under safe conditions
  }
}
