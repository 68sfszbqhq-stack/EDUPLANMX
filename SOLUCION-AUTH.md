# 🔧 SOLUCIÓN AL ERROR DE AUTENTICACIÓN

## ✅ Problema Identificado

**Error:** `FirebaseError: Missing or insufficient permissions`

**Causa:** Las reglas de Firestore que desplegamos eran demasiado restrictivas y bloqueaban la lectura de usuarios durante el login.

---

## 🚀 SOLUCIÓN INMEDIATA

### **PASO 1: Desplegar Reglas Actualizadas**

Las reglas ya fueron corregidas en el archivo `firestore.rules`. Ahora necesitas desplegarlas:

1. **Ve a Firebase Console:**
   - https://console.firebase.google.com/
   - Proyecto: **eduplanmx**

2. **Firestore Database → Reglas**

3. **Copia TODAS las reglas actualizadas:**
   - Abre el archivo `firestore.rules` en tu editor
   - Selecciona TODO (Cmd+A)
   - Copia (Cmd+C)

4. **Pega en Firebase Console:**
   - Borra todo el contenido actual
   - Pega las nuevas reglas
   - Click en **Publicar**

5. **Espera 10-30 segundos** para que se propaguen

---

## 🔍 Qué Se Cambió

### **Antes (Bloqueaba el login):**
```javascript
match /users/{userId} {
  allow read: if isOwner(userId);
  // ❌ Esto requería que getUserData() funcionara,
  // pero getUserData() necesita leer el usuario primero
}
```

### **Después (Permite el login):**
```javascript
match /users/{userId} {
  // ✅ Permite leer tu propio perfil sin verificaciones circulares
  allow read: if isAuthenticated() && request.auth.uid == userId;
  
  // ✅ Permite crear tu perfil durante el login
  allow create: if isAuthenticated() 
                && request.auth.uid == userId
                && request.resource.data.id == request.auth.uid;
}
```

---

## 📋 Checklist

- [x] Reglas corregidas en `firestore.rules`
- [ ] **Reglas desplegadas en Firebase Console** ← HAZLO AHORA
- [ ] Esperar 10-30 segundos
- [ ] Recargar página de login (Cmd+Shift+R)
- [ ] Intentar login de nuevo

---

## ⚡ Después de Desplegar

1. **Recarga la página de login:**
   ```
   Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)
   ```

2. **Intenta iniciar sesión con Google**

3. **Debería funcionar ahora** ✅

---

## 🆘 Si Aún No Funciona

Después de desplegar las reglas, si aún tienes problemas:

1. Abre la consola del navegador (F12)
2. Copia el nuevo error
3. Envíamelo para ayudarte

---

## 📊 Reglas Actualizadas - Resumen

Las nuevas reglas permiten:
- ✅ Leer tu propio perfil (incluso si no existe)
- ✅ Crear tu perfil durante login/onboarding
- ✅ Actualizar tu perfil (sin cambiar rol/schoolId)
- ✅ Leer perfiles de tu escuela (después de tener schoolId)
- ✅ Aislamiento total por schoolId (se mantiene)

---

## 🎯 ACCIÓN REQUERIDA

**VE A FIREBASE CONSOLE Y DESPLIEGA LAS REGLAS AHORA:**

1. https://console.firebase.google.com/
2. Proyecto: eduplanmx
3. Firestore Database → Reglas
4. Copiar contenido de `firestore.rules`
5. Pegar y Publicar
6. Esperar 30 segundos
7. Recargar login y probar

**¿Ya desplegaste las reglas?** 🚀
