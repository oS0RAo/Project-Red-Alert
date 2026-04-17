import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, SafeAreaView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppContext } from './_layout';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '../src/api/client';

const houseSchema = z.object({
  name: z.string().min(1, "กรุณาตั้งชื่อบ้าน"),
  address: z.string().min(1, "กรุณากรอกที่อยู่"),
});
type HouseFormValues = z.infer<typeof houseSchema>;

export default function HouseSelectionScreen() {
  const { houses, setHouses } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  
  // State สำหรับจัดการ Loading
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup Form
  const { control, handleSubmit, reset, formState: { errors } } = useForm<HouseFormValues>({
    resolver: zodResolver(houseSchema),
    defaultValues: { name: '', address: '' }
  });

  // ฟังก์ชันดึงข้อมูลบ้านจาก Database
  const fetchHouses = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/houses');
      setHouses(response.data); // เอาข้อมูลที่ได้จาก API ไปใส่ใน Context
    } catch (error) {
      console.error("Fetch houses error:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลบ้านได้");
    } finally {
      setIsLoading(false);
    }
  };

  // สั่งให้ดึงข้อมูลทันทีที่เปิดหน้านี้
  useEffect(() => {
    fetchHouses();
  }, []);

  // ฟังก์ชันบันทึกบ้านหลังใหม่ลง Database
  const onSubmit = async (data: HouseFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/houses', {
        name: data.name.trim(),
        address: data.address.trim(),
      });

      // ดึงบ้านใหม่ที่ Backend ตอบกลับมา ไปต่อท้าย List เดิม (ไม่ต้องโหลดใหม่ทั้งหน้า)
      const newHouse = response.data.house;
      setHouses([...houses, newHouse]);
      
      closeModal();
      Alert.alert("สำเร็จ", "เพิ่มบ้านหลังใหม่เรียบร้อยแล้ว!");
    } catch (error: any) {
      console.error("Create house error:", error);
      const errorMsg = error.response?.data?.error || "ไม่สามารถเพิ่มบ้านได้ ลองใหม่อีกครั้ง";
      Alert.alert("ล้มเหลว", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    reset(); // ล้างข้อมูลในฟอร์ม
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoRed}>RED</Text>
          <Text style={styles.logoWhite}> ALERT</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* เช็คว่ากำลังโหลดอยู่ไหม ถ้าโหลดให้แสดงวงกลมหมุน */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ff4444" />
          <Text style={{ color: '#888', marginTop: 10 }}>Loading houses...</Text>
        </View>
      ) : (
        <FlatList
          data={houses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          // Pull-to-refresh เอานิ้วปัดจอลงเพื่อโหลดข้อมูลใหม่
          refreshing={isLoading}
          onRefresh={fetchHouses}
          ListEmptyComponent={<Text style={{color: '#888', textAlign: 'center', marginTop: 50}}>No properties found. Tap + to add one.</Text>}
          renderItem={({ item }) => {
            // Prisma ส่งจำนวนเซนเซอร์มาในก้อน _count.sensors (ถ้าเพิ่งสร้างใหม่จะดึงมาจาก 0)
            const sensorCount = item._count?.sensors || 0;
            return (
              <TouchableOpacity style={styles.houseCard} onPress={() => router.push({ pathname: '/dashboard', params: { houseId: item.id, houseName: item.name }})}>
                <View>
                  <Text style={styles.houseName}>{item.name}</Text>
                  <Text style={styles.houseAddress}>{item.address || "ไม่ได้ระบุที่อยู่"}</Text>
                </View>
                <View style={styles.sensorStatus}>
                  <Text style={styles.sensorText}>{sensorCount} SENSOR{sensorCount !== 1 ? 'S' : ''}</Text>
                  <View style={[styles.statusDot, sensorCount === 0 ? { backgroundColor: '#888' } : {}]} />
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )}

      {/* Modal เพิ่มบ้าน */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>➕ Add New Home</Text>

            <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
              <>
                <TextInput 
                  style={[styles.input, errors.name && styles.inputError]} 
                  placeholder="House Name (e.g. บ้านแสนสุข)..." 
                  placeholderTextColor="#888" 
                  value={value} 
                  onChangeText={onChange} 
                  editable={!isSubmitting}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
              </>
            )} />

            <Controller control={control} name="address" render={({ field: { onChange, value } }) => (
              <>
                <TextInput 
                  style={[styles.input, styles.textArea, errors.address && styles.inputError]} 
                  placeholder="Address..." 
                  placeholderTextColor="#888" 
                  multiline={true} 
                  numberOfLines={4} 
                  value={value} 
                  onChangeText={onChange} 
                  editable={!isSubmitting}
                />
                {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}
              </>
            )} />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.confirmBtn, isSubmitting && { opacity: 0.7 }]} 
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirm</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={closeModal}
                disabled={isSubmitting}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' }, 
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 30 },
  logoContainer: { flexDirection: 'row' },
  logoRed: { fontSize: 26, fontWeight: '900', color: '#ff4444', fontStyle: 'italic' },
  logoWhite: { fontSize: 26, fontWeight: '900', color: '#ffffff', fontStyle: 'italic' },
  addButton: { backgroundColor: '#ff4444', borderRadius: 12, width: 45, height: 45, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 50 },
  houseCard: { backgroundColor: '#1e1e1e', borderRadius: 15, padding: 20, marginBottom: 20, minHeight: 120, justifyContent: 'space-between', borderLeftWidth: 5, borderLeftColor: '#ff4444' },
  houseName: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  houseAddress: { color: '#888888', fontSize: 14, lineHeight: 20 },
  sensorStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 15 },
  sensorText: { color: '#aaaaaa', fontSize: 12, fontWeight: 'bold', marginRight: 8, letterSpacing: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2ecc71' }, 
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1e1e1e', width: '90%', borderRadius: 15, padding: 25, alignItems: 'flex-start', borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#2a2a2a', width: '100%', borderRadius: 10, padding: 15, color: '#ffffff', fontSize: 16, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  inputError: { borderColor: '#ff4444', backgroundColor: 'rgba(255, 68, 68, 0.05)' },
  errorText: { color: '#ff4444', fontSize: 12, marginBottom: 15, marginLeft: 5 },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  confirmBtn: { backgroundColor: '#2ecc71', paddingVertical: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
  cancelBtn: { backgroundColor: '#555555', paddingVertical: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});