import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, TextInput, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/theme';

// Module Art mapping based on the first 4 digits of the serial number
const modulArtMapping = {
    'EIC1': 'EIC-Modul Basic',
    'EIC2': 'IC-Modul Pro',
    'SOL1': 'Solar-Modul Standard',
    'WST1': 'Wasserstand-Modul',
    // Add more mappings as needed
};

export default function EinzellmoduleScreen() {
    const [showPopup, setShowPopup] = useState(false);
    const [moduleName, setModuleName] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [modulesArray, setModulesArray] = useState([]);

    // Format the serial number with dashes
    const formatSerialNumber = (input) => {
        // Remove all non-numeric characters
        const numericInput = input.replace(/\D/g, '');

        // Add dashes at the correct positions
        let formattedInput = '';
        if (numericInput.length > 0) {
            formattedInput += numericInput.slice(0, 4); // First 4 digits
        }
        if (numericInput.length > 4) {
            formattedInput += '-' + numericInput.slice(4, 9); // Next 5 digits
        }
        if (numericInput.length > 9) {
            formattedInput += '-' + numericInput.slice(9, 11); // Next 2 digits
        }
        if (numericInput.length > 11) {
            formattedInput += '-' + numericInput.slice(11, 15); // Last 4 digits
        }

        return formattedInput;
    };

    // Handle serial number input change
    const handleSerialNumberChange = (input) => {
        const formattedInput = formatSerialNumber(input);
        setSerialNumber(formattedInput);
    };

    // Determine the module type based on the first 4 digits of the serial number
    const getModulArt = (serial) => {
        const prefix = serial.split('-')[0]; // Extract the first 4 digits
        return modulArtMapping[prefix] || 'Unbekanntes Modell'; // Return the module type or "Unbekanntes Modell"
    };

    // Handle saving a new module
    const handleSave = () => {
        if (moduleName.trim() !== '' && serialNumber.trim() !== '') {
            const newModule = {
                name: moduleName,
                serial: serialNumber,
                modulArt: getModulArt(serialNumber), // Determine module type
                wiese: '', // Leave empty for now
            };
            setModulesArray([...modulesArray, newModule]); // Add the new module to the array
            setModuleName(''); // Reset the module name input
            setSerialNumber(''); // Reset the serial number input
            setShowPopup(false); // Close the popup
        }
    };

    // Handle deleting a module
    const handleDelete = (index) => {
        Alert.alert(
            'Modul löschen',
            'Sind Sie sicher, dass Sie dieses Modul löschen möchten?',
            [
                { text: 'Abbrechen', style: 'cancel' },
                {
                    text: 'Löschen',
                    onPress: () => {
                        const updatedArray = modulesArray.filter((_, i) => i !== index); // Remove the module at the specified index
                        setModulesArray(updatedArray);
                    },
                },
            ],
            { cancelable: true }
        );
    };

    // Handle QR code scanning (mock implementation)
    const handleQRScan = () => {
        // For now, mock the scanned value
        setSerialNumber('EIC1-12345-10-2023'); // Example serial number
    };

    // Check if the save button should be disabled
    const isSaveDisabled = moduleName.trim() === '' || serialNumber.trim() === '';

    return (
        <View style={styles.container}>
            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowPopup(true)}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            {/* Module List or Empty State */}
            {modulesArray.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Um dein erstes EIC Modul hinzuzufügen{'\n'}
                        Klicke auf das +
                    </Text>
                </View>
            ) : (
                <View style={styles.listContainer}>
                    {modulesArray.map((module, index) => (
                        <View key={index} style={styles.moduleItem}>
                            <View style={styles.moduleInfo}>
                                <Text style={styles.moduleText}>Modell: {module.modulArt}</Text>
                                <Text style={styles.moduleText}>Name: {module.name}</Text>
                                <Text style={styles.moduleText}>Seriennummer: {module.serial}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDelete(index)}
                            >
                                <Ionicons name="trash" size={24} color={COLORS.red} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {/* Add Module Modal */}
            <Modal
                visible={showPopup}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPopup(false)}
                statusBarTranslucent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Neues Modul hinzufügen</Text>

                        {/* Module Name Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Modulname"
                            placeholderTextColor={COLORS.text}
                            value={moduleName}
                            onChangeText={setModuleName}
                        />

                        {/* Serial Number Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Seriennummer (XXXX-XXXXX-XX-XXXX)"
                            placeholderTextColor={COLORS.text}
                            value={serialNumber}
                            onChangeText={handleSerialNumberChange}
                            keyboardType="numeric" // Only allow numeric input
                            maxLength={19} // Maximum length with dashes
                        />

                        {/* QR Code Scan Button */}
                        <TouchableOpacity
                            style={styles.qrButton}
                            onPress={handleQRScan}
                        >
                            <Text style={styles.qrButtonText}>QR-Code scannen / noch nicht verfügbar</Text>
                        </TouchableOpacity>

                        {/* Save and Cancel Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowPopup(false)}
                            >
                                <Text style={styles.buttonText}>Abbrechen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, isSaveDisabled && styles.disabledButton]}
                                onPress={handleSave}
                                disabled={isSaveDisabled}
                            >
                                <Text style={styles.buttonText}>Speichern</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const screen = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background2,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    listContainer: {
        marginTop: 20,
    },
    moduleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingLeft: 20,
        paddingBottom: 10,
        paddingRight: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    moduleInfo: {
        flex: 1,
    },
    moduleText: {
        fontSize: 16,
        color: COLORS.text,
        marginBottom: 4,
    },
    deleteButton: {
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: screen.width * 0.9,
        backgroundColor: COLORS.background,
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: COLORS.text,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: COLORS.text,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        color: COLORS.text,
        backgroundColor: COLORS.background2,
    },
    qrButton: {
        backgroundColor: COLORS.green,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginBottom: 20,
        height: 50,
        justifyContent: 'center',
    },
    qrButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    closeButton: {
        backgroundColor: COLORS.red,
        borderRadius: 8,
        padding: 12,
        flex: 1,
        marginRight: 8,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: COLORS.green,
        borderRadius: 8,
        padding: 12,
        flex: 1,
        marginLeft: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: COLORS.grey,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});