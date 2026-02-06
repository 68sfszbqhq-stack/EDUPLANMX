# ✅ RESOLUCIÓN DE SEGURIDAD - Checklist

## 📋 Estado Actual

**Fecha**: 2026-02-05 19:11  
**Alerta**: API Key de Firebase expuesta públicamente  
**Acción**: En proceso de resolución

---

## ✅ Pasos Completados

- [x] **Documentación creada** - REPORTE_SEGURIDAD.md
- [x] **Script de resolución** - fix-security.sh
- [x] **Código actualizado** - firebase.ts usa variables de entorno
- [x] **Tipos TypeScript** - Definiciones agregadas
- [x] **Commit realizado** - Cambios guardados en Git

---

## ⏳ Pasos Pendientes (URGENTE)

### 1. Configurar Restricciones de Dominio 🔴 CRÍTICO

**URL**: https://console.cloud.google.com/apis/credentials?project=eduplanmx

**Pasos**:
1. Busca la API Key "Browser key (auto created by Firebase)"
2. Click en el nombre para editarla
3. En "Application restrictions":
   - Selecciona: **HTTP referrers (web sites)**
4. En "Website restrictions", agrega:
   ```
   https://68sfszbqhq-stack.github.io/EDUPLANMX/*
   http://localhost:*
   https://localhost:*
   ```
5. Click "Save"

**Estado**: ⏳ PENDIENTE - Esperando tu acción

---

### 2. Verificar Firestore Rules 🟡 IMPORTANTE

**URL**: https://console.firebase.google.com/project/eduplanmx/firestore/rules

**Reglas Recomendadas**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Requerir autenticación para todo
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Estado**: ⏳ PENDIENTE - Verificar y actualizar si es necesario

---

### 3. Push y Deploy 🟢 OPCIONAL

Una vez configuradas las restricciones:

```bash
git push origin main
npm run build
./deploy.sh
```

**Estado**: ⏳ PENDIENTE - Después de configurar restricciones

---

## 💡 Información Importante

### ¿Por qué la API Key sigue en el código?

**Las API Keys de Firebase son PÚBLICAS por diseño**:
- ✅ Es normal que estén en el código del cliente
- ✅ No son secretas como las API Keys de backend
- ✅ La seguridad viene de:
  1. **Firestore Rules** (requieren autenticación)
  2. **Restricciones de dominio** (solo ciertos sitios)
  3. **Firebase Authentication** (usuarios autenticados)

### ¿Qué hace el código actualizado?

```typescript
// Antes (hardcoded):
apiKey: "AIzaSy..."

// Ahora (con fallback):
apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy..."
```

**Ventajas**:
- ✅ Permite usar variables de entorno en desarrollo
- ✅ Mantiene compatibilidad con producción (fallback)
- ✅ Facilita rotación de claves en el futuro

---

## 🎯 Próxima Acción Requerida

**AHORA MISMO**: Configura las restricciones de dominio en Google Cloud Console

La ventana ya debería estar abierta en tu navegador. Si no:
```
https://console.cloud.google.com/apis/credentials?project=eduplanmx
```

**Una vez que termines, avísame y haremos el push + deploy final.** ✅

---

## 📊 Nivel de Riesgo

| Aspecto | Antes | Después |
|---------|-------|---------|
| API Key expuesta | 🔴 Sí | 🔴 Sí (pero es normal) |
| Restricciones | 🔴 No | ⏳ Pendiente |
| Firestore Rules | ⚠️ ? | ⏳ Por verificar |
| Variables de entorno | 🔴 No | ✅ Sí |
| Documentación | 🔴 No | ✅ Sí |

**Riesgo Actual**: 🟡 MEDIO (bajará a 🟢 BAJO después de restricciones)

---

**Última actualización**: 2026-02-05 19:11
