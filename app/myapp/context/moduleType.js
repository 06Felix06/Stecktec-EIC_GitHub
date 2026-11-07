// moduleTypes.js

export const moduleTypes = {
    //!Steuereinheiten
    "0001": {
        name: "Steuereinheit Standard",
        category: "main",
        allowedAsSubmodule: false
    },
    "0002": {
        name: "Steuereinheit Extended",
        category: "main",
        allowedAsSubmodule: false
    },

    //!Sensoren
    "0100": {
        name: "Bodefeuchtesensor",
        category: "sensor",
        allowedAsSubmodule: true
    },
    "0101": {
        name: "Temp+Luftfeuchtesensor",
        category: "sensor",
        allowedAsSubmodule: true
    },
    "0102": {
        name: "2RelaisAusgangSensor",
        category: "sensor",
        allowedAsSubmodule: true
    },
    "0103": {
        name: "2RelaisAusgang+Bodefeuchtesensor",
        category: "sensor",
        allowedAsSubmodule: true
    },
    "0104": {
        name: "Full Functionality Sensor",
        category: "sensor",
        allowedAsSubmodule: true
    },

    // Add more as needed
};