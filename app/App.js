import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { DarkTheme } from './myapp/constants/theme';
import { AuthProvider } from './myapp/context/AuthContext';
import AppNavigation from './myapp/navigation'; // Import AppNavigation

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer theme={DarkTheme}>
                <AppNavigation />
            </NavigationContainer>
        </AuthProvider>
    );
}