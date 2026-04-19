import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotification = async (expoPushToken: string, title: string, body: string) => {
    if (!Expo.isExpoPushToken(expoPushToken)) {
        console.error(`Token นี้ผิดรูปแบบ: ${expoPushToken}`);
        return;
    }

    const messages = [{
        to: expoPushToken,
        sound: 'default' as const,
        title: title,
        body: body,
        data: { route: '/houses' },
    }];

    try {
        const ticketChunk = await expo.sendPushNotificationsAsync(messages);
        console.log("ส่ง Push ไป Expo สำเร็จ:", ticketChunk);
    } catch (error) {
        console.error("ส่ง Push ล้มเหลว:", error);
    }
};