import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const getGermanDayName = (date) => {
    return date.toLocaleString('de-DE', { weekday: 'long' });
};

const getGermanDate = (date) => {
    return date.toLocaleString('de-DE', { day: 'numeric', month: 'long' });
};

const KalenderScreen = () => {
    const [currentDate] = useState(new Date());

    // Calculate available height
    const screenHeight = Dimensions.get('window').height;
    const headerHeight = 50;
    const navbarHeight = 70;
    const availableHeight = screenHeight - headerHeight - navbarHeight;
    const dayHeight = availableHeight / 7; // Divide available height by 7 days

    // Generate one week starting from today
    const generateDateRange = () => {
        const daysArray = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(currentDate.getDate() + i);
            daysArray.push(date);
        }
        return daysArray;
    };

    const isToday = (date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const renderDates = () => {
        const dateRange = generateDateRange();
        return dateRange.map((date, index) => {
            const dayName = getGermanDayName(date);
            const germanDate = getGermanDate(date);
            const isCurrentDay = isToday(date);

            return (
                <View
                    key={index}
                    style={[
                        styles.dateContainer,
                        isCurrentDay && styles.currentDayContainer,
                        { height: dayHeight }, // Set height dynamically
                    ]}
                >
                    <Text style={styles.dateTitle}>
                        {dayName}, {germanDate}
                    </Text>
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>Keine Bewässerungszyklen eingetragen</Text>
                    </View>
                </View>
            );
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {renderDates()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background2,
    },
    scrollContainer: {
        width: '100%',
    },
    dateContainer: {
        width: '100%',
        paddingVertical: 10,
        paddingLeft: 20,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.border,

    },
    currentDayContainer: {
        backgroundColor: 'rgba(255,0,0,0.15)',
    },
    dateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: 14,
        color: COLORS.grey,
    },
});

export default KalenderScreen;