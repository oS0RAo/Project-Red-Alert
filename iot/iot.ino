#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>

// ตั้งค่า WiFi
const char* WIFI_SSID = "*****";
const char* WIFI_PASSWORD = "******";

// ตั้งค่า NETPIE
const char* MQTT_SERVER = "broker.netpie.io";
const int MQTT_PORT = 1883;
const char* MQTT_CLIENT_ID = "***********"; 
const char* MQTT_USERNAME  = "***********";    
const char* MQTT_PASSWORD  = "***********";  

// ตั้งค่า IP ของ Backend
const String BACKEND_IP = "********";
const String BACKEND_URL = "http://" + BACKEND_IP + ":5000/api/sensors/data";

// ตั้งค่า Sensor
const uint8_t DHT_PIN = 5;
const uint8_t MQ2_PIN = A0;
const unsigned long UPDATE_INTERVAL = 5000; // ส่งทุก 5 วินาที

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
DHT dht(DHT_PIN, DHT11);

unsigned long lastMsg = 0;
String sensorID = ""; 

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void connectNETPIE() {
  while (!mqtt.connected()) {
    Serial.print("Connecting to NETPIE...");
    if (mqtt.connect(MQTT_CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println(" Connected to NETPIE");
    } else {
      Serial.print(" Failed, state = ");
      Serial.print(mqtt.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void sendToBackend(float temp, float hum, int gas) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    http.begin(client, BACKEND_URL);
    http.addHeader("Content-Type", "application/json");

    // สร้าง JSON
    String payload = "{\"serialNumber\":\"" + sensorID + "\", \"temp\":" + String(temp) + ", \"humidity\":" + String(hum) + ", \"gasValue\":" + String(gas) + "}";

    int httpCode = http.POST(payload); 
    
    // ระบบดักเช็ค Error ว่าส่งผ่านหรือไม่ผ่าน
    if (httpCode == 200 || httpCode == 201) {
      Serial.println("ส่งเข้า Backend สำเร็จ");
    } else if (httpCode > 0) {
      Serial.print("ส่งถึงหลังบ้าน แต่โดนปฏิเสธ รหัส: ");
      Serial.println(httpCode);
      Serial.println(http.getString()); // โชว์ข้อความ Error จาก Node.js
    } else {
      Serial.print("ส่งไม่ถึงคอมพิวเตอร์ Error: ");
      Serial.println(http.errorToString(httpCode).c_str());
    }
    http.end();
  }
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

void sendToNETPIE(float temp, float hum, int gas) {
  String payload = "{\"data\": {";
  payload += "\"sensor_id\": \"" + sensorID + "\", ";
  payload += "\"temperature\": " + String(temp) + ", ";
  payload += "\"humidity\": " + String(hum) + ", ";
  payload += "\"gas\": " + String(gas);
  payload += "}}";

  Serial.print("📡 Sending to NETPIE: ");
  Serial.println(payload);
  
  mqtt.publish("@shadow/data/update", payload.c_str());
}

void setup() {
  Serial.begin(115200);

  pinMode(MQ2_PIN, INPUT);
  dht.begin();

  connectWiFi();

  // ดึง MAC Address มาสร้างเป็น Serial Number อัตโนมัติ
  String mac = WiFi.macAddress();
  mac.replace(":", ""); 
  sensorID = "SN-" + mac;

  Serial.println("\n=============================================");
  Serial.print("MY SENSOR ID IS: ");
  Serial.println(sensorID);
  Serial.println("=============================================\n");
  
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
}

void loop() {
  if (!mqtt.connected()) {
    connectNETPIE();
  }
  mqtt.loop();

  unsigned long now = millis();
  
  // ยิงข้อมูลทุกๆ 5 วินาที
  if (now - lastMsg > UPDATE_INTERVAL) {
    lastMsg = now;
    
    float temperature, humidity;
    
    if (!readDHT(temperature, humidity)) {
      return; 
    }

    int gasValue = readMQ2();
    
    sendToNETPIE(temperature, humidity, gasValue); // ส่งเข้า NetPie ไปโชว์ข้อมูล
    sendToBackend(temperature, humidity, gasValue); // ส่งเข้า BackEnd ไปให้ฝั่งสมอง AI และ Database
  }
}