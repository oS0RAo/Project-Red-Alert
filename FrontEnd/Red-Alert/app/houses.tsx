import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppContext } from './_layout';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const houseSchema = z.object({
  name: z.string().min(1, "กรุณาตั้งชื่อบ้าน"),
  address: z.string().min(1, "กรุณากรอกที่อยู่"),
});
type HouseFormValues = z.infer<typeof houseSchema>;

export default function HouseSelectionScreen() {
  const { houses, setHouses } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);

  // Setup Form
  const { control, handleSubmit, reset, formState: { errors } } = useForm<HouseFormValues>({
    resolver: zodResolver(houseSchema),
    defaultValues: { name: '', address: '' }
  });

  const onSubmit = (data: HouseFormValues) => {
    const newHouse = {
      id: Date.now().toString(),
      name: data.name.trim(),
      address: data.address.trim(),
      sensors: 0,
    };
    setHouses([...houses, newHouse]);
    closeModal();
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

      <FlatList
        data={houses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={{color: '#888', textAlign: 'center', marginTop: 50}}>No houses found. Please add one.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.houseCard} onPress={() => router.replace('/(tabs)/dashboard')}>
            <View>
              <Text style={styles.houseName}>{item.name}</Text>
              <Text style={styles.houseAddress}>{item.address}</Text>
            </View>
            <View style={styles.sensorStatus}>
              <Text style={styles.sensorText}>{item.sensors} SENSOR{item.sensors > 1 ? 'S' : ''}</Text>
              <View style={styles.statusDot} />
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>➕ Add New Home</Text>

            <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
              <>
                <TextInput style={[styles.input, errors.name && styles.inputError]} placeholder="House Name..." placeholderTextColor="#888" value={value} onChangeText={onChange} />
                {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
              </>
            )} />

            <Controller control={control} name="address" render={({ field: { onChange, value } }) => (
              <>
                <TextInput style={[styles.input, styles.textArea, errors.address && styles.inputError]} placeholder="Address..." placeholderTextColor="#888" multiline={true} numberOfLines={4} value={value} onChangeText={onChange} />
                {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}
              </>
            )} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.btnText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
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
  listContent: { paddingHorizontal: 20 },
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