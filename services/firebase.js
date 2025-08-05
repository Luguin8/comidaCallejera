// /services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// Importa tus variables de entorno desde .env (si usas expo-constants)
// import Constants from "expo-constants";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBAVco5Pw9bBGiXQFwX972t3Npn2JmmbTw",
  authDomain: "comida-callejera-app.firebaseapp.com",
  projectId: "comida-callejera-app",
  storageBucket: "comida-callejera-app.firebasestorage.app",
  messagingSenderId: "480125556637",
  appId: "1:480125556637:web:9fd7b3b64747dbd6b8c174"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios que usaremos
export const db = getFirestore(app);
export const auth = getAuth(app);