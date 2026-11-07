// navigation.js
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import { createStackNavigator } from '@react-navigation/stack';
// import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
// import { TouchableOpacity, View, TextInput, Text, StyleSheet, Image } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import React, { useState } from 'react';

// const COLORS = {
//     primary: '#d00000', // Change this value to update all orange elements
//     background: '#1E1E1E',
//     text: 'white',
//     inactive: 'gray',
// };
// // Dark Theme Configuration
// const DarkTheme = {
//     ...DefaultTheme,
//     dark: true,
//     colors: {
//         ...DefaultTheme.colors,
//         primary: COLORS.primary,
//         background: '#121212',
//         card: '#1E1E1E',
//         text: 'white',
//         border: '#383838',
//     },
// };

// // Screen Components
// function WiesenScreen() { return <View style={styles.container}><Text style={styles.text}>Wiesen Screen</Text></View>; }
// function KarteScreen() { return <View style={styles.container}><Text style={styles.text}>Karte Screen</Text></View>; }
// function EinzellmoduleScreen() { return <View style={styles.container}><Text style={styles.text}>Einzellmodule Screen</Text></View>; }
// function KalenderScreen() { return <View style={styles.container}><Text style={styles.text}>Kalender Screen</Text></View>; }
// function AlarmeScreen() { return <View style={styles.container}><Text style={styles.text}>Alarme Screen</Text></View>; }
// function EinstellungenScreen() { return <View style={styles.container}><Text style={styles.text}>Einstellungen Screen</Text></View>; }
// function AddModuleScreen({ navigation }) {
//     return (
//         <View style={styles.container}>
//             <Text style={styles.text}>Add Module Screen</Text>
//             <TouchableOpacity onPress={() => navigation.goBack()}>
//                 <Text style={{ color: COLORS.primary }}>Go Back</Text>
//             </TouchableOpacity>
//         </View>
//     );
// }

// // New Wiese Tab Screens
// function SensorenScreen() { return <View style={styles.container}><Text style={styles.text}>Sensoren Screen</Text></View>; }
// function ManuellScreen() { return <View style={styles.container}><Text style={styles.text}>Manuell Screen</Text></View>; }
// function AutomatischScreen() { return <View style={styles.container}><Text style={styles.text}>Automatisch Screen</Text></View>; }

// // Header Component
// function CustomHeader({ navigation, route, showSearch, setShowSearch }) {
//     const [searchQuery, setSearchQuery] = useState('');

//     return (
//         <View style={styles.header}>
//             <View style={styles.headerLeft}>
//                 <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
//                     <Ionicons name="search" size={24} color="white" />
//                 </TouchableOpacity>
//             </View>

//             {!showSearch && <Text style={styles.title}>{route.name}</Text>}

//             <View style={styles.headerRight}></View>

//             {showSearch && (
//                 <TextInput
//                     style={styles.searchInput}
//                     placeholder="Search..."
//                     placeholderTextColor="#888"
//                     autoFocus
//                     value={searchQuery}
//                     onChangeText={setSearchQuery}
//                 />
//             )}
//         </View>
//     );
// }

// // Home Tabs Navigator
// function HomeTabs() {
//     const TopTab = createMaterialTopTabNavigator();
//     return (
//         <TopTab.Navigator
//             screenOptions={{
//                 tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
//                 tabBarStyle: { backgroundColor: '#1E1E1E' },
//                 tabBarActiveTintColor: COLORS.primary,
//                 tabBarInactiveTintColor: 'white',
//                 tabBarLabelStyle: { fontWeight: '500', },
//             }}
//         >
//             <TopTab.Screen name="Wiesen" component={WiesenScreen} />
//             <TopTab.Screen name="Karte" component={KarteScreen} />
//             <TopTab.Screen name="Einzellmodule" component={EinzellmoduleScreen} />
//         </TopTab.Navigator>
//     );
// }

// // Wiese Tabs Navigator
// function WieseTabs() {
//     const TopTab = createMaterialTopTabNavigator();
//     return (
//         <TopTab.Navigator
//             screenOptions={{
//                 tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
//                 tabBarStyle: { backgroundColor: '#1E1E1E' },
//                 tabBarActiveTintColor: COLORS.primary,
//                 tabBarInactiveTintColor: 'white',
//                 tabBarLabelStyle: { fontWeight: '500' },
//             }}
//         >
//             <TopTab.Screen name="Automatisch" component={AutomatischScreen} />
//             <TopTab.Screen name="Manuell" component={ManuellScreen} />
//             <TopTab.Screen name="Sensoren" component={SensorenScreen} />
//         </TopTab.Navigator>
//     );
// }

// // Update AusgewahlteWieseScreen to use WieseTabs
// function AusgewahlteWieseScreen() { return <WieseTabs />; }

// // Home Stack Navigator
// const HomeStack = createStackNavigator();
// function HomeStackScreen() {
//     return (
//         <HomeStack.Navigator screenOptions={{ headerShown: false }}>
//             <HomeStack.Screen name="Main" component={HomeTabs} />
//         </HomeStack.Navigator>
//     );
// }

// // Main Tab Navigator
// const Tab = createBottomTabNavigator();
// export default function App() {
//     const [showSearch, setShowSearch] = useState(false);

//     return (
//         <NavigationContainer theme={DarkTheme}>
//             <Tab.Navigator
//                 screenOptions={({ route }) => ({
//                     tabBarIcon: ({ focused }) => {
//                         let iconName;
//                         switch (route.name) {
//                             case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
//                             case 'Wiese': iconName = focused ? 'leaf' : 'leaf-outline'; break;
//                             case 'Kalender': iconName = focused ? 'calendar' : 'calendar-outline'; break;
//                             case 'Alarme': iconName = focused ? 'notifications' : 'notifications-outline'; break;
//                             case 'Einstellungen': iconName = focused ? 'settings' : 'settings-outline'; break;
//                         }
//                         return <Ionicons name={iconName} size={24} color={focused ? COLORS.primary : 'gray'} />;
//                     },
//                     header: ({ navigation }) => (
//                         <CustomHeader
//                             navigation={navigation}
//                             route={route}
//                             showSearch={showSearch}
//                             setShowSearch={setShowSearch}
//                         />
//                     ),
//                     tabBarActiveTintColor: COLORS.primary,
//                     tabBarInactiveTintColor: 'gray',
//                     tabBarStyle: { backgroundColor: '#1E1E1E' },
//                 })}
//             >
//                 <Tab.Screen name="Home" component={HomeStackScreen} />
//                 <Tab.Screen name="Wiese" component={AusgewahlteWieseScreen} />
//                 <Tab.Screen name="Kalender" component={KalenderScreen} />
//                 <Tab.Screen name="Alarme" component={AlarmeScreen} />
//                 <Tab.Screen name="Einstellungen" component={EinstellungenScreen} />
//             </Tab.Navigator>
//         </NavigationContainer>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#121212',
//     },
//     text: {
//         color: 'white',
//         fontSize: 20,
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         height: 80,
//         backgroundColor: '#1E1E1E',
//         paddingHorizontal: 15,
//         paddingTop: 25,
//     },
//     title: {
//         color: 'white',
//         fontSize: 20,
//         fontWeight: 'bold',
//     },
//     headerRight: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 15,
//         marginRight: 15,
//     },
//     headerLeft: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 15,
//     },
//     searchInput: {
//         flex: 1,
//         color: 'white',
//         fontSize: 16,
//         marginLeft: 15,
//     },
// });