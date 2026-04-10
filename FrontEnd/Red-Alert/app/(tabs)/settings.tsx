import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../_layout';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const sensorSchema = z.object({
  id: z.string().min(1, "กรุณากรอก Sensor ID"),
  name: z.string().min(1, "กรุณาตั้งชื่ออุปกรณ์"),
});
type SensorFormValues = z.infer<typeof sensorSchema>;

export default function SettingsScreen() {
  const { sensors, setSensors, logs, setLogs } = useContext(AppContext);
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');

  // Setup Form
  const { control, handleSubmit, reset, formState: { errors } } = useForm<SensorFormValues>({
    resolver: zodResolver(sensorSchema),
    defaultValues: { id: '', name: '' }
  });

  const handleDelete = (id: string) => {
    Alert.alert('ยืนยันการลบ', 'ต้องการลบเซนเซอร์นี้ใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => {
        const sensorName = sensors.find((s:any) => s.id === id)?.name || 'Unknown';
        setSensors(sensors.filter((s: any) => s.id !== id));
        
        const newLog = {
          id: Date.now().toString(), type: 'info', title: 'Sensor Removed', 
          room: sensorName, timestamp: new Date().toLocaleTimeString(), 
          details: `Device ID ${id} was removed from the system.`
        };
        setLogs([newLog, ...logs]);
      }}
    ]);
  };

  const onSubmit = (data: SensorFormValues) => {
    if (currentView === 'add') {
      // เช็คข้อมูลซ้ำ
      if (sensors.some((s: any) => s.id === data.id.trim())) {
        return Alert.alert('ข้อมูลซ้ำ', 'Sensor ID นี้มีอยู่ในระบบแล้ว');
      }
      setSensors([...sensors, { id: data.id.trim(), name: data.name.trim(), status: 'Waiting', temp: 0, gas: 0 }]);
      
      const newLog = {
        id: Date.now().toString(), type: 'info', title: 'Sensor Added', 
        room: data.name.trim(), timestamp: new Date().toLocaleTimeString(), 
        details: `Device ID ${data.id.trim()} was successfully connected.`
      };
      setLogs([newLog, ...logs]);

    } else if (currentView === 'edit') {
      setSensors(sensors.map((s: any) => s.id === data.id ? { ...s, name: data.name.trim() } : s));
    }
    
    setCurrentView('list');
  };

  const openAddForm = () => { 
    reset({ id: '', name: '' }); // ล้างฟอร์ม
    setCurrentView('add'); 
  };

  const openEditForm = (sensor: any) => { 
    reset({ id: sensor.id, name: sensor.name }); // ยัดข้อมูลเดิมลงฟอร์ม
    setCurrentView('edit'); 
  };

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
        <Controller control={control} name="id" render={({ field: { onChange, value } }) => (
          <>
            <TextInput 
              style={[styles.input, currentView === 'edit' && styles.disabledInput, errors.id && styles.inputError]} 
              placeholder="เช่น SN-1234" 
              placeholderTextColor="#666" 
              value={value} 
              onChangeText={onChange} 
              editable={currentView === 'add'} 
            />
            {errors.id && <Text style={styles.errorText}>{errors.id.message}</Text>}
          </>
        )} />
        
        <Text style={styles.label}>Sensor Name (ชื่อเรียก)</Text>
        <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
          <>
            <TextInput 
              style={[styles.input, errors.name && styles.inputError]} 
              placeholder="เช่น ห้องครัว" 
              placeholderTextColor="#666" 
              value={value} 
              onChangeText={onChange} 
              autoFocus={currentView === 'edit'} 
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </>
        )} />
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(onSubmit)}>
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
  input: { backgroundColor: '#2a2a2a', color: '#fff', padding: 15, borderRadius: 8, fontSize: 16, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  disabledInput: { color: '#666', backgroundColor: '#181818', borderColor: '#222' },
  inputError: { borderColor: '#ff4444', backgroundColor: 'rgba(255, 68, 68, 0.05)' },
  errorText: { color: '#ff4444', fontSize: 12, marginBottom: 15, marginLeft: 5 },
  saveButton: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});