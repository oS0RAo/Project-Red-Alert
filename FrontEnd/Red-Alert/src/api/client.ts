import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BACKEND_URL = 'http://10.206.75.238:5000/api'; 

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ใส่ Token เข้าไปใน Header อัตโนมัติทุกครั้งที่ยิง API
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});