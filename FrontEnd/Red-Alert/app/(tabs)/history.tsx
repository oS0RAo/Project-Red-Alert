import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../_layout';

export default function HistoryScreen() {
  // ดึงประวัติจากส่วนกลาง
  const { logs, setLogs } = useContext(AppContext);

  const getLogStyle = (type: string) => {
    switch (type) {
      case 'critical': return { color: '#ff4444', icon: 'warning', bg: 'rgba(255, 68, 68, 0.1)' };
      case 'warning': return { color: '#f1c40f', icon: 'restaurant', bg: 'rgba(241, 196, 15, 0.1)' };
      case 'info': return { color: '#3498db', icon: 'information-circle', bg: 'rgba(52, 152, 219, 0.1)' };
      default: return { color: '#888', icon: 'notifications', bg: '#2a2a2a' };
    }
  };

  // ฟังก์ชันล้างประวัติ
  const handleClearAll = () => {
    if (logs.length === 0) return;
    Alert.alert("Clear Logs", "Are you sure you want to delete all event logs?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: () => setLogs([]) }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <Text style={styles.totalLogsText}>Recent Logs ({logs.length})</Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={[styles.clearText, logs.length === 0 && { color: '#555' }]}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const logStyle = getLogStyle(item.type);
          return (
            <View style={styles.logCard}>
              <View style={[styles.iconContainer, { backgroundColor: logStyle.bg }]}>
                <Ionicons name={logStyle.icon as any} size={28} color={logStyle.color} />
              </View>
              <View style={styles.logInfo}>
                <View style={styles.logHeader}>
                  <Text style={[styles.logTitle, { color: logStyle.color }]}>{item.title}</Text>
                  <Text style={styles.logTime}>{item.timestamp}</Text>
                </View>
                <Text style={styles.logRoom}>{item.room}</Text>
                <Text style={styles.logDetails}>{item.details}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={60} color="#2ecc71" />
            <Text style={styles.emptyText}>All Clear!</Text>
            <Text style={styles.emptySubText}>ไม่มีประวัติเหตุการณ์ผิดปกติ</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  totalLogsText: { color: '#aaa', fontSize: 14, fontWeight: 'bold' },
  clearText: { color: '#ff4444', fontSize: 14, fontWeight: 'bold' },
  listContent: { padding: 20, paddingBottom: 40 },
  logCard: { flexDirection: 'row', backgroundColor: '#1e1e1e', borderRadius: 15, padding: 15, marginBottom: 15 },
  iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  logInfo: { flex: 1 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  logTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
  logTime: { fontSize: 12, color: '#666', marginTop: 2 },
  logRoom: { fontSize: 13, color: '#ccc', marginBottom: 5 },
  logDetails: { fontSize: 13, color: '#888', lineHeight: 18 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { color: '#2ecc71', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  emptySubText: { color: '#666', fontSize: 14, marginTop: 5 },
});