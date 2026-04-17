import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../src/api/client'; // เช็ค Path ให้ตรงกับที่คุณตั้งไว้ด้วยนะครับ

export default function HistoryScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงประวัติจาก Backend
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/history');
      setLogs(response.data);
    } catch (error) {
      console.error("Fetch history error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // โหลดข้อมูลครั้งแรกที่เปิดหน้า
  useEffect(() => {
    fetchHistory();
  }, []);

  // กำหนดสีและไอคอนตามประเภท (รองรับตัวพิมพ์ใหญ่/เล็กจาก DB)
  const getLogStyle = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'DANGER':
      case 'CRITICAL': return { color: '#ff4444', icon: 'warning', bg: 'rgba(255, 68, 68, 0.1)' };
      case 'WARNING': return { color: '#f1c40f', icon: 'alert-circle', bg: 'rgba(241, 196, 15, 0.1)' };
      case 'INFO': return { color: '#3498db', icon: 'information-circle', bg: 'rgba(52, 152, 219, 0.1)' };
      default: return { color: '#888', icon: 'notifications', bg: '#2a2a2a' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <Text style={styles.totalLogsText}>Recent Logs ({logs.length})</Text>
        <TouchableOpacity onPress={fetchHistory}>
          <Text style={styles.clearText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#ff4444" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchHistory} // ดึงหน้าจอลงเพื่อรีเฟรชได้
          renderItem={({ item }) => {
            const logStyle = getLogStyle(item.type);
            
            // แปลงรูปแบบวันที่จากฐานข้อมูล (createdAt) ให้อ่านง่ายขึ้น
            const timeString = item.createdAt 
              ? new Date(item.createdAt).toLocaleString('th-TH') 
              : 'Unknown Time';

            // ดึงชื่อเซนเซอร์ ถ้าเป็น Log ของระบบจะขึ้นว่า System
            const roomName = item.sensor?.name || 'System Activity';

            return (
              <View style={styles.logCard}>
                <View style={[styles.iconContainer, { backgroundColor: logStyle.bg }]}>
                  <Ionicons name={logStyle.icon as any} size={28} color={logStyle.color} />
                </View>
                <View style={styles.logInfo}>
                  <View style={styles.logHeader}>
                    <Text style={[styles.logTitle, { color: logStyle.color }]}>{item.title}</Text>
                    <Text style={styles.logTime}>{timeString}</Text>
                  </View>
                  <Text style={styles.logRoom}>{roomName}</Text>
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
      )}
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
  logTime: { fontSize: 12, color: '#666', marginTop: 2, textAlign: 'right', flexShrink: 0, marginLeft: 5 },
  logRoom: { fontSize: 13, color: '#ccc', marginBottom: 5 },
  logDetails: { fontSize: 13, color: '#888', lineHeight: 18 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { color: '#2ecc71', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  emptySubText: { color: '#666', fontSize: 14, marginTop: 5 },
});