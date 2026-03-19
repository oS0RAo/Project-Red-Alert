import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, Dimensions, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../_layout';

export default function DashboardScreen() {
  const { sensors } = useContext(AppContext);
  const { userProfile } = useContext(AppContext);
  
  const [activeTab, setActiveTab] = useState(sensors[0]?.id || null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (sensors.length > 0 && !sensors.find((s: any) => s.id === activeTab)) {
      setActiveTab(sensors[0].id);
    }
  }, [sensors, activeTab]);

  const currentSensor = sensors.length > 0 ? (sensors.find((s: any) => s.id === activeTab) || sensors[0]) : null;

  useEffect(() => {
    if (currentSensor?.status === 'Danger') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [currentSensor?.status, pulseAnim]);

  const handleEmergencyCall = () => {
    const phone = userProfile.emergencyPhone || '199';
    Linking.openURL(`tel:${phone}`);
  };

  if (!sensors || sensors.length === 0 || !currentSensor) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="hardware-chip-outline" size={80} color="#333" />
        <Text style={{ color: '#888', fontSize: 18, marginTop: 15, textAlign: 'center' }}>No connected devices.{"\n"}Please add a sensor in the Settings tab.</Text>
      </View>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Normal': return { color: '#2ecc71', icon: 'shield-checkmark', text: 'SAFE & CLEAR' };
      case 'Cooking': return { color: '#f1c40f', icon: 'restaurant', text: 'COOKING SMOKE' };
      case 'Danger': return { color: '#ff4444', icon: 'warning', text: 'FIRE / GAS LEAK' };
      case 'Waiting': return { color: '#3498db', icon: 'sync', text: 'NO DATA' };
      default: return { color: '#888', icon: 'help-circle', text: 'UNKNOWN' };
    }
  };

  const statusConfig = getStatusConfig(currentSensor.status);
  
  // เช็คว่าเป็นสถานะรอข้อมูลไหม
  const isWaiting = currentSensor.status === 'Waiting';

  return (
    <View style={styles.container}>
      <View style={styles.roomSelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roomScroll}>
          {sensors.map((sensor: any) => (
            <TouchableOpacity key={sensor.id} style={[styles.roomTab, activeTab === sensor.id && styles.roomTabActive, sensor.status === 'Danger' && { borderColor: '#ff4444', borderWidth: 1 }]} onPress={() => setActiveTab(sensor.id)}>
              <Text style={[styles.roomTabText, activeTab === sensor.id && styles.roomTabTextActive]}>{sensor.name}</Text>
              {sensor.status === 'Danger' && <View style={styles.dangerDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statusSection}>
          <Animated.View style={[styles.statusCircle, { borderColor: statusConfig.color, shadowColor: statusConfig.color }, currentSensor.status === 'Danger' && { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name={statusConfig.icon as any} size={60} color={statusConfig.color} />
            <Text style={[styles.statusMainText, { color: statusConfig.color }]}>{statusConfig.text}</Text>
            <Text style={styles.statusSubText}>AI Classification</Text>
          </Animated.View>
        </View>

        <View style={styles.dataGrid}>
          {/* อุณหภูมิ */}
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}><Ionicons name="thermometer" size={20} color={isWaiting ? '#666' : '#ff7675'} /><Text style={styles.cardTitle}>Temperature</Text></View>
            <Text style={styles.dataValue}>{isWaiting ? '-- ' : currentSensor.temp}<Text style={styles.dataUnit}>°C</Text></Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { 
                width: `${isWaiting ? 0 : Math.min(currentSensor.temp * 1.5, 100)}%`, 
                backgroundColor: currentSensor.temp > 50 && !isWaiting ? '#ff4444' : '#2ecc71' 
              }]} />
            </View>
          </View>

          {/* แก๊ส */}
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}><Ionicons name="cloud-outline" size={20} color={isWaiting ? '#666' : '#74b9ff'} /><Text style={styles.cardTitle}>Gas Level</Text></View>
            <Text style={styles.dataValue}>{isWaiting ? '-- ' : currentSensor.gas}<Text style={styles.dataUnit}> PPM</Text></Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { 
                width: `${isWaiting ? 0 : Math.min(currentSensor.gas / 10, 100)}%`, 
                backgroundColor: currentSensor.gas > 400 && !isWaiting ? '#ff4444' : '#2ecc71' 
              }]} />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
          <Ionicons name="call" size={24} color="#fff" />
          <Text style={styles.emergencyText}>CALL EMERGENCY ({userProfile.emergencyPhone})</Text>
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
  dataGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 }, 
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