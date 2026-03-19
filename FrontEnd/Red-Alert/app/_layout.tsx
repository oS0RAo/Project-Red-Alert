import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useState } from 'react';

export const AppContext = createContext<any>(null);

export default function RootLayout() {
  const [userProfile, setUserProfile] = useState({ 
    name: '', 
    email: '', 
    emergencyPhone: '', 
    pushNotify: false 
  });
  const [houses, setHouses] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [logs, setLogs] = useState([]);

  return (
    <AppContext.Provider value={{ userProfile, setUserProfile, houses, setHouses, sensors, setSensors, logs, setLogs }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" /> {/* หน้า Login */}
        <Stack.Screen name="signup" /> {/* หน้า Sign Up */}
        <Stack.Screen name="houses" /> {/* หน้า เลือกบ้าน */}
        <Stack.Screen name="(tabs)" />  {/* หน้าที่อยู่ใน Tab Bar */}
      </Stack>
    </AppContext.Provider>
  );
}