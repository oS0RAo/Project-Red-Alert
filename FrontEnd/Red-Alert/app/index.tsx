import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
import { StatusBar } from 'expo-status-bar';

import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GuideScreen from '../screens/Guide';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: { 
            backgroundColor: '#1e1e1e', 
            borderTopColor: '#333',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8
          },
          tabBarActiveTintColor: '#ff4444', 
          tabBarInactiveTintColor: '#888',
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#fff',
          
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'flame' : 'flame-outline';
            } else if (route.name === 'History') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'Guide') {
              iconName = focused ? 'book' : 'book-outline'; 
            } else {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            return <Ionicons name={iconName || 'help-circle'} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: 'Red Alert Sentinel' }} 
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{ title: 'Event Logs' }} 
        />
        <Tab.Screen 
          name="Guide" 
          component={GuideScreen} 
          options={{ title: 'User Manual' }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'System Config' }} 
        />
      </Tab.Navigator>
    </>
  );
}