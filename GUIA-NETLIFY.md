# 🚀 Guía Completa: Migración a Netlify

**Fecha**: 2026-02-05  
**Tiempo estimado**: 10-15 minutos  
**Dificultad**: ⭐ Fácil

---

## 🎯 ¿Por Qué Netlify?

✅ **Soporta variables de entorno privadas** (Gemini funcionará)  
✅ **Deploy automático** desde GitHub  
✅ **Gratis** para proyectos pequeños  
✅ **Más rápido** que GitHub Pages  
✅ **HTTPS automático**  
✅ **CDN global**  

---

## 📋 Paso 1: Crear Cuenta en Netlify

### **1.1 Ir a Netlify**
```
https://app.netlify.com/signup
```

### **1.2 Registrarse con GitHub**
- Click en "Sign up with GitHub"
- Autorizar Netlify a acceder a tu cuenta
- ✅ Listo, cuenta creada

---

## 📦 Paso 2: Importar Proyecto desde GitHub

### **2.1 Crear Nuevo Sitio**
1. En el dashboard de Netlify
2. Click en **"Add new site"**
3. Selecciona **"Import an existing project"**

### **2.2 Conectar con GitHub**
1. Click en **"Deploy with GitHub"**
2. Autorizar Netlify (si es la primera vez)
3. Buscar tu repositorio: **"EDUPLANMX"**
4. Click en el repositorio

### **2.3 Configurar Build Settings**

Netlify debería detectar automáticamente la configuración desde `netlify.toml`, pero verifica:

```
Build command: npm run build
Publish directory: dist
```

**NO hagas deploy todavía** - Primero configuraremos las variables de entorno.

---

## 🔐 Paso 3: Configurar Variables de Entorno

### **3.1 Ir a Site Settings**
1. En tu sitio de Netlify
2. Click en **"Site settings"**
3. En el menú lateral: **"Environment variables"**

### **3.2 Agregar Variables**

Click en **"Add a variable"** para cada una:

#### **Variable 1: VITE_API_KEY** (Gemini)
```
Key: VITE_API_KEY
Value: AIzaSyDXV7YnJ3iwAeQPICO50y4VMsYHXyfO7WI
```

#### **Variable 2: VITE_FIREBASE_API_KEY**
```
Key: VITE_FIREBASE_API_KEY
Value: AIzaSyBk7iQqIVRcleUkb5WjmR3qhcvwVt0bekM
```

#### **Variable 3: VITE_FIREBASE_AUTH_DOMAIN**
```
Key: VITE_FIREBASE_AUTH_DOMAIN
Value: eduplanmx.firebaseapp.com
```

#### **Variable 4: VITE_FIREBASE_PROJECT_ID**
```
Key: VITE_FIREBASE_PROJECT_ID
Value: eduplanmx
```

#### **Variable 5: VITE_FIREBASE_STORAGE_BUCKET**
```
Key: VITE_FIREBASE_STORAGE_BUCKET
Value: eduplanmx.firebasestorage.app
```

#### **Variable 6: VITE_FIREBASE_MESSAGING_SENDER_ID**
```
Key: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 144677335686
```

#### **Variable 7: VITE_FIREBASE_APP_ID**
```
Key: VITE_FIREBASE_APP_ID
Value: 1:144677335686:web:cd82543b32b323e3ea5707
```

**Total**: 7 variables de entorno

---

## 🚀 Paso 4: Deploy Inicial

### **4.1 Hacer el Primer Deploy**
1. Volver a **"Deploys"** en el menú
2. Click en **"Trigger deploy"** → **"Deploy site"**
3. Esperar 1-2 minutos mientras construye

### **4.2 Verificar Build**
Deberías ver:
```
✓ Build script success
✓ Deploy succeeded
```

### **4.3 Obtener URL**
Netlify te asignará una URL como:
```
https://random-name-123456.netlify.app
```

---

## 🎨 Paso 5: Personalizar Dominio (Opcional)

### **5.1 Cambiar Nombre del Sitio**
1. En **"Site settings"** → **"General"**
2. **"Site details"** → **"Change site name"**
3. Cambiar a: `eduplanmx` (si está disponible)
4. Tu URL será: `https://eduplanmx.netlify.app`

### **5.2 Dominio Personalizado (Opcional)**
Si tienes un dominio propio:
1. **"Domain management"** → **"Add custom domain"**
2. Seguir instrucciones de DNS

---

## ✅ Paso 6: Verificar que Todo Funcione

### **6.1 Abrir tu Sitio**
```
https://tu-sitio.netlify.app
```

### **6.2 Probar Funcionalidades**
- [ ] Login funciona
- [ ] Firestore funciona
- [ ] **Gemini AI funciona** ✨ (lo importante)
- [ ] Sistema de herramientas carga
- [ ] No hay errores en consola

---

## 🔄 Paso 7: Deploy Automático

### **7.1 Configurar Auto-Deploy**

Ya está configurado por defecto. Cada vez que hagas `git push`:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

Netlify automáticamente:
1. Detecta el push
2. Construye la app
3. Despliega la nueva versión
4. ✅ Listo en 1-2 minutos

---

## 📊 Comparación: GitHub Pages vs Netlify

| Aspecto | GitHub Pages | Netlify |
|---------|--------------|---------|
| Variables de entorno | ❌ No | ✅ Sí |
| Gemini AI | ❌ No funciona | ✅ Funciona |
| Deploy automático | ✅ Sí | ✅ Sí |
| HTTPS | ✅ Sí | ✅ Sí |
| CDN | ✅ Sí | ✅ Sí (mejor) |
| Velocidad | 🟡 Buena | 🟢 Excelente |
| Configuración | Manual | Automática |
| Costo | Gratis | Gratis |

---

## 🔧 Troubleshooting

### **Error: Build Failed**

**Causa**: Falta alguna dependencia

**Solución**:
```bash
# Verificar que package.json esté completo
npm install
npm run build
```

### **Error: Environment Variables Not Working**

**Causa**: Variables mal configuradas

**Solución**:
1. Verificar nombres exactos (case-sensitive)
2. Verificar que empiecen con `VITE_`
3. Hacer re-deploy después de cambiar variables

### **Error: 404 en Rutas**

**Causa**: SPA routing no configurado

**Solución**: Ya está en `netlify.toml` con:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📚 Recursos Adicionales

- **Dashboard Netlify**: https://app.netlify.com
- **Documentación**: https://docs.netlify.com
- **Status**: https://www.netlifystatus.com

---

## ✅ Checklist Final

- [ ] Cuenta de Netlify creada
- [ ] Repositorio conectado
- [ ] 7 variables de entorno configuradas
- [ ] Primer deploy exitoso
- [ ] Sitio accesible
- [ ] Gemini AI funcionando
- [ ] Deploy automático configurado

---

## 🎉 ¡Listo!

Tu aplicación ahora está en producción con **todas las funcionalidades**, incluyendo Gemini AI.

**URL de tu app**: `https://tu-sitio.netlify.app`

**Próximos pasos**:
- Compartir la URL
- Probar todas las funcionalidades
- Crear la primera herramienta educativa

---

**¿Necesitas ayuda?** Consulta esta guía o contacta.

**Última actualización**: 2026-02-05 19:31
