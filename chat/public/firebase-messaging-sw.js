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

messaging.onBackgroundMessage(function (payload) {
  console.log("FCM background message: ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/Images/app.png",
  
  };

  // self.registration.showNotification(notificationTitle, notificationOptions);
});
