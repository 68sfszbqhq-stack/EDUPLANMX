# 🚀 RESUMEN RÁPIDO: Migración a Netlify

**Tiempo**: 10 minutos | **Dificultad**: ⭐ Fácil

---

## 📋 Checklist de 7 Pasos

### ✅ Paso 1: Crear Cuenta (2 min)
```
https://app.netlify.com/signup
```
- [ ] Registrarse con GitHub
- [ ] Autorizar Netlify

### ✅ Paso 2: Importar Proyecto (2 min)
- [ ] "Add new site" → "Import from GitHub"
- [ ] Seleccionar repositorio "EDUPLANMX"
- [ ] **NO hacer deploy todavía**

### ✅ Paso 3: Variables de Entorno (3 min)
En "Site settings" → "Environment variables", agregar:

```
VITE_API_KEY=YOUR_API_KEY_HERE
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=eduplanmx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eduplanmx
VITE_FIREBASE_STORAGE_BUCKET=eduplanmx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=144677335686
VITE_FIREBASE_APP_ID=1:144677335686:web:cd82543b32b323e3ea5707
```

- [ ] 7 variables agregadas

### ✅ Paso 4: Primer Deploy (2 min)
- [ ] "Deploys" → "Trigger deploy"
- [ ] Esperar build (1-2 min)
- [ ] ✅ Deploy succeeded

### ✅ Paso 5: Obtener URL
- [ ] Copiar URL: `https://random-name.netlify.app`

### ✅ Paso 6: Verificar (1 min)
- [ ] Abrir sitio
- [ ] Login funciona
- [ ] **Gemini AI funciona** ✨
- [ ] Sin errores en consola

### ✅ Paso 7: Deploy Automático
- [ ] Ya configurado ✅
- [ ] Cada `git push` → auto-deploy

---

## 🎯 Resultado

**Antes (GitHub Pages)**:
- ❌ Gemini no funciona
- ⚠️ Solo Firebase

**Después (Netlify)**:
- ✅ Gemini funciona
- ✅ Firebase funciona
- ✅ **Todo funciona** 🎉

---

## 📱 Acceso Rápido

**Dashboard**: https://app.netlify.com  
**Guía Completa**: GUIA-NETLIFY.md  
**Tu Sitio**: https://[tu-nombre].netlify.app

---

## 🆘 ¿Problemas?

**Build falla**: Verifica variables de entorno  
**404 en rutas**: Ya está configurado en netlify.toml  
**Variables no funcionan**: Nombres exactos (case-sensitive)

---

**¡Listo en 10 minutos!** 🚀
