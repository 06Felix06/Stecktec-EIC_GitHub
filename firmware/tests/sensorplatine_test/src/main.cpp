#include <Arduino.h>

void setup()
{
    Serial.begin(9600);
    pinMode(4, OUTPUT);
}

void loop()
{
    Serial.println("Hello World");
    digitalWrite(4, HIGH);
    delay(200);
    digitalWrite(4, LOW);
    delay(200);
}
