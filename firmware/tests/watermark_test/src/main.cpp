#include <Arduino.h>

unsigned long previousMillis = 0; // Stores the last time the action was performed
const long interval = 10000;      // Interval at which to run (10 seconds)

int testVal = 0;

void setup()
{
    Serial.begin(9600); // initialize serial
}

void loop()
{
    unsigned long currentMillis = millis();

    if (currentMillis - previousMillis >= interval)
    {
        previousMillis = currentMillis;
        pinMode(9, OUTPUT);
        pinMode(10, OUTPUT);
        digitalWrite(9, LOW);
        digitalWrite(10, HIGH);
        testVal = analogRead(A3);
        Serial.println(testVal);
        Serial.println("--------");
        digitalWrite(10, LOW);
        digitalWrite(9, HIGH);
        testVal = analogRead(A3);
        Serial.println(testVal);
        Serial.println("--------");

        pinMode(9, INPUT);
        pinMode(10, INPUT);
    }
}