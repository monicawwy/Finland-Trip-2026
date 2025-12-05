// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 這裡貼上你在 Firebase 網頁複製的那堆 Config
const firebaseConfig = {
  apiKey: "AIzaSyBAp_DFoXnHRNnrtzTW24Vao0b-_gROiOc",
  authDomain: "finland-2026.firebaseapp.com",
  projectId: "finland-2026",
  storageBucket: "finland-2026.firebasestorage.app",
  messagingSenderId: "968058915484",
  appId: "1:968058915484:web:dda932b9594ed9472e7b59",
  measurementId: "G-NE5GNYG4LC"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 匯出 Database 和 Storage 給其他檔案用
export const db = getFirestore(app);
export const storage = getStorage(app);
