#include <Arduino.h>
#define TINY_GSM_MODEM_SIM7000
#include <SoftwareSerial.h>
#include <TinyGsmClient.h>

#define PIN_TX 11
#define PIN_RX 12

SoftwareSerial SerialAT(PIN_RX, PIN_TX);
TinyGsm modem(SerialAT);
TinyGsmClient client(modem);

const char apn[] = "hologram";
const char user[] = "";
const char pass[] = "";
const char *proxyHost = "YOUR_PROXY_IP";
const int proxyPort = 5000;

String ReadValue = "";
String responseString = "";

bool valve0 = false;
bool valve1 = false;
bool valve2 = false;
bool valve3 = false;

void debugResponse()
{
    Serial.println("\nFull Server Response:");
    while (client.available())
    {
        String line = client.readStringUntil('\n');
        Serial.println(line);
    }
}

void putValue(const char *path, const String &value)
{
    if (client.connect(proxyHost, proxyPort))
    {

        Serial.print("Sending PUT request to: ");
        Serial.println(path);

        client.print("PUT /proxy?path=");
        client.print(path);
        client.println(" HTTP/1.1");
        client.println("Host: YOUR_PROXY_IP");
        client.println("Content-Type: text/plain");
        client.print("Content-Length: ");
        client.println(value.length());
        client.println("Connection: close");
        client.println();
        client.println(value);

        // Handle response
        unsigned long timeout = millis();
        while (client.connected() && !client.available())
        {
            if (millis() - timeout > 10000)
            {
                Serial.println(">>> PUT response timeout!");
                client.stop();
                return;
            }
        }

        // Print server response
        Serial.println("PUT response:");
        while (client.available())
        {
            String line = client.readStringUntil('\n');
            Serial.println(line);
        }

        client.stop();
    }
    else
    {
        Serial.println("PUT connection failed!");
    }
}

String getValue(const char *path)
{

    if (client.connect(proxyHost, proxyPort))
    {
        // Send request
        client.print("GET /proxy?path=");
        client.print(path);
        client.println(" HTTP/1.1");
        client.println("Host: YOUR_PROXY_IP");
        client.println("Connection: close");
        client.println();

        // Wait for response
        unsigned long timeout = millis();
        while (client.connected() && !client.available())
        {
            if (millis() - timeout > 10000)
            {
                Serial.println(">>> Response timeout!");
                client.stop();
                return "";
            }
        }

        // Skip HTTP headers
        while (client.available())
        {
            String line = client.readStringUntil('\n');
            if (line == "\r")
            { // End of headers
                break;
            }
        }

        // Read value
        if (client.available())
        {
            ReadValue = client.readStringUntil('\n');
            ReadValue.trim(); // Remove any whitespace/CR/LF

            Serial.print("Raw ReadValue: ");
            Serial.println(ReadValue);
        }
        client.stop();
    }
    else
    {
        Serial.println("Connection failed!");
    }

    Serial.print("ReadValue:   ");
    Serial.println(ReadValue);
    return ReadValue;
}