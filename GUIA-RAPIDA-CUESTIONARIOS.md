# 🚀 GUÍA RÁPIDA DE INICIO

## ⚡ Implementación en 3 Pasos

### Paso 1: Agregar la Ruta 
**Archivo**: `Router.tsx`

```tsx
import GestionCuestionarios from './pages/GestionCuestionarios';

// Agregar dentro de tus rutas protegidas:
<Route 
  path="/cuestionarios" 
  element={<GestionCuestionarios />} 
/>
```

### Paso 2: Agregar al Menú de Navegación
**Archivo**: Donde tengas tu menú/sidebar

```tsx
<Link to="/cuestionarios">
  📋 Cuestionarios Socioeducativos
</Link>
```

### Paso 3: ¡Listo! 🎉
Navega a `/cuestionarios` y comienza a usar el sistema.

---

## 📖 Uso Básico

### Para Maestros/Administradores

1. **Ver cuestionarios**: 
   - Ve a `/cuestionarios`
   - Verás la lista de cuestionarios completados

2. **Crear nuevo cuestionario**:
   - Click en "Nuevo Cuestionario"
   - Completa los 5 pasos
   - Click en "Guardar Cuestionario"

3. **Exportar datos**:
   - Click en "Exportar CSV"
   - Se descargará un archivo con todos los datos

### Para Alumnos

Si quieres que los alumnos completen directamente:

```tsx
// En tu página de alumno
import CuestionarioSocioEducativoIntegrado from '../components/cuestionarioIntegrado/CuestionarioSocioEducativoIntegrado';

<CuestionarioSocioEducativoIntegrado
  onGuardar={async (cuestionario) => {
    // Guardar con el ID del alumno actual
    await addDoc(collection(db, 'cuestionariosSocioEducativos'), {
      ...cuestionario,
      alumnoId: auth.currentUser?.uid,
      timestamp: new Date()
    });
  }}
  onCancelar={() => setMostrar(false)}
/>
```

---

## 🔥 Características Instantáneas

### Auto-guardado ✨
El progreso se guarda **automáticamente** cada vez que el usuario cambia de paso o completa un campo. Pueden cerrar y continuar después.

### Validación Inteligente ✅
- Campos obligatorios marcados con *
- Validación de formato (email, teléfonos)
- Protesta de veracidad requerida
- Al menos un teléfono de contacto

### Diseño Responsive 📱
Funciona perfecto en:
- 📱 Móviles (iPhone, Android)
- 📱 Tablets (iPad)
- 💻 Laptops
- 🖥️ Monitores grandes

---

## 📊 Acceder a los Datos

### Ejemplo 1: Obtener Todos los Cuestionarios

```tsx
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

const cuestionarios = await getDocs(
  collection(db, 'cuestionariosSocioEducativos')
);

cuestionarios.forEach(doc => {
  const data = doc.data();
  console.log('Alumno:', data.datosGenerales.nombre);
  console.log('Grado:', data.datosGenerales.gradoGrupo);
  console.log('Problema principal:', data.contextoComunitario.principalProblema);
});
```

### Ejemplo 2: Filtrar por Grado

```tsx
import { collection, query, where, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'cuestionariosSocioEducativos'),
  where('datosGenerales.gradoGrupo', '==', '1° A')
);

const cuestionarios1A = await getDocs(q);
console.log(`Total en 1° A: ${cuestionarios1A.size}`);
```

### Ejemplo 3: Analizar Problemas Comunitarios

```tsx
function analizarProblemas(cuestionarios) {
  const problemas = {};
  
  cuestionarios.forEach(c => {
    const problema = c.contextoComunitario.principalProblema;
    problemas[problema] = (problemas[problema] || 0) + 1;
  });
  
  // Ordenar por frecuencia
  return Object.entries(problemas)
    .sort((a, b) => b[1] - a[1])
    .map(([problema, count]) => ({
      problema,
      count,
      porcentaje: (count / cuestionarios.length) * 100
    }));
}
```

---

## 🎨 Personalizar Colores

### Cambiar Colores del Header

**Archivo**: `components/cuestionarioIntegrado/CuestionarioSocioEducativoIntegrado.tsx`

```tsx
// Línea ~35 - Encuentra:
className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"

// Cambia a tus colores preferidos:
className="bg-gradient-to-r from-blue-600 via-teal-600 to-green-600"
```

### Cambiar Colores de Cada Paso

Edita los archivos de cada paso:
- `PasoIntegrado1DatosGenerales.tsx` - Línea ~14 (azul)
- `PasoIntegrado2Familia.tsx` - Línea ~14 (morado)
- `PasoIntegrado3Economia.tsx` - Línea ~14 (verde)
- `PasoIntegrado4Alumno.tsx` - Línea ~14 (índigo)
- `PasoIntegrado5Comunidad.tsx` - Línea ~14 (teal)

---

## 🔧 Solución de Problemas

### El formulario no se muestra
✅ **Solución**: Verifica que importaste correctamente el componente y que está dentro de un provider de React.

### Los datos no se guardan en Firebase
✅ **Solución**: 
1. Verifica tu configuración de Firebase en `services/firebase.ts`
2. Revisa las reglas de Firestore
3. Checa la consola del navegador por errores

### El diseño se ve roto
✅ **Solución**: Asegúrate de tener Tailwind CSS configurado correctamente en tu proyecto.

### localStorage se llena
✅ **Solución**: El sistema limpia automáticamente después de guardar. Si necesitas limpiar manualmente:
```tsx
localStorage.removeItem('cuestionario_socio_educativo_progreso');
```

---

## 📱 Screenshots

### Vista Desktop
![Flujo de 5 pasos](ver imagen adjunta: cuestionario_flujo_pasos)

### Integración de Datos
![Fuentes de datos](ver imagen adjunta: integracion_fuentes_datos)

---

## 🎯 Siguientes Pasos Recomendados

1. **Configurar Reglas Firestore** (seguridad)
2. **Crear Dashboard de Análisis** (gráficas)
3. **Generar Reportes PDF** (documentos)
4. **Integrar con IA** (diagnósticos automáticos)
5. **Notificaciones** (emails/SMS cuando se complete)

---

## 💡 Tips Pro

### Tip 1: Exportar Datos Específicos
```tsx
// Solo exportar datos de alumnos con internet
const conInternet = cuestionarios.filter(c => 
  c.datosEconomicos.servicios.internet
);
exportToCSV(conInternet);
```

### Tip 2: Validación Personalizada
```tsx
// Agregar validación personalizada
const esValido = (cuestionario) => {
  // Tu lógica personalizada
  if (cuestionario.datosAlumno.situacionAlumno.includes('trabaja')) {
    return cuestionario.datosAlumno.horasTrabajoSemanal > 0;
  }
  return true;
};
```

### Tip 3: Autocompletar Datos
```tsx
// Pre-llenar algunos campos si tienes datos del alumno
const datosIniciales = {
  datosGenerales: {
    ...DEFAULT_DATOS_GENERALES,
    nombre: alumnoActual.nombre,
    apellidoPaterno: alumnoActual.apellidoPaterno,
    // etc.
  }
};
```

---

## 📞 ¿Necesitas Ayuda?

1. **Documentación completa**: `CUESTIONARIO-INTEGRADO-README.md`
2. **Detalles de integración**: `INTEGRACION-CUESTIONARIO-COMPLETA.md`
3. **Tipos de datos**: `types/cuestionarioIntegrado.ts`

---

**¡Disfruta tu nuevo sistema de cuestionarios! 🎉**
