import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { 
          backgroundColor: '#1e1e1e', 
          borderTopColor: '#333',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarActiveTintColor: '#ff4444', 
        tabBarInactiveTintColor: '#888',
        
        header: ({ options }) => (
          <View style={{ 
            backgroundColor: '#121212', 
            paddingTop: insets.top + 15,
            paddingHorizontal: 20,
            paddingBottom: 15,
          }}>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>
              {options.title}
            </Text>
            
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: -6 }}
              onPress={() => router.replace('/')} 
            >
              <Ionicons name="chevron-back" size={22} color="#ff4444" />
              <Text style={{ color: '#ff4444', fontSize: 16, fontWeight: 'bold' }}>
                Houses
              </Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Red Alert Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flame' : 'flame-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Event Logs',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'System Config',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'User Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}