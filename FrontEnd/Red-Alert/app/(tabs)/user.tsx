import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../_layout';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Schema ล็อคเบอร์โทรศัพท์ (ห้ามเว้นว่าง, ต้องเป็นตัวเลขล้วน, ความยาวขั้นต่ำ 3 ตัว)
const phoneSchema = z.object({
  emergencyPhone: z.string()
    .min(3, "เบอร์โทรฉุกเฉินสั้นเกินไป")
    .regex(/^[0-9]+$/, "กรุณากรอกเฉพาะตัวเลขเท่านั้น"),
});
type PhoneFormValues = z.infer<typeof phoneSchema>;

export default function UserScreen() {
  const { userProfile, setUserProfile, setHouses, setSensors, setLogs } = useContext(AppContext);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'emergency' | 'notify'>('emergency');

  // State สำหรับหน้าตั้งค่าแจ้งเตือน
  const [pushNotify, setPushNotify] = useState(userProfile.pushNotify);

  // Setup Form สำหรับเบอร์ฉุกเฉิน
  const { control, handleSubmit, reset, formState: { errors } } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { emergencyPhone: userProfile.emergencyPhone }
  });

  // อัปเดตค่าเริ่มต้นให้ฟอร์มเวลา userProfile โหลดมาครั้งแรก
  useEffect(() => {
    reset({ emergencyPhone: userProfile.emergencyPhone });
  }, [userProfile.emergencyPhone, reset]);

  const getInitial = () => userProfile.name ? userProfile.name.charAt(0).toUpperCase() : '?';

  const handleLogout = () => {
    Alert.alert("ยืนยันการออกจากระบบ", "คุณต้องการออกจากระบบ Red Alert ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ออกจากระบบ", style: "destructive", onPress: () => {
        setHouses([]);
        setSensors([]);
        setLogs([]);
        router.replace('/'); 
      }}
    ]);
  };

  const openModal = (type: 'emergency' | 'notify') => {
    setModalType(type);
    if (type === 'emergency') {
      reset({ emergencyPhone: userProfile.emergencyPhone }); // ดึงเบอร์ล่าสุดมาใส่ฟอร์ม
    } else {
      setPushNotify(userProfile.pushNotify); // ดึงค่าการแจ้งเตือนล่าสุด
    }
    setModalVisible(true);
  };

  // ฟังก์ชันเซฟเบอร์โทรจะถูกเรียกเมื่อผ่านกฎ Zod แล้ว
  const onSavePhone = (data: PhoneFormValues) => {
    setUserProfile({ ...userProfile, emergencyPhone: data.emergencyPhone });
    setModalVisible(false);
    Alert.alert("Success", "อัปเดตเบอร์ฉุกเฉินเรียบร้อยแล้ว!");
  };

  // ฟังก์ชันเซฟการแจ้งเตือน
  const saveNotifyConfig = () => {
    setUserProfile({ ...userProfile, pushNotify });
    setModalVisible(false);
    Alert.alert("Success", "อัปเดตการตั้งค่าแจ้งเตือนเรียบร้อยแล้ว!");
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
                
                {/* ใช้ Controller ครอบช่องกรอกเบอร์โทร */}
                <Controller
                  control={control}
                  name="emergencyPhone"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput 
                        style={[styles.input, errors.emergencyPhone && styles.inputError]} 
                        keyboardType="phone-pad"
                        placeholder="เช่น 191, 199 หรือเบอร์มือถือ"
                        placeholderTextColor="#666"
                        value={value} 
                        onChangeText={onChange} 
                      />
                      {errors.emergencyPhone && <Text style={styles.errorText}>{errors.emergencyPhone.message}</Text>}
                    </>
                  )}
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
              
              {/* แยกว่าปุ่ม Save จะรันคำสั่งไหน ขึ้นอยู่กับประเภท Modal */}
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={modalType === 'emergency' ? handleSubmit(onSavePhone) : saveNotifyConfig}
              >
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
  input: { backgroundColor: '#2a2a2a', width: '100%', borderRadius: 10, padding: 15, color: '#fff', fontSize: 16, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  inputError: { borderColor: '#ff4444', backgroundColor: 'rgba(255, 68, 68, 0.05)' },
  errorText: { color: '#ff4444', fontSize: 12, marginBottom: 15, marginLeft: 5 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, width: '100%' },
  switchLabel: { color: '#fff', fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10, marginBottom: 20 },
  cancelBtn: { backgroundColor: '#333', paddingVertical: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
  saveBtn: { backgroundColor: '#ff4444', paddingVertical: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});