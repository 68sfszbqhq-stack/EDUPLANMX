# 🚀 GUÍA DE DESPLIEGUE: AISLAMIENTO MULTI-ESCUELA

## ✅ Implementación Completada

Se han creado los siguientes archivos:

1. **`src/services/planeacionesService.ts`** - Servicio completo con aislamiento
2. **`firestore.rules`** - Reglas de seguridad actualizadas
3. **`scripts/migrateToMultiSchool.ts`** - Script de migración de datos
4. **Componentes actualizados**:
   - `PersonalizedDashboard.tsx`
   - `App.tsx`

---

## 📋 PASOS PARA DESPLEGAR

### **PASO 1: Migrar Datos Existentes** 🔄

Antes de desplegar las nuevas reglas, necesitas migrar las planeaciones existentes:

```bash
# Instalar dependencias si es necesario
npm install

# Ejecutar script de migración
npx ts-node scripts/migrateToMultiSchool.ts
```

**Qué hace el script:**
- ✅ Busca planeaciones sin `schoolId`
- ✅ Obtiene el `schoolId` del usuario que la creó
- ✅ Actualiza cada planeación
- ✅ Genera reporte en `migration-report.json`
- ✅ Valida que todo esté correcto

**Salida esperada:**
```
📊 REPORTE FINAL DE MIGRACIÓN
============================================================
Total de planeaciones:        50
✅ Migradas exitosamente:     45
⏭️  Ya tenían schoolId:        5
⚠️  Sin userId:                0
❌ Errores:                    0
============================================================
```

---

### **PASO 2: Desplegar Reglas de Firestore** 🔐

#### **Opción A: Firebase Console (Recomendado)**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **eduplanmx**
3. Ve a **Firestore Database** → **Reglas**
4. Copia el contenido de `firestore.rules`
5. Pégalo en el editor
6. Click en **Publicar**

#### **Opción B: Firebase CLI**

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Login
firebase login

# Desplegar solo las reglas
firebase deploy --only firestore:rules
```

---

### **PASO 3: Probar el Aislamiento** 🧪

#### **Test 1: Crear Planeación**

1. Inicia sesión como docente
2. Ve a "Nueva Planeación"
3. Crea una planeación
4. Verifica en Firestore que tiene `schoolId`

#### **Test 2: Ver Planeaciones**

1. Ve al Dashboard
2. Verifica que solo ves tus planeaciones
3. Verifica que todas son de tu escuela

#### **Test 3: Intentar Acceso No Autorizado**

Abre la consola del navegador y ejecuta:

```javascript
// Intentar leer planeación de otra escuela (debe fallar)
const db = getFirestore();
const planRef = doc(db, 'planeaciones', 'ID_DE_OTRA_ESCUELA');
await getDoc(planRef); // ❌ Debe dar error de permisos
```

---

### **PASO 4: Verificar en Producción** ✅

1. **Desplegar a Netlify**:
   ```bash
   git add .
   git commit -m "feat: Implementar aislamiento multi-escuela completo"
   git push origin main
   ```

2. **Esperar despliegue** (2-3 minutos)

3. **Probar en producción**:
   - Crear planeación
   - Ver dashboard
   - Verificar que solo ves datos de tu escuela

---

## 🔍 VALIDACIÓN POST-DESPLIEGUE

### **Checklist de Seguridad**

- [ ] Las planeaciones tienen `schoolId`
- [ ] Solo veo planeaciones de mi escuela
- [ ] No puedo ver planeaciones de otras escuelas
- [ ] Puedo crear planeaciones (se guardan con `schoolId`)
- [ ] Puedo actualizar mis planeaciones
- [ ] NO puedo actualizar planeaciones de otros
- [ ] Director puede ver todas las de su escuela
- [ ] Docente solo ve las suyas

### **Verificar en Firestore Console**

1. Ve a Firestore Database
2. Abre colección `planeaciones`
3. Verifica que TODAS tienen:
   - `userId`
   - `schoolId`
   - `createdAt`

---

## 📊 ÍNDICES REQUERIDOS

Firestore necesita índices compuestos para las queries. Créalos en:
**Firestore Database** → **Índices** → **Crear índice**

### **Índice 1: Planeaciones por Escuela y Usuario**
- Colección: `planeaciones`
- Campos:
  - `schoolId` (Ascendente)
  - `userId` (Ascendente)
  - `createdAt` (Descendente)

### **Índice 2: Planeaciones por Escuela**
- Colección: `planeaciones`
- Campos:
  - `schoolId` (Ascendente)
  - `createdAt` (Descendente)

**O ejecuta estos comandos:**

```bash
firebase firestore:indexes:create \
  --collection-group=planeaciones \
  --field=schoolId \
  --field=userId \
  --field=createdAt:desc

firebase firestore:indexes:create \
  --collection-group=planeaciones \
  --field=schoolId \
  --field=createdAt:desc
```

---

## ⚠️ TROUBLESHOOTING

### **Error: "Missing or insufficient permissions"**

**Causa**: Las reglas de Firestore no están desplegadas o hay un error en ellas.

**Solución**:
1. Verifica que desplegaste las reglas
2. Revisa la consola de Firebase para errores
3. Asegúrate de que el usuario tiene `schoolId`

### **Error: "The query requires an index"**

**Causa**: Falta crear los índices compuestos.

**Solución**:
1. Click en el link del error (te lleva a crear el índice)
2. O créalos manualmente como se indica arriba

### **No veo mis planeaciones**

**Causa**: Puede que no tengan `schoolId` o el filtro está mal.

**Solución**:
1. Verifica en Firestore que las planeaciones tienen `schoolId`
2. Ejecuta el script de migración de nuevo
3. Verifica que `user.schoolId` existe en el contexto

---

## 🎯 RESULTADO ESPERADO

Después del despliegue:

### **Escuela A (CBT No. 1)**
```
Director José:
  ✅ Ve 50 planeaciones (todas de su escuela)
  ✅ Ve 5 docentes
  ✅ Puede editar configuración de escuela

Docente María:
  ✅ Ve 12 planeaciones (solo las suyas)
  ✅ Ve lista de docentes de su escuela
  ❌ NO puede editar configuración de escuela
```

### **Escuela B (CBT No. 2)**
```
Director Luis:
  ✅ Ve 30 planeaciones (todas de su escuela)
  ✅ Ve 3 docentes
  ❌ NO ve nada de Escuela A

Docente Carmen:
  ✅ Ve 8 planeaciones (solo las suyas)
  ❌ NO ve nada de Escuela A
```

---

## 📞 SOPORTE

Si encuentras problemas:

1. **Revisa el reporte de migración**: `migration-report.json`
2. **Verifica las reglas de Firestore** en la consola
3. **Revisa los logs del navegador** (F12 → Console)
4. **Verifica los datos en Firestore** directamente

---

## ✅ CHECKLIST FINAL

- [ ] Script de migración ejecutado exitosamente
- [ ] Todas las planeaciones tienen `schoolId`
- [ ] Reglas de Firestore desplegadas
- [ ] Índices creados
- [ ] Código desplegado a Netlify
- [ ] Tests de aislamiento pasados
- [ ] Dashboard muestra solo datos de mi escuela
- [ ] No puedo ver datos de otras escuelas

---

## 🎉 ¡LISTO!

Tu sistema ahora tiene **aislamiento total** entre escuelas. Cada escuela es completamente independiente y segura.

**Próximos pasos opcionales:**
- [ ] Implementar panel de Super Admin
- [ ] Agregar reportes por escuela
- [ ] Implementar exportación de datos
- [ ] Agregar auditoría de accesos
