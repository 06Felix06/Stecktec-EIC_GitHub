#include <Arduino.h>
#include "LoRa_E32.h"
#include <Wire.h>
#include <BME280_t.h>

LoRa_E32 e32ttl100(2, 3); // RX: 2, TX: 3

// BME280 setup
BME280<> BMESensor;
unsigned long previousMillis_BME = 0;
const unsigned long interval_BME = 2000; // Update sensor every 2 seconds
float temperature = 0;
float humidity = 0;

void setup()
{
	Serial.begin(9600);
	pinMode(12, OUTPUT);
	pinMode(13, OUTPUT);
	digitalWrite(12, LOW);
	digitalWrite(13, LOW);

	// Initialize LoRa
	e32ttl100.begin();
	Serial.println("Environmental sensor node ready");

	// Initialize BME280
	Wire.begin();
	if (!BMESensor.begin())
	{
		Serial.println("Could not find BME280 sensor!");
		while (1)
			delay(10);
	}
}

void loop()
{
	// Update sensor readings periodically
	unsigned long currentMillis = millis();
	if (currentMillis - previousMillis_BME >= interval_BME)
	{
		previousMillis_BME = currentMillis;
		BMESensor.refresh();
		temperature = BMESensor.temperature;
		humidity = BMESensor.humidity;

		Serial.print("Sensor Update - Temp: ");
		Serial.print(temperature);
		Serial.print("°C, Humidity: ");
		Serial.print(humidity);
		Serial.println("%");
	}

	// Check for incoming messages
	if (e32ttl100.available())
	{
		ResponseContainer rc = e32ttl100.receiveMessage();

		if (rc.status.code == 1)
		{
			Serial.print("Received query: ");
			Serial.println(rc.data);

			// Create JSON-formatted response
			String sensorData = "{";
			sensorData += "\"temperature\":" + String(temperature, 1) + ",";
			sensorData += "\"humidity\":" + String(humidity, 1);
			sensorData += "}";

			// Send sensor data
			ResponseStatus rs = e32ttl100.sendMessage(sensorData);
			Serial.print("Sent response: ");
			Serial.println(sensorData);
		}
	}
}