#include <Arduino.h>
#include "LoRa_E32.h"
#include "SimFunctions.h"
#include <SoftwareSerial.h>

LoRa_E32 e32ttl100(6, 7); // RX: 6, TX: 7

void setup()
{
	Serial.begin(9600);
	pinMode(8, OUTPUT);
	pinMode(9, OUTPUT);
	digitalWrite(8, LOW);
	digitalWrite(9, LOW);

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
}

void sendWithResponse(const String &message)
{
	// Send initial message
	ResponseStatus sendStatus = e32ttl100.sendMessage(message);
	Serial.print("Sent: ");
	Serial.println(message);

	// Wait for response
	unsigned long responseStart = millis();
	bool responseReceived = false;

	while (millis() - responseStart < 2000)
	{
		if (e32ttl100.available())
		{
			ResponseContainer rc = e32ttl100.receiveMessage();

			if (rc.status.code == 1)
			{
				Serial.print("Received response: ");
				Serial.println(rc.data);
				responseReceived = true;
				break;
			}
		}
	}

	if (!responseReceived)
	{
		Serial.println("No response received");
	}
}

void loop()
{
	// //! SIM Module Loop CODE--------------------------------------------------------------------------

	SerialAT.listen();
	// responseString = getValue("/felix_johann_steck_gmail_com/wiesen/1/valves/0/isOpen");
	// valve0 = (responseString == "true"); // wandelt "false" und "true" string in bool um
	// digitalWrite(4, valve0);

	putValue("felix_johann_steck_gmail_com/wiesen/1/valves/0/isOpen", "false");

	// // Serial.println("Test");

	// Serial.print("Aux Read:  ");
	// Serial.println(digitalRead(10));
	//-
	//-
	//-
	SerialAT.stopListening();
	e32ttl100.begin();

	static unsigned long lastSend = 0;
	const unsigned long interval = 5000;

	// Regular message every 5 seconds
	if (millis() - lastSend >= interval)
	{
		lastSend = millis();
		sendWithResponse("Main device");
	}

	// Manual message from Serial
	if (Serial.available())
	{
		String input = Serial.readString();
		input.trim();
		sendWithResponse(input);
	}
}
