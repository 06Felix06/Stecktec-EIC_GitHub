#include <Arduino.h>

#define ENABLE_PIN 8

void updateVent(uint8_t D1_pin, uint8_t D2_pin, bool state)
{
    if (state == true)
    {
        digitalWrite(ENABLE_PIN, LOW);
        digitalWrite(D2_pin, LOW);
        digitalWrite(D1_pin, LOW);
        delay(10);
        digitalWrite(D2_pin, HIGH);
        digitalWrite(ENABLE_PIN, HIGH);
        delay(10);
        digitalWrite(ENABLE_PIN, LOW);
    }
    else if (state == false)
    {
        digitalWrite(ENABLE_PIN, LOW);
        digitalWrite(D1_pin, LOW);
        digitalWrite(D2_pin, LOW);
        delay(10);
        digitalWrite(D1_pin, HIGH);
        digitalWrite(ENABLE_PIN, HIGH);
        delay(10);
        digitalWrite(ENABLE_PIN, LOW);
    }
}

//! Watermark Sensor Function--------------------------------------------------------------------------

#define SENS_PIN A3

int readWatermark()
{
    pinMode(9, OUTPUT);
    pinMode(10, OUTPUT);
    digitalWrite(9, LOW);
    digitalWrite(10, HIGH);
    int readVal = analogRead(A3);

    Serial.println(readVal);
    Serial.println("--------");

    digitalWrite(10, LOW);
    digitalWrite(9, HIGH);
    int readVal2 = analogRead(A3);

    Serial.println(readVal2);
    Serial.println("--------");

    pinMode(9, INPUT);
    pinMode(10, INPUT);

    return readVal2;
}