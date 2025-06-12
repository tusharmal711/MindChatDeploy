import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDU5PsYwZtrw3GwDQ22ebpNlx0TGT1hWyg",
  authDomain: "mindchat-8716a.firebaseapp.com",
  projectId: "mindchat-8716a",
  storageBucket: "mindchat-8716a.firebasestorage.app",
  messagingSenderId: "894137387316",
  appId: "1:894137387316:web:e0362d34e8a19cb1187d61",
  measurementId: "G-PHC9K1J07D"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const getFCMToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: 'BGQ7SbxFoSteFJXxUeoaP2EyKaZFKBZTtN1AF-wDjNHG9M4L5cWCPghF2fH4icLh6oquU8QFDkXcFiBt2aq1MoQ',
    });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

export { messaging, onMessage };



 