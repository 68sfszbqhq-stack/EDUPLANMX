# 🚀 Guía de Deploy: GitHub Pages + Firebase

## 📋 Configuración Inicial

### 1. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. En **Project Settings** > **General** > **Your apps**
4. Crea una **Web App** y copia la configuración
5. Pega los valores en tu archivo `.env`:

```bash
VITE_FIREBASE_API_KEY=tu-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id
```

### 2. Habilitar Firestore Database

1. En Firebase Console, ve a **Firestore Database**
2. Click en **Create database**
3. Selecciona **Start in test mode** (o production mode con reglas personalizadas)
4. Elige una ubicación cercana (ej: `us-central`)

### 3. Configurar Reglas de Seguridad de Firestore

En **Firestore Database** > **Rules**, pega esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura de alumnos
    match /alumnos/{alumnoId} {
      allow read, write: if true; // Cambia esto en producción
    }
    
    // Permitir lectura y escritura de diagnósticos
    match /diagnosticos/{diagnosticoId} {
      allow read, write: if true; // Cambia esto en producción
    }
    
    // Permitir lectura y escritura de planeaciones
    match /planeaciones/{planeacionId} {
      allow read, write: if true; // Cambia esto en producción
    }
  }
}
```

**⚠️ IMPORTANTE**: Estas reglas permiten acceso total. En producción, debes implementar autenticación.

---

## 🌐 Deploy a GitHub Pages

### Opción 1: Deploy Automático (Recomendado)

```bash
npm run deploy
```

Este comando:
1. ✅ Construye la aplicación (`npm run build`)
2. ✅ Crea el archivo `.nojekyll`
3. ✅ Sube a la rama `gh-pages`

### Opción 2: Deploy Manual

```bash
# 1. Construir
npm run build

# 2. Ir a la carpeta dist
cd dist

# 3. Crear .nojekyll
touch .nojekyll

# 4. Inicializar git
git init
git add -A
git commit -m "Deploy"

# 5. Push a gh-pages
git push -f git@github.com:68sfszbqhq-stack/EDUPLANMX.git main:gh-pages

cd ..
```

### Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. **Settings** > **Pages**
3. En **Source**, selecciona la rama `gh-pages`
4. Click en **Save**
5. Espera unos minutos

Tu app estará en: **https://68sfszbqhq-stack.github.io/EDUPLANMX/**

---

## 🔧 Variables de Entorno en GitHub Pages

GitHub Pages es **estático**, así que las variables de entorno se compilan en el build.

### Para Desarrollo Local:
Usa el archivo `.env` (ya configurado)

### Para Producción (GitHub Pages):

**Opción A**: Usar GitHub Actions (Recomendado)

Crea `.github/workflows/deploy.yml`:

\`\`\`yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        env:
          VITE_API_KEY: ${{ secrets.VITE_API_KEY }}
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
\`\`\`

Luego, en GitHub:
1. **Settings** > **Secrets and variables** > **Actions**
2. Agrega cada variable como **Repository secret**

**Opción B**: Build local con variables

Simplemente asegúrate de tener tu `.env` configurado antes de hacer `npm run deploy`.

---

## 📊 Estructura de Datos en Firestore

### Colección: `alumnos`
```javascript
{
  id: "auto-generado",
  datosAdministrativos: {
    curp: "...",
    nombre: "...",
    genero: "...",
    promedioSecundaria: 8.5,
    tipoSecundaria: "General",
    sostenimiento: "Público"
  },
  datosNEM: {
    tipoFamilia: "Nuclear",
    ingresosMensuales: "5001-10000",
    serviciosVivienda: {...},
    problemasComunitarios: [...],
    materiasPreferidas: [...],
    actividadesInteres: [...]
  },
  fechaRegistro: "2026-01-10T10:00:00.000Z"
}
```

### Colección: `diagnosticos`
```javascript
{
  id: "auto-generado",
  grupoId: "1A",
  totalAlumnos: 30,
  perfilAprendizaje: {...},
  alertasAbandono: [...],
  problemaPAEC: {...},
  metasPMC: [...],
  fechaGeneracion: "2026-01-10T10:00:00.000Z"
}
```

### Colección: `planeaciones`
```javascript
{
  id: "auto-generado",
  title: "...",
  subject: "...",
  learningGoal: "...",
  sequence: {...},
  mccemsAlignment: {...},
  fechaCreacion: "2026-01-10T10:00:00.000Z"
}
```

---

## ✅ Checklist de Deploy

- [ ] Firebase proyecto creado
- [ ] Firestore Database habilitado
- [ ] Variables de entorno configuradas en `.env`
- [ ] App funciona en local (`npm run dev`)
- [ ] Build exitoso (`npm run build`)
- [ ] Deploy a GitHub Pages (`npm run deploy`)
- [ ] GitHub Pages habilitado en Settings
- [ ] App accesible en la URL de GitHub Pages

---

## 🐛 Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"
- Verifica que todas las variables de Firebase estén en `.env`
- Asegúrate de que el proyecto de Firebase esté correctamente configurado

### Error: "404 Not Found" en GitHub Pages
- Verifica que la rama `gh-pages` exista
- Asegúrate de que GitHub Pages esté habilitado en Settings
- Espera unos minutos después del deploy

### Error: "Blank page" en producción
- Verifica que `base` en `vite.config.ts` sea `/EDUPLANMX/`
- Asegúrate de que el archivo `.nojekyll` exista en `dist`

### Los datos no se guardan en Firebase
- Verifica las reglas de seguridad de Firestore
- Revisa la consola del navegador para errores
- Asegúrate de que las variables de Firebase sean correctas

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica los logs de Firebase Console
3. Asegúrate de que todas las variables estén configuradas

---

## 🎉 ¡Listo!

Tu aplicación **EDUPLANMX** ahora está:
- ✅ Alojada en GitHub Pages
- ✅ Conectada a Firebase (Firestore)
- ✅ Lista para guardar datos en la nube
- ✅ Accesible desde cualquier dispositivo

**URL de tu app**: https://68sfszbqhq-stack.github.io/EDUPLANMX/
