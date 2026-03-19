import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../_layout';

export default function UserScreen() {
  const { userProfile, setUserProfile, setHouses, setSensors, setLogs } = useContext(AppContext);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'emergency' | 'notify'>('emergency');

  // State ชั่วคราวเวลาพิมพ์แก้ในฟอร์ม
  const [editPhone, setEditPhone] = useState(userProfile.emergencyPhone);
  const [pushNotify, setPushNotify] = useState(userProfile.pushNotify);

  // ดึงตัวอักษรแรกของชื่อมาทำเป็นรูปโปรไฟล์
  const getInitial = () => userProfile.name ? userProfile.name.charAt(0).toUpperCase() : '?';

  const handleLogout = () => {
    Alert.alert("ยืนยันการออกจากระบบ", "คุณต้องการออกจากระบบ Red Alert ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ออกจากระบบ", style: "destructive", onPress: () => {
        // เคลียร์ข้อมูลทุกอย่างในคลังกลาง (Global State)
        setHouses([]);
        setSensors([]);
        setLogs([]);
        router.replace('/'); 
      }}
    ]);
  };

  const openModal = (type: 'emergency' | 'notify') => {
    setModalType(type);
    setEditPhone(userProfile.emergencyPhone);
    setPushNotify(userProfile.pushNotify);
    setModalVisible(true);
  };

  const saveSettings = () => {
    setUserProfile({ ...userProfile, emergencyPhone: editPhone, pushNotify });
    setModalVisible(false);
    Alert.alert("Success", "บันทึกการตั้งค่าเรียบร้อยแล้ว!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{getInitial()}</Text>
        </View> 
        <Text style={styles.userName}>{userProfile.name}</Text>
        <Text style={styles.userEmail}>{userProfile.email}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => openModal('emergency')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="call" size={20} color="#ff4444" style={{ marginRight: 15 }} />
            <Text style={styles.menuText}>Emergency Contacts</Text>
          </View>
          <Text style={styles.menuValue}>{userProfile.emergencyPhone}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => openModal('notify')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="notifications" size={20} color="#f1c40f" style={{ marginRight: 15 }} />
            <Text style={styles.menuText}>Notification Preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'emergency' ? '📞 Emergency Contact' : '🔔 Notification Config'}
            </Text>

            {modalType === 'emergency' ? (
              <View style={{ width: '100%' }}>
                <Text style={styles.label}>Phone Number (เบอร์ฉุกเฉิน)</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="phone-pad"
                  value={editPhone} 
                  onChangeText={setEditPhone} 
                />
              </View>
            ) : (
              <View style={{ width: '100%' }}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Push Notifications (แจ้งเตือนแอป)</Text>
                  <Switch value={pushNotify} onValueChange={setPushNotify} trackColor={{ false: '#333', true: '#ff4444' }} />
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  profileSection: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  userName: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#888', marginTop: 5 },
  menuSection: { flex: 1 },
  menuItem: { backgroundColor: '#1e1e1e', padding: 18, borderRadius: 12, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuText: { color: '#fff', fontSize: 16 },
  menuValue: { color: '#888', fontSize: 14 },
  logoutButton: { backgroundColor: 'transparent', padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#ff4444', borderRadius: 10, marginBottom: 20 },
  logoutText: { color: '#ff4444', fontSize: 16, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1e1e1e', padding: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25, alignItems: 'flex-start' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 25 },
  label: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  input: { backgroundColor: '#2a2a2a', width: '100%', borderRadius: 10, padding: 15, color: '#fff', fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, width: '100%' },
  switchLabel: { color: '#fff', fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10, marginBottom: 20 },
  cancelBtn: { backgroundColor: '#333', paddingVertical: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
  saveBtn: { backgroundColor: '#ff4444', paddingVertical: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});