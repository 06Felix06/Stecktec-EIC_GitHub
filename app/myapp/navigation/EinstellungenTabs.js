import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ProfilScreen from '../screens/Einstellungen/ProfilScreen';
import WiesenKonfigurationScreen from '../screens/Einstellungen/WiesenKonfigurationScreen';
import HaupteinstellungenScreen from '../screens/Einstellungen/HaupteinstellungenScreen';
import { COLORS } from '../constants/theme';

const TopTab = createMaterialTopTabNavigator();

export default function EinstellungenTabs() {
    return (
        <TopTab.Navigator
            screenOptions={{
                tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
                tabBarStyle: { backgroundColor: COLORS.background },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: 'white',
                tabBarLabelStyle: { fontWeight: '500' },
            }}
        >
            <TopTab.Screen name="Profil" component={ProfilScreen} />
            <TopTab.Screen name="Wiesen Config" component={WiesenKonfigurationScreen} />
            <TopTab.Screen name="Einstellungen" component={HaupteinstellungenScreen} />
        </TopTab.Navigator>
    );
}