#include <Arduino.h>
#include <Wire.h>

void setup()
{
    Serial.begin(9600);
    while (!Serial)
        ;         // Wait for serial monitor (optional)
    Wire.begin(); // Initialize I2C
    Serial.println("I2C Scanner started...");
}

void loop()
{
    byte error, address;
    int foundDevices = 0;

    Serial.println("Scanning I2C devices...");

    for (address = 1; address < 127; address++)
    {
        Wire.beginTransmission(address);
        error = Wire.endTransmission();

        if (error == 0)
        {
            Serial.print("Found device at address: 0x");
            if (address < 16)
                Serial.print("0"); // Pad with leading zero
            Serial.println(address, HEX);
            foundDevices++;
        }
    }

    if (foundDevices == 0)
    {
        Serial.println("No devices found. Check wiring/pull-ups!");
    }

    Serial.println("-------------------");
    delay(5000); // Scan every 5 seconds
}