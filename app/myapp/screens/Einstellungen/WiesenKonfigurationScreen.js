import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, TextInput, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/theme';
import { auth, database, ref, set, get } from '../../context/firebase';
import { moduleTypes } from '../../context/moduleType';

export default function WiesenKonfigurationScreen() {
    const [showPopup, setShowPopup] = useState(false);
    const [wiesenname, setWiesenname] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [wiesenType, setWiesenType] = useState('standard');
    const [isGeteilteWieseSelected, setIsGeteilteWieseSelected] = useState(false);
    const [wiesenArray, setWiesenArray] = useState([]);
    const [showSubmodulePopup, setShowSubmodulePopup] = useState(false);
    const [submoduleName, setSubmoduleName] = useState('');
    const [submoduleSerial, setSubmoduleSerial] = useState('');
    const [selectedWieseId, setSelectedWieseId] = useState(null);
    const [moduleInfo, setModuleInfo] = useState(null);

    // Get sanitized user email for Firebase path
    const userEmail = auth.currentUser?.email?.replace(/[@.]/g, '_');
    console.log(userEmail);



    // Load wiesenArray from Firebase
    useEffect(() => {
        if (userEmail) {
            console.log("load Firebase data");
            console.log(wiesenArray);
            const wiesenRef = ref(database, `users/${userEmail}/wiesen`);
            console.log(wiesenRef);
            get(wiesenRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        setWiesenArray(snapshot.val());
                    }
                })
                .catch((error) => {
                    console.error("Error loading data:", error);
                    Alert.alert("Fehler", "Daten konnten nicht geladen werden");
                });
        }
        console.log(wiesenArray);
    }, [userEmail]);

    //Save wiesenArray to Firebase
    useEffect(() => {
        if (userEmail && wiesenArray.length > 0) {
            console.log("save Firebase data");
            console.log(wiesenArray);
            const wiesenRef = ref(database, `users/${userEmail}/wiesen`);
            set(wiesenRef, wiesenArray)
                .catch((error) => {
                    console.error("Error saving data:", error);
                    Alert.alert("Fehler", "Daten konnten nicht gespeichert werden");
                });
        }
        console.log(wiesenArray);
    }, [wiesenArray, userEmail]);

    const formatSerialNumber = (input) => {
        const numericInput = input.replace(/\D/g, '');
        let formattedInput = '';
        if (numericInput.length > 0) formattedInput += numericInput.slice(0, 4);
        if (numericInput.length > 4) formattedInput += '-' + numericInput.slice(4, 9);
        if (numericInput.length > 9) formattedInput += '-' + numericInput.slice(9, 11);
        if (numericInput.length > 11) formattedInput += '-' + numericInput.slice(11, 15);
        return formattedInput;
    };

    // Add these new functions
    const handleAddSubmodule = (wieseId) => {
        setSelectedWieseId(wieseId);
        setShowSubmodulePopup(true);
    };

    const handleSubmoduleSerialChange = (input) => {
        setSubmoduleSerial(formatSerialNumber(input));

        // Check module type using raw numbers (remove formatting)
        const numericSerial = input.replace(/\D/g, '');
        const prefix = numericSerial.slice(0, 4);
        const type = moduleTypes[prefix] || {
            name: "Unbekanntes Modul",
            category: "unknown",
            allowedAsSubmodule: false
        };
        setModuleInfo(type);
    };

    const handleSaveSubmodule = () => {
        if (!moduleInfo.allowedAsSubmodule) {
            Alert.alert("Fehler", "Dieser Modultyp kann nicht hinzugefügt werden");
            return;
        }

        const updatedWiesen = wiesenArray.map(wiese => {
            if (wiese.id === selectedWieseId) {
                // Get max submodule ID for this wiese
                const maxSubId = wiese.submodules?.reduce((max, sub) => Math.max(max, sub.id), 0) || 0;

                const newSubmodule = {
                    id: maxSubId + 1,
                    name: submoduleName,
                    serial: submoduleSerial,
                    type: moduleInfo.name,
                    category: moduleInfo.category,
                    isIrrigating: false, // Add this
                    hasProblem: false, // Add this
                    soilMoisture: 0,
                    temperature: 0.0,
                    airHumidity: 0,
                    timestamp: 0 //! Richten Variablen
                };

                return {
                    ...wiese,
                    submodules: [...(wiese.submodules || []), newSubmodule]
                };
            }
            return wiese;
        });

        setWiesenArray(updatedWiesen);
        setShowSubmodulePopup(false);
        setSubmoduleName('');
        setSubmoduleSerial('');
    };

    const handleSerialNumberChange = (input) => {
        setSerialNumber(formatSerialNumber(input));
    };

    const handleWiesenTypeChange = (value) => {
        setWiesenType(value);
        setIsGeteilteWieseSelected(value === 'geteilte');
    };

    const handleSave = () => {
        if (!isGeteilteWieseSelected && wiesenname.trim() !== '' && serialNumber.trim() !== '') {
            const maxId = wiesenArray.reduce((max, wiese) => Math.max(max, wiese.id), 0);
            const newWiese = {
                id: maxId + 1,
                name: wiesenname,
                type: wiesenType,
                serial: serialNumber,
                isIrrigating: false, // Add this
                hasProblem: false, // Add this
                valves: {
                    0: { isOpen: false, flowDetected: false, timerEnd: 0 },
                    1: { isOpen: false, flowDetected: false, timerEnd: 0 },
                    2: { isOpen: false, flowDetected: false, timerEnd: 0 },
                    3: { isOpen: false, flowDetected: false, timerEnd: 0 }
                },
                submodules: [] // Ensure this exists
            };
            setWiesenArray([...wiesenArray, newWiese]);
            setWiesenname('');
            setSerialNumber('');
            setWiesenType('standard');
            setShowPopup(false);
        }
    };

    const handleDelete = (wieseId, submoduleId = null) => {
        Alert.alert(
            submoduleId ? 'Modul löschen' : 'Wiese löschen',
            'Sind Sie sicher?',
            [
                { text: 'Abbrechen', style: 'cancel' },
                {
                    text: 'Löschen',
                    onPress: () => {
                        if (submoduleId) {
                            const updatedArray = wiesenArray.map(wiese => {
                                if (wiese.id === wieseId) {
                                    return {
                                        ...wiese,
                                        submodules: wiese.submodules?.filter(s => s.id !== submoduleId) || []
                                    };
                                }
                                return wiese;
                            });
                            setWiesenArray(updatedArray);
                        } else {
                            const updatedArray = wiesenArray.filter(wiese => wiese.id !== wieseId);
                            setWiesenArray(updatedArray);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const isSaveDisabled =
        isGeteilteWieseSelected ||
        wiesenname.trim() === '' ||
        serialNumber.trim() === '' ||
        serialNumber.length !== 18;

    const isSubmoduleSaveDisabled =
        !moduleInfo?.allowedAsSubmodule ||
        submoduleName.trim() === '' ||
        submoduleSerial.length !== 18;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.fab}
                onPress={() => { setShowPopup(true); setWiesenname(''); setSerialNumber(''); }}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            <Modal
                visible={showPopup}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPopup(false)}
                statusBarTranslucent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Neue Wiese hinzufügen</Text>

                        <TextInput
                            style={[styles.input, { color: COLORS.text }]}
                            placeholderTextColor={COLORS.text}
                            placeholder="Wiesenname"
                            value={wiesenname}
                            onChangeText={setWiesenname}
                        />

                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={wiesenType}
                                onValueChange={handleWiesenTypeChange}
                                dropdownIconColor={COLORS.text}
                                style={styles.picker}
                            >
                                <Picker.Item label="Standard" value="standard" style={styles.pickerItem} />
                                <Picker.Item label="Geteilte Wiese" value="geteilte" style={styles.pickerItem} />
                            </Picker>
                        </View>

                        <Text style={styles.modalsubTitle}>Steuereinheit der Wiese</Text>

                        <TextInput
                            style={[styles.input, { color: COLORS.text }]}
                            placeholderTextColor={COLORS.text}
                            placeholder="Seriennummer (XXXX-XXXXX-XX-XXXX)"
                            value={serialNumber}
                            onChangeText={handleSerialNumberChange}
                            keyboardType="numeric"
                            maxLength={18}
                        />

                        <TouchableOpacity style={styles.qrButton}>
                            <Text style={styles.qrButtonText}>QR-Code scannen / noch nicht verfügbar</Text>
                        </TouchableOpacity>

                        {isGeteilteWieseSelected && (
                            <Text style={styles.unsupportedText}>
                                Geteilte Wiese wird derzeit noch nicht unterstützt.
                            </Text>
                        )}

                        {(wiesenname.trim() === '' || serialNumber.trim() === '') && (
                            <Text style={styles.warningText}>
                                Bitte geben Sie einen Wiesenname und eine Seriennummer ein.
                            </Text>
                        )}

                        <View style={styles.ClosingButtons}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowPopup(false)}
                            >
                                <Text style={styles.ButtonText}>Schließen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, isSaveDisabled && styles.disabledButton]}
                                onPress={handleSave}
                                disabled={isSaveDisabled}
                            >
                                <Text style={styles.ButtonText}>Speichern</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showSubmodulePopup}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSubmodulePopup(false)}
                statusBarTranslucent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Neues Modul hinzufügen</Text>

                        <TextInput
                            style={[styles.input, { color: COLORS.text }]}
                            placeholderTextColor={COLORS.text}
                            placeholder="Modulname"
                            value={submoduleName}
                            onChangeText={setSubmoduleName}
                        />

                        <TextInput
                            style={[styles.input, { color: COLORS.text }]}
                            placeholderTextColor={COLORS.text}
                            placeholder="Seriennummer (XXXX-XXXXX-XX-XXXX)"
                            value={submoduleSerial}
                            onChangeText={handleSubmoduleSerialChange}
                            keyboardType="numeric"
                            maxLength={18}
                        />

                        {moduleInfo && (
                            <View style={styles.moduleInfoContainer}>
                                <Text style={styles.moduleInfoText}>
                                    Modultyp: {moduleInfo.name}
                                </Text>
                                <Text style={styles.moduleInfoText}>
                                    Kategorie: {moduleInfo.category}
                                </Text>
                                {!moduleInfo.allowedAsSubmodule && (
                                    <Text style={styles.errorText}>
                                        Dieser Modultyp kann nicht als Submodul hinzugefügt werden
                                    </Text>
                                )}
                            </View>
                        )}

                        <View style={styles.ClosingButtons}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowSubmodulePopup(false)}
                            >
                                <Text style={styles.ButtonText}>Schließen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    isSubmoduleSaveDisabled && styles.disabledButton
                                ]}
                                onPress={handleSaveSubmodule}
                                disabled={isSubmoduleSaveDisabled}
                            >
                                <Text style={styles.ButtonText}>Speichern</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView style={styles.scrollView}>
                {wiesenArray.map((wiese) => (
                    <View key={wiese.id} style={styles.wieseItem}>
                        <View style={styles.wieseInfo}>
                            <Text style={styles.wieseText}>ID: {wiese.id}</Text>
                            <Text style={styles.wieseText}>Name: {wiese.name}</Text>
                            <Text style={styles.wieseText}>Typ: {wiese.type}</Text>
                            <Text style={styles.wieseText}>Seriennummer: {wiese.serial}</Text>

                            {wiese.submodules?.map(sub => (
                                <View key={sub.id} style={styles.submoduleItem}>
                                    <View>
                                        <Text style={styles.submoduleText}> {sub.name} </Text>
                                        <Text style={styles.submoduleText}> ({sub.type}) </Text>
                                        <Text style={styles.submoduleText}> {sub.serial} </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(wiese.id, sub.id)}
                                    >
                                        <Ionicons name="trash" size={18} color={COLORS.red} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.addSlaveButton}
                            onPress={() => handleAddSubmodule(wiese.id)}
                        >
                            <Ionicons name="add" size={32} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDelete(wiese.id)}
                        >
                            <Ionicons name="trash" size={24} color={COLORS.red} />
                        </TouchableOpacity>
                    </View>
                ))}
                <View style={styles.spacingBottom}></View>
            </ScrollView>
        </View>
    );
}

const screen = Dimensions.get('window');
const styles = StyleSheet.create({

    moduleInfoContainer: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: COLORS.background2,
        borderRadius: 8,
    },
    moduleInfoText: {
        color: COLORS.text,
        fontSize: 14,
        marginBottom: 5,
    },
    errorText: {
        color: COLORS.red,
        fontSize: 14,
        marginTop: 5,
    },
    submoduleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        marginLeft: 10,
        paddingHorizontal: 13,
        paddingVertical: 5,
        borderBottomWidth: 0,
        borderBottomColor: COLORS.background2,
        width: '88%',
        backgroundColor: COLORS.background2,
        borderRadius: 10,
    },
    submoduleText: {
        fontSize: 14,
        color: COLORS.text,
    },

    container: {
        flex: 1,
        backgroundColor: COLORS.background2,
    },
    title: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
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
        elevation: 5,  // Android shadow
        zIndex: 999,   // Ensure FAB stays on top
        shadowColor: '#000',  // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    scrollView: {
        flex: 1,
        paddingTop: 5,
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
        marginBottom: 35,
        color: COLORS.text,
        textAlign: 'center',
    },
    modalsubTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 15,
        color: COLORS.text,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: COLORS.text,
        borderWidth: 1,
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 25,
        color: COLORS.text,
        backgroundColor: COLORS.background2,
        fontSize: 18,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.text,
        height: 50,
        justifyContent: 'center',
        borderRadius: 15,
        marginBottom: 25,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        backgroundColor: COLORS.background2,
        color: COLORS.text,
    },
    pickerItem: {
        fontSize: 18,
    },
    unsupportedText: {
        color: COLORS.red,
        marginBottom: 25,
        textAlign: 'center',
    },
    warningText: {
        color: COLORS.red,
        marginBottom: 25,
        textAlign: 'center',
    },
    ClosingButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    closeButton: {
        padding: 8,
        backgroundColor: COLORS.red,
        borderRadius: 15,
        alignItems: 'center',
        width: '45%',
        marginHorizontal: '5%',
        marginBottom: 15,
        height: 50,
        justifyContent: 'center',
    },
    saveButton: {
        padding: 8,
        backgroundColor: COLORS.green,
        borderRadius: 15,
        alignItems: 'center',
        width: '45%',
        marginHorizontal: '5%',
        marginBottom: 15,
        height: 50,
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: COLORS.grey,
    },
    ButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    wiesenList: {
        marginTop: 20,
    },
    wieseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginHorizontal: 15,
        marginVertical: 5,
        borderRadius: 10,
        backgroundColor: COLORS.background,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    spacingBottom: {
        marginBottom: 80,
    },

    wieseInfo: {
        flex: 1,
    },
    wieseText: {
        fontSize: 16,
        color: COLORS.text,
    },
    deleteButton: {
        padding: 8,
    },
    addSlaveButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
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
    EICaddTitle: {
        backgroundColor: COLORS.background2,
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
});