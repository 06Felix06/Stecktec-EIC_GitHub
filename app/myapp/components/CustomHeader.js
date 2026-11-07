import React, { useState } from 'react';
import { TouchableOpacity, View, TextInput, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/theme';

export default function CustomHeader({ navigation, route, showSearch, setShowSearch }) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <View style={styles.header}>

            {/* {!showSearch && <Text style={styles.title}>{route.name}</Text>} */}

            {showSearch && (
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor="#888"
                    autoFocus
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    text: {
        color: 'white',
        fontSize: 20,
    },
    header: {
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 80,
        backgroundColor: COLORS.background,
        paddingHorizontal: 15,
        paddingTop: 30,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginRight: 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        marginLeft: 15,
    },
});