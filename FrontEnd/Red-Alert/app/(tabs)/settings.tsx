import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  FlatList, Alert 
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

interface SensorItem {
  id: string;
  name: string;
}

const Stack = createStackNavigator();

const DeviceListScreen = ({ navigation, sensors, setSensors }: any) => {
  const deleteSensor = (id: string) => {
    Alert.alert('ยืนยันการลบ', 'ต้องการลบเซนเซอร์นี้ใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => {
        setSensors(sensors.filter((s: SensorItem) => s.id !== id));
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Connected Devices</Text>
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => navigation.navigate('AddSensor')}
        >
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
              <TouchableOpacity 
                style={styles.iconBtn} 
                onPress={() => navigation.navigate('EditSensor', { sensor: item })}
              >
                <Ionicons name="pencil" size={22} color="#3498db" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => deleteSensor(item.id)}>
                <Ionicons name="trash" size={22} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const AddSensorScreen = ({ navigation, sensors, setSensors }: any) => {
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');

  const handleSave = () => {
    if (!newId.trim() || !newName.trim()) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอก ID และ ชื่อให้ครบ');
      return;
    }
    if (sensors.some((s: SensorItem) => s.id === newId.trim())) {
      Alert.alert('ซ้ำ', 'Sensor ID นี้มีอยู่แล้ว');
      return;
    }
    setSensors([...sensors, { id: newId.trim(), name: newName.trim() }]);
    navigation.goBack();
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Sensor ID (จากบอร์ด ESP32)</Text>
      <TextInput style={styles.input} placeholder="เช่น SN-1234" placeholderTextColor="#666" value={newId} onChangeText={setNewId} />
      
      <Text style={styles.label}>Sensor Name (ชื่อเรียก)</Text>
      <TextInput style={styles.input} placeholder="เช่น ห้องครัว" placeholderTextColor="#666" value={newName} onChangeText={setNewName} />
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Sensor</Text>
      </TouchableOpacity>
    </View>
  );
};

const EditSensorScreen = ({ route, navigation, sensors, setSensors }: any) => {
  const { sensor } = route.params;
  const [editName, setEditName] = useState(sensor.name);

  const handleUpdate = () => {
    if (!editName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อเซนเซอร์');
      return;
    }
    const updatedSensors = sensors.map((s: SensorItem) => 
      s.id === sensor.id ? { ...s, name: editName.trim() } : s
    );
    setSensors(updatedSensors);
    navigation.goBack();
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Sensor ID (ไม่สามารถแก้ไขได้)</Text>
      <TextInput style={[styles.input, styles.disabledInput]} value={sensor.id} editable={false} />
      
      <Text style={styles.label}>Sensor Name (ชื่อเรียก)</Text>
      <TextInput style={styles.input} value={editName} onChangeText={setEditName} autoFocus />
      
      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.saveButtonText}>Update Name</Text>
      </TouchableOpacity>
    </View>
  );
};

////////////////////////// ข้อมูลจำลองนะจ๊ะอิอิ //////////////////////////////////
export default function SettingsStack() {
  const [sensors, setSensors] = useState<SensorItem[]>([
    { id: 'SN-ESP32-001', name: 'Kitchen Sensor' },
    { id: 'SN-ESP32-002', name: 'Bedroom Sensor' },
  ]);
////////////////////////////////////////////////////////////////////////////

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#1e1e1e', shadowColor: 'transparent' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="DeviceList" options={{ headerShown: false }}>
        {(props) => <DeviceListScreen {...props} sensors={sensors} setSensors={setSensors} />}
      </Stack.Screen>
      
      <Stack.Screen name="AddSensor" options={{ title: 'Add New Device' }}>
        {(props) => <AddSensorScreen {...props} sensors={sensors} setSensors={setSensors} />}
      </Stack.Screen>
      
      <Stack.Screen name="EditSensor" options={{ title: 'Edit Device' }}>
        {(props) => <EditSensorScreen {...props} sensors={sensors} setSensors={setSensors} />}
      </Stack.Screen>
    </Stack.Navigator>
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

  formContainer: { flex: 1, backgroundColor: '#121212', padding: 20 },
  label: { color: '#aaa', fontSize: 14, marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 8, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  disabledInput: { color: '#666', backgroundColor: '#181818', borderColor: '#222' },
  saveButton: { backgroundColor: '#ff4444', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});