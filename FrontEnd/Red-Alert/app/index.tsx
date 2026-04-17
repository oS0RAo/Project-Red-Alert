import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '../src/api/client';
import * as SecureStore from 'expo-secure-store';
import * as z from 'zod';

// Schema เช็คข้อมูล Login
const loginSchema = z.object({
  email: z.string().min(1, "กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน")
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      // ยิงข้อมูลไปที่ Backend
      const response = await apiClient.post('/login', {
        email: data.email,
        password: data.password,
      });

      // ถ้า Backend ตอบกลับมาสำเร็จ ดึง Token และข้อมูลออกมา
      const { token, user } = response.data;

      // เก็บ Token ลงมือถือ
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      router.replace('/houses'); 

    } catch (error: any) {
      console.error("Login Error: ", error);
      
      // ดักจับ Error Message ที่เราเขียนไว้ใน Backend (เช่น "User not found")
      const errorMessage = error.response?.data?.msg 
                        || error.response?.data?.error 
                        || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ ตรวจสอบ IP/WiFi";
      
      Alert.alert("เข้าสู่ระบบล้มเหลว", errorMessage);
    } finally {
      setIsLoading(false); // หยุดหมุนไม่ว่าจะสำเร็จหรือพัง
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        <View style={styles.logoContainer}>
          <Text style={styles.logoRed}>RED</Text>
          <Text style={styles.logoWhite}> ALERT</Text>
        </View>
        <Text style={styles.subLogo}>Smart Fire & Gas Sentinel</Text>

        <View style={styles.formContainer}>
          {/* Email */}
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
                <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#888" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
            </>
          )} />

          {/* Password */}
          <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
            <>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
                <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" secureTextEntry value={value} onChangeText={onChange} />
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </>
          )} />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { flex: 1, justifyContent: 'center', padding: 25 },
  logoContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 5 },
  logoRed: { fontSize: 36, fontWeight: '900', color: '#ff4444', fontStyle: 'italic' },
  logoWhite: { fontSize: 36, fontWeight: '900', color: '#ffffff', fontStyle: 'italic' },
  subLogo: { color: '#888', textAlign: 'center', fontSize: 14, marginBottom: 50, letterSpacing: 1 },
  formContainer: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', borderRadius: 12, marginBottom: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: '#333' },
  inputError: { borderColor: '#ff4444', backgroundColor: 'rgba(255, 68, 68, 0.05)' },
  errorText: { color: '#ff4444', fontSize: 12, marginBottom: 15, marginLeft: 5 },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 18, color: '#fff', fontSize: 16 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: '#aaa', fontSize: 14 },
  loginButton: { backgroundColor: '#ff4444', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#ff4444', shadowOpacity: 0.3, shadowRadius: 10 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#888', fontSize: 15 },
  signupText: { color: '#ff4444', fontSize: 15, fontWeight: 'bold' },
});