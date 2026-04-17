#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>

// ตั้งค่า WiFi
const char* WIFI_SSID = "";
const char* WIFI_PASSWORD = "";

// ตั้งค่า NETPIE
const char* MQTT_SERVER = "broker.netpie.io";
const int MQTT_PORT = 1883;
const char* MQTT_CLIENT_ID = ""; 
const char* MQTT_USERNAME  = "";    
const char* MQTT_PASSWORD  = "";   

// ตั้งค่า Sensor
const uint8_t DHT_PIN =5;
const uint8_t MQ2_PIN = A0;
const unsigned long UPDATE_INTERVAL = 5000;

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
DHT dht(DHT_PIN, DHT11);

unsigned long lastMsg = 0;
String sensorID = ""; // ตัวแปรสำหรับเก็บรหัส Sensor ID

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
      Serial.println(" Connected to NETPIE!");
    } else {
      Serial.print(" Failed, state = ");
      Serial.print(mqtt.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void sendToBackend(float temp, int gas) {
  if(WiFi.status() == WL_CONNECTED){
    WiFiClient client;
    HTTPClient http;

    http.begin(client, "http://xxxx:5000/api/sensors/data");
    http.addHeader("Content-Type", "application/json");

    // สร้าง JSON
    String payload = "{\"serialNumber\":\"" + sensorID + "\", \"temp\":" + String(temp) + ", \"gas\":" + String(gas) + "}";

    int httpCode = http.POST(payload); // ยิง POST ไปที่ Backend
    
    if (httpCode > 0) {
      Serial.println("Sent to My Backend Successfully!");
    } else {
      Serial.print("Failed to send to Backend, Error: ");
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
  // ส่ง sensor_id เข้าไปใน JSON ที่จะส่งให้ NETPIE
  String payload = "{\"data\": {";
  payload += "\"sensor_id\": \"" + sensorID + "\", ";
  payload += "\"temperature\": " + String(temp) + ", ";
  payload += "\"humidity\": " + String(hum) + ", ";
  payload += "\"gas\": " + String(gas);
  payload += "}}";

  Serial.print("Sending to NETPIE: ");
  Serial.println(payload);
  
  mqtt.publish("@shadow/data/update", payload.c_str());
}

void setup() {
  Serial.begin(115200);

  pinMode(MQ2_PIN, INPUT);
  dht.begin();

  // เชื่อมต่อ WiFi ให้เสร็จก่อน ถึงจะดึง MAC Address ได้
  connectWiFi();

  // ดึง MAC Address และสร้าง Sensor ID
  String mac = WiFi.macAddress();
  mac.replace(":", ""); // ตัดเครื่องหมาย : ออก ให้เหลือแค่ตัวอักษรและตัวเลข
  sensorID = "SN-" + mac;

  // แสดงเลข Sensor ID ออกมาทางหน้าจอ
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
  
  // ทำงานทุกๆ 5 วินาที (5000 ms)
  if (now - lastMsg > UPDATE_INTERVAL) {
    lastMsg = now;
    
    float temperature, humidity;
    
    // อ่านค่าอุณหภูมิและความชื้น
    if (!readDHT(temperature, humidity)) {
      return; 
    }

    // อ่านค่าแก๊ส
    int gasValue = readMQ2();
    
    sendToNETPIE(temperature, humidity, gasValue); // ส่งขึ้น NETPIE
    sendToBackend(temperature, gasValue); // ส่งเข้า Backend
  }
}