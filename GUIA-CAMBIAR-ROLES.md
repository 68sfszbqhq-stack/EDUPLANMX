# 🔧 GUÍA: Cambiar Roles de Usuarios

## 📋 Usuarios a Actualizar

1. **jose.mendoza.buap@gmail.com** → `superadmin`
2. **jose.mendoza.bgo@gmail.com** → `maestro`
3. **jozezito2004@gmail.com** → `directivo`

---

## 🚀 OPCIÓN 1: Desde Firebase Console (Recomendado)

### **Paso 1: Abrir Firestore**

1. Ve a: https://console.firebase.google.com/project/eduplanmx/firestore/data
2. Selecciona la colección `users`

### **Paso 2: Actualizar Cada Usuario**

#### **Usuario 1: jose.mendoza.buap@gmail.com**
1. Busca el documento con `email: jose.mendoza.buap@gmail.com`
2. Click en el documento
3. Busca el campo `rol`
4. Cambia el valor a: `superadmin`
5. Click en "Actualizar"

#### **Usuario 2: jose.mendoza.bgo@gmail.com**
1. Busca el documento con `email: jose.mendoza.bgo@gmail.com`
2. Si NO existe:
   - Este usuario debe **iniciar sesión primero** en la app
   - Después de iniciar sesión, vuelve aquí y actualiza su rol
3. Si existe:
   - Click en el documento
   - Busca el campo `rol`
   - Cambia el valor a: `maestro`
   - Click en "Actualizar"

#### **Usuario 3: jozezito2004@gmail.com**
1. Busca el documento con `email: jozezito2004@gmail.com`
2. Si NO existe:
   - Este usuario debe **iniciar sesión primero** en la app
   - Después de iniciar sesión, vuelve aquí y actualiza su rol
3. Si existe:
   - Click en el documento
   - Busca el campo `rol`
   - Cambia el valor a: `directivo`
   - Click en "Actualizar"

---

## 🚀 OPCIÓN 2: Desde Consola del Navegador

### **Paso 1: Abrir Firebase Console**
https://console.firebase.google.com/project/eduplanmx/firestore/data

### **Paso 2: Abrir Consola del Navegador**
Presiona `F12` o `Cmd+Option+I`

### **Paso 3: Pegar y Ejecutar Este Código**

```javascript
// Copiar y pegar TODO este código en la consola

const updateRoles = async () => {
  const updates = [
    { email: 'jose.mendoza.buap@gmail.com', rol: 'superadmin' },
    { email: 'jose.mendoza.bgo@gmail.com', rol: 'maestro' },
    { email: 'jozezito2004@gmail.com', rol: 'directivo' }
  ];

  console.log('🔧 Iniciando actualización de roles...\n');

  for (const update of updates) {
    try {
      // Buscar usuario por email
      const usersRef = firebase.firestore().collection('users');
      const snapshot = await usersRef.where('email', '==', update.email).get();

      if (snapshot.empty) {
        console.log(`⚠️  ${update.email} - Usuario no encontrado (debe iniciar sesión primero)`);
        continue;
      }

      // Actualizar rol
      const userDoc = snapshot.docs[0];
      await userDoc.ref.update({
        rol: update.rol,
        updatedAt: new Date().toISOString()
      });

      console.log(`✅ ${update.email} → ${update.rol}`);
    } catch (error) {
      console.error(`❌ Error en ${update.email}:`, error.message);
    }
  }

  console.log('\n✅ Proceso completado');
};

// Ejecutar
updateRoles();
```

---

## 🚀 OPCIÓN 3: Manualmente (Más Simple)

### **Paso a Paso:**

1. **Abre Firestore:**
   https://console.firebase.google.com/project/eduplanmx/firestore/data

2. **Click en la colección `users`**

3. **Para cada usuario:**
   - Busca por email (usa Ctrl+F en la página)
   - Click en el documento
   - Edita el campo `rol`
   - Guarda

---

## ⚠️ IMPORTANTE

### **Si un usuario NO aparece en Firestore:**

Significa que **nunca ha iniciado sesión**. Para solucionarlo:

1. El usuario debe ir a: http://localhost:3000/login
2. Iniciar sesión con Google
3. Completar el onboarding
4. Luego TÚ actualizas su rol en Firestore

---

## 📊 Roles Disponibles

- **`superadmin`** - Acceso total a todo el sistema
- **`directivo`** - Director, puede ver toda su escuela
- **`maestro`** - Docente, solo ve sus planeaciones
- **`alumno`** - Estudiante (si aplica)

---

## 🔍 Verificar Cambios

Después de actualizar los roles:

1. Los usuarios deben **cerrar sesión** y **volver a iniciar sesión**
2. O simplemente **recargar la página** (Cmd+Shift+R)
3. Verificar que tienen los permisos correctos

---

## 🆘 Si Algo Sale Mal

Si un usuario no puede acceder después de cambiar su rol:

1. Verifica que el campo `rol` esté escrito exactamente como arriba
2. Verifica que el usuario tenga `schoolId`
3. Pide al usuario que cierre sesión y vuelva a entrar

---

**¿Cuál opción prefieres usar?**

1. **Opción 1** - Manual desde Firebase Console (más seguro)
2. **Opción 2** - Script desde consola del navegador (más rápido)
3. **Opción 3** - Te ayudo paso a paso

🚀
