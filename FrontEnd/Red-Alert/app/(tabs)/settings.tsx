import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../_layout';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGlobalSearchParams } from 'expo-router';
import { apiClient } from '../../src/api/client';

const sensorSchema = z.object({
  serialNumber: z.string().min(1, "กรุณากรอก Sensor ID (เช่น SN-1234)"),
  name: z.string().min(1, "กรุณาตั้งชื่ออุปกรณ์"),
});
type SensorFormValues = z.infer<typeof sensorSchema>;

export default function SettingsScreen() {
  const { logs, setLogs } = useContext(AppContext);
  const { houseId } = useGlobalSearchParams();

  const [sensors, setSensors] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<SensorFormValues>({
    resolver: zodResolver(sensorSchema),
    defaultValues: { serialNumber: '', name: '' }
  });

  // ดึงข้อมูล List
  const fetchSensors = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/houses/${houseId}/sensors`);
      setSensors(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (houseId) fetchSensors();
  }, [houseId]);

  // ฟังก์ชันลบเซนเซอร์
  const handleDelete = (id: string) => {
    Alert.alert('ยืนยันการลบ', 'คุณต้องการลบอุปกรณ์นี้ออกจากระบบใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { 
        text: 'ลบข้อมูล', 
        style: 'destructive', 
        onPress: async () => {
          try {
            // ยิง API ไปลบที่ Backend
            await apiClient.delete(`/sensors/${id}`);
            
            // อัปเดต List หน้าจอให้ของหายไปทันทีโดยไม่ต้องโหลดใหม่
            setSensors(sensors.filter(s => s.id !== id));
            Alert.alert("สำเร็จ", "ลบอุปกรณ์เรียบร้อยแล้ว");
          } catch (error) {
            console.error("Delete error:", error);
            Alert.alert("ผิดพลาด", "ไม่สามารถลบอุปกรณ์ได้");
          }
        }
      }
    ]);
  };

  // ฟังก์ชันบันทึกข้อมูลเข้า Database
  const onSubmit = async (data: SensorFormValues) => {
    setIsSubmitting(true);
    try {
      if (currentView === 'add') {
        // ยิง API เพิ่มเซนเซอร์
        const response = await apiClient.post('/sensors', {
          houseId: String(houseId),
          serialNumber: data.serialNumber.trim(),
          name: data.name.trim(),
          type: "Fire & Gas"
        });
        
        setSensors([...sensors, response.data.sensor]);
        Alert.alert("สำเร็จ", "เพิ่มอุปกรณ์เรียบร้อยแล้ว");
      } 
      else if (currentView === 'edit') {
        Alert.alert('อัปเดต', 'ฟีเจอร์แก้ไขกำลังพัฒนาใน Backend นะครับ');
      }
      setCurrentView('list');
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "ไม่สามารถจัดการเซนเซอร์ได้";
      Alert.alert("ล้มเหลว", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddForm = () => { 
    reset({ serialNumber: '', name: '' }); 
    setCurrentView('add'); 
  };

  const openEditForm = (sensor: any) => { 
    setEditingId(sensor.id);
    reset({ serialNumber: sensor.serialNumber, name: sensor.name }); 
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
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#ff4444" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={sensors}
            keyExtractor={(item) => item.id}
            refreshing={isLoading}
            onRefresh={fetchSensors}
            ListEmptyComponent={<Text style={styles.emptyText}>ยังไม่มีเซนเซอร์ในระบบ</Text>}
            renderItem={({ item }) => (
              <View style={styles.sensorCard}>
                <View style={styles.sensorInfo}>
                  <Text style={styles.sensorName}>{item.name}</Text>
                  <Text style={styles.sensorIdLabel}>SN: {item.serialNumber}</Text>
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
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentView('list')} disabled={isSubmitting}>
        <Ionicons name="chevron-back" size={24} color="#ff4444" />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>
      
      <View style={styles.formContainer}>
        <Text style={styles.formHeader}>{currentView === 'add' ? 'Add New Device' : 'Edit Device'}</Text>
        
        <Text style={styles.label}>Sensor ID / Serial Number {currentView === 'edit' && '(ไม่สามารถแก้ไขได้)'}</Text>
        <Controller control={control} name="serialNumber" render={({ field: { onChange, value } }) => (
          <>
            <TextInput 
              style={[styles.input, currentView === 'edit' && styles.disabledInput, errors.serialNumber && styles.inputError]} 
              placeholder="เช่น SN-1234" 
              placeholderTextColor="#666" 
              value={value} 
              onChangeText={onChange} 
              editable={currentView === 'add' && !isSubmitting} 
              autoCapitalize="characters"
            />
            {errors.serialNumber && <Text style={styles.errorText}>{errors.serialNumber.message}</Text>}
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
              editable={!isSubmitting}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </>
        )} />
        
        <TouchableOpacity style={[styles.saveButton, isSubmitting && {opacity: 0.7}]} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{currentView === 'add' ? 'Save Sensor' : 'Update Name'}</Text>}
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