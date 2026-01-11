# ⚠️ No se pueden agregar alumnos de prueba todavía

## 🔍 Problema Detectado

El script `agregar-alumnos-prueba.ts` está listo, pero **no puede ejecutarse** porque:

❌ **Firebase NO está configurado**
- No hay credenciales en `.env.local`
- No existe un proyecto de Firebase
- Firestore no está habilitado

## 📋 Lo que necesitas hacer PRIMERO

### Paso 1: Configurar Firebase (15 minutos)

Sigue la **GUIA-RAPIDA-FIREBASE.md** para:

1. **Crear proyecto en Firebase Console**
   - https://console.firebase.google.com/
   - Crear proyecto: `EDUPLANMX`

2. **Habilitar Firestore Database**
   - Modo de prueba
   - Ubicación: us-central1

3. **Obtener credenciales**
   - Configuración del proyecto > Tus apps
   - Registrar app web
   - Copiar `firebaseConfig`

4. **Configurar en el proyecto**
   ```bash
   # Opción A: Automático
   ./setup-firebase.sh
   
   # Opción B: Manual
   # Editar .env.local con las credenciales
   ```

### Paso 2: Ejecutar el script de prueba

Una vez configurado Firebase:

```bash
# Agregar 5 alumnos de prueba
npx tsx agregar-alumnos-prueba.ts
```

## 📊 Los 5 Alumnos de Prueba

El script agregará estos alumnos con datos realistas:

### 1. **Juan Carlos Gómez Martínez**
- CURP: GOMJ050815HMCRNS01
- Promedio: 8.5
- Familia: Nuclear
- Contexto: Clase media, con internet, problemas de violencia en la comunidad

### 2. **María Fernanda López Pérez**
- CURP: LOPM060320MDFPRL02
- Promedio: 9.2
- Familia: Monoparental
- Contexto: Trabaja 15 hrs/semana, sin internet, beca Benito Juárez, zona con pandillerismo

### 3. **Roberto Hernández Rodríguez**
- CURP: HERS050912HDFRDN03
- Promedio: 7.8
- Familia: Extensa
- Contexto: Trabaja 25 hrs/semana, sin internet, sin seguro médico, riesgo alto de abandono

### 4. **Ana Sofía Sánchez Núñez**
- CURP: SANA060505MDFNNN04
- Promedio: 9.5
- Familia: Nuclear
- Contexto: Clase alta, todos los servicios, padres con posgrado, sin problemas comunitarios

### 5. **Carlos Eduardo Ramírez Cruz**
- CURP: RAMC050728HDFRRL05
- Promedio: 8.0
- Familia: Compuesta
- Contexto: Clase media-alta, con internet, pocos problemas comunitarios

## 🎯 Diversidad de Contextos

Los alumnos de prueba representan:

✅ **Diferentes niveles socioeconómicos**: Desde clase baja hasta alta  
✅ **Diferentes estructuras familiares**: Nuclear, monoparental, extensa, compuesta  
✅ **Diferentes situaciones laborales**: Solo estudia, estudia y trabaja, trabaja y estudia  
✅ **Diferentes niveles de riesgo**: Bajo, medio, alto  
✅ **Diferentes contextos comunitarios**: Con y sin problemas PAEC  
✅ **Diferentes niveles de conectividad**: Con y sin internet  

Esto permitirá probar:
- Diagnóstico grupal con datos diversos
- Detección de alumnos en riesgo
- Identificación de problemas PAEC
- Adaptaciones tecnológicas (algunos sin internet)
- Generación de planeaciones contextualizadas

## ✅ Resultado Esperado

Después de ejecutar el script:

```
🔥 Iniciando carga de alumnos de prueba a Firebase...

📝 [1/5] Guardando: Juan Carlos Gómez...
   ✅ Guardado con ID: abc123

📝 [2/5] Guardando: María Fernanda López...
   ✅ Guardado con ID: def456

📝 [3/5] Guardando: Roberto Hernández...
   ✅ Guardado con ID: ghi789

📝 [4/5] Guardando: Ana Sofía Sánchez...
   ✅ Guardado con ID: jkl012

📝 [5/5] Guardando: Carlos Eduardo Ramírez...
   ✅ Guardado con ID: mno345

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMEN:
   ✅ Exitosos: 5
   ❌ Fallidos: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 ¡Alumnos agregados exitosamente!

📍 Verifica en Firebase Console:
   → https://console.firebase.google.com/
   → Firestore Database > Data > alumnos
```

## 🔄 Orden de Ejecución

```
1. Configurar Firebase
   ↓
2. Ejecutar: npx tsx agregar-alumnos-prueba.ts
   ↓
3. Verificar en Firebase Console
   ↓
4. Probar diagnóstico grupal en la app
```

## 📚 Documentación de Referencia

- **README-FIREBASE.md** - Resumen general
- **GUIA-RAPIDA-FIREBASE.md** - Pasos para configurar Firebase
- **ESTRUCTURA-TABLAS-FIREBASE.md** - Estructura de datos

---

**Siguiente paso**: Configura Firebase siguiendo la **GUIA-RAPIDA-FIREBASE.md** 🚀
