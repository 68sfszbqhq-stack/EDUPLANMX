# 🔍 DIAGNÓSTICO: Problema de Autenticación

## ❓ Síntomas
- No puedes acceder/autenticarte en la aplicación local

## 🔧 Pasos de Diagnóstico

### **1. Verificar que el servidor está corriendo**
✅ El servidor está corriendo en `http://localhost:3000`

### **2. Abrir la Consola del Navegador**
1. Presiona **F12** o **Cmd+Option+I** (Mac)
2. Ve a la pestaña **Console**
3. Busca errores en rojo

**Errores comunes:**
- `Firebase: Error (auth/...)` - Problema de autenticación
- `CORS error` - Problema de configuración
- `Failed to fetch` - Problema de red/Firebase

### **3. Verificar la Página de Login**

**¿Qué ves en `http://localhost:3000/login`?**

#### **Opción A: Página en blanco**
- Abre la consola (F12)
- Busca errores de JavaScript
- Puede ser un problema de importación

#### **Opción B: Página de login visible pero no funciona**
- Click en "Iniciar sesión con Google"
- Abre la consola
- Busca el error específico

#### **Opción C: Error de Firebase**
Posibles causas:
- Dominio no autorizado
- Configuración incorrecta
- API keys incorrectas

---

## 🛠️ Soluciones Rápidas

### **Solución 1: Verificar Dominios Autorizados en Firebase**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona proyecto: **eduplanmx**
3. **Authentication** → **Settings** → **Authorized domains**
4. Verifica que esté autorizado:
   - ✅ `localhost`
   - ✅ `eduplanmx.netlify.app`
   - ✅ `eduplanmx.firebaseapp.com`

Si falta `localhost`, agrégalo:
- Click en **Add domain**
- Escribe: `localhost`
- Guardar

### **Solución 2: Limpiar Caché del Navegador**

```bash
# Opción A: Desde el navegador
Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)

# Opción B: Modo incógnito
Cmd+Shift+N (Mac) o Ctrl+Shift+N (Windows)
Abre: http://localhost:3000/login
```

### **Solución 3: Verificar Variables de Entorno**

Verifica que `.env` tenga las claves correctas:

```bash
VITE_FIREBASE_API_KEY=AIzaSyC-Ry46hCfXxez-lfA5ZX792AOIbmOc6Vw
VITE_FIREBASE_AUTH_DOMAIN=eduplanmx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eduplanmx
```

Si cambiaste algo, **reinicia el servidor**:
```bash
# Matar servidor
lsof -ti:3000 | xargs kill -9

# Reiniciar
npm run dev
```

### **Solución 4: Crear Usuario de Prueba Manual**

Si Google Sign-In no funciona, puedes crear un usuario con email/password:

1. Firebase Console → **Authentication** → **Users**
2. Click en **Add user**
3. Email: `test@eduplanmx.com`
4. Password: `Test123456`
5. Guardar

Luego en la app, usa esas credenciales.

---

## 📊 Checklist de Verificación

Marca lo que ya verificaste:

- [ ] Servidor corriendo en `localhost:3000`
- [ ] Página de login se carga (no está en blanco)
- [ ] Consola del navegador abierta (F12)
- [ ] `localhost` está en dominios autorizados de Firebase
- [ ] Variables de entorno correctas en `.env`
- [ ] Caché del navegador limpiado
- [ ] Intentaste en modo incógnito

---

## 🔴 Errores Específicos y Soluciones

### **Error: "auth/unauthorized-domain"**
**Causa:** `localhost` no está autorizado en Firebase

**Solución:**
1. Firebase Console → Authentication → Settings
2. Authorized domains → Add domain
3. Agregar: `localhost`

### **Error: "auth/popup-blocked"**
**Causa:** El navegador bloqueó el popup de Google

**Solución:**
1. Permitir popups para `localhost:3000`
2. O usar autenticación con redirect en lugar de popup

### **Error: "Failed to fetch"**
**Causa:** No hay conexión a Firebase

**Solución:**
1. Verifica tu conexión a internet
2. Verifica que Firebase esté activo
3. Revisa las API keys en `.env`

---

## 🆘 Si Nada Funciona

### **Opción A: Usar Producción**
La app en producción debería funcionar:
```
https://eduplanmx.netlify.app
```

### **Opción B: Revisar Logs**
Envíame:
1. Captura de pantalla de la consola del navegador (F12)
2. Captura de pantalla de la página de login
3. El error exacto que ves

---

## 📋 Información para Debugging

**URL actual:** `http://localhost:3000/login`
**Servidor:** Corriendo ✅
**Firebase Project:** eduplanmx
**Dominios autorizados:** Verificar en Firebase Console

---

## ✅ Próximos Pasos

1. **Abre la consola del navegador** (F12)
2. **Ve a** `http://localhost:3000/login`
3. **Copia el error** que aparece en la consola
4. **Envíamelo** para ayudarte mejor

**¿Qué error específico ves en la consola?** 🔍
