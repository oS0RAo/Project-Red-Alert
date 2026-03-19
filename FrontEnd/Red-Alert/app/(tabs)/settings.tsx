import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../_layout';

export default function SettingsScreen() {
  const { sensors, setSensors, logs, setLogs } = useContext(AppContext);

  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [formData, setFormData] = useState({ id: '', name: '' });

  const handleDelete = (id: string) => {
    Alert.alert('ยืนยันการลบ', 'ต้องการลบเซนเซอร์นี้ใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => {
        // หาชื่อเซนเซอร์ที่จะโดนลบ
        const sensorName = sensors.find((s:any) => s.id === id)?.name || 'Unknown';
        setSensors(sensors.filter((s: any) => s.id !== id));
        
        // บันทึกประวัติการลบลงไปใน Log นำไปต่อหน้าข้อมูลเก่า
        const newLog = {
          id: Date.now().toString(), type: 'info', title: 'Sensor Removed', 
          room: sensorName, timestamp: new Date().toLocaleTimeString(), 
          details: `Device ID ${id} was removed from the system.`
        };
        setLogs([newLog, ...logs]);
      }}
    ]);
  };

  const handleSaveAdd = () => {
    if (!formData.id.trim() || !formData.name.trim()) return Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอก ID และ ชื่อให้ครบ');
    if (sensors.some((s: any) => s.id === formData.id.trim())) return Alert.alert('ข้อมูลซ้ำ', 'Sensor ID นี้มีอยู่ในระบบแล้ว');
    
    setSensors([...sensors, { 
      id: formData.id.trim(), 
      name: formData.name.trim(), 
      status: 'Waiting', // รอรับข้อมูล
      temp: 0,           // ค่าว่าง
      gas: 0             // ค่าว่าง
    }]);
    
    // บันทึกประวัติการเพิ่มลงไปใน Log
    const newLog = {
      id: Date.now().toString(), type: 'info', title: 'Sensor Added', 
      room: formData.name.trim(), timestamp: new Date().toLocaleTimeString(), 
      details: `Device ID ${formData.id.trim()} was successfully connected.`
    };
    setLogs([newLog, ...logs]); // เอา log ใหม่ไว้บนสุด
    
    setCurrentView('list');
  };

  const handleSaveEdit = () => {
    if (!formData.name.trim()) return Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อเซนเซอร์');
    setSensors(sensors.map((s: any) => s.id === formData.id ? { ...s, name: formData.name.trim() } : s));
    setCurrentView('list');
  };

  const openEditForm = (sensor: any) => { setFormData({ id: sensor.id, name: sensor.name }); setCurrentView('edit'); };
  const openAddForm = () => { setFormData({ id: '', name: '' }); setCurrentView('add'); };

  if (currentView === 'list') {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Connected Devices</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAddForm}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}> Add</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={sensors}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>ยังไม่มีเซนเซอร์ในระบบ</Text>}
          renderItem={({ item }) => (
            <View style={styles.sensorCard}>
              <View style={styles.sensorInfo}>
                <Text style={styles.sensorName}>{item.name}</Text>
                <Text style={styles.sensorIdLabel}>ID: {item.id}</Text>
              </View>
              <View style={styles.actionIcons}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => openEditForm(item)}>
                  <Ionicons name="pencil" size={22} color="#3498db" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash" size={22} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentView('list')}>
        <Ionicons name="chevron-back" size={24} color="#ff4444" />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.formContainer}>
        <Text style={styles.formHeader}>{currentView === 'add' ? 'Add New Device' : 'Edit Device'}</Text>
        <Text style={styles.label}>Sensor ID {currentView === 'edit' && '(ไม่สามารถแก้ไขได้)'}</Text>
        <TextInput style={[styles.input, currentView === 'edit' && styles.disabledInput]} placeholder="เช่น SN-1234" placeholderTextColor="#666" value={formData.id} onChangeText={(text) => setFormData({ ...formData, id: text })} editable={currentView === 'add'} />
        <Text style={styles.label}>Sensor Name (ชื่อเรียก)</Text>
        <TextInput style={styles.input} placeholder="เช่น ห้องครัว" placeholderTextColor="#666" value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} autoFocus={currentView === 'edit'} />
        <TouchableOpacity style={styles.saveButton} onPress={currentView === 'add' ? handleSaveAdd : handleSaveEdit}>
          <Text style={styles.saveButtonText}>{currentView === 'add' ? 'Save Sensor' : 'Update Name'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  addBtn: { flexDirection: 'row', backgroundColor: '#ff4444', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 30 },
  sensorCard: { backgroundColor: '#1e1e1e', padding: 18, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#ff4444' },
  sensorInfo: { flex: 1 },
  sensorName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  sensorIdLabel: { color: '#888', fontSize: 13 },
  actionIcons: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 5 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginLeft: -5 },
  backBtnText: { color: '#ff4444', fontSize: 16, fontWeight: 'bold', marginLeft: 5 },
  formContainer: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 15 },
  formHeader: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  input: { backgroundColor: '#2a2a2a', color: '#fff', padding: 15, borderRadius: 8, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  disabledInput: { color: '#666', backgroundColor: '#181818', borderColor: '#222' },
  saveButton: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});