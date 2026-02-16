import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function GuideScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>คู่มือการใช้งาน</Text>
      
      <View style={styles.section}>
        <Text style={styles.subHeader}>สถานะไฟแจ้งเตือน</Text>
        <Text style={styles.text}>🟢 ปกติ: ปลอดภัย</Text>
        <Text style={styles.text}>🟡 ทำอาหาร: ตรวจพบควันจากการทำอาหาร</Text>
        <Text style={styles.text}>🔴 อันตราย: ตรวจพบแก๊สรั่วหรือควันไฟรุนแรง</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#ff4444', marginBottom: 20, marginTop: 10 },
  section: { marginBottom: 20, backgroundColor: '#1e1e1e', padding: 15, borderRadius: 10 },
  subHeader: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  text: { color: '#ccc', fontSize: 14, marginBottom: 5, lineHeight: 22 },
});