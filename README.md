# EDUPLANMX - Sistema de Planeación Educativa

Sistema integral de planeación didáctica para Educación Media Superior, alineado al MCCEMS 2024.

## 🚀 Características

- ✅ Generación automática de planeaciones con IA (Gemini)
- ✅ Sistema modular de herramientas educativas
- ✅ Autenticación con Firebase
- ✅ Base de datos en Firestore
- ✅ Interfaz moderna y responsive
- ✅ Deploy en GitHub Pages (`npm run deploy`)

## 🌐 Deploy

**Producción**: https://68sfszbqhq-stack.github.io/EDUPLANMX/  
**Repositorio**: https://github.com/68sfszbqhq-stack/EDUPLANMX

## 📚 Documentación

- `GUIA-NETLIFY.md` - Guía de deploy en Netlify
- `SISTEMA-HERRAMIENTAS.md` - Sistema de herramientas educativas
- `RESOLUCION-SEGURIDAD-FINAL.md` - Configuración de seguridad

## 🔧 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus claves

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

## 📦 Variables de Entorno Requeridas

```bash
VITE_API_KEY=                        # Gemini API Key
VITE_FIREBASE_API_KEY=               # Firebase API Key
VITE_FIREBASE_AUTH_DOMAIN=           # Firebase Auth Domain
VITE_FIREBASE_PROJECT_ID=            # Firebase Project ID
VITE_FIREBASE_STORAGE_BUCKET=        # Firebase Storage Bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=   # Firebase Messaging Sender ID
VITE_FIREBASE_APP_ID=                # Firebase App ID
```

## 🛠️ Stack Tecnológico

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **IA**: Google Gemini 2.5 Flash
- **Backend**: Firebase (Auth + Firestore)
- **Deploy**: GitHub Pages
- **Icons**: Lucide React

## 📄 Licencia

Proyecto educativo - 2026
