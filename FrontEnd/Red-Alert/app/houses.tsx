import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Modal, TextInput, SafeAreaView, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// โครงสร้างข้อมูลของบ้าน
interface House {
  id: string;
  name: string;
  address: string;
  sensors: number;
}

export default function HouseSelectionScreen() {
  // จำลองข้อมูลบ้าน
  const [houses, setHouses] = useState<House[]>([
    { id: '1', name: 'บ้านแสนสุข', address: '123/5 หมู่บ้านสุขใจ', sensors: 2 },
    { id: '2', name: 'บ้านนี้ดีย์อยู่แล้วรวย', address: '123/5 หมู่บ้านทองม้วน3ตลบ', sensors: 1 },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // ฟังก์ชันสำหรับเพิ่มบ้านใหม่
  const addHouse = () => {
    if (newName.trim() && newAddress.trim()) {
      const newHouse: House = {
        id: Date.now().toString(),
        name: newName.trim(),
        address: newAddress.trim(),
        sensors: 0,
      };
      setHouses([...houses, newHouse]);
      setNewName('');
      setNewAddress('');
      setModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoRed}>RED</Text>
          <Text style={styles.logoWhite}> ALERT</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={houses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.houseCard}
            onPress={() => router.replace('./(tabs)/dashboard')} 
          >
            <View>
              <Text style={styles.houseName}>{item.name}</Text>
              <Text style={styles.houseAddress}>{item.address}</Text>
            </View>
            <View style={styles.sensorStatus}>
              <Text style={styles.sensorText}>
                {item.sensors} SENSOR{item.sensors > 1 ? 'S' : ''}
              </Text>
              <View style={styles.statusDot} />
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Home</Text>
            
            <TextInput
              style={styles.input}
              placeholder="House Name..."
              placeholderTextColor="#888"
              value={newName}
              onChangeText={setNewName}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Address..."
              placeholderTextColor="#888"
              multiline={true}
              numberOfLines={4}
              value={newAddress}
              onChangeText={setNewAddress}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.confirmBtn} onPress={addHouse}>
                <Text style={styles.btnText}>Confirm</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => {
                  setModalVisible(false);
                  setNewName('');
                  setNewAddress('');
                }}
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
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginTop: 20,
    marginBottom: 30
  },
  logoContainer: { flexDirection: 'row' },
  logoRed: { fontSize: 26, fontWeight: '900', color: '#ff4444', fontStyle: 'italic' },
  logoWhite: { fontSize: 26, fontWeight: '900', color: '#ffffff', fontStyle: 'italic' },
  addButton: { 
    backgroundColor: '#ff4444', 
    borderRadius: 12, 
    width: 45, 
    height: 45, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#ff4444',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  listContent: { paddingHorizontal: 20 },
  houseCard: { 
    backgroundColor: '#1e1e1e', 
    borderRadius: 15, 
    padding: 20, 
    marginBottom: 20,
    minHeight: 120,
    justifyContent: 'space-between',
    borderLeftWidth: 5,
    borderLeftColor: '#ff4444' 
  },
  houseName: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  houseAddress: { color: '#888888', fontSize: 14, lineHeight: 20 },
  sensorStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 15 },
  sensorText: { color: '#aaaaaa', fontSize: 12, fontWeight: 'bold', marginRight: 8, letterSpacing: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2ecc71' }, 
  
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: '#1e1e1e', 
    width: '90%', 
    borderRadius: 15, 
    padding: 25,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#333'
  },
  modalTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { 
    backgroundColor: '#2a2a2a', 
    width: '100%', 
    borderRadius: 10, 
    padding: 15, 
    color: '#ffffff', 
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333'
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  confirmBtn: { 
    backgroundColor: '#2ecc71', 
    paddingVertical: 15, 
    borderRadius: 10, 
    width: '48%', 
    alignItems: 'center' 
  },
  cancelBtn: { 
    backgroundColor: '#555555', 
    paddingVertical: 15, 
    borderRadius: 10, 
    width: '48%', 
    alignItems: 'center' 
  },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});