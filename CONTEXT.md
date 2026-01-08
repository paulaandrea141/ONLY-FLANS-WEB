# Only Flans - Frontend Context & Documentation

**Fecha de Actualización:** 7 de enero de 2026

## 📋 Resumen General

Sistema de reclutamiento autónomo 100% gratuito para Monterrey usando WhatsApp Personal + Firebase.

**Backend Repo:** https://github.com/paulaandrea141/PAULA-ANDREA-ONLY-FLANS-RECLUTAMIENTO

---

## 🏗️ Arquitectura del Proyecto

### Frontend (Este Proyecto)
- **Stack:** Next.js + TypeScript + Tailwind CSS
- **BD:** Firebase Firestore
- **Deploy:** Vercel
- **Ruta Local:** `c:\Users\choco\Desktop\onlyflans-web`

### Backend
- **Stack:** Node.js + TypeScript + Express
- **API:** WhatsApp Baileys (personal, sin costo)
- **Deploy:** Railway.app, Google Cloud Run o Render.com

---

## 🔐 Variables de Entorno `.env.local`

```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=onlyflans.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=onlyflans
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=onlyflans.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 📊 Colecciones Firebase Firestore

### `vacantes`
Trabajos disponibles con detalles:
- Empresa, salario, ubicación, requisitos
- Ejemplos: DAMAR ($2,100+$600), ILSAN ($2,288), MAGNEKON/BREMBO

### `candidatos`
Prospectos y empleados con:
- Datos personales, edad, colonia
- Formación y experiencia
- Estado (prospecto, en proceso, contratado)

### `rutasLogistica`
Rutas de entrega y distribución:
- Santa María, Ciénega y otras zonas

### `configuracionBot`
Parámetros y configuración del sistema

---

## 🎯 Flujo de Reclutamiento Automático

1. **Atracción:** Bot contacta candidatos por WhatsApp
2. **Calificación:** Recopila edad, colonia, formación
3. **Matching:** Asigna vacante automáticamente según algoritmo
4. **Inducción:** Envía detalles y horario
5. **Seguimiento:** Mantiene contacto post-contratación

---

## 📁 Estructura Actual Frontend

```
onlyflans-web/
├── pages/
│   ├── _app.tsx          (Configuración global + rutas)
│   ├── _document.tsx     (HTML base)
│   ├── index.tsx         (Inicio/Dashboard)
│   ├── candidatos.tsx    (Gestión de candidatos)
│   ├── leads.tsx         (CRM de leads)
│   ├── vacantes.tsx      (Gestión de vacantes)
│   └── admin/
│       └── vacantes.tsx  (Admin de vacantes)
├── lib/
│   └── firebase.ts       (Configuración Firebase)
├── globals.css
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 Comandos Principales

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Deploy Vercel
vercel
```

---

## 💡 Notas Importantes

- ✅ Firestore está en Spark Plan (gratuito)
- ✅ Firebase Rules deben estar configuradas
- ✅ `.env.local` debe estar en `.gitignore`
- ✅ Sistema completamente gratis
- ⚠️ WhatsApp personal (no público)

---

## 📝 Historial de Trabajo

Ver `holi-frontend.txt` para la bitácora detallada de cambios.

---

## 👤 Creador

Paula Andrea - Monterrey
Sistema creado con ❤️ para automatizar reclutamiento
