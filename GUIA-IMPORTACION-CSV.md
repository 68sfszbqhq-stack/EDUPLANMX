# 📥 Guía de Importación CSV - EduPlan MX

## 🎯 Descripción General

El sistema de importación CSV permite cargar datos masivos de **alumnos** y **maestros** de forma rápida y eficiente.

---

## 📋 Proceso de Importación (4 Pasos)

### **Paso 1: Selecciona el Tipo de Importación**

Elige qué tipo de datos vas a importar:
- 👥 **Alumnos**: Estudiantes con matrícula, grado y grupo
- 🎓 **Maestros**: Docentes con materias y grados que imparten

---

### **Paso 2: Descarga la Plantilla CSV**

1. Click en **"Descargar Plantilla de Alumnos"** o **"Descargar Plantilla de Maestros"**
2. Se descargará un archivo `.csv` con:
   - Headers (nombres de columnas)
   - 3 ejemplos de datos
   - Formato correcto

---

### **Paso 3: Llena la Plantilla**

#### **Para Alumnos:**

| Campo | Obligatorio | Descripción | Ejemplo |
|-------|-------------|-------------|---------|
| `nombre` | ✅ Sí | Nombre del alumno | Juan |
| `apellidoPaterno` | ✅ Sí | Apellido paterno | Pérez |
| `apellidoMaterno` | ❌ No | Apellido materno | García |
| `matricula` | ✅ Sí | Matrícula única | 2024001 |
| `email` | ❌ No | Correo electrónico | juan.perez@ejemplo.com |
| `grado` | ❌ No | Grado (1-6) | 1 |
| `grupo` | ❌ No | Grupo (A, B, C, etc.) | A |
| `telefono` | ❌ No | Teléfono | 3481234567 |
| `fechaNacimiento` | ❌ No | Fecha (YYYY-MM-DD) | 2008-05-15 |

**Ejemplo de CSV de Alumnos:**
```csv
nombre,apellidoPaterno,apellidoMaterno,matricula,email,grado,grupo,telefono,fechaNacimiento
Juan,Pérez,García,2024001,juan.perez@ejemplo.com,1,A,3481234567,2008-05-15
María,López,Martínez,2024002,maria.lopez@ejemplo.com,2,B,3481234568,2007-08-20
Carlos,Sánchez,Rodríguez,2024003,carlos.sanchez@ejemplo.com,3,A,3481234569,2006-03-10
```

---

#### **Para Maestros:**

| Campo | Obligatorio | Descripción | Ejemplo |
|-------|-------------|-------------|---------|
| `nombre` | ✅ Sí | Nombre del maestro | Ana |
| `apellidoPaterno` | ✅ Sí | Apellido paterno | Martínez |
| `apellidoMaterno` | ❌ No | Apellido materno | López |
| `email` | ✅ Sí | Correo (único) | ana.martinez@ejemplo.com |
| `puesto` | ❌ No | Puesto/cargo | Docente |
| `telefono` | ❌ No | Teléfono | 3481234570 |
| `materias` | ❌ No | Materias (separadas por `;`) | Matemáticas;Física |
| `grados` | ❌ No | Grados (separados por `;`) | 1;2;3 |

**Ejemplo de CSV de Maestros:**
```csv
nombre,apellidoPaterno,apellidoMaterno,email,puesto,telefono,materias,grados
Ana,Martínez,López,ana.martinez@ejemplo.com,Docente,3481234570,"Matemáticas;Física","1;2;3"
Pedro,González,Hernández,pedro.gonzalez@ejemplo.com,Director,3481234571,"Administración",""
Laura,Ramírez,Torres,laura.ramirez@ejemplo.com,Docente,3481234572,"Español;Literatura","2;3"
```

**⚠️ IMPORTANTE:**
- Si un campo contiene comas o punto y coma, enciérralo entre comillas dobles: `"Matemáticas;Física"`
- Las materias y grados se separan con punto y coma (`;`)
- El email debe ser único (no puede repetirse)

---

### **Paso 4: Sube el Archivo**

1. Selecciona la **escuela** a la que pertenecen los datos
2. Click en el área de **"Subir archivo"** o arrastra el CSV
3. Click en **"Importar Alumnos"** o **"Importar Maestros"**
4. Espera a que termine el proceso

---

## 📊 Reporte de Importación

Al finalizar, verás un reporte con:

### **Resumen:**
- ✅ **Exitosos**: Registros importados correctamente
- ⚠️ **Advertencias**: Registros omitidos (duplicados)
- ❌ **Errores**: Registros con problemas

### **Detalles por Fila:**
Cada fila del CSV tendrá un mensaje:
- ✅ **Éxito**: "Alumno Juan Pérez importado correctamente"
- ⚠️ **Advertencia**: "Matrícula 2024001 ya existe, se omitió"
- ❌ **Error**: "Faltan campos obligatorios (nombre, apellidoPaterno, matricula)"

---

## ✅ Validaciones Automáticas

### **Para Alumnos:**
- ✅ Nombre y apellido paterno obligatorios
- ✅ Matrícula obligatoria y única
- ✅ No permite duplicar matrículas en la misma escuela
- ✅ Grado debe ser número entre 1-6

### **Para Maestros:**
- ✅ Nombre, apellido paterno y email obligatorios
- ✅ Email único en todo el sistema
- ✅ No permite duplicar emails
- ✅ Crea automáticamente usuario con rol "maestro"
- ✅ Asigna automáticamente a la escuela seleccionada

---

## 🔧 Solución de Problemas

### **Error: "Faltan campos obligatorios"**
**Causa:** No llenaste todos los campos obligatorios
**Solución:** Verifica que cada fila tenga:
- Alumnos: nombre, apellidoPaterno, matricula
- Maestros: nombre, apellidoPaterno, email

### **Advertencia: "Matrícula/Email ya existe"**
**Causa:** Ya hay un registro con esa matrícula o email
**Solución:** 
- Cambia la matrícula/email a uno único
- O elimina esa fila si ya existe en el sistema

### **Error: "Error al procesar el archivo"**
**Causa:** El archivo CSV tiene formato incorrecto
**Solución:**
- Asegúrate de que sea un archivo `.csv`
- Verifica que tenga la primera fila con headers
- Usa la plantilla descargada como base

---

## 💡 Consejos y Mejores Prácticas

### **1. Usa la Plantilla**
Siempre descarga y usa la plantilla proporcionada. Ya tiene el formato correcto.

### **2. Verifica Duplicados Antes**
Antes de importar, verifica que no haya matrículas o emails duplicados en tu archivo.

### **3. Importa en Lotes Pequeños**
Si tienes muchos registros (más de 100), divide en varios archivos más pequeños.

### **4. Revisa el Reporte**
Siempre revisa el reporte de importación para ver si hubo errores o advertencias.

### **5. Backup**
Guarda una copia de tu archivo CSV antes de importar.

### **6. Formato de Fechas**
Las fechas deben estar en formato `YYYY-MM-DD` (ejemplo: `2008-05-15`)

### **7. Materias y Grados**
Para maestros, separa materias y grados con punto y coma (`;`):
- Correcto: `Matemáticas;Física`
- Incorrecto: `Matemáticas, Física`

---

## 📝 Ejemplo Completo

### **Escenario:**
Quieres importar 50 alumnos de 1er grado a la "Preparatoria Regional de Arandas"

### **Pasos:**

1. **Descarga la plantilla de alumnos**
   - Click en "Descargar Plantilla de Alumnos"

2. **Abre el CSV en Excel o Google Sheets**
   - Verás los headers y 3 ejemplos

3. **Llena tus datos**
   ```csv
   nombre,apellidoPaterno,apellidoMaterno,matricula,email,grado,grupo,telefono,fechaNacimiento
   Juan,Pérez,García,2024001,juan.perez@ejemplo.com,1,A,3481234567,2008-05-15
   María,López,Martínez,2024002,maria.lopez@ejemplo.com,1,A,3481234568,2007-08-20
   ... (48 alumnos más)
   ```

4. **Guarda como CSV**
   - Archivo → Guardar como → CSV (delimitado por comas)

5. **Importa en el sistema**
   - Selecciona "Alumnos"
   - Selecciona "Preparatoria Regional de Arandas"
   - Sube el archivo
   - Click "Importar Alumnos"

6. **Revisa el reporte**
   - ✅ 50 exitosos
   - ⚠️ 0 advertencias
   - ❌ 0 errores

---

## 🎯 Resultado

Después de importar:

### **Alumnos:**
- Se crean en la colección `alumnos` de Firestore
- Se asignan automáticamente a la escuela seleccionada
- Quedan activos por defecto

### **Maestros:**
- Se crean en la colección `users` de Firestore
- Se les asigna rol `maestro`
- Se asignan a la escuela seleccionada
- Onboarding marcado como completo
- Deben iniciar sesión con Google usando el email proporcionado

---

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía
2. Verifica el reporte de importación
3. Asegúrate de usar la plantilla correcta
4. Verifica que los datos obligatorios estén completos

---

**¡Listo! Ahora puedes importar datos masivos de forma rápida y eficiente.** 🚀
