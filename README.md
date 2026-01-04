# Only Flans Dashboard - Admin Web

Dashboard Next.js para gestionar candidatos, vacantes y seguimiento de reclutamiento en tiempo real.

## 🎨 Características

- ✅ Dashboard en tiempo real
- ✅ Gestión de vacantes (CRUD)
- ✅ Visualización de candidatos
- ✅ Integración Firebase Firestore
- ✅ UI moderna con Tailwind CSS
- ✅ Responsive design
- ✅ Deploy gratuito en Vercel

## 📦 Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Firebase Firestore
- Heroicons

## 🚀 Instalación

```bash
npm install
```

## ⚙️ Variables de Entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=onlyflans.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=onlyflans
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=onlyflans.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🏃 Ejecutar en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

## 📊 Páginas

- **/** - Dashboard principal con stats
- **/vacantes** - Gestión de vacantes
- **/candidatos** - Listado de candidatos

## 🌐 Deploy en Vercel

```bash
vercel
```

Selecciona este proyecto y Vercel manejará el deploy automático.

## 📚 Estructura

```
pages/
  _app.tsx         - Configuración global
  _document.tsx    - HTML wrapper
  index.tsx        - Dashboard home
  vacantes.tsx     - Gestión de vacantes
  candidatos.tsx   - Listado de candidatos
lib/
  firebase.ts      - Configuración Firebase
```

## 🔗 Conectar con Backend

El dashboard se conecta automáticamente a Firebase. El backend (Baileys bot) usa la misma base de datos.

---

**Deploy Gratis en Vercel + Firebase Spark**
