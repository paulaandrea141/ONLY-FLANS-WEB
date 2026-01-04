# 🚀 Deployment en Vercel - Only Flans Dashboard

## ⚡ Opción 1: Deploy Automático (Recomendado)

### Paso 1: Crear repositorio en GitHub

```bash
# Ir a https://github.com/new
# Nombre: PAULA-ANDREA-ONLY-FLANS-WEB
# Descripción: Frontend dashboard for Only Flans recruitment platform
# Público o Privado: Tu preferencia
# Crear repositorio
```

### Paso 2: Conectar el repositorio local

```bash
# En la carpeta onlyflans-web/

git remote set-url origin https://github.com/paulaandrea141/PAULA-ANDREA-ONLY-FLANS-WEB.git
git branch -M main
git push -u origin main
```

### Paso 3: Configurar Vercel

1. **Ir a**: https://vercel.com
2. **Login** con GitHub (conecta tu cuenta)
3. **Click**: "New Project"
4. **Importar repositorio**: Selecciona `PAULA-ANDREA-ONLY-FLANS-WEB`
5. **Framework Preset**: Selecciona "Next.js"
6. **Build Settings**: 
   - Build Command: `npm run build` ✅ (ya está configurado)
   - Output Directory: `.next` ✅ (Next.js default)
7. **Environment Variables**: Agregar

```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

8. **Deploy**: Click "Deploy"
9. **Esperar**: 3-5 minutos hasta que termine
10. **URL**: Vercel te da una URL como `https://only-flans-web.vercel.app`

---

## 🔑 Variables de Entorno Firebase

### Obtener credenciales:

```
1. Firebase Console: https://console.firebase.google.com
2. Proyecto: "Only Flans" (o el que usaste)
3. Settings → Project Settings → Tu App (Web)
4. Copiar config objeto:

{
  apiKey: "AIzaSy...",
  authDomain: "only-flans.firebaseapp.com",
  projectId: "only-flans",
  storageBucket: "only-flans.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
}

Poner cada valor en la variable correspondiente en Vercel
```

---

## 📋 Checklist Vercel Deploy

- [ ] GitHub repo creado
- [ ] Local conectado a remoto
- [ ] Push a main
- [ ] Vercel conectado con GitHub
- [ ] Variables de entorno configuradas
- [ ] Deploy completado
- [ ] Dashboard accesible en la URL

---

## ⚙️ Configuración Automática con GitHub Actions

El archivo `.github/workflows/deploy.yml` ya está listo. Solo agregar secrets a GitHub:

1. **En GitHub repo**: Settings → Secrets and variables → Actions
2. **New Repository Secret**: 

```
VERCEL_TOKEN = (obtener de https://vercel.com/account/tokens)
```

3. **New Organization Secret**:
```
VERCEL_ORG_ID = (del dashboard de Vercel)
VERCEL_PROJECT_ID = (del dashboard de Vercel)
```

Luego, cada push a main automáticamente deploy en Vercel.

---

## 🌍 Dominio Personalizado (Opcional)

```
1. En Vercel: Project Settings → Domains
2. Agregar: tudominio.com
3. Agregar DNS records en tu proveedor de dominio
4. Esperar 10-30 min para que se propague
```

---

## 🔒 Firestore Rules para Vercel

Agregar a Firestore:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Dashboard (Vercel) - Lectura pública, escritura admin
    match /vacantes/{document=**} {
      allow read: if true;  // Lectura pública
      allow write: if false;  // Solo backend puede escribir
    }
    
    match /candidatos/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    match /leads/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
  }
}
```

---

## 📊 Después del Deploy

Una vez en Vercel:

✅ Dashboard en: `https://your-url.vercel.app`
✅ Vacantes: `/vacantes`
✅ Candidatos: `/candidatos`
✅ Leads CRM: `/leads`

**Monitoreo**:
- Vercel Analytics: Dashboard → Analytics
- Firestore: Estadísticas en tiempo real
- Bot logs: Por terminal en servidor backend

---

## 🐛 Troubleshooting

### "Build failed"
```
Verificar:
- next.config.js existe
- package.json con dependencias correctas
- npm install ejecutado localmente
```

### "Firebase not found"
```
Verificar:
- NEXT_PUBLIC_* variables en Vercel
- Valores correctos copiados
- No hay espacios en blanco
```

### "Conexión lenta"
```
- Es normal primer build (5-10 min)
- Vercel cachea builds posteriores (30 seg)
- Revisar logs en Vercel dashboard
```

---

## 💡 Pro Tips

1. **Previews automáticos**: Cada PR crea una URL de preview
2. **Rollback**: Un click para volver a deploy anterior
3. **Logs en tiempo real**: Vercel → Deployments → mostrar logs
4. **Edge Functions**: Próxima fase para agregar lógica en el edge

---

## 📱 Acceso desde Teléfono

Una vez en Vercel:

```
https://your-url.vercel.app

Funciona en:
✅ Mobile (responsive design con Tailwind)
✅ Tablet
✅ Desktop

Datos en tiempo real desde Firestore
```

---

## ✨ Siguiente Paso

Después de Vercel deploy:

```
1. Backend en Railway o Google Cloud Run
2. Variables de entorno para bot
3. Webhook de WhatsApp apuntando a backend
4. Webhook de Facebook apuntando a backend
```

¡Vercel hace todo muy fácil!
