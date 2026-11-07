import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth, database, ref, update, onValue, get, set } from '../../context/firebase';
import { COLORS } from '../../constants/theme';

const VALVE_COUNT = 6;

export default function ManuellScreen() {
    const route = useRoute();
    const [wieseData, setWieseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timerInputs, setTimerInputs] = useState(Array(VALVE_COUNT).fill(''));
    const [showTimerInputs, setShowTimerInputs] = useState(Array(VALVE_COUNT).fill(false));

    const valves = wieseData?.valves ? Object.entries(wieseData.valves) : [];
    const initialWiese = route.params?.wiese || {};
    const userEmail = auth.currentUser?.email?.replace(/[@.]/g, '_') || '';

    useEffect(() => {
        let isMounted = true;
        let unsubscribe;

        if (userEmail && initialWiese?.id) {
            const wiesenRef = ref(database, `users/${userEmail}/wiesen`);

            unsubscribe = onValue(wiesenRef, (snapshot) => {
                if (isMounted) {
                    if (snapshot.exists()) {
                        const allWiesen = Object.values(snapshot.val());
                        const foundWiese = allWiesen.find(w => w.id === initialWiese.id);

                        if (foundWiese) {
                            setWieseData({
                                ...foundWiese,
                                valves: foundWiese.valves || Array(VALVE_COUNT).fill({
                                    isOpen: false,
                                    flowDetected: false,
                                    timerEnd: 0
                                })
                            });
                        } else {
                            setError('Wiese nicht gefunden');
                        }
                    } else {
                        setError('Keine Wiesen vorhanden');
                    }
                    setLoading(false);
                }
            }, (error) => {
                console.error("Datenabruf fehlgeschlagen:", error);
                setError('Verbindungsfehler');
                setLoading(false);
            });
        }

        return () => {
            isMounted = false;
            if (unsubscribe) unsubscribe();
        };
    }, [userEmail, initialWiese?.id]);

    const toggleValve = async (valveIndex) => {
        try {
            const wiesenRef = ref(database, `users/${userEmail}/wiesen`);
            const snapshot = await get(wiesenRef);

            if (!snapshot.exists()) {
                console.error("No wiesen found");
                return;
            }

            const wiesenArray = Object.values(snapshot.val());
            const wieseIndex = wiesenArray.findIndex(w => w.id === wieseData.id);

            if (wieseIndex === -1) return;

            const updatedWiesen = [...wiesenArray];
            const updatedWiese = {
                ...updatedWiesen[wieseIndex],
                valves: [...(updatedWiesen[wieseIndex].valves || [])]
            };

            const newIsOpen = !updatedWiese.valves[valveIndex].isOpen;
            updatedWiese.valves[valveIndex].isOpen = newIsOpen;

            if (!newIsOpen) {
                updatedWiese.valves[valveIndex].timerEnd = 0;
            }

            updatedWiesen[wieseIndex] = updatedWiese;
            await set(wiesenRef, updatedWiesen);
        } catch (error) {
            console.error("Valve toggle failed:", error);
        }
    };

    const setValveTimer = async (valveIndex, minutes) => {
        try {
            const minutesNumber = parseInt(minutes, 10);
            if (isNaN(minutesNumber)) { // Fix: Added missing parenthesis
                Alert.alert("Ungültige Eingabe", "Bitte eine Zahl eingeben");
                return;
            }

            const wiesenRef = ref(database, `users/${userEmail}/wiesen`);
            const snapshot = await get(wiesenRef);

            if (!snapshot.exists()) return;

            const wiesenArray = Object.values(snapshot.val());
            const wieseIndex = wiesenArray.findIndex(w => w.id === wieseData.id);

            if (wieseIndex === -1) return;

            const updatedWiesen = [...wiesenArray];
            const updatedWiese = {
                ...updatedWiesen[wieseIndex],
                valves: [...(updatedWiesen[wieseIndex].valves || [])]
            };

            updatedWiese.valves[valveIndex] = {
                ...updatedWiese.valves[valveIndex],
                isOpen: true,
                timerEnd: Date.now() + (minutesNumber * 60000)
            };

            updatedWiesen[wieseIndex] = updatedWiese;
            await set(wiesenRef, updatedWiesen);
        } catch (error) {
            console.error("Timer set failed:", error);
            Alert.alert("Fehler", "Timer konnte nicht gesetzt werden");
        }
    };

    const renderValve = (valveId) => {
        const valve = wieseData?.valves?.[valveId] || {};
        const remainingTime = valve.timerEnd ? Math.max(0, valve.timerEnd - Date.now()) : 0;
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);

        return (
            <View key={valveId} style={styles.valveContainer}>
                <Text style={styles.valveTitle}>Ventil {valveId + 1}</Text>

                <View style={styles.statusRow}>
                    <Ionicons
                        name={valve.flowDetected ? "water" : "water-outline"}
                        size={24}
                        color={valve.flowDetected ? COLORS.primary : COLORS.grey}
                    />
                    <Text style={styles.statusText}>
                        {valve.isOpen
                            ? valve.timerEnd > 0
                                ? `Aktiv (${minutes}:${seconds.toString().padStart(2, '0')})`
                                : 'Aktiv'
                            : 'Inaktiv'}
                    </Text>
                </View>

                {valve.isOpen ? (
                    <TouchableOpacity
                        style={[styles.button, styles.stopButton]}
                        onPress={() => toggleValve(valveId)}
                    >
                        <Text style={styles.buttonText}>STOPPEN</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        {showTimerInputs[valveId] && (
                            <TextInput
                                style={styles.timerInput}
                                placeholder="Minuten"
                                keyboardType="numeric"
                                value={timerInputs[valveId]}
                                onChangeText={(text) => setTimerInputs({
                                    ...timerInputs,
                                    [valveId]: text.replace(/[^0-9]/g, '')
                                })}
                            />
                        )}

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.startButton]}
                                onPress={async () => {
                                    await toggleValve(valveId);
                                    setShowTimerInputs(prev => {
                                        const newState = [...prev];
                                        newState[valveId] = false;
                                        return newState;
                                    });
                                }}
                            >
                                <Text style={styles.buttonText}>STARTEN</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.timerButton]}
                                onPress={async () => {
                                    if (showTimerInputs[valveId]) {
                                        if (!timerInputs[valveId] || isNaN(timerInputs[valveId])) {
                                            Alert.alert("Fehler", "Bitte gültige Minuten eingeben");
                                            return;
                                        }
                                        await setValveTimer(valveId, timerInputs[valveId]);
                                    }
                                    setShowTimerInputs(prev => {
                                        const newState = [...prev];
                                        newState[valveId] = !newState[valveId];
                                        return newState;
                                    });
                                }}
                            >
                                <Text style={styles.buttonText}>
                                    {showTimerInputs[valveId] ? 'TIMER STARTEN' : 'MIT TIMER'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={40} color={COLORS.red} />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>{wieseData?.name || 'Unbenannte Wiese'}</Text>
            {Array.from({ length: VALVE_COUNT }).map((_, i) => renderValve(i))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: COLORS.background2,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: COLORS.text,
    },
    valveContainer: {
        backgroundColor: COLORS.background,
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
    },
    valveTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    statusText: {
        fontSize: 16,
        color: COLORS.text,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: COLORS.green,
    },
    timerButton: {
        backgroundColor: COLORS.blue,
    },
    stopButton: {
        backgroundColor: COLORS.red,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    timerInput: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 8,
        color: COLORS.text,
        marginBottom: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: COLORS.red,
        fontSize: 18,
        marginTop: 10,
        textAlign: 'center',
    },
});