// 🔥 SEED DE CANDIDATAS ÉLITE - CORP. TYRELL
// Tech Lead: Paula Andrea Hayle Specter Litt

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const eliteCandidates = [
  {
    name: 'Riley Reid',
    status: 'Online',
    lastMessage: '¡Hola! Lista para empezar cuando sea necesario. 💼',
    priority: 'High',
    phone: '+52 81 1234 5001',
    email: 'riley.reid@corptyrell.com',
    createdAt: serverTimestamp(),
  },
  {
    name: 'Lana Rhoades',
    status: 'Online',
    lastMessage: 'Buenas tardes, confirmo disponibilidad inmediata. ✨',
    priority: 'High',
    phone: '+52 81 1234 5002',
    email: 'lana.rhoades@corptyrell.com',
    createdAt: serverTimestamp(),
  },
  {
    name: 'Abella Danger',
    status: 'Online',
    lastMessage: 'Hola, preparada para la entrevista. 🚀',
    priority: 'High',
    phone: '+52 81 1234 5003',
    email: 'abella.danger@corptyrell.com',
    createdAt: serverTimestamp(),
  },
  {
    name: 'Mia Khalifa',
    status: 'Online',
    lastMessage: '¡Saludos! Revisé la vacante y estoy muy interesada. 💪',
    priority: 'High',
    phone: '+52 81 1234 5004',
    email: 'mia.khalifa@corptyrell.com',
    createdAt: serverTimestamp(),
  },
  {
    name: 'Dani Daniels',
    status: 'Online',
    lastMessage: 'Hola equipo, lista para contribuir desde hoy. 🔥',
    priority: 'High',
    phone: '+52 81 1234 5005',
    email: 'dani.daniels@corptyrell.com',
    createdAt: serverTimestamp(),
  },
];

async function seedEliteCandidates() {
  console.log('🔥 CORP. TYRELL - INYECTANDO CANDIDATAS ÉLITE...\n');

  try {
    for (const candidate of eliteCandidates) {
      const docRef = await addDoc(collection(db, 'candidates'), candidate);
      console.log(`✅ ${candidate.name} → ID: ${docRef.id}`);
    }

    console.log('\n🎯 SEED COMPLETADO. 5 candidatas élite en Firestore (colección: candidates).');
    console.log('📡 Refresca http://localhost:3001 para verlas en el Dashboard.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR AL INYECTAR:', error);
    process.exit(1);
  }
}

seedEliteCandidates();
