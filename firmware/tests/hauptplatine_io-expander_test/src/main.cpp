#include <Arduino.h>
#include <Adafruit_MCP23X17.h>

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
bool Vent1_State = true; // Example: false = "-+", true = "+-"
bool Vent2_State = false;
bool Vent3_State = true;
bool Vent4_State = false;

Adafruit_MCP23X17 mcp;

void setup()
{
    Serial.begin(9600);

    // Initialize MCP23017 at address 0x27
    if (!mcp.begin_I2C(0x27))
    {
        Serial.println("MCP23017 not found!");
        while (1)
            ;
    }

    // Configure all Valve control pins as OUTPUT
    mcp.pinMode(VENT1_D1, OUTPUT);
    mcp.pinMode(VENT1_D2, OUTPUT);
    mcp.pinMode(VENT2_D1, OUTPUT);
    mcp.pinMode(VENT2_D2, OUTPUT);
    mcp.pinMode(VENT3_D1, OUTPUT);
    mcp.pinMode(VENT3_D2, OUTPUT);
    mcp.pinMode(VENT4_D1, OUTPUT);
    mcp.pinMode(VENT4_D2, OUTPUT);

    // Configure enable pin (HIGH = Valves enabled)
    pinMode(ENABLE_PIN, OUTPUT);
    digitalWrite(ENABLE_PIN, LOW);

    Serial.println("System Ready");
}

void updateVent(uint8_t D1_pin, uint8_t D2_pin, bool state)
{
    if (state == true)
    {
        digitalWrite(ENABLE_PIN, LOW);
        mcp.digitalWrite(D1_pin, LOW);
        Serial.print("D1_pin true LOW: ");
        Serial.println(D1_pin);
        delay(10);
        mcp.digitalWrite(D2_pin, HIGH);
        Serial.print("D2_pin true HIGH: ");
        Serial.println(D2_pin);
        digitalWrite(ENABLE_PIN, HIGH);
    }
    else if (state == false)
    {
        digitalWrite(ENABLE_PIN, LOW);
        mcp.digitalWrite(D2_pin, LOW);
        Serial.print("D2_pin false LOW: ");
        Serial.println(D2_pin);
        delay(10);
        mcp.digitalWrite(D1_pin, HIGH);
        Serial.print("D1_pin false HIGH: ");
        Serial.println(D1_pin);
        digitalWrite(ENABLE_PIN, HIGH);
    }
}

void loop()
{
    // Update Valve directions based on boolean states
    // updateVent(VENT1_D1, VENT1_D2, Vent1_State); // Valve 1 //Hardware wahrschienlich defekt
    updateVent(VENT2_D1, VENT2_D2, Vent2_State); // Valve 2
    updateVent(VENT3_D1, VENT3_D2, Vent3_State); // Valve 3
    // updateVent(VENT4_D1, VENT4_D2, Vent4_State); // Valve 4 //Hardware wahrschienlich defekt
    Vent2_State = !Vent2_State; // Toggle state for testing
    Vent3_State = !Vent3_State; // Toggle state for testing
    delay(2000);
}
