import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { COLORS } from '../../constants/theme';

const ProfileScreen = () => {
    const { user, logout } = useAuth(); // Get user and logout function from AuthContext

    const handleLogout = async () => {
        try {
            await logout(); // Call logout function
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            {/* Display logged-in user's email */}
            {user && (
                <View style={styles.userInfo}>
                    <Text style={styles.label}>Logged in as:</Text>
                    <Text style={styles.email}>{user.email}</Text>
                </View>
            )}

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background2,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 20,
    },
    userInfo: {
        marginBottom: 30,
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        color: COLORS.grey,
        marginBottom: 5,
    },
    email: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    logoutButton: {
        backgroundColor: COLORS.red,
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ProfileScreen;