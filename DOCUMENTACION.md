# 📘 EduPlan MX — Documentación Completa de la Plataforma

> Documento maestro para cualquier persona que nunca ha visto la plataforma.
> Última actualización: julio 2026.

---

## 1. ¿Qué es EduPlan MX?

**EduPlan MX** es una plataforma web de **planeación educativa para Educación Media Superior (bachillerato) en México**, alineada al **MCCEMS 2024** (Marco Curricular Común de la Educación Media Superior) de la SEP/DGB.

Su función principal es que un **docente** genere en minutos una **planeación didáctica profesional** usando Inteligencia Artificial (Google Gemini), basada en los **programas oficiales de la SEP**, y contextualizada con los datos reales de su escuela y sus alumnos.

Alrededor de esa función central, la plataforma incluye módulos para directivos (indicadores del plantel, proyectos comunitarios PAEC/PMC), diagnóstico socioeducativo de alumnos, y un panel de super-administración multi-escuela.

**URLs de producción:**
- Netlify: https://superb-dodol-acefed.netlify.app
- GitHub Pages: https://68sfszbqhq-stack.github.io/EDUPLANMX/
- Repositorio: https://github.com/68sfszbqhq-stack/EDUPLANMX

---

## 2. Glosario (imprescindible para entender el dominio)

| Término | Significado |
|---|---|
| **MCCEMS** | Marco Curricular Común de la Educación Media Superior (plan de estudios oficial 2024) |
| **NEM** | Nueva Escuela Mexicana (modelo educativo nacional) |
| **SEP / DGB** | Secretaría de Educación Pública / Dirección General del Bachillerato |
| **UAC** | Unidad de Aprendizaje Curricular (equivalente a "materia") |
| **Progresión** | Unidad de contenido oficial de una materia (sustituye a los "temas" tradicionales) |
| **PAEC** | Programa Aula-Escuela-Comunidad: proyectos escolares vinculados a problemáticas de la comunidad |
| **PMC** | Programa de Mejora Continua: indicadores y diagnóstico del plantel (nivel directivo) |
| **PEC** | Proyecto Escolar Comunitario (documento derivado del PAEC) |
| **CCT** | Clave de Centro de Trabajo (identificador oficial de cada escuela) |
| **DUA** | Diseño Universal para el Aprendizaje (estrategias de inclusión) |
| **Ficha 12** | Taller de reflexión docente (árbol de identidad, huella docente, mapa sol) |
| **Planeación didáctica** | El documento que el maestro entrega: secuencia de clases con actividades, tiempos, evaluación |

---

## 3. Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite 5 |
| Estilos | Tailwind CSS 3 |
| Ruteo | React Router DOM 7 |
| Iconos | Lucide React |
| IA | Google Gemini 2.5 Flash (`@google/genai`) con salida JSON estructurada |
| Backend (BaaS) | Firebase: Authentication + Cloud Firestore |
| Impresión/PDF | `react-to-print` |
| Deploy | Netlify (principal) y GitHub Pages (`deploy.sh`) |

**No hay servidor propio.** Todo corre en el navegador; la persistencia es Firestore y la IA se llama directamente a la API de Gemini desde el cliente.

---

## 4. Arranque rápido (desarrollo local)

```bash
npm install
cp .env.example .env          # llenar con tus claves
npm run dev                   # http://localhost:3000
npm run build                 # tsc + vite build → dist/
npm run deploy                # ./deploy.sh → GitHub Pages
```

Variables de entorno requeridas (`.env`):

```bash
VITE_API_KEY=                        # API Key de Google Gemini
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Nota: si el usuario no tiene `VITE_API_KEY` del sistema, la interfaz del generador permite que el maestro pegue **su propia API Key de Gemini**.

---

## 5. Estructura del Proyecto

```
EDUPLANMX/
├── index.tsx                 # Punto de entrada (monta <Router/>)
├── Router.tsx                # TODAS las rutas + redirección por rol
├── App.tsx                   # "Shell" del maestro: sidebar + vistas internas
├── types.ts                  # Tipos núcleo: SchoolContext, SubjectContext, LessonPlan
│
├── types/                    # Tipos por dominio
│   ├── auth.ts               #   Usuario, roles, AuthContextType
│   ├── school.ts             #   School, UserProfile, onboarding multi-escuela
│   ├── diagnostico.ts        #   Alumno, batería NEM sociofamiliar
│   ├── cuestionarioIntegrado.ts # Cuestionario socioeducativo (5 pasos, Tobón 2023)
│   ├── paec.ts               #   Proyecto PAEC / Plan Factible
│   ├── pmc.ts                #   Indicadores del plantel (PMC)
│   ├── materia.ts, asignacion.ts, admin.ts
│
├── src/
│   ├── config/firebase.ts    # Inicialización de Firebase
│   ├── contexts/AuthContext.tsx # Estado global de sesión + carga de perfil
│   ├── services/             # CRUD contra Firestore (ver §9)
│   └── tools/                # Sistema modular de "Herramientas" (registro extensible)
│
├── services/                 # Servicios de IA y datos locales
│   ├── geminiService.ts      # ⭐ Generación de planeaciones con Gemini
│   ├── diagnosticoService.ts
│   └── mccemsService.ts
│
├── components/               # UI compartida y por módulo
│   ├── PlanGenerator.tsx     # ⭐ Formulario de generación de planeaciones
│   ├── PlanDocument.tsx      # Render imprimible de la planeación
│   ├── ContextManager.tsx    # Editor de contexto escolar y de materia
│   ├── PlansLibrary.tsx      # Historial de planeaciones
│   ├── DiagnosticoDashboard.tsx
│   ├── Sidebar.tsx, ProtectedRoute.tsx, PersonalizedDashboard.tsx
│   ├── RubricaInteractiva.tsx, VisualizacionFicha12.tsx
│   ├── onboarding/           # Wizard de 4 pantallas (crear/unirse a escuela)
│   ├── cuestionarioIntegrado/# Cuestionario socioeducativo en 5 pasos
│   ├── pasos/                # Formulario de alumno en 5 pasos
│   ├── admin/, director/, maestro/, dashboard/
│
├── pages/                    # Páginas por rol (ver §7)
│   ├── Login.tsx, OnboardingPage.tsx, RegistroAlumnos.tsx
│   ├── maestro/   (GuiaCurricular, ProgramaMateria, Herramientas, Ficha12)
│   ├── admin/     (SuperAdminDashboard, UsersManagement, SchoolsManagement, CSVImport…)
│   ├── director/  (Dashboard, Students)
│   ├── directivo/ (PMCDashboard)
│   └── plantel/   (PAECDashboard)
│
├── hooks/                    # useFormularioAlumno, useCuestionarioIntegrado
├── data/                     # ⭐ Catálogo oficial SEP (programas_sep.json + variantes)
├── scripts/                  # ETL: extractores Python/Node que generan data/*.json
├── firestore.rules           # Reglas de seguridad Firestore (dev)
├── firestore_prod.rules      # Reglas endurecidas (producción)
├── firestore.indexes.json    # Índices compuestos
├── vite.config.ts            # base path condicional (GitHub Pages vs Netlify)
├── netlify.toml              # Build + redirect SPA
├── deploy.sh                 # Deploy manual a gh-pages
└── *.md                      # ~30 documentos históricos de implementación
```

---

## 6. Autenticación, Roles y Onboarding

### 6.1 Roles

Definidos en `types/auth.ts`:

| Rol | Qué puede hacer |
|---|---|
| `superadmin` | Administra TODO el sistema: escuelas, usuarios, alumnos, asignación de materias. No pertenece a una escuela (usa `schoolId: 'system'`). Salta el onboarding. |
| `directivo` | Dashboard del plantel, gestión de alumnos, indicadores PMC, PAEC. |
| `maestro` | Generador de planeaciones, guía curricular, herramientas, diagnóstico, Ficha 12. |
| `alumno` | Dashboard en construcción; hoy solo llena cuestionarios vía registro público. |
| `guest` | Modo invitado (método `loginAsGuest` en el contexto). |

### 6.2 Flujo de sesión (`src/contexts/AuthContext.tsx`)

1. `authService.onAuthStateChanged` escucha Firebase Auth.
2. Al detectar usuario, lee su documento en la colección `users`.
3. **Si es superadmin**: se le inyecta `schoolId: 'system'` y entra directo.
4. Si no: `schoolService.needsOnboarding()` decide si va al wizard de onboarding.
5. Si el onboarding está completo, se hidrata el perfil con `schoolId`, `schoolName`, `schoolCct` y `puesto`.

Login soporta **email/contraseña** y **Google** (`loginWithGoogle`).

### 6.3 Onboarding multi-escuela (`components/onboarding/`)

Wizard de pasos: `WelcomeScreen` → (`JoinSchoolScreen` **o** `CreateSchoolScreen`) → `CompleteProfileScreen`.

- **Unirse**: busca la escuela por nombre/CCT o usa un **código de acceso** (ej. `CBT001`).
- **Crear**: registra la escuela (nombre, CCT, municipio, estado, turno) y el creador queda como directivo.
- **Perfil**: puesto (Director, Docente, etc.), materias que imparte y semestres que atiende.

Un usuario se considera "onboarded" cuando tiene: `onboardingCompleto`, `schoolId`, `schoolName`, `nombre` y `apellidoPaterno` (validación en `Router.tsx:45`).

---

## 7. Mapa de Rutas (`Router.tsx`)

| Ruta | Acceso | Contenido |
|---|---|---|
| `/login` | Pública | Login (email/Google) |
| `/registro` | Pública | Registro de alumnos (cuestionario diagnóstico, sin cuenta) |
| `/onboarding` | Autenticado | Wizard multi-escuela |
| `/` | Autenticado | Redirección automática según rol |
| `/maestro/dashboard` | maestro, superadmin | `App.tsx` — shell principal del docente |
| `/maestro/guia-curricular` | maestro, superadmin | Catálogo de materias MCCEMS |
| `/maestro/guia-curricular/:materiaId` | maestro, superadmin | Detalle de programa (progresiones, metas) |
| `/maestro/herramientas` | maestro, superadmin | Catálogo de herramientas educativas |
| `/maestro/ficha12` | maestro, superadmin | Taller reflexivo Ficha 12 |
| `/directivo/dashboard` | directivo, superadmin | Dashboard del plantel |
| `/directivo/alumnos` | directivo, superadmin | Gestión de alumnos del plantel |
| `/admin/dashboard` | superadmin | Panel central multi-escuela |
| `/admin/usuarios` | superadmin | Gestión global de usuarios |
| `/alumno/dashboard` | alumno | "En construcción" |
| `*` | — | Redirige a `/` |

`ProtectedRoute.tsx` valida sesión + rol permitido antes de renderizar.

### 7.1 Vistas internas del maestro (`App.tsx`)

`App.tsx` **no** es una página simple: es un shell con `Sidebar` que conmuta vistas por estado local (`view`), no por URL:

`dashboard` (PersonalizedDashboard) · `context` (ContextManager) · `generator` (PlanGenerator) · `plans` (PlansLibrary) · `diagnostico` (DiagnosticoDashboard) · `pmc` (PMCDashboard) · `paec` (PAECDashboard) · `admin-asignacion` · `admin-alumnos`. Las opciones de sidebar `guia-curricular`, `herramientas` y `ficha12` sí navegan por URL.

`App.tsx` además:
- Persiste `schoolContext`, `subjectContext` y `savedPlans` en **localStorage**.
- Hidrata el contexto escolar/materia automáticamente desde el perfil del usuario.
- Al guardar una planeación la escribe en localStorage (fallback) **y** en Firestore.

---

## 8. Módulos Funcionales

### 8.1 ⭐ Generador de Planeaciones con IA (núcleo de la plataforma)

**Archivos:** `components/PlanGenerator.tsx` (formulario, 761 líneas), `services/geminiService.ts`, `components/PlanDocument.tsx` (documento imprimible).

**Flujo:**
1. El maestro configura contexto escolar y materia (o se hidratan de su perfil).
2. En el generador especifica: progresión oficial, sesiones, metodología (ABP, ABPr…), fechas, vínculo PAEC, etc.
3. `generateLessonPlan()`:
   - Busca el **programa oficial SEP** de la materia con `programasSEPService` (catálogo local `data/programas_sep.json`).
   - Construye un *system prompt* de "experto pedagogo DGB/SEP en MCCEMS 2024".
   - Llama a **Gemini 2.5 Flash** con `responseSchema` (JSON estructurado, `maxOutputTokens: 16384`).
4. El resultado es un `LessonPlan` (tipo en `types.ts`) que incluye:
   - Datos generales (docente, ciclo, periodo, sesiones, metodología)
   - Progresión oficial + metas de aprendizaje + categorías/subcategorías
   - Vinculación PAEC (problemática comunitaria)
   - Fundamento pedagógico (sociocognitivo, socioemocional, transversalidad)
   - Secuencia didáctica (apertura/desarrollo/cierre, con actividades docente/alumno, tiempos, evidencias, instrumentos)
   - Estudio independiente, estrategias DUA, evaluación (diagnóstica/formativa/sumativa)
5. Se guarda en Firestore (`planeaciones`, con `userId` y `schoolId`) y puede imprimirse/exportarse con `react-to-print`.

**Extras:** `PedagogicalAuditor.tsx` (revisión pedagógica del plan) y `components/maestro/SugerenciasTransversalidad.tsx` + `transversalidadService.ts` (sugiere vínculos entre materias detectando temáticas compartidas en el catálogo SEP con un mapa de conceptos relacionados).

### 8.2 Guía Curricular (catálogo oficial SEP)

**Archivos:** `pages/maestro/GuiaCurricular.tsx`, `pages/maestro/ProgramaMateria.tsx`, `src/services/programasSEPService.ts`, `data/programas_sep.json`.

Muestra todas las UAC del MCCEMS por semestre. Cada materia tiene su programa completo: metadata (créditos, horas), organizador curricular (categorías, metas) y progresiones. Los datos se cargan del JSON local (generado por los scripts ETL de `scripts/`), con Firestore (`materias`) como capa adicional de materias activas del sistema. Estrategia "sí o sí": si el servicio falla, importa el JSON directo.

### 8.3 Diagnóstico Socioeducativo de Alumnos

Dos instrumentos:

1. **Formulario de alumno (5 pasos)** — `components/FormularioAlumno.tsx` + `components/pasos/Paso1..5` + `hooks/useFormularioAlumno.ts`. Página pública `/registro`. Captura: identidad/CURP, familia, economía y salud, contexto PAEC, intereses. Guarda en colección `alumnos` (`alumnosFirebase.ts`).

2. **Cuestionario Socioeducativo Integrado (5 pasos)** — `components/cuestionarioIntegrado/` + `hooks/useCuestionarioIntegrado.ts` + `types/cuestionarioIntegrado.ts`. Basado en Sergio Tobón (2023). Secciones: datos generales, familia (tipo de familia, tutor), economía/vivienda, datos personales del alumno, contexto comunitario. Guarda progreso en localStorage y el resultado en `cuestionariosSocioEducativos`. Se administra desde `pages/GestionCuestionarios.tsx`.

`DiagnosticoDashboard.tsx` y `components/maestro/DiagnosticoGrupoForm.tsx` agregan estos datos para que el maestro conozca el perfil de su grupo (alimenta el campo "contexto/diagnóstico" de las planeaciones).

### 8.4 PAEC — Proyectos Escuela-Comunidad

**Archivos:** `pages/plantel/PAECDashboard.tsx`, `components/director/PAECManager.tsx`, `components/PlanFactibleWeb.tsx`, `components/PECPrintableDocument.tsx`, `types/paec.ts`, `src/services/pecService.ts`.

Permite construir el **Plan Factible / PEC** del plantel: encabezado institucional oficial, justificación, propósito, metodología, y una matriz de **actividades por fase** (Identificación → Planeación → Acción → Reflexión) con asignatura, propósito formativo, semana de ejecución, instrumento de evaluación y evidencia. Incluye ficha administrativa con población beneficiada. Genera documento imprimible con formato oficial SEP.

### 8.5 PMC — Programa de Mejora Continua (directivos)

**Archivos:** `pages/directivo/PMCDashboard.tsx`, `components/director/SchoolIndicators.tsx`, `types/pmc.ts`, `src/services/pmcService.ts`.

Captura indicadores del plantel: abandono escolar, reprobación, eficiencia terminal, matrícula; infraestructura (electricidad, internet, laboratorios); y el banco de **problemáticas PAEC** priorizadas (con criterios de impacto social, viabilidad, interés estudiantil y transversalidad) para elegir la problemática del ciclo.

### 8.6 Sistema de Herramientas (extensible)

**Archivos:** `pages/maestro/Herramientas.tsx`, `src/tools/_shared/` (ToolRegistry, ToolCard, ToolLayout, types), `src/services/toolService.ts`.

Catálogo de herramientas educativas con categorías (planeación, actividades, evaluación, materiales, comunicación), búsqueda y registro central (`registerTool()`). **El registro está actualmente vacío** — es la infraestructura lista para agregar herramientas como módulos independientes. Los resultados generados se guardan en `herramientas_generadas`.

### 8.7 Ficha 12 — Taller reflexivo docente

**Archivos:** `pages/maestro/Ficha12.tsx`, `components/RubricaInteractiva.tsx`, `components/VisualizacionFicha12.tsx`.

Taller interactivo por pestañas donde el docente completa: **Árbol de identidad** (raíces/tronco/copa), **Huella docente**, **Reflexión** y **Mapa Sol** (identidad, áreas, acciones). Incluye rúbrica interactiva de autoevaluación y una visualización final. Persiste en la colección `fichas12` por `userId`.

### 8.8 Super Admin (multi-escuela)

**Archivos:** `pages/admin/*`: `SuperAdminDashboard.tsx`, `UsersManagement.tsx`/`Usuarios.tsx`, `SchoolsManagement.tsx`, `StudentsManagement.tsx`/`GestionAlumnos.tsx`, `AsignacionMaterias.tsx`, `CSVImport.tsx`; servicios `adminService.ts`, `usuariosService.ts`, `asignacionesService.ts`.

Capacidades: estadísticas globales, CRUD de escuelas y usuarios, cambio de roles (`ModalCambiarRol`), asignación de materias a maestros, gestión de alumnos, e **importación masiva por CSV** (`CSVImport.tsx`, ver `GUIA-IMPORTACION-CSV.md`).

### 8.9 Dashboard del Directivo

`pages/director/Dashboard.tsx` + `pages/director/Students.tsx`: resumen del plantel, acceso a alumnos, indicadores (`SchoolIndicators`) y diseño del PEC (`PECDesignPanel`).

---

## 9. Servicios (capa de datos)

### `src/services/` — Firestore

| Servicio | Responsabilidad |
|---|---|
| `authService.ts` | Login/registro/Google, observador de sesión, lectura de `users` |
| `schoolService.ts` | Crear/buscar/unirse a escuelas, `needsOnboarding`, perfiles |
| `planeacionesService.ts` | CRUD de planeaciones con aislamiento por `schoolId`, estadísticas |
| `alumnosFirebase.ts` | Registro de alumnos (diagnóstico) |
| `usuariosService.ts` / `adminService.ts` | Gestión de usuarios (admin) |
| `materiasService.ts` | Materias del sistema |
| `asignacionesService.ts` | Asignación materia↔maestro |
| `pecService.ts` / `pmcService.ts` | Documentos PAEC/PEC y PMC |
| `programasSEPService.ts` | Catálogo SEP local con índices por materia y semestre; genera contexto para la IA |
| `transversalidadService.ts` | Análisis de vinculaciones entre materias |
| `toolService.ts` | Persistencia de herramientas generadas |
| `studentStatsService.ts` | Estadísticas de alumnos |

### `services/` (raíz) — IA y utilidades

- `geminiService.ts` — generación de planeaciones (ver §8.1)
- `diagnosticoService.ts` — lógica del módulo de diagnóstico
- `mccemsService.ts` — metadatos MCCEMS

---

## 10. Modelo de Datos en Firestore

Colecciones detectadas en el código:

| Colección | Contenido | Aislamiento |
|---|---|---|
| `users` | Perfiles de usuario (rol, escuela, materias, onboarding) | Por `uid` |
| `schools` | Escuelas (CCT, código de acceso, directivos, estadísticas) | — |
| `alumnos` | Alumnos con batería diagnóstica NEM | `schoolId` (filtrado en frontend) |
| `planeaciones` | Planeaciones generadas (`content` = LessonPlan completo) | `userId` + `schoolId` |
| `cuestionariosSocioEducativos` | Respuestas del cuestionario integrado | — |
| `fichas12` | Talleres Ficha 12 | `userId` |
| `asignaciones` | Materias asignadas a maestros | `schoolId` |
| `herramientas_generadas` | Salidas del sistema de herramientas | `userId` |
| `materias` | Catálogo de materias activas | — |
| `diagnosticos_grupo` | Diagnósticos por grupo (índice definido) | `schoolId` |

**Índices compuestos** (`firestore.indexes.json`): `planeaciones` por (`schoolId`,`userId`,`createdAt`) y (`schoolId`,`createdAt`); `diagnosticos_grupo` por (`schoolId`,`fechaActualizacion`).

**Patrón multi-tenant:** cada documento operativo lleva `schoolId`; los servicios filtran por escuela. `schoolName` se **denormaliza** en el usuario para evitar lecturas extra.

---

## 11. Seguridad (`firestore.rules`)

- Helpers: `isAuthenticated()`, `getUserData()` (lee el doc del usuario — cuesta 1 lectura por evaluación), `isSuperAdmin()`, `isDirector()`.
- `users`: cada usuario lee/escribe **su propio** documento; superadmin todo.
- `schools`: lectura para cualquier autenticado (necesario para el onboarding); escritura solo superadmin.
- `alumnos`: lectura/escritura para autenticados (el frontend filtra por escuela).
- **Regla catch-all**: cualquier otra colección permite lectura/escritura a cualquier autenticado.

⚠️ **Advertencia conocida**: las reglas actuales son permisivas (el aislamiento por escuela se confía al frontend). Existe `firestore_prod.rules` con versión endurecida; ver `RESOLUCION-SEGURIDAD-FINAL.md` y `DESPLEGAR-REGLAS-FIRESTORE.md`.

---

## 12. Pipeline de Datos MCCEMS (`data/` + `scripts/`)

El catálogo oficial no se escribe a mano; se genera con un pipeline ETL:

1. `scripts/extractor_mccems.py` / `generar_oficial.py` (Python, ver `requirements.txt`) extraen los programas oficiales de la DGB (PDFs/web).
2. `scripts/populate_curriculum*.cjs`, `sanitize_json.cjs`, `update_propositos.cjs` (Node) limpian y completan el JSON.
3. Salida: `data/programas_sep.json` (+ variantes `_completo`, `_automatico`, y carpeta `sep_por_semestre/`).
4. `programasSEPService` lo carga en memoria al iniciar y lo indexa por materia/semestre.

Para agregar materias: ver `data/COMO_EXPANDIR_MATERIAS.md`. Scripts de siembra a Firestore: `seed-materias.ts`, `agregar-alumnos-prueba.ts`, `configurar-super-admin.ts`, `scripts/migrateToMultiSchool.ts` (se corren con `tsx`).

---

## 13. Build y Deploy

**Único destino: GitHub Pages** (Netlify se eliminó en julio 2026 por costos):
- `vite.config.ts` usa base `/EDUPLANMX/` en producción y `/` en desarrollo.
- `npm run deploy` ejecuta `deploy.sh`: build, crea `.nojekyll`, copia `index.html` → `404.html` (para que el ruteo SPA sobreviva recargas) y hace push forzado a la rama `gh-pages`.
- `firebase.json` + `.firebaserc` permiten desplegar reglas de Firestore con `firebase deploy --only firestore:rules`.

`iniciar_eduplan.command` / `.sh`: lanzadores locales de conveniencia (macOS).

---

## 14. Documentos históricos (los ~30 `.md` de la raíz)

Son **bitácoras de implementación** por fase, no documentación de usuario. Los más útiles:

- `ARQUITECTURA-IMPLEMENTADA.md`, `DIAGRAMA-ARQUITECTURA.md` — decisiones de arquitectura
- `SISTEMA-MULTI-ESCUELA-FINAL.md`, `PLAN-AISLAMIENTO-MULTI-ESCUELA.md` — diseño multi-tenant
- `SUPER-ADMIN-SISTEMA.md`, `FUNCIONALIDADES-SUPER-ADMIN.md` — panel admin
- `ONBOARDING-COMPLETO.md` — flujo de onboarding
- `MODULO-DIAGNOSTICO.md`, `CUESTIONARIO-INTEGRADO-README.md` — instrumentos diagnósticos
- `MCCEMS_DATA_ENGINEERING.md`, `README-MCCEMS.md` — pipeline del catálogo SEP
- `RESOLUCION-SEGURIDAD-FINAL.md` — decisiones de seguridad
- `GUIA-IMPORTACION-CSV.md` — formato de importación masiva

---

## 15. Estado actual y áreas pendientes

- ✅ Núcleo funcionando: generación IA, guía curricular, multi-escuela, onboarding, super admin, Ficha 12, PAEC/PMC, diagnóstico.
- 🚧 Dashboard de **alumno**: placeholder "En construcción".
- 🚧 **ToolRegistry vacío**: la infraestructura de herramientas existe pero sin herramientas registradas.
- ✅ Reglas Firestore desplegadas (jul 2026): lectura de datos de alumnos solo con sesión; creación pública solo para el formulario `/registro`; planeaciones y fichas12 editables solo por su dueño.
- ✅ Analítica de uso (GA4 vía Firebase, gratis): eventos `login`, `planeacion_iniciada/generada/impresa`, `modulo_abierto`. Requiere `VITE_FIREBASE_MEASUREMENT_ID` en `.env`.
- ✅ Modo demo "Probar como Invitado" funcional (rol `guest` con acceso a la experiencia de maestro).
- ⚠️ La `VITE_API_KEY` del sistema en `.env` es **inválida** (verificado jul 2026): cada docente debe usar su propia clave (el generador ya incluye botón y guía para crearla).
