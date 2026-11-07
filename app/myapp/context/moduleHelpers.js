// src/utils/moduleHelpers.js
import { moduleTypes } from '/moduleTypes.js'; // Adjust the import path as necessary

// Function to check if a Wiese has a full function sensor submodule
export const hasFullFunctionSensor = (submodules) => {
    // Check if any submodule is a full function sensor (IDs 0102 or 0103)
    return submodules?.some(module =>
        module.type === "0102" || module.type === "0103"
    );
};

// Function to get total valve count for a Wiese
export const getTotalValveCount = (wiese) => {
    // Base valve count is 4
    let valveCount = 4;

    // Add 2 more if there's a full function sensor
    if (hasFullFunctionSensor(wiese.submodules)) {
        valveCount += 2;
    }

    return valveCount;
};