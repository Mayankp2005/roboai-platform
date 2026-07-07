import { initializeApp } from "firebase/app";
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDr-h83prGQ1j0i6RzCQcX1R1MSqimb6_8",
  authDomain: "kit-23624.firebaseapp.com",
  projectId: "kit-23624",
  storageBucket: "kit-23624.firebasestorage.app",
  messagingSenderId: "974896418776",
  appId: "1:974896418776:web:8099b8db4d488d2d6d2cad",
  measurementId: "G-2TJKX41M2N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service with explicit persistence for Electron/hybrid support
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  popupRedirectResolver: browserPopupRedirectResolver,
});



// Initialize Cloud Firestore and get a reference to the service
// Enable experimentalForceLongPolling to bypass gRPC/WebSocket stream blocks in Electron
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
