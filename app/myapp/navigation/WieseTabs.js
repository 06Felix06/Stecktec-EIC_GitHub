import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SensorenScreen from '../screens/Wiese/SensorenScreen';
import VentilKonfigurationScreen from '../screens/Wiese/VentilKonfigurationScreen';
import ManuellScreen from '../screens/Wiese/ManuellScreen';
import AutomatischScreen from '../screens/Wiese/AutomatischScreen';
import { COLORS } from '../constants/theme';

const TopTab = createMaterialTopTabNavigator();

export default function WieseTabs() {
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
            <TopTab.Screen name="Automatic" component={AutomatischScreen} />
            <TopTab.Screen name="Manuell" component={ManuellScreen} />
            <TopTab.Screen name="Sensoren" component={SensorenScreen} />
            <TopTab.Screen name="Config" component={VentilKonfigurationScreen} />
        </TopTab.Navigator>
    );
}