// 🔥 SEED DE CANDIDATOS CYBERPUNK - CORP. TYRELL
// Tech Lead: Paula Specter (@SpecterTech)

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

const candidatosCyberpunk = [
  {
    nombre: 'Raven Blackwood',
    telefono: '+528112345001',
    whatsapp: '+528112345001',
    edad: 24,
    genero: 'F',
    colonia: 'Santa Catarina',
    ciudad: 'Monterrey',
    formacion: 'Preparatoria',
    experiencia: '2 años en manufactura',
    restricciones: {
      tatuajesVisibles: true,
      tatuajesCaraOCuello: false,
    },
    etapa: 'Prospecto',
    vacanteAsignada: null,
    score: 85,
    disponibilidad: 'Inmediata',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    nombre: 'Nyx Sterling',
    telefono: '+528112345002',
    whatsapp: '+528112345002',
    edad: 28,
    genero: 'M',
    colonia: 'Escobedo',
    ciudad: 'Monterrey',
    formacion: 'Licenciatura',
    experiencia: '3 años en logística',
    restricciones: {
      tatuajesVisibles: false,
      tatuajesCaraOCuello: false,
    },
    etapa: 'Calificado',
    vacanteAsignada: null,
    score: 92,
    disponibilidad: '2 semanas',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    nombre: 'Cipher Vex',
    telefono: '+528112345003',
    whatsapp: '+528112345003',
    edad: 22,
    genero: 'F',
    colonia: 'García',
    ciudad: 'Monterrey',
    formacion: 'Secundaria',
    experiencia: '1 año en retail',
    restricciones: {
      tatuajesVisibles: true,
      tatuajesCaraOCuello: true,
    },
    etapa: 'Prospecto',
    vacanteAsignada: null,
    score: 67,
    disponibilidad: 'Inmediata',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    nombre: 'Kael Obsidian',
    telefono: '+528112345004',
    whatsapp: '+528112345004',
    edad: 26,
    genero: 'M',
    colonia: 'Apodaca',
    ciudad: 'Monterrey',
    formacion: 'Preparatoria',
    experiencia: '4 años en construcción',
    restricciones: {
      tatuajesVisibles: true,
      tatuajesCaraOCuello: false,
    },
    etapa: 'Asignado',
    vacanteAsignada: 'VAC-001',
    score: 88,
    disponibilidad: 'Inmediata',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    nombre: 'Nova Phantom',
    telefono: '+528112345005',
    whatsapp: '+528112345005',
    edad: 30,
    genero: 'F',
    colonia: 'San Nicolás',
    ciudad: 'Monterrey',
    formacion: 'Licenciatura',
    experiencia: '5 años en administración',
    restricciones: {
      tatuajesVisibles: false,
      tatuajesCaraOCuello: false,
    },
    etapa: 'Inductado',
    vacanteAsignada: 'VAC-002',
    score: 95,
    disponibilidad: 'Inmediata',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

async function seedCandidatos() {
  console.log('🔥 CORP. TYRELL - SEEDING CANDIDATOS CYBERPUNK...');

  try {
    for (const candidato of candidatosCyberpunk) {
      const docRef = await addDoc(collection(db, 'candidatos'), candidato);
      console.log(`✅ ${candidato.nombre} insertado con ID: ${docRef.id}`);
    }

    console.log('\n🎯 SEED COMPLETADO. 5 candidatos cyberpunk en Firestore.');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR AL HACER SEED:', error);
    process.exit(1);
  }
}

seedCandidatos();
