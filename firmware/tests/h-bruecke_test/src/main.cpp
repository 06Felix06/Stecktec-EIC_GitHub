#include <Arduino.h>

int BatVoltage = 0;
int SolarVoltage = 0;

void setup()
{
    Serial.begin(9600);
    pinMode(4, OUTPUT);
    pinMode(5, OUTPUT);
    pinMode(8, OUTPUT);
}

void loop()
{
    BatVoltage = analogRead(A0);
    SolarVoltage = analogRead(A6);
    Serial.print("Battery Voltage: ");
    Serial.println(BatVoltage);
    Serial.print("Solar Voltage: ");
    Serial.println(SolarVoltage);
    digitalWrite(8, HIGH);
    digitalWrite(4, HIGH);
    digitalWrite(5, LOW);
    delay(100);
    digitalWrite(8, LOW);
    delay(500);
    digitalWrite(4, LOW);
    digitalWrite(5, HIGH);
    delay(100);
    digitalWrite(8, LOW);
    delay(500);
}
