importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDU5PsYwZtrw3GwDQ22ebpNlx0TGT1hWyg",
  authDomain: "mindchat-8716a.firebaseapp.com",
  projectId: "mindchat-8716a",
  messagingSenderId: "894137387316",
  appId: "1:894137387316:web:e0362d34e8a19cb1187d61"
});

const messaging = firebase.messaging();

// ✅ Show notification when message received in background
messaging.onBackgroundMessage(function (payload) {
  console.log("🔔 FCM background message:", payload);

  const notificationTitle = payload.notification?.title || "MindChat";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message.",
    icon: "/Images/app.png", // Make sure this path exists in your public folder
    badge: "/Images/app.png",
    data: {
      url: payload?.fcmOptions?.link || "https://mindchat-one.vercel.app/chatboard"
    }
  };

  // ✅ Display the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Handle notification click
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "https://mindchat-one.vercel.app/chatboard")
  );
});
