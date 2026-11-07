import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/theme';
import HomeTabs from './HomeTabs';
import WieseTabs from './WieseTabs';
import EinstellungenTabs from './EinstellungenTabs';
import KalenderScreen from '../screens/KalenderScreen';
import AlarmeScreen from '../screens/AlarmeScreen';
import CustomHeader from '../components/CustomHeader';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
    const [showSearch, setShowSearch] = useState(false);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => {
                    let iconName;
                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Wiese':
                            iconName = focused ? 'leaf' : 'leaf-outline';
                            break;
                        case 'Kalender':
                            iconName = focused ? 'calendar' : 'calendar-outline';
                            break;
                        case 'Alarme':
                            iconName = focused ? 'notifications' : 'notifications-outline';
                            break;
                        case 'Einstellungen':
                            iconName = focused ? 'settings' : 'settings-outline';
                            break;
                    }
                    return <Ionicons
                        name={iconName}
                        size={24}
                        color={focused ? COLORS.primary : 'gray'}
                    />;
                },
                header: ({ navigation, route }) => (
                    <CustomHeader
                        navigation={navigation}
                        route={route}
                        showSearch={showSearch}
                        setShowSearch={setShowSearch}
                    />
                ),
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: COLORS.background,
                    borderColor: COLORS.background,
                    height: 70,
                    paddingTop: 10,
                },
                // Add this to prevent header showing on login screen
                headerShown: route.name !== 'Login' // Add your login screen name if different
            })}
        >
            {/* Keep existing tabs */}
            <Tab.Screen name="Home" component={HomeTabs} />
            <Tab.Screen name="Wiese" component={WieseTabs} />
            <Tab.Screen name="Kalender" component={KalenderScreen} />
            <Tab.Screen name="Alarme" component={AlarmeScreen} />
            <Tab.Screen name="Einstellungen" component={EinstellungenTabs} />
        </Tab.Navigator>
    );
}