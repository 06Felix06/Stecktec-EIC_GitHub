#include <Arduino.h>
#include "LoRa_E32.h"
#include <SoftwareSerial.h>
#include <Adafruit_MCP23X17.h>
#include <ArduinoJson.h>

ResponseContainer rc;

Adafruit_MCP23X17 mcp;

float tmp = 0;
float hum = 0;
int wtm = 0;
bool ps1 = false;
bool ps2 = false;

//!! Lora Function--------------------------------------------------------------------------

LoRa_E32 e32ttl100(6, 7); // RX: 6, TX: 7

void sendWithResponse(const String &message)
{
	// Send initial message
	ResponseStatus sendStatus = e32ttl100.sendMessage(message);
	Serial.print("Sent: ");
	Serial.println(message);

	// Wait for response
	unsigned long responseStart = millis();
	bool responseReceived = false;

	while (millis() - responseStart < 4000)
	{
		if (e32ttl100.available())
		{
			rc = e32ttl100.receiveMessage();

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

//!! Set Valves Function--------------------------------------------------------------------------

#define ENABLE_PIN 3

void updateVent(uint8_t D1_pin, uint8_t D2_pin, bool state)
{
	if (state == true)
	{
		digitalWrite(ENABLE_PIN, LOW);
		mcp.digitalWrite(D1_pin, LOW);
		// delay(10);
		mcp.digitalWrite(D2_pin, HIGH);
		digitalWrite(ENABLE_PIN, HIGH);
	}
	else if (state == false)
	{
		digitalWrite(ENABLE_PIN, LOW);
		mcp.digitalWrite(D2_pin, LOW);
		// delay(10);
		mcp.digitalWrite(D1_pin, HIGH);
		digitalWrite(ENABLE_PIN, HIGH);
	}
}

