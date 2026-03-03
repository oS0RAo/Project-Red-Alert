import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function UserScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>=*=</Text>
          {/* ข้อมูลจำลองงงงงงงงงงง */}
        </View> 
        <Text style={styles.userName}>Doom Guy</Text>
        <Text style={styles.userEmail}>doom@redalert.com</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Emergency Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Notification Preferences</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  profileSection: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  avatarPlaceholder: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#333', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15 
  },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  userName: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#888', marginTop: 5 },
  menuSection: { flex: 1 },
  menuItem: { 
    backgroundColor: '#1e1e1e', padding: 18, borderRadius: 10, marginBottom: 15 
  },
  menuText: { color: '#fff', fontSize: 16 },
  logoutButton: { 
    backgroundColor: 'transparent', padding: 15, alignItems: 'center', 
    borderWidth: 1, borderColor: '#ff4444', borderRadius: 10, marginBottom: 20
  },
  logoutText: { color: '#ff4444', fontSize: 16, fontWeight: 'bold' },
});