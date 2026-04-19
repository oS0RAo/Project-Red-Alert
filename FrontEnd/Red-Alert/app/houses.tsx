import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [editingHouse, setEditingHouse] = useState<any>(null); // State สำหรับโหมดแก้ไข
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<HouseFormValues>({
    resolver: zodResolver(houseSchema),
    defaultValues: { name: '', address: '' }
  });

  const fetchHouses = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/houses');
      setHouses(response.data);
    } catch (error) {
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลบ้านได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchHouses(); }, []);

  // ฟังก์ชันเปิด Modal สำหรับแก้ไข
  const openEditModal = (house: any) => {
    setEditingHouse(house);
    setValue('name', house.name);
    setValue('address', house.address || '');
    setModalVisible(true);
  };

  // ฟังก์ชันลบบ้าน
  const handleDeleteHouse = (id: string, name: string) => {
    Alert.alert(
      "ยืนยันการลบ",
      `คุณแน่ใจหรือไม่ว่าต้องการลบ "${name}"? ข้อมูลเซนเซอร์ในบ้านนี้จะหายไปด้วย`,
      [
        { text: "ยกเลิก", style: "cancel" },
        { 
          text: "ลบ", 
          style: "destructive", 
          onPress: async () => {
            try {
              await apiClient.delete(`/houses/${id}`);
              setHouses(houses.filter((h: any) => h.id !== id));
              Alert.alert("สำเร็จ", "ลบบ้านเรียบร้อยแล้ว");
            } catch (error) {
              Alert.alert("ล้มเหลว", "ไม่สามารถลบบ้านได้");
            }
          } 
        }
      ]
    );
  };

  const onSubmit = async (data: HouseFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingHouse) {
        // กรณีแก้ไข
        const response = await apiClient.put(`/houses/${editingHouse.id}`, data);
        setHouses(houses.map((h: any) => h.id === editingHouse.id ? response.data.house : h));
        Alert.alert("สำเร็จ", "อัปเดตข้อมูลบ้านแล้ว");
      } else {
        // กรณีเพิ่มใหม่
        const response = await apiClient.post('/houses', data);
        setHouses([...houses, response.data.house]);
        Alert.alert("สำเร็จ", "เพิ่มบ้านหลังใหม่เรียบร้อยแล้ว!");
      }
      closeModal();
    } catch (error: any) {
      Alert.alert("ล้มเหลว", error.response?.data?.error || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    reset();
    setEditingHouse(null);
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

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ff4444" />
        </View>
      ) : (
        <FlatList
          data={houses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchHouses}
          refreshing={isLoading}
          renderItem={({ item }) => {
            const sensorCount = item._count?.sensors || 0;
            return (
              <TouchableOpacity 
                style={styles.houseCard} 
                onPress={() => router.push({ pathname: '/dashboard', params: { houseId: item.id, houseName: item.name }})}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.houseName}>{item.name}</Text>
                    <Text style={styles.houseAddress}>{item.address || "ไม่ได้ระบุที่อยู่"}</Text>
                  </View>
                  {/* ปุ่ม Edit & Delete */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
                      <Ionicons name="pencil" size={18} color="#aaa" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteHouse(item.id, item.name)} style={styles.iconBtn}>
                      <Ionicons name="trash" size={18} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
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

      {/* Modal เพิ่ม/แก้ไขบ้าน */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingHouse ? 'Edit Home' : 'Add New Home'}</Text>

            <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
              <>
                <TextInput 
                  style={[styles.input, errors.name && styles.inputError]} 
                  placeholder="House Name..." 
                  placeholderTextColor="#888" 
                  value={value} 
                  onChangeText={onChange} 
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
                  value={value} 
                  onChangeText={onChange} 
                />
                {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}
              </>
            )} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal} disabled={isSubmitting}>
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
  logoRed: { fontSize: 26, fontWeight: '900', color: '#ff4444', fontStyle: 'italic' },
  logoWhite: { fontSize: 26, fontWeight: '900', color: '#ffffff', fontStyle: 'italic' },
  addButton: { backgroundColor: '#ff4444', borderRadius: 12, width: 45, height: 45, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 50 },
  houseCard: { backgroundColor: '#1e1e1e', borderRadius: 15, padding: 20, marginBottom: 20, minHeight: 120, borderLeftWidth: 5, borderLeftColor: '#ff4444' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButtons: { flexDirection: 'row' },
  iconBtn: { marginLeft: 15, padding: 5 },
  houseName: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  houseAddress: { color: '#888888', fontSize: 14, lineHeight: 20 },
  sensorStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 15 },
  sensorText: { color: '#aaaaaa', fontSize: 12, fontWeight: 'bold', marginRight: 8, letterSpacing: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2ecc71' }, 
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1e1e1e', width: '90%', borderRadius: 15, padding: 25, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#2a2a2a', width: '100%', borderRadius: 10, padding: 15, color: '#ffffff', fontSize: 16, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  inputError: { borderColor: '#ff4444', backgroundColor: 'rgba(255, 68, 68, 0.05)' },
  errorText: { color: '#ff4444', fontSize: 12, marginBottom: 15, marginLeft: 5 },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  confirmBtn: { backgroundColor: '#2ecc71', paddingVertical: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
  cancelBtn: { backgroundColor: '#555555', paddingVertical: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  logoContainer: { flexDirection: 'row' }
});