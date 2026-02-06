# 🚨 URGENTE: API Key de Gemini Bloqueada

**Fecha**: 2026-02-05 19:25  
**Error**: `403 - Your API key was reported as leaked`

---

## ⚠️ Problema

Google bloqueó tu **API Key de Gemini** porque fue detectada como expuesta públicamente.

**Error en consola**:
```
ApiError: {"error":{"code":403,"message":"Your API key was reported as leaked. 
Please use another API key.","status":"PERMISSION_DENIED"}}
```

---

## 🔧 SOLUCIÓN (5 Minutos)

### **Paso 1: Regenerar API Key de Gemini**

Ya abrí la página en tu navegador. Sigue estos pasos:

1. **En Google AI Studio** (https://aistudio.google.com/app/apikey):
   - Busca tu API Key actual
   - Click en "Delete" o "Revoke" para eliminarla
   - Click en "Create API Key"
   - Selecciona el proyecto "eduplanmx"
   - **Copia la nueva clave**

---

### **Paso 2: Actualizar .env.local**

Ya preparé el archivo `.env.local` con la estructura correcta.

**Abre el archivo**:
```bash
code .env.local
```

**Reemplaza** la línea 6:
```bash
# ANTES:
VITE_API_KEY=TU_NUEVA_CLAVE_GEMINI_AQUI

# DESPUÉS (con tu nueva clave):
VITE_API_KEY=AIzaSy[tu_nueva_clave_aqui]
```

---

### **Paso 3: Reiniciar el Servidor de Desarrollo**

```bash
# Detener el servidor actual (Ctrl+C si está corriendo)
# Luego:
npm run dev
```

---

## ✅ Verificación

Tu app debería funcionar correctamente. Prueba generando una planeación.

---

## 🔒 Prevención Futura

### **¿Por qué pasó esto?**

La clave de Gemini estaba en `.env.local` pero **también** podría haber sido commiteada accidentalmente o estar en el código compilado.

### **Protección Implementada**:

1. ✅ `.env.local` está en `.gitignore`
2. ✅ El código usa `import.meta.env.VITE_API_KEY`
3. ✅ Creado `.env.example` como template
4. ✅ Documentación actualizada

### **IMPORTANTE**:

**Gemini API Keys son PRIVADAS** (diferente a Firebase):
- 🔴 **NO** deben estar en el código
- 🔴 **NO** deben subirse a Git
- 🔴 **NO** deben estar en el build de producción
- ✅ **SÍ** deben estar solo en `.env.local`

---

## 🎯 Para Producción (GitHub Pages)

**PROBLEMA**: GitHub Pages no soporta variables de entorno privadas.

**SOLUCIONES**:

### **Opción A: Migrar a Netlify/Vercel** (Recomendado)
- ✅ Soporta variables de entorno
- ✅ Deploy automático desde Git
- ✅ Más seguro y fácil de gestionar

### **Opción B: Backend Proxy** (Más complejo)
- Crear un backend simple que llame a Gemini
- El frontend llama al backend
- La API Key queda en el servidor

### **Opción C: Solo Desarrollo Local** (Temporal)
- Usar la app solo en localhost
- No deployar a GitHub Pages por ahora

---

## 📊 Checklist

- [ ] Regenerar API Key de Gemini
- [ ] Actualizar `.env.local` con la nueva clave
- [ ] Reiniciar `npm run dev`
- [ ] Probar generación de planeación
- [ ] Decidir solución para producción

---

## 🚀 Próximos Pasos

1. **AHORA**: Regenera la clave y actualiza `.env.local`
2. **HOY**: Decide si migrar a Netlify/Vercel
3. **ESTA SEMANA**: Implementar solución para producción

---

## 💡 Diferencia Clave

| Aspecto | Firebase API Key | Gemini API Key |
|---------|------------------|----------------|
| Visibilidad | 🟢 Pública | 🔴 Privada |
| En código | ✅ OK | ❌ NO |
| En Git | ✅ OK | ❌ NO |
| En build | ✅ OK | ❌ NO |
| Seguridad | Firestore Rules | La clave misma |

---

**Archivos Actualizados**:
- ✅ `.env.local` - Limpiado y estructurado
- ✅ `.env.example` - Template creado
- ✅ `.gitignore` - Ya incluye `*.local`

**Código**:
- ✅ `geminiService.ts` - Ya usa `import.meta.env.VITE_API_KEY`
- ✅ `toolService.ts` - Ya usa `import.meta.env.VITE_API_KEY`

---

**¿Necesitas ayuda con algún paso?** Avísame cuando hayas regenerado la clave. 🔑
