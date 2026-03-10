import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />       {/* หน้า Login */}
        <Stack.Screen name="signup" />      {/* หน้า Sign Up */}
        <Stack.Screen name="houses" />      {/* หน้า เลือกบ้าน */}
        <Stack.Screen name="(tabs)" />      {/* หน้าที่อยู่ใน Tab Bar */}
      </Stack>
    </>
  );
}