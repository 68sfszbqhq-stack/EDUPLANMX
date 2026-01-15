# 📋 Cuestionario Socioeducativo Integrado

## 📖 Descripción General

Este cuestionario integra dos marcos de referencia complementarios para un diagnóstico socioeducativo completo:

1. **Síntesis del Diagnóstico Socioeducativo** - Sergio Tobón (CIFE, 2023)
2. **Cuestionario Contexto Sociofamiliar y Comunitario** - La Avanzada (NEM)

## 🎯 Objetivo

Recopilar información integral sobre:
- ✅ Datos generales y administrativos del estudiante
- 👨‍👩‍👧‍👦 Contexto familiar y red de apoyo
- 🏠 Situación socioeconómica y vivienda
- 📚 Intereses, preferencias académicas y salud del alumno
- 🌍 Contexto comunitario (PAEC - Programa Aula-Escuela-Comunidad)

## 📁 Estructura de Archivos

```
types/
  └── cuestionarioIntegrado.ts       # Tipos TypeScript completos

hooks/
  └── useCuestionarioIntegrado.ts    # Hook personalizado con auto-guardado

components/cuestionarioIntegrado/
  ├── CuestionarioSocioEducativoIntegrado.tsx  # Componente principal
  ├── PasoIntegrado1DatosGenerales.tsx         # Paso 1: Datos generales
  ├── PasoIntegrado2Familia.tsx                # Paso 2: Familia
  ├── PasoIntegrado3Economia.tsx               # Paso 3: Economía
  ├── PasoIntegrado4Alumno.tsx                 # Paso 4: Datos del alumno
  └── PasoIntegrado5Comunidad.tsx              # Paso 5: Contexto comunitario
```

## 🚀 Cómo Usar

### 1. Importar el componente principal

```tsx
import CuestionarioSocioEducativoIntegrado from './components/cuestionarioIntegrado/CuestionarioSocioEducativoIntegrado';
import type { CuestionarioSocioEducativo } from './types/cuestionarioIntegrado';
```

### 2. Implementar en tu aplicación

```tsx
function MiComponente() {
  const [mostrarCuestionario, setMostrarCuestionario] = useState(false);

  const handleGuardarCuestionario = (cuestionario: CuestionarioSocioEducativo) => {
    console.log('Cuestionario completo:', cuestionario);
    
    // Aquí puedes:
    // - Guardar en Firebase/Firestore
    // - Enviar a una API
    // - Procesar los datos
    // - Generar diagnósticos
    
    setMostrarCuestionario(false);
  };

  return (
    <>
      <button onClick={() => setMostrarCuestionario(true)}>
        Iniciar Cuestionario
      </button>

      {mostrarCuestionario && (
        <CuestionarioSocioEducativoIntegrado
          onGuardar={handleGuardarCuestionario}
          onCancelar={() => setMostrarCuestionario(false)}
        />
      )}
    </>
  );
}
```

### 3. Guardar en Firestore (ejemplo)

```tsx
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const handleGuardarCuestionario = async (cuestionario: CuestionarioSocioEducativo) => {
  try {
    const docRef = await addDoc(collection(db, 'cuestionarios'), {
      ...cuestionario,
      timestamp: new Date().toISOString()
    });
    
    console.log('Cuestionario guardado con ID:', docRef.id);
    alert('¡Cuestionario guardado exitosamente!');
  } catch (error) {
    console.error('Error al guardar:', error);
    alert('Error al guardar el cuestionario');
  }
};
```

## 📊 Estructura de Datos

### Objeto Completo del Cuestionario

```typescript
interface CuestionarioSocioEducativo {
  id?: string;
  datosGenerales: DatosGeneralesAlumno;      // Paso 1
  datosFamiliares: DatosFamiliares;          // Paso 2
  datosEconomicos: DatosEconomicosVivienda;  // Paso 3
  datosAlumno: DatosAlumnoPersonales;        // Paso 4
  contextoComunitario: ContextoComunitario;  // Paso 5
  fechaRegistro: string;
  completado: boolean;
}
```

## 🎨 Características

### ✨ Auto-guardado
- El progreso se guarda automáticamente en `localStorage`
- Los estudiantes pueden cerrar y continuar después
- No se pierde información al cambiar de paso

### 📈 Indicador de Progreso
- Barra de progreso visual
- Porcentaje de completitud calculado dinámicamente
- Indicadores de pasos completados

### ✅ Validación
- Campos obligatorios marcados con *
- Validación de formato (email, teléfonos, CURP)
- Feedback visual inmediato

### 🎯 UX Optimizada
- Diseño responsive (móvil y desktop)
- Tooltips y ayudas contextuales
- Navegación clara entre pasos
- Confirmación visual de selecciones

## 📋 Contenido de Cada Paso

### Paso 1: Datos Generales (👤)
- Protesta de veracidad ✓
- Nombres completos
- CURP (opcional)
- Correo electrónico
- Grado y grupo

### Paso 2: Familia (👨‍👩‍👧‍👦)
- Datos del tutor/responsable
- Teléfonos de contacto (padre, madre, tutor, emergencia)
- Tipo de familia
- Número de hermanos
- Escolaridad de padres
- Ocupación de padres
- Seguridad social
- Convivencia familiar
- Prácticas en el hogar

### Paso 3: Economía y Vivienda (🏠)
- Tipo de vivienda
- Número de habitantes
- Servicios disponibles (agua, luz, internet, etc.)
- Automóvil propio
- Gastos mensuales
- Personas que aportan al ingreso
- Becas o apoyos

### Paso 4: Datos del Alumno (📚)
- Situación laboral/académica
- Materias preferidas (selección múltiple)
- Actividades de interés (selección múltiple)
- Salud física
- Enfermedades o condiciones (con detalles si aplica)

### Paso 5: Contexto Comunitario (🌍)
- **Problemas principales** (top 3)
- **Servicios faltantes** en la comunidad
- **Factores de riesgo**:
  - Consumo de alcohol/cigarro/drogas (cuadra y casa)
  - Frecuencia de peleas/discusiones
- **Cultura y recreación**:
  - Espacios de recreación
  - Tradiciones locales
- **Discriminación**:
  - Prácticas machistas
  - Prácticas homofóbicas
  - Prácticas racistas
  - Prácticas clasistas

## 🔧 Personalización

### Agregar más opciones

Edita `types/cuestionarioIntegrado.ts`:

```typescript
export const MATERIAS_BACHILLERATO = [
  'Matemáticas',
  'Español',
  // ... agregar más materias
];
```

### Modificar estilos

Los componentes usan Tailwind CSS. Puedes personalizar:
- Colores del gradiente del header
- Tamaños de fuente
- Espaciado
- Bordes y sombras

### Agregar validaciones personalizadas

En el hook `useCuestionarioIntegrado.ts`:

```typescript
const isCompleto = (): boolean => {
  // Agregar tus validaciones personalizadas
  const validacionPersonalizada = /* tu lógica */;
  
  return generalesCompletos && 
         familiaresCompletos && 
         validacionPersonalizada;
};
```

## 📊 Análisis de Datos

### Generar Diagnóstico Grupal

```typescript
function generarDiagnosticoGrupal(cuestionarios: CuestionarioSocioEducativo[]) {
  // Problema más común en la comunidad
  const problemasPrincipales = cuestionarios.map(c => c.contextoComunitario.principalProblema);
  const problemaMasComun = moda(problemasPrincipales);
  
  // Materias más populares
  const todasMaterias = cuestionarios.flatMap(c => c.datosAlumno.materiasPreferidas);
  const materiasPopulares = top3(todasMaterias);
  
  // Porcentaje con internet
  const conInternet = cuestionarios.filter(c => c.datosEconomicos.servicios.internet).length;
  const porcentajeConectividad = (conInternet / cuestionarios.length) * 100;
  
  return {
    problemaMasComun,
    materiasPopulares,
    porcentajeConectividad,
    // ... más análisis
  };
}
```

### Identificar Alertas de Riesgo

```typescript
function identificarRiesgos(cuestionario: CuestionarioSocioEducativo) {
  const factoresRiesgo = [];
  
  // Riesgo económico
  if (cuestionario.datosEconomicos.gastosMensuales === 'Menos de 5 mil pesos') {
    factoresRiesgo.push('Situación económica vulnerable');
  }
  
  // Riesgo de salud
  if (cuestionario.datosAlumno.tieneEnfermedadCondicion === 'Sí') {
    factoresRiesgo.push('Atención médica requerida');
  }
  
  // Riesgo comunitario
  if (cuestionario.contextoComunitario.consumoDrogasCasa === 'Sí') {
    factoresRiesgo.push('Ambiente familiar de riesgo');
  }
  
  return {
    nivelRiesgo: factoresRiesgo.length > 2 ? 'Alto' : 'Medio',
    factoresRiesgo
  };
}
```

## 🔒 Seguridad y Privacidad

### Buenas Prácticas

1. **Encriptar datos sensibles** antes de guardar
2. **Implementar autenticación** robusta
3. **Usar reglas de Firestore** para proteger datos
4. **No mostrar información personal** en logs o consola
5. **Cumplir con GDPR/LFPDPPP** (protección de datos personales)

### Ejemplo de Reglas Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cuestionarios/{cuestionarioId} {
      // Solo maestros y administradores
      allow read: if request.auth != null && 
                     (request.auth.token.role == 'maestro' || 
                      request.auth.token.role == 'admin');
      
      // Solo el alumno puede crear su cuestionario
      allow create: if request.auth != null && 
                       request.auth.token.role == 'alumno';
      
      // No permitir actualizaciones ni eliminaciones
      allow update, delete: if false;
    }
  }
}
```

## 📝 Próximos Pasos

1. ✅ Integrar con Firebase/Firestore
2. ✅ Crear página de administración para visualizar respuestas
3. ✅ Generar reportes automáticos en PDF
4. ✅ Implementar análisis con IA para diagnósticos personalizados
5. ✅ Crear dashboards con gráficas y estadísticas
6. ✅ Exportar datos a Excel/CSV para análisis externo

## 🤝 Soporte

Para preguntas o problemas:
- Revisa la documentación de tipos en `cuestionarioIntegrado.ts`
- Verifica la consola del navegador para errores
- Asegúrate de que todas las dependencias estén instaladas

## 📚 Referencias

- **Sergio Tobón (2023)**: "Elaboración del diagnóstico socioeducativo en las escuelas" - CIFE
- **NEM (Nueva Escuela Mexicana)**: Programas de contextualización educativa
- **PAEC**: Programa Aula-Escuela-Comunidad

---

**Versión**: 1.0  
**Última actualización**: Enero 2026  
**Nivel educativo**: Bachillerato General
