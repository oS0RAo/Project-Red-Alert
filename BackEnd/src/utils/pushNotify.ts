import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export const sendEmergencyPush = async (token: string, sensorName: string) => {
  if (!Expo.isExpoPushToken(token)) {
    console.error(`Token นี้ใช้งานไม่ได้: ${token}`);
    return;
  }

  const messages = [{
    to: token,
    sound: 'default' as const,
    title: 'RED ALERT : แจ้งเตือนเหตุฉุกเฉิน!',
    body: `ตรวจพบความผิดปกติที่อุปกรณ์ "${sensorName}" กรุณาตรวจสอบทันที!`,
    priority: 'high' as const,
    data: { sensorName: sensorName },
  }];

  try {
    const ticketChunks = await expo.sendPushNotificationsAsync(messages);
    console.log("ยิง Push Notification สำเร็จ:", ticketChunks);
  } catch (error) {
    console.error("ยิง Push Notification พลาด:", error);
  }
};