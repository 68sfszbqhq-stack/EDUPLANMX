# 📚 EduPlan MX - Sistema de Diagnóstico Socioeducativo

<div align="center">

![EduPlan MX](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

**Plataforma integral para diagnóstico socioeducativo NEM y gestión curricular**

[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://68sfszbqhq-stack.github.io/EDUPLANMX/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6.0-orange)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)](https://www.typescriptlang.org/)

[🌐 Ver Demo](https://68sfszbqhq-stack.github.io/EDUPLANMX/) | [📖 Documentación](#documentación) | [🚀 Inicio Rápido](#inicio-rápido)

</div>

---

## 🎯 Descripción

**EduPlan MX** es una plataforma web diseñada para facilitar el diagnóstico socioeducativo de estudiantes bajo el marco de la Nueva Escuela Mexicana (NEM), así como proporcionar herramientas de gestión curricular para maestros y administradores.

### ✨ Características Principales

#### 👑 **Para Super Administradores**
- 📊 Dashboard con estadísticas en tiempo real
- 👥 Gestión completa de usuarios (crear, editar, eliminar, cambiar roles)
- 🔍 Filtros avanzados y búsqueda
- 📚 Visualización de todas las materias del sistema
- 🎯 Control total del sistema

#### 👨‍🏫 **Para Maestros**
- 📖 **Guía Curricular Interactiva**
  - Programas completos por materia
  - Unidades y temas detallados
  - Contenidos y aprendizajes esperados
  - Recursos digitales recomendados
  - Criterios de evaluación
- 👨‍🎓 Registro de alumnos con formulario NEM
- 📋 Diagnóstico socioeducativo completo
- 📊 Dashboard de alumnos

#### 🔐 **Sistema de Autenticación**
- Login con email/password
- Login con Google OAuth
- Roles y permisos (Super Admin, Directivo, Maestro, Alumno)
- Rutas protegidas por rol

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Firebase

### Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/68sfszbqhq-stack/EDUPLANMX.git
cd EDUPLANMX
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar Firebase:**

Crea un archivo `.env.local` con tus credenciales:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

O ejecuta el script de configuración:
```bash
./setup-firebase.sh
```

4. **Configurar Firestore Rules:**

Ve a Firebase Console y aplica las reglas de `firestore.rules`

5. **Crear usuario Super Admin:**
```bash
npx tsx crear-super-admin.ts
```

6. **Ejecutar en desarrollo:**
```bash
npm run dev
```

7. **Abrir en el navegador:**
```
http://localhost:5173
```

---

## 📦 Tecnologías

### Frontend
- **React 18.3.1** - Biblioteca de UI
- **TypeScript 5.6.2** - Tipado estático
- **Vite 5.4.21** - Build tool
- **React Router 7.1.1** - Enrutamiento
- **Lucide React** - Iconos

### Backend & Database
- **Firebase 12.6.0**
  - Authentication (Email/Password + Google OAuth)
  - Firestore Database
  - Hosting

### Estilos
- **Tailwind CSS** - Framework de CSS
- Diseño moderno y responsive
- Componentes reutilizables

---

## 📁 Estructura del Proyecto

```
EDUPLANMX/
├── components/           # Componentes React
│   ├── admin/           # Componentes de administración
│   │   ├── StatsCard.tsx
│   │   ├── TablaUsuarios.tsx
│   │   ├── FormularioUsuario.tsx
│   │   └── ModalCambiarRol.tsx
│   ├── pasos/           # Pasos del formulario NEM
│   └── ProtectedRoute.tsx
├── pages/               # Páginas principales
│   ├── admin/          # Páginas de admin
│   │   ├── Dashboard.tsx
│   │   └── Usuarios.tsx
│   ├── maestro/        # Páginas de maestro
│   │   ├── GuiaCurricular.tsx
│   │   └── ProgramaMateria.tsx
│   ├── Login.tsx
│   └── RegistroAlumnos.tsx
├── src/
│   ├── config/         # Configuración
│   │   └── firebase.ts
│   ├── contexts/       # React Contexts
│   │   └── AuthContext.tsx
│   └── services/       # Servicios Firebase
│       ├── authService.ts
│       ├── usuariosService.ts
│       ├── materiasService.ts
│       ├── asignacionesService.ts
│       └── alumnosFirebase.ts
├── types/              # Tipos TypeScript
│   ├── auth.ts
│   ├── materia.ts
│   ├── asignacion.ts
│   └── diagnostico.ts
├── Router.tsx          # Configuración de rutas
└── firestore.rules     # Reglas de seguridad
```

---

## 🗄️ Estructura de Datos

### Colecciones de Firestore

#### `usuarios`
```typescript
{
  id: string;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rol: 'superadmin' | 'directivo' | 'maestro' | 'alumno';
  activo: boolean;
  institucionId?: string;
  fechaCreacion: string;
  ultimoAcceso: string;
}
```

#### `materias`
```typescript
{
  id: string;
  nombre: string;
  clave: string;
  grado: 1 | 2 | 3;
  horasSemanales: number;
  totalHoras: number;
  proposito: string;
  competencias: string[];
  unidades: Unidad[];
  recursosDigitales: RecursoDigital[];
  criteriosEvaluacion: CriterioEvaluacion[];
}
```

#### `alumnos`
```typescript
{
  id: string;
  curp: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  // ... campos NEM completos
}
```

---

## 🎨 Funcionalidades Detalladas

### 📚 Guía Curricular Interactiva

La Guía Curricular es una herramienta completa para que los maestros consulten el programa de cada materia:

**Características:**
- ✅ Vista de selección de materias con diseño moderno
- ✅ Programa completo por semestre
- ✅ Unidades expandibles/colapsables
- ✅ Temas con contenidos detallados
- ✅ Aprendizajes esperados por tema
- ✅ Actividades sugeridas
- ✅ Recursos digitales con enlaces directos
- ✅ Criterios de evaluación con porcentajes

**Ejemplo: Matemáticas III**
- 4 unidades (Álgebra, Geometría, Probabilidad, Cálculo)
- 12 temas detallados
- 80 horas totales
- 5 recursos digitales (Khan Academy, GeoGebra, etc.)

### 👥 Gestión de Usuarios

**Funcionalidades:**
- Crear usuarios con email/password
- Editar información de usuarios
- Cambiar roles (con modal dedicado)
- Activar/desactivar usuarios
- Eliminar usuarios (con confirmación)
- Filtros por rol y estado
- Búsqueda por nombre o email
- Protección de cuenta propia

### 📋 Diagnóstico NEM

Formulario completo de 5 pasos para diagnóstico socioeducativo:
1. **Identidad** - Datos personales y académicos
2. **Familia** - Contexto familiar
3. **Economía y Salud** - Situación socioeconómica
4. **Contexto PAEC** - Problemas de aprendizaje
5. **Intereses** - Intereses y aspiraciones

---

## 🔐 Autenticación y Roles

### Roles Disponibles

| Rol | Permisos |
|-----|----------|
| **Super Admin** | Control total del sistema, gestión de usuarios, acceso a todas las funcionalidades |
| **Directivo** | Gestión de su institución, maestros y alumnos |
| **Maestro** | Registro de alumnos, diagnósticos, acceso a guía curricular |
| **Alumno** | Acceso a su perfil y diagnóstico |

### Rutas Protegidas

- `/admin/*` - Solo Super Admin
- `/directivo/*` - Directivo y Super Admin
- `/maestro/*` - Maestro y Super Admin
- `/alumno/*` - Alumno autenticado

---

## 📖 Documentación

### Guías Disponibles

- 📄 [Plan de Autenticación y Roles](PLAN-AUTENTICACION-ROLES.md)
- 📄 [Funcionalidades Super Admin](FUNCIONALIDADES-SUPER-ADMIN.md)
- 📄 [Plan Guía Curricular](PLAN-GUIA-CURRICULAR.md)
- 📄 [Configuración Firebase](README-FIREBASE.md)
- 📄 [Google Auth](GOOGLE-AUTH-AGREGADO.md)

### Scripts Útiles

```bash
# Crear Super Admin
npx tsx crear-super-admin.ts

# Agregar Matemáticas III de ejemplo
npx tsx agregar-matematicas-ejemplo.ts

# Agregar alumnos de prueba
npx tsx agregar-alumnos-prueba.ts

# Build para producción
npm run build

# Deploy a GitHub Pages
npm run deploy
```

---

## 🌐 Deploy

### GitHub Pages

El proyecto está configurado para deploy automático a GitHub Pages:

```bash
npm run deploy
```

**URL de Producción:**
```
https://68sfszbqhq-stack.github.io/EDUPLANMX/
```

### Configuración de Firebase para Producción

1. Habilitar dominios autorizados en Firebase Console
2. Agregar `68sfszbqhq-stack.github.io` a dominios autorizados
3. Configurar credenciales en `src/config/firebase.ts`

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👨‍💻 Autor

**Jose Roberto Mendoza Mendoza**

---

## 🙏 Agradecimientos

- Nueva Escuela Mexicana (NEM)
- Firebase
- React Community
- Lucide Icons

---

## 📊 Estadísticas del Proyecto

- 📦 **63 archivos** creados
- ➕ **12,179 líneas** de código
- ⏱️ **~6.5 horas** de desarrollo
- ✅ **100%** funcional

---

<div align="center">

**Hecho con ❤️ para la educación en México**

[⬆ Volver arriba](#-eduplan-mx---sistema-de-diagnóstico-socioeducativo)

</div>
