#include <Arduino.h>
#include "LoRa_E32.h"
#include "SimFunctions.h"
#include <SoftwareSerial.h>
#include "MainFunctions.h"
#include <Adafruit_MCP23X17.h>
#include <ArduinoJson.h>

// MCP23017 Pins (GPA0-GPA7, GPB0-GPB7)
#define VENT1_D2 0 // Valve 1 Direction 2
#define VENT1_D1 1 // Valve 1 Direction 1
#define VENT2_D2 2 // Valve 2 Direction 2
#define VENT2_D1 3 // Valve 2 Direction 1
#define VENT3_D2 4 // Valve 3 Direction 2
#define VENT3_D1 5 // Valve 3 Direction 1
#define VENT4_D2 6 // Valve 4 Direction 2
#define VENT4_D1 7 // Valve 4 Direction 1
// Arduino Pins
#define ENABLE_PIN 3 // Shared enable pin (D3)
// Direction control variables (set these externally)
bool Vent1_State = false; // Example: false = "-+", true = "+-"
bool Vent2_State = false;
bool Vent3_State = false;
bool Vent4_State = false;

bool Vent1_Sens_State = true;
bool Vent2_Sens_State = true;

unsigned long previousMillis_Vent = 0; // Stores last execution time
const long interval_Vent = 5000;

bool firstTime = false;

unsigned long previousMillis_1 = 0;
const long interval_1 = 5000; // 5 seconds in milliseconds

unsigned long previousMillis_2 = 0;
const long interval_2 = 5800; // 5 seconds in milliseconds

void setup()
{
	Serial.begin(9600);
	Serial.println("Boot Sequence...................................................................");

	pinMode(8, OUTPUT);
	pinMode(9, OUTPUT);
	digitalWrite(8, LOW);
	digitalWrite(9, LOW);

	pinMode(ENABLE_PIN, OUTPUT);
	pinMode(4, OUTPUT);

	Serial.println("Main device ready");

	//! SIM Module Setup CODE--------------------------------------------------------------------------
	pinMode(4, OUTPUT);

	SerialAT.begin(9600);
	delay(3000);

	Serial.println("Initializing modem...");
	if (!modem.init())
	{
		Serial.println("Modem initialization failed!");
		while (true)
			;
	}

	Serial.println("Connecting to network...");
	if (!modem.gprsConnect(apn, user, pass))
	{
		Serial.println("GPRS connection failed!");
		while (true)
			;
	}
	Serial.println("Connected to internet!");
	// Set to true to send data for the first time
}

void loop()
{
	digitalWrite(4, HIGH);

	// Serial.println("Main loop started............................................................");
	// Serial.print("Loop Data: ");
	// Serial.println(rc.data);

	int tmpStart = rc.data.indexOf("\"tmp\":") + 6; // 6 is length of "\"tmp\":"
	int tmpEnd = rc.data.indexOf(',', tmpStart);
	tmp = rc.data.substring(tmpStart, tmpEnd).toFloat();

	// Extract humidity (float)
	int humStart = rc.data.indexOf("\"hum\":") + 6;
	int humEnd = rc.data.indexOf('"', humStart);
	hum = rc.data.substring(humStart, humEnd).toFloat();

	// Extract pressure 1 (int)
	int ps1Start = rc.data.indexOf("\"ps1\":") + 6;
	int ps1End = rc.data.indexOf('"', ps1Start);
	ps1 = rc.data.substring(ps1Start, ps1End).toInt();

	// Extract pressure 2 (int)
	int ps2Start = rc.data.indexOf("\"ps2\":") + 6;
	int ps2End = rc.data.indexOf('"', ps2Start);
	ps2 = rc.data.substring(ps2Start, ps2End).toInt();

	// Extract water level (int)
	int wtmStart = rc.data.indexOf("\"wtm\":") + 6;
	int wtmEnd = rc.data.indexOf('}', wtmStart);
	wtm = rc.data.substring(wtmStart, wtmEnd).toInt();

	// Serial.print(F("Temperature:    "));
	// Serial.print(tmp);
	// Serial.print(F("Humidity:       "));
	// Serial.print(hum);
	// Serial.print(F("Pressure 1:     "));
	// Serial.println(ps1);
	// Serial.print(F("Pressure 2:     "));
	// Serial.println(ps2);
	// Serial.print(F("Bodenfeuchte:    "));
	// Serial.println(wtm);

	//! SIM Module Loop CODE--------------------------------------------------------------------------
	// Get Vent1 state from server

	SerialAT.listen();

	//! Port Exp Funktioniert eh nicht also diese Valve reads unnötig
	// responseString = getValue("/felix_johann_steck_gmail_com/wiesen/1/valves/0/isOpen");
	// Vent1_State = (responseString == "true"); // wandelt "false" und "true" string in bool um

	// 										  // Get Vent2 state from server
	// responseString = getValue("/felix_johann_steck_gmail_com/wiesen/1/valves/1/isOpen");
	// Vent2_State = (responseString == "true"); // wandelt "false" und "true" string in bool um
	// 										  // Get Vent3 state from server
	// responseString = getValue("/felix_johann_steck_gmail_com/wiesen/1/valves/2/isOpen");
	// Vent3_State = (responseString == "true"); // wandelt "false" und "true" string in bool um
	// 										  // Get Vent4 state from server
	// responseString = getValue("/felix_johann_steck_gmail_com/wiesen/1/valves/3/isOpen");
	// Vent4_State = (responseString == "true"); // wandelt "false" und "true" string in bool um

	// responseString = getValue("/felix_johann_steck_gmail_com/wiesen/1/valves/4/isOpen");
	// Vent1_Sens_State = (responseString == "true"); // wandelt "false" und "true" string in bool um

	// Serial.print("Vent1_Sens_State: ");
	// Serial.println(Vent1_Sens_State);

	// responseString = getValue("/felix_johann_steck_gmail_com/wiesen/1/valves/5/isOpen");
	// Vent2_Sens_State = (responseString == "true"); // wandelt "false" und "true" string in bool um

	putValue("/felix_johann_steck_gmail_com/wiesen/1/valves/4/flowDetected", String(ps1));

	putValue("/felix_johann_steck_gmail_com/wiesen/1/valves/5/flowDetected", String(ps2));

	putValue("/felix_johann_steck_gmail_com/wiesen/1/submodules/0/temperature", String(tmp));

	putValue("/felix_johann_steck_gmail_com/wiesen/1/submodules/0/airHumidity", String(hum));

	putValue("/felix_johann_steck_gmail_com/wiesen/1/submodules/0/soilMoisture", String(wtm));

	// // responseString = getValue("/felix_johann_steck_gmail_com/wiesen/1/valves/0/isOpen");

	// // putValue("felix_johann_steck_gmail_com/wiesen/1/valves/0/isOpen", "true");

	//! Dann Includen wenn ichs hab

	SerialAT.stopListening();

	//! LORA CODE------------------------------------------------------------------------
	e32ttl100.begin();

	static unsigned long lastSend = 0;
	const unsigned long interval = 5000;

	// Regular message every 5 seconds
	if (millis() - lastSend >= interval)
	{
		String sensorData = "{";
		sensorData += "\"V1SState\":" + String(Vent1_Sens_State) + ",";
		sensorData += "\"V2SState\":" + String(Vent2_Sens_State);
		sensorData += "}";

		lastSend = millis();
		sendWithResponse(sensorData);
	}

	// Manual message from Serial
	// if (Serial.available())
	// {
	// 	String input = Serial.readString();
	// 	input.trim();
	// 	sendWithResponse(input);
	// }

	//! VALVE CONTROL CODE--------------------------------------------------------------------------

	// Serial.print("Ventil update:  ");
	// Serial.print(Vent1_State);
	// Serial.print("  V2: ");
	// Serial.print(Vent2_State);
	// Serial.print("  V3: ");
	// Serial.print(Vent3_State);
	// Serial.print("  V4: ");
	// Serial.print(Vent4_State);

	//! Wahrscheinlich mocht Port Expander an Hund inni weil mit sel geats nit ollm, vllt interrupt trigger I2C ?!
	// Serial.println("Ventil Start............................................................");
	// delay(3000);
	// // Vent 2 setter
	// if (Vent2_State == 1)
	// {
	// 	digitalWrite(ENABLE_PIN, LOW);
	// 	mcp.digitalWrite(VENT2_D1, LOW);
	// 	// delay(10);
	// 	mcp.digitalWrite(VENT2_D2, HIGH);
	// 	digitalWrite(ENABLE_PIN, HIGH);
	// }
	// else if (Vent2_State == 0)
	// {
	// 	digitalWrite(ENABLE_PIN, LOW);
	// 	mcp.digitalWrite(VENT2_D2, LOW);
	// 	// delay(10);
	// 	mcp.digitalWrite(VENT2_D1, HIGH);
	// 	digitalWrite(ENABLE_PIN, HIGH);
	// }
	// Serial.println("  Ventil update done.");

	//? Sensor Ventile Toggle, braucht es jetzt nicht mehr, weil ich die Ventile direkt steuere
	// if (millis() - previousMillis_Vent >= interval_Vent)
	// {
	// 	Serial.print("Ventil 1 update:  ");
	// 	Serial.print(Vent1_Sens_State);
	// 	Vent1_Sens_State = !Vent1_Sens_State;
	// 	previousMillis_Vent = millis();
	// 	Serial.print("      Ventil 1 update done.");
	// 	Serial.println(Vent1_Sens_State);
	// }
}
