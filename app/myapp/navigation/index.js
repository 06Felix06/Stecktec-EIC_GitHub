import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { auth } from '../context/firebase';
import AuthNavigator from './AuthNavigator';
import { registerRootComponent } from 'expo';
import MainTabNavigator from './MainTabNavigator'; // Ensure this import exists

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const subscriber = auth.onAuthStateChanged(currentUser => {
            setUser(currentUser);
            if (initializing) setInitializing(false);
        });
        return subscriber;
    }, []);

    if (initializing) return null;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <Stack.Screen name="Main" component={MainTabNavigator} />
            ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
        </Stack.Navigator>
    );
}