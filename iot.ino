#include <WiFi.h>
#include <ThingSpeak.h>
#include <DHT.h>

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

const unsigned long CHANNEL_ID = 2557762;
const char* WRITE_API_KEY = "088FDVWCQY5PSQ4O";
const char* THINGSPEAK_SERVER = "api.thingspeak.com";

const uint8_t DHT_PIN = 4;
const uint8_t MQ2_PIN = 34;

const unsigned long UPDATE_INTERVAL = 20000; // ThingSpeak ≥ 15s

WiFiClient wifiClient;
DHT dht(DHT_PIN, DHT11);

void connectWiFi() {
  Serial.print("Connecting to WiFi");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

bool readDHT(float &temperature, float &humidity) {
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return false;
  }

  return true;
}

int readMQ2() {
  return analogRead(MQ2_PIN);
}

void sendToThingSpeak(float temperature, float humidity, int gasValue) {

  ThingSpeak.setField(1, temperature);
  ThingSpeak.setField(2, humidity);
  ThingSpeak.setField(4, gasValue);

  int response = ThingSpeak.writeFields(CHANNEL_ID, WRITE_API_KEY);

  if (response == 200) {
    Serial.println("ThingSpeak update successful");
  } else {
    Serial.print("ThingSpeak error: ");
    Serial.println(response);
  }
}

void printSensor(float temperature, float humidity, int gas) {
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print(" °C | Humidity: ");
  Serial.print(humidity);
  Serial.print(" % | MQ2: ");
  Serial.println(gas);
}

void setup() {
  Serial.begin(115200);

  pinMode(MQ2_PIN, INPUT);
  dht.begin();

  connectWiFi();
  ThingSpeak.begin(wifiClient);
}

void loop() {
  float temperature, humidity;

  if (!readDHT(temperature, humidity)) {
    delay(2000);
    return;
  }

  int gasValue = readMQ2();

  printSensor(temperature, humidity, gasValue);
  sendToThingSpeak(temperature, humidity, gasValue);

  delay(UPDATE_INTERVAL);
}