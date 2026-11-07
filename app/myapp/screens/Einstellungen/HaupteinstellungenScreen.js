import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function HaupteinstellungenScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Haupteinstellungen Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background2,
    },
    text: {
        color: COLORS.text,
        fontSize: 20,
    },
});