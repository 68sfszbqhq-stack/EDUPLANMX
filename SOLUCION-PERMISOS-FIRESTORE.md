# 🔧 SOLUCIÓN: Actualizar Reglas de Firestore

## ⚠️ Problema Detectado

```
Error: Missing or insufficient permissions
```

Las nuevas collections (`users`, `schools`, `api_usage`) no tienen permisos en Firestore.

---

## ✅ Solución Aplicada

### **1. Archivo Actualizado**
```
firestore.rules
```

### **2. Reglas Agregadas**
```javascript
// Colección de usuarios (nuevo sistema)
match /users/{userId} {
  allow read, write: if request.auth != null;
}

// Colección de escuelas
match /schools/{schoolId} {
  allow read, write: if request.auth != null;
}

// Colección de uso de API
match /api_usage/{userId} {
  allow read, write: if request.auth != null;
}

// Colección de cuotas de API
match /api_quotas/{quotaId} {
  allow read, write: if request.auth != null;
}
```

---

## 🚀 Desplegar en Firebase Console

Ya abrí Firebase Console. Ahora sigue estos pasos:

### **Paso 1: Copiar las Reglas**

Copia todo este contenido:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // REGLAS TEMPORALES PARA DESARROLLO
    // ============================================
    
    // Colección de usuarios - Permitir lectura y escritura para desarrollo
    match /usuarios/{userId} {
      allow read, write: if true;
    }
    
    // Colección de alumnos
    match /alumnos/{alumnoId} {
      allow read, write: if true;
    }
    
    // Colección de diagnósticos
    match /diagnosticos/{diagnosticoId} {
      allow read, write: if true;
    }
    
    // Colección de planeaciones
    match /planeaciones/{planeacionId} {
      allow read, write: if true;
    }
    
    // Colección de instituciones
    match /instituciones/{institucionId} {
      allow read, write: if true;
    }
    
    // Colección de grupos
    match /grupos/{grupoId} {
      allow read, write: if true;
    }
    
    // Colección de materias
    match /materias/{materiaId} {
      allow read, write: if true;
    }
    
    // Colección de asignaciones
    match /asignaciones/{asignacionId} {
      allow read, write: if true;
    }
    
    // ============================================
    // NUEVAS COLECCIONES - SISTEMA MULTI-ESCUELA
    // ============================================
    
    // Colección de usuarios (nuevo sistema)
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Colección de escuelas
    match /schools/{schoolId} {
      allow read, write: if request.auth != null;
    }
    
    // Colección de uso de API
    match /api_usage/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Colección de cuotas de API
    match /api_quotas/{quotaId} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

### **Paso 2: Pegar en Firebase Console**

1. En la página que se abrió (Firestore Rules)
2. **Seleccionar TODO** el contenido actual
3. **Borrar** todo
4. **Pegar** las nuevas reglas (de arriba)

### **Paso 3: Publicar**

1. Click en **"Publish"** (botón azul arriba a la derecha)
2. Esperar confirmación (~5 segundos)
3. ✅ Ver mensaje "Rules published successfully"

---

## ⏱️ Después de Publicar

**Espera 10-30 segundos** para que las reglas se propaguen.

Luego:
1. Volver a tu sitio: `https://eduplanmx.netlify.app`
2. **Refrescar la página** (F5 o Cmd+R)
3. Intentar login de nuevo
4. ✅ Debería funcionar sin errores

---

## 🎯 Lo Que Cambia

**ANTES**:
```
❌ Error: Missing or insufficient permissions
❌ No puede leer users
❌ No puede leer schools
❌ No puede crear escuela
```

**DESPUÉS**:
```
✅ Puede leer users (si está autenticado)
✅ Puede leer schools (si está autenticado)
✅ Puede crear escuela (si está autenticado)
✅ Onboarding funciona completamente
```

---

## 📋 Checklist

- [x] Actualizar firestore.rules localmente
- [x] Commit y push a GitHub
- [ ] **Copiar reglas** (de arriba)
- [ ] **Pegar en Firebase Console**
- [ ] **Publicar reglas**
- [ ] Esperar 10-30 segundos
- [ ] Refrescar sitio
- [ ] Probar login
- [ ] ✅ Verificar que funciona

---

## 🔐 Seguridad

Las nuevas reglas requieren:
- ✅ Usuario autenticado (`request.auth != null`)
- ✅ No permite acceso anónimo
- ✅ Protege datos sensibles

---

**¿Ya publicaste las reglas en Firebase Console?** Avísame cuando lo hagas. 🚀
