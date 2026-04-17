import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AppContext } from './_layout';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '../src/api/client';

// Schema กำหนดกฎของฟอร์ม
const signupSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  email: z.string().min(1, "กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน!",
  path: ["confirmPassword"], // ให้ Error ไปแสดงที่ช่อง Confirm Password
});

// ดึง Type จาก Schema มาใช้
type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const { setUserProfile } = useContext(AppContext);
  
  // สเตทสำหรับปุ่ม Loading
  const [isLoading, setIsLoading] = useState(false);

  // เรียกใช้งาน useForm และผูกกับ Zod Schema
  const { control, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);

    try {
      // ยิง API ไปที่ Backend (/register)
      // ส่งไปแค่ name (เป็น fullName ตาม Backend), email, password
      const response = await apiClient.post('/register', {
        fullName: data.name.trim(), // Backend เราใช้ตัวแปร fullName นะครับ
        email: data.email.trim(),
        password: data.password,
      });

      // ถ้าสมัครสำเร็จ อัปเดต Context (ถ้าจำเป็น)
      setUserProfile((prev: any) => ({
        ...prev,
        name: data.name.trim(),
        email: data.email.trim()
      }));

      // แจ้งเตือนความสำเร็จแล้วเด้งกลับหน้า Login
      Alert.alert("สำเร็จ!", "สมัครสมาชิกเรียบร้อยแล้ว กรุณาล็อกอินเข้าสู่ระบบ", [
        { text: "ตกลง", onPress: () => router.back() } 
      ]);

    } catch (error: any) {
      console.error("SignUp Error: ", error);
      
      // ดึงข้อความ Error จาก Backend มาแสดง
      const errorMessage = error.response?.data?.msg 
                        || error.response?.data?.error 
                        || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ ตรวจสอบ IP/WiFi";
      
      Alert.alert("สมัครสมาชิกไม่สำเร็จ", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} disabled={isLoading}>
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.subTitle}>Sign up to start securing your home</Text>

        <View style={styles.formContainer}>
          
          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <>
                <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#888"
                    value={value}
                    onChangeText={onChange}
                    editable={!isLoading}
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
              </>
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <>
                <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    editable={!isLoading}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
              </>
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <>
                <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    editable={!isLoading}
                  />
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
              </>
            )}
          />

          {/* Confirm Password */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#888" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    editable={!isLoading}
                  />
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
              </>
            )}
          />

          {/* ปุ่มเ Loading เวลาโหลด */}
          <TouchableOpacity 
            style={[styles.signupButton, isLoading && styles.buttonDisabled]} 
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupButtonText}>SIGN UP</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  content: { flex: 1, justifyContent: 'center', padding: 25, marginTop: 40 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subTitle: { color: '#888', fontSize: 16, marginBottom: 30 },
  
  formContainer: { width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputError: {
    borderColor: '#ff4444',
    backgroundColor: 'rgba(255, 68, 68, 0.05)',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 5,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 18, color: '#fff', fontSize: 16 },
  
  signupButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#ff4444',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonDisabled: { backgroundColor: '#aa3333', shadowOpacity: 0 },
  signupButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#888', fontSize: 15 },
  loginText: { color: '#ff4444', fontSize: 15, fontWeight: 'bold' },
});