import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS } from '../../constants/theme';
import { auth, database, ref, onValue } from '../../context/firebase';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const CHART_HEIGHT = 220;
const MAX_DATA_POINTS = 60;

export default function SensorenScreen() {
    const [sensorData, setSensorData] = useState({
        soilMoisture: [],
        temperature: [],
        airHumidity: [],
        timestamps: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const sensorRef = ref(database, 'users/felix_johann_steck_gmail_com/wiesen/1/submodules/0');
        const unsubscribe = onValue(sensorRef,
            (snapshot) => handleData(snapshot),
            (error) => handleError(error)
        );

        return () => unsubscribe();
    }, []);

    const handleData = (snapshot) => {
        try {
            if (!snapshot.exists()) {
                setError('Keine Sensordaten vorhanden');
                setLoading(false);
                return;
            }

            const rawData = snapshot.val();
            console.log('New sensor reading:', rawData);
            processSensorData(rawData);
            setError('');
            setLoading(false);
        } catch (err) {
            handleError(err);
        }
    };

    const processSensorData = (newData) => {
        const validatedData = {
            soilMoisture: validateNumber(newData.soilMoisture, 0, 1023),
            temperature: validateNumber(newData.temperature, -20, 60),
            airHumidity: validateNumber(newData.airHumidity, 0, 100),
            timestamp: validateTimestamp(newData.timestamp)
        };

        setSensorData(prev => ({
            soilMoisture: [...prev.soilMoisture.slice(-MAX_DATA_POINTS + 1), validatedData.soilMoisture],
            temperature: [...prev.temperature.slice(-MAX_DATA_POINTS + 1), validatedData.temperature],
            airHumidity: [...prev.airHumidity.slice(-MAX_DATA_POINTS + 1), validatedData.airHumidity],
            timestamps: [...prev.timestamps.slice(-MAX_DATA_POINTS + 1), formatTime(validatedData.timestamp - 7200000)]
        }));
    };

    const validateNumber = (value, min, max) => {
        const num = Number(value);
        return typeof num === 'number' && !isNaN(num) && num >= min && num <= max ? num : 0;
    };

    const validateTimestamp = (timestamp) => {
        const ts = Number(timestamp);
        return !isNaN(ts) && ts > 0 ? ts : Date.now();
    };

    const formatTime = (timestamp) => {
        try {
            const numericTimestamp = Number(timestamp);
            if (isNaN(numericTimestamp)) {
                console.warn("Oha, des isch kan gueltiga Zeitstempel", timestamp);
                return "--:--";
            }

            // Verwende echte Südtiroler Zeit (automatisch mit Sommerzeit)
            const date = new Date(numericTimestamp);
            return date.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Europe/Berlin" // Wichtig: Europa/Berlin inkl. Sommerzeit
            });
        } catch (error) {
            console.error("Zeitumstellung håt nit klappt:", error);
            return "--:--";
        }
    };

    const chartConfig = {
        backgroundColor: COLORS.background2,
        backgroundGradientFrom: COLORS.background2,
        backgroundGradientTo: COLORS.background,
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        propsForDots: { r: 4, strokeWidth: 2, stroke: COLORS.primary },
        propsForLabels: { fontSize: 10 },
        formatXLabel: (value) => {
            const index = sensorData.timestamps.indexOf(value);
            return index % 5 === 0 ? value : '';
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.header}>Sensor Data - Heute</Text>

            <ChartSection
                title="Bodenfeuchtigkeit (0-1023)"
                data={sensorData.soilMoisture}
                labels={sensorData.timestamps}
                chartConfig={chartConfig}
                ySuffix="" // Remove percentage suffix
            />

            <ChartSection
                title="Temperatur (°C)"
                data={sensorData.temperature}
                labels={sensorData.timestamps}
                chartConfig={chartConfig}
                ySuffix="°C"
            />

            <ChartSection
                title="Luftfeuchtigkeit (%)"
                data={sensorData.airHumidity}
                labels={sensorData.timestamps}
                chartConfig={chartConfig}
                ySuffix="%"
            />
        </ScrollView>
    );
}

const ChartSection = ({ title, data, labels, chartConfig, ySuffix }) => (
    <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        {data.length > 0 ? (
            <LineChart
                data={{ labels, datasets: [{ data }] }}
                width={screenWidth - 32}
                height={CHART_HEIGHT}
                chartConfig={chartConfig}
                bezier
                withDots={data.length < 20}
                withVerticalLines={false}
                yAxisSuffix={ySuffix}
                style={styles.chart}
                fromZero={title.includes('Bodenfeuchtigkeit')}
            />
        ) : (
            <Text style={styles.noDataText}>Keine Daten verfügbar</Text>
        )}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background2,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background2,
    },
    header: {
        color: COLORS.text,
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    chartContainer: {
        marginBottom: 24,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
        elevation: 2,
    },
    chartTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    chart: {
        borderRadius: 8,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 16,
        textAlign: 'center',
        margin: 24,
        lineHeight: 24,
    },
    noDataText: {
        color: COLORS.text,
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 14
    }
});