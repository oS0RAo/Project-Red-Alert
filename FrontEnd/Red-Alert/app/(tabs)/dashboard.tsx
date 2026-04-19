import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, Dimensions, Linking, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../_layout';
import { useGlobalSearchParams } from 'expo-router';
import { apiClient } from '../../src/api/client';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// ตั้งค่าให้การแจ้งเตือนทำงานแม้เปิดแอปอยู่
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ฟังก์ชันสำหรับดึง Token และส่งให้ Backend
async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('ไม่ได้รับอนุญาตให้ส่งแจ้งเตือน');
      return;
    }

    // ดึง Project ID จาก app.json
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    
    if (!projectId) {
      console.log('ไม่พบ Project ID Token อาจ error ได้');
    }

    try {
      // ขอ Token จาก Expo
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenData.data;
      console.log("ได้ Token มาแล้ว:", token);

      // ยิง API เอา Token ไปเซฟใน Backend
      await apiClient.put('/user/push-token', { expoPushToken: token });
      console.log("ส่ง Token ให้ Backend เรียบร้อย");

    } catch (error: any) {
      console.log("=============================");
      console.log("ยิงไปที่ URL:", error.config?.baseURL + error.config?.url);
      
      if (error.response) {
        // ถ้าหลังบ้านตอบกลับมา (แต่เป็น Error)
        console.log("หลังบ้านตอบกลับมาว่า (Status):", error.response.status);
        console.log("ข้อความจากหลังบ้าน:", error.response.data);
      } else {
        // ถ้าหาหลังบ้านไม่เจอเลย หรือเน็ตหลุด
        console.log("ติดต่อหลังบ้านไม่ได้ (Error):", error.message);
      }
      console.log("=============================");
    }
  } else {
    console.log('ห้ามใช้ Emu ในการทดสอบ Push Notification');
  }
}

export default function DashboardScreen() {
  const { userProfile } = useContext(AppContext);
  const { houseId } = useGlobalSearchParams(); 
  
  const [sensors, setSensors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  // ขอสิทธิ์และดึง Token การแจ้งเตือนตอนเปิดหน้าจอ
  useEffect(() => {
    // เรียกใช้ฟังก์ชันดึง Token ที่เราสร้างไว้
    registerForPushNotificationsAsync();
  }, []);

  // ดึงข้อมูลเซนเซอร์จาก Backend
  const fetchSensors = async () => {
    if (!houseId) return;
    
    try {
      const response = await apiClient.get(`/houses/${houseId}/sensors`);
      console.log("📝 ข้อมูลที่แอปได้รับ:", response.data);
      setSensors(response.data);
      
      // ถ้ายังไม่มีการเลือก Tab ให้เลือกอันแรกอัตโนมัติ
      if (response.data.length > 0 && !activeTab) {
        setActiveTab(response.data[0].id);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error("Session expired, please login again");
      }
      console.error("Fetch sensors error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ดึงข้อมูลตอนเปิดหน้า และตั้ง Refresh ไว้ทุกๆ 5 วินาที
  useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 5000); 
    return () => clearInterval(interval);
  }, [houseId]);

  const currentSensor = sensors.find((s: any) => s.id === activeTab) || null;

  // เช็คว่ามีอันตรายหรือไม่
  const isDanger = currentSensor?.status === 'fire' || currentSensor?.status === 'gasleak';

  // จัดการ Animation
  useEffect(() => {
    if (isDanger) {
      // เล่น Animation เต้นตุบๆ
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    } else {
      // หยุดและเคลียร์ Animation เมื่อกลับมาสถานะปกติ
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isDanger, pulseAnim]);

  const handleEmergencyCall = () => {
    const phone = userProfile?.emergencyPhone || '199';
    Linking.openURL(`tel:${phone}`);
  };

  if (isLoading && sensors.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ff4444" />
        <Text style={{ color: '#888', marginTop: 10 }}>Loading sensors...</Text>
      </View>
    );
  }

  if (!sensors || sensors.length === 0 || !currentSensor) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="hardware-chip-outline" size={80} color="#333" />
        <Text style={{ color: '#888', fontSize: 18, marginTop: 15, textAlign: 'center' }}>No connected devices.{"\n"}Please add a sensor in the Settings tab.</Text>
      </View>
    );
  }

  // รับค่า Status จาก AI
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'normal':
      case 'online':
      case 'active': return { color: '#2ecc71', icon: 'shield-checkmark', text: 'SAFE & CLEAR' };
      case 'cooking': return { color: '#f1c40f', icon: 'restaurant', text: 'COOKING SMOKE' };
      case 'fire': return { color: '#ff4444', icon: 'flame', text: 'FIRE DETECTED' };
      case 'gasleak': return { color: '#ff4444', icon: 'warning', text: 'GAS LEAK' };
      case 'waiting': return { color: '#3498db', icon: 'sync', text: 'NO DATA' };
      default: return { color: '#888', icon: 'help-circle', text: 'UNKNOWN' };
    }
  };

  const statusConfig = getStatusConfig(currentSensor.status);
  const isWaiting = currentSensor.status?.toLowerCase() === 'waiting';

  const tempValue = currentSensor.temp || 0;
  const gasValue = currentSensor.gasValue || 0;
  const humValue = currentSensor.humidity || 0; 

  return (
    <View style={styles.container}>
      <View style={styles.roomSelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roomScroll}>
          {sensors.map((sensor: any) => {
            const isTabDanger = sensor.status === 'fire' || sensor.status === 'gasleak';
            return (
              <TouchableOpacity key={sensor.id} style={[styles.roomTab, activeTab === sensor.id && styles.roomTabActive, isTabDanger && { borderColor: '#ff4444', borderWidth: 1 }]} onPress={() => setActiveTab(sensor.id)}>
                <Text style={[styles.roomTabText, activeTab === sensor.id && styles.roomTabTextActive]}>{sensor.name}</Text>
                {isTabDanger && <View style={styles.dangerDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statusSection}>
          <Animated.View style={[styles.statusCircle, { borderColor: statusConfig.color, shadowColor: statusConfig.color }, isDanger && { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name={statusConfig.icon as any} size={60} color={statusConfig.color} />
            <Text style={[styles.statusMainText, { color: statusConfig.color }]}>{statusConfig.text}</Text>
            <Text style={styles.statusSubText}>System Status</Text>
          </Animated.View>
        </View>

        <View style={styles.dataGrid}>
          {/* อุณหภูมิ */}
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}><Ionicons name="thermometer" size={20} color={isWaiting ? '#666' : '#ff7675'} /><Text style={styles.cardTitle}>Temperature</Text></View>
            <Text style={styles.dataValue}>{isWaiting ? '-- ' : tempValue}<Text style={styles.dataUnit}>°C</Text></Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { 
                width: `${isWaiting ? 0 : Math.min(tempValue * 1.5, 100)}%`, 
                backgroundColor: tempValue > 50 && !isWaiting ? '#ff4444' : '#2ecc71' 
              }]} />
            </View>
          </View>

          {/* แก๊ส/ควัน */}
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}><Ionicons name="cloud-outline" size={20} color={isWaiting ? '#666' : '#74b9ff'} /><Text style={styles.cardTitle}>Gas/Smoke</Text></View>
            <Text style={styles.dataValue}>{isWaiting ? '-- ' : gasValue}<Text style={styles.dataUnit}> PPM</Text></Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { 
                width: `${isWaiting ? 0 : Math.min(gasValue / 10, 100)}%`, 
                backgroundColor: gasValue > 400 && !isWaiting ? '#ff4444' : '#2ecc71' 
              }]} />
            </View>
          </View>
        </View>

        {/* ความชื้น */}
        <View style={[styles.dataCard, { width: '100%', marginBottom: 40 }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="water-outline" size={20} color={isWaiting ? '#666' : '#0984e3'} />
            <Text style={styles.cardTitle}>Humidity (ความชื้น)</Text>
          </View>
          <Text style={styles.dataValue}>{isWaiting ? '-- ' : humValue}<Text style={styles.dataUnit}> %</Text></Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { 
              width: `${isWaiting ? 0 : Math.min(humValue, 100)}%`, 
              backgroundColor: '#0984e3'
            }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
          <Ionicons name="call" size={24} color="#fff" />
          <Text style={styles.emergencyText}>CALL EMERGENCY</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  roomSelectorContainer: { height: 60, borderBottomWidth: 1, borderBottomColor: '#222', justifyContent: 'center' },
  roomScroll: { paddingHorizontal: 15, alignItems: 'center' },
  roomTab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e1e1e', marginRight: 10, flexDirection: 'row', alignItems: 'center' },
  roomTabActive: { backgroundColor: '#333' },
  roomTabText: { color: '#888', fontWeight: 'bold' },
  roomTabTextActive: { color: '#fff' },
  dangerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff4444', marginLeft: 6 },
  statusSection: { alignItems: 'center', marginVertical: 30 },
  statusCircle: { width: 200, height: 200, borderRadius: 100, borderWidth: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 },
  statusMainText: { fontSize: 20, fontWeight: '900', marginTop: 10, letterSpacing: 1 },
  statusSubText: { color: '#666', fontSize: 12, marginTop: 5 },
  dataGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dataCard: { backgroundColor: '#1e1e1e', width: (width - 55) / 2, padding: 15, borderRadius: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardTitle: { color: '#aaa', marginLeft: 8, fontSize: 14, fontWeight: 'bold' },
  dataValue: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  dataUnit: { fontSize: 16, color: '#888' },
  progressBarBg: { height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  emergencyButton: { backgroundColor: '#ff4444', borderRadius: 15, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#ff4444', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  emergencyText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10, letterSpacing: 1 },
});