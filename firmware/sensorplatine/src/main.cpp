#include <Arduino.h>
#include "LoRa_E32.h"
#include <Wire.h>
#include <BME280_t.h>
#include "functionsSensor.h"

LoRa_E32 e32ttl100(2, 3); // RX: 2, TX: 3

// BME280 setup
BME280<> BMESensor;
unsigned long previousMillis_BME = 0;
const unsigned long interval_BME = 5000; // Update sensor every 2 seconds
float temperature = 0;
float humidity = 0;

#define VENT1_Sens_D1 4 // Valve 1 Direction 1
#define VENT1_Sens_D2 5 // Valve 1 Direction 2
#define VENT2_Sens_D1 6 // Valve 2 Direction 1
#define VENT2_Sens_D2 7 // Valve 2 Direction 2

bool Vent1_Sens_State = false;
bool Vent2_Sens_State = false;

bool Vent1_Sens_Statebefore = false;
bool Vent2_Sens_Statebefore = false;

bool durchgang = false; // Flag to check if the loop has run at least once

int Vent1_Pressure = 0; // Pressure sensor for Valve 1
int Vent2_Pressure = 0; // Pressure sensor for Valve 2

bool Vent1_Pressure_bool = false; // Pressure sensor for Valve 1
bool Vent2_Pressure_bool = false; // Pressure sensor for Valve 2

int watermarkReading = 0; // Watermark sensor reading

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

		watermarkReading = readWatermark();
	}

	// Check for incoming messages
	if (e32ttl100.available())
	{
		ResponseContainer rc = e32ttl100.receiveMessage();

		if (rc.status.code == 1)
		{
			Serial.print("Received query: ");
			Serial.println(rc.data);

			Vent1_Sens_State = (rc.data.indexOf("\"V1SState\":1") != -1);
			Vent2_Sens_State = (rc.data.indexOf("\"V2SState\":1") != -1);

			// Serial.print("Vent1_Sens_State: ");
			// Serial.println(Vent1_Sens_State);
			// Serial.print("Vent2_Sens_State: ");
			// Serial.println(Vent2_Sens_State);

			// Create JSON-formatted response
			String sensorData = "{";
			sensorData += "\"tmp\":" + String(temperature, 1) + ",";
			sensorData += "\"hum\":" + String(humidity, 1);
			sensorData += "\"ps1\":" + String(Vent1_Pressure_bool);
			sensorData += "\"ps2\":" + String(Vent2_Pressure_bool);
			sensorData += "\"wtm\":" + String(watermarkReading);
			// sensorData += "\"ps1b\":" + String(Vent1_Pressure_bool);
			// sensorData += "\"ps2b\":" + String(Vent2_Pressure_bool);
			sensorData += "}";

			// Send sensor data
			ResponseStatus rs = e32ttl100.sendMessage(sensorData);
			Serial.print("Sent response: ");
			Serial.println(sensorData);
		}
	}

	//! Code Ventile Schalten------------------------------------------------------------------
	if (durchgang == false)
	{
		updateVent(VENT1_Sens_D1, VENT1_Sens_D2, Vent1_Sens_State);
		updateVent(VENT2_Sens_D1, VENT2_Sens_D2, Vent2_Sens_State);
		durchgang = true;
	}

	if (Vent1_Sens_State != Vent1_Sens_Statebefore)
	{
		Serial.print("Vent1_Sens_State: ");
		Serial.println(Vent1_Sens_State);
		updateVent(VENT1_Sens_D1, VENT1_Sens_D2, Vent1_Sens_State);
	}
	if (Vent2_Sens_State != Vent2_Sens_Statebefore)
	{
		Serial.print("Vent2_Sens_State: ");
		Serial.println(Vent2_Sens_State);
		updateVent(VENT2_Sens_D1, VENT2_Sens_D2, Vent2_Sens_State);
	}

	Vent1_Sens_Statebefore = Vent1_Sens_State;
	Vent2_Sens_Statebefore = Vent2_Sens_State;

	//! Code Durchflusssensoren auslesen------------------------------------------------------------------
	Vent1_Pressure = analogRead(A1);
	Vent2_Pressure = analogRead(A2);

	if (Vent1_Pressure > 900)
	{
		Vent1_Pressure_bool = true;
	}
	else if (Vent1_Pressure < 100)
	{
		Vent1_Pressure_bool = false;
	}
	if (Vent2_Pressure > 900)
	{
		Vent2_Pressure_bool = true;
	}
	else if (Vent2_Pressure < 100)
	{
		Vent2_Pressure_bool = false;
	}

	//! Read Watermark Sensor CODE--------------------------------------------------------------------------


	// Print pressure values for debugging
	// Serial.print("Vent1 Pressure: ");
	// Serial.print(Vent1_Pressure);
	// Serial.print("||  Bool: ");
	// Serial.println(Vent1_Pressure_bool);
	// Serial.print("Vent2 Pressure: ");
	// Serial.print(Vent2_Pressure);
	// Serial.print("||  Bool: ");
	// Serial.println(Vent2_Pressure_bool);
}