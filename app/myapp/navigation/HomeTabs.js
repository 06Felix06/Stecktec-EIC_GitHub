import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import WiesenScreen from '../screens/Home/WiesenScreen';
import KarteScreen from '../screens/Home/KarteScreen';
import EinzellmoduleScreen from '../screens/Home/EinzellmoduleScreen';
import { COLORS } from '../constants/theme';

const TopTab = createMaterialTopTabNavigator();

export default function HomeTabs() {
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
            <TopTab.Screen name="Wiesen" component={WiesenScreen} />
            <TopTab.Screen name="Karte" component={KarteScreen} />
            {/* <TopTab.Screen name="Einzellmodule" component={EinzellmoduleScreen} /> */}
        </TopTab.Navigator>
    );
}