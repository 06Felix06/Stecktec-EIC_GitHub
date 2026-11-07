import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/theme';
import { auth, database, ref, get } from '../../context/firebase';
import { useNavigation } from '@react-navigation/native';
import ManuellScreen from '../Wiese/ManuellScreen';

export default function Wiesenscreen() {
    const [wiesenArray, setWiesenArray] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get sanitized user email for Firebase path
    const userEmail = auth.currentUser?.email?.replace(/[@.]/g, '_');
    const navigation = useNavigation();

    // Load wiesenArray from Firebase
    useEffect(() => {
        const loadData = async () => {
            try {
                if (!userEmail) return;

                const wiesenRef = ref(database, `users/${userEmail}/wiesen`);
                const snapshot = await get(wiesenRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const formattedData = Object.values(data).map(wiese => ({
                        ...wiese,
                        isIrrigating: wiese.isIrrigating || false,
                        hasProblem: wiese.hasProblem || false,
                        submodules: wiese.submodules?.map(sub => ({
                            ...sub,
                            isIrrigating: sub.isIrrigating || false,
                            hasProblem: sub.hasProblem || false,
                        })) || []
                    }));
                    setWiesenArray(formattedData);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error loading data:", err);
                setError("Daten konnten nicht geladen werden");
                setLoading(false);
            }
        };

        // Run immediately on mount and then every second
        const intervalId = setInterval(loadData, 1000);

        // Cleanup function to clear interval
        return () => clearInterval(intervalId);
    }, [userEmail]);  // Dependency array ensures new interval when userEmail changes

    const renderWieseItem = ({ item }) => (
        <TouchableOpacity
            style={styles.wieseContainer}
            onPress={() => navigation.navigate('Wiese', {
                screen: 'Manuell',
                params: { wiese: item },
            })}>
            <View style={styles.wieseHeader}>
                <Text style={styles.wieseName}>{item.name}</Text>
                <View style={styles.statusIcons}>
                    <Ionicons
                        name="water-outline"
                        size={24}
                        color={item.isIrrigating ? COLORS.primary : COLORS.grey}
                        style={styles.icon}
                    />
                    <Ionicons
                        name="alert-circle-outline"
                        size={24}
                        color={item.hasProblem ? COLORS.red : COLORS.grey}
                        style={styles.icon}
                    />
                </View>
            </View>

            {/* Submodules */}
            {item.submodules?.map(submodule => (
                <View
                    key={submodule.id}
                    style={styles.submoduleContainer}
                >
                    <Text style={styles.submoduleName}>{submodule.name}</Text>
                    <View style={styles.statusIcons}>
                        <Ionicons
                            name="water-outline"
                            size={20}
                            color={submodule.isIrrigating ? COLORS.primary : COLORS.grey}
                            style={styles.icon}
                        />
                        <Ionicons
                            name="alert-circle-outline"
                            size={20}
                            color={submodule.hasProblem ? COLORS.red : COLORS.grey}
                            style={styles.icon}
                        />
                    </View>
                </View>
            ))}
        </TouchableOpacity>
    );

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
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {wiesenArray.length > 0 ? (
                <FlatList
                    data={wiesenArray}
                    renderItem={renderWieseItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <Text style={styles.emptyText}>Keine Wiesen angelegt</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background2,
        paddingHorizontal: 16,
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
    },
    errorText: {
        color: COLORS.red,
        fontSize: 16,
    },
    listContent: {
        paddingVertical: 16,
    },
    wieseContainer: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    wieseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    wieseName: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '600',
    },
    statusIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginLeft: 12,
    },
    submoduleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.background2,
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    submoduleName: {
        color: COLORS.text,
        fontSize: 14,
        marginLeft: 8,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 16,
        textAlign: 'center',
    },
});