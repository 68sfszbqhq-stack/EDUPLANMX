# Plan de Mejoras EduPlan MX — basado en fichas CAPEMS 2026 (DBEPA Puebla)

> Fuente: análisis de `contexto_total_para_ia.md` (40 fichas de formación docente CAPEMS 2026,
> 6ª sesión de Consejo Académico ZE013BG, dossier de planeación situada).
> Fecha del análisis: 19 de julio de 2026.
> Estado: [ ] pendiente · [~] en progreso · [x] hecho

## Alta prioridad (alinean la app con lo que la DBEPA ya exige)

### 1. [x] Alinear PedagogicalAuditor con checklist oficial "Reflexionando sobre el Modelo 2025" (Ficha 01)
> HECHO 20 jul 2026: auditor reescrito con 4 grupos de criterios (estructura, NEM, evaluación,
> equidad), veredicto tipo semáforo y "Cómo corregirlo" accionable por cada hallazgo.
- Componente: `components/PedagogicalAuditor.tsx`
- Convertir en criterios del auditor las preguntas oficiales de la Ficha 01:
  - Diagnóstico que va más allá de lo académico (integra contexto/problemas reales)
  - Apertura con democracia participativa (consenso de producto y criterios de evaluación)
  - Desarrollo con micro-intervenciones focalizadas y preguntas metacognitivas
  - Cierre como asamblea de reflexión (no "juicio final"), eje técnico + eje humano
  - Error como oportunidad; retroalimentación dialógica
- Es el mismo criterio con el que supervisión de Zona 013 revisa planeaciones.

### 2. [ ] Biblioteca de instrumentos de evaluación insertables
- Catálogo de plantillas que el maestro inserta en su planeación y salen en export a Word:
  - Guía de observación cualitativa, bitácora de dudas, anecdotario/bitácora de campo
  - "Entrevista en espejo", "rúbrica espejo lógico" (coevaluación)
  - Diana de participación / diana de razonamiento matemático (Ficha 18)
  - Escalera de metacognición (Ficha 19)
  - Tickets de salida, semáforo grupal, escalas de autoevaluación, listas de cotejo
- Diferenciador inmediato: ningún maestro tiene esto a un clic.

### 3. [x] Ciclo oficial de retroalimentación en 3 preguntas (Fichas 03 y 18)
> HECHO 20 jul 2026: `feedbackCycle` en el schema de Gemini (campo requerido) + reglas anti-genéricas
> en el systemInstruction; se renderiza en PlanDocument (sección VIII-B) y en el export a Word (7-B);
> el auditor valida que las 3 preguntas existan y que la sugerencia no sea genérica.
- Agregar a la sección de evaluación de cada secuencia los 3 campos del MCCEMS:
  1. ¿Hacia dónde va el estudiante? (meta)
  2. ¿Dónde se encuentra ahora? (evidencia)
  3. ¿Cómo puede llegar ahí? (retroalimentación)
- Pedir a Gemini sugerencias CONCRETAS, no genéricas (énfasis explícito de la Ficha 18).
- Cambio de prompt/estructura sobre `services/geminiService.ts` + generador; no toca Firestore.

### 4. [ ] Módulo BAP en el diagnóstico (Ficha 08 + 6ª sesión CAPEMS)
- Agregar al módulo de diagnóstico (`components/DiagnosticoDashboard.tsx`, `services/diagnosticoService.ts`):
  - Registro de BAP por categoría (basado en el Instrumento de Registro oficial SEP)
  - Generador propone 3 estrategias de prevención/minimización por categoría detectada
    (= producto exacto que pide la Ficha 08)
- Extender biblioteca del plantel con etiquetas de BAP y TICCAD en los recursos
  (= "repositorio institucional compartido" del Acuerdo 2 del cierre de ciclo).

## Prioridad media (módulos nuevos con demanda clara)

### 5. [ ] Constructor de metas SMART + seguimiento de PMC (Fichas 35–38, 45)
- Módulo para páginas director/directivo:
  - Asistente que valida redacción de meta campo por campo:
    verbo + plazo + porcentaje/cantidad + acciones + actores + finalidad + criterio de medición
  - Tabla de seguimiento con umbrales oficiales (Ficha 36):
    Cumplida ≥80% · En proceso 40–79% · En riesgo <40% · Decisión: Mantener/Ajustar/Reorientar
  - Estructura PMC: Portada, Diagnóstico (FODA), Metas, Estrategia de implementación
  - Informe final de cierre de ciclo (Ficha 37)
- Producto de entrega obligatoria para cada plantel.

### 6. [ ] Generador del Anexo 1 del PAEC (Fichas 39–42)
- Cierra el flujo de `Paso4ContextoPAEC` + `PlanFactibleWeb`:
  - Prellenar formato de registro oficial: CCT, plantel, subsistema
  - Resumen del proyecto con contador de máx. 1,700 caracteres
  - Conteo de participantes (estudiantes, docentes, padres, comunidad)
  - Validar transversalidad de ≥3 asignaturas/UAC (proyecto integrador = 2, PAEC = 3+)
- Alinear `RubricaInteractiva.tsx` con las 2 rúbricas oficiales DBEPA:
  - Rúbrica de desempeño estudiantil (7 categorías, nivel "Sobresaliente (5)")
  - Rúbrica de propósitos formativos (4 fases: identificación, plan factible, realización, reflexión)
- Export a PDF (las fichas exigen entrega a supervisión en PDF).

### 7. [x] Bitácora docente ligera con semáforo (dossier, módulos 03 y 07)
> HECHO 20 jul 2026: `components/BitacoraDocente.tsx` + `src/services/bitacoraService.ts` (paso 6
> del sidebar). Registro por sesión con semáforo 🟢🟡🔴, alerta automática cuando ≥40% queda en rojo
> (argumento con evidencia ante la Academia de Zona) y botón "Enviar al Flujo de Contextualización"
> que vuelca los hallazgos a la Fase 1 — así se cierra el bucle del flujo.
- Registro diario por grupo, 3 ejes: ¿Qué pasó? / ¿Qué falló? / ¿Qué sigue?
- Semáforo grupal 🟢 comprendido · 🟡 dudas · 🔴 no se entendió
- Tickets de salida agrupados en alto/medio/bajo dominio
- Bajo costo Firestore (1 doc por sesión); evidencia para Academia de Zona y PMC.

## Prioridad menor pero estratégica

### 8. [x] Transparencia del uso de IA (Fichas 16 y 34)
> HECHO 20 jul 2026: `aiTrace` en LessonPlan (prompt exacto, modelo, fecha, ajustes docente,
> revisado sí/no). Nuevo `components/RevisionDocente.tsx` con las 4 preguntas de lectura crítica;
> los botones Word/PDF quedan deshabilitados hasta confirmar la revisión. El Word incluye una
> "Constancia de revisión docente" con los ajustes declarados.
- Guardar con cada planeación generada: (a) el prompt enviado a Gemini, (b) los ajustes del docente.
- Paso obligatorio de "revisión y ajuste docente" antes de exportar.
- Cumple el flujo IA-con-mediación-docente que capacita la propia SEP Puebla.
- Argumento fuerte para la ponencia EIIE 2026 (PONENCIA-EIIE-2026.md).

### 9. [x] Checklist de perspectiva de género en el auditor (Ficha 13)
> HECHO 20 jul 2026: criterio "Lenguaje incluyente" en el grupo Equidad del auditor + regla 11 en
> el systemInstruction de Gemini (usar "el estudiantado", evitar masculino genérico y estereotipos).
- Dos verificaciones: lenguaje incluyente en instrucciones + al menos un referente femenino
  vinculado al tema (= producto "PDPG" de la ficha).

### 10. [ ] Reforzar modo offline de la PWA
- Contexto real: planteles sin internet en talleres, conectividad intermitente (dossier).
- Verificar que planeaciones ya generadas y biblioteca sean consultables sin conexión
  (persistencia offline de Firestore + cache de assets).

## Decisión de alcance
- NO indexar el contenido íntegro de las fichas como "cursos" en la app: son materiales de
  sesiones presenciales de CTE. Lo valioso son los formatos, criterios e instrumentos oficiales,
  que es lo que extraen las 10 propuestas.

## Implementado (19 jul 2026): Panel "Flujo de Contextualización"
- [x] Nuevo panel `components/FlujoContextualizacion.tsx` (vista `flujo`, paso 1 del sidebar):
  fases visuales con flechas — 0 Plantel (indicadores/conectividad/FODA), 1 Grupo,
  2 BAP con estrategias sugeridas de la Ficha 08 (elegibles), 3 PAEC (validación ≥3 asignaturas),
  4 Curricular (informativa) → tarjeta Resultado con mapa de trazabilidad + CTA al generador.
- [x] Servicio `src/services/flujoContextoService.ts`: persistencia localStorage `flujoContexto`,
  conteo de fases, catálogo ESTRATEGIAS_BAP, `generarBloquePrompt()`.
- [x] Interconexión con PlanGenerator: bloque del flujo inyectado al prompt de Gemini
  (instrucciones: apertura situada, etiqueta [Ajuste BAP], cierre con producto social),
  prellenado de problemática PAEC, banner 🧭 con estado X/4 y botón al panel.
- [x] Tipos `ContextoFlujo` en types.ts; sidebar con paso "Flujo de Contextualización" (Compass).
- Con esto, la mejora #4 queda parcialmente cubierta (registro BAP + estrategias); falta
  etiquetar BAP/TICCAD en la biblioteca del plantel.

## Diagrama del flujo de contextualización
- Visual del proceso completo (fases que se rellenan → planeación contextualizada):
  https://claude.ai/code/artifact/a0fa650a-8f39-45ae-ba29-16b39c9e4a9f
- Fases: 0 Contexto plantel + 1 Diagnóstico grupo (convergen) → 2 BAP → 3 PAEC →
  4 Selección curricular → 5 IA + revisión docente → RESULTADO (planeación con mapa de
  trazabilidad) → 6 Auditor → 7 Export/entrega → ↺ bitácora semáforo reinicia el ciclo.

## Auditoría de seguridad — corregido y desplegado (21 jul 2026)
- URGENTE (resuelto): la clave de Gemini estaba incrustada en el bundle público.
  Vite ya no la inyecta; cada docente usa su propia clave (sessionStorage).
  Verificado en producción: ya no es descargable. PENDIENTE DE JOSÉ: revocar la
  clave anterior en Google AI Studio (estuvo pública → asumir comprometida).
- ALTO (resuelto): datos de alumnos (menores) no aislados por escuela.
  - Consultas acotadas por schoolId (studentStats, obtenerAlumnos, dashboard).
  - /registro ahora exige el CCT (o ?escuela=CCT en el enlace del docente) y liga
    al alumno a su plantel; antes nacían huérfanos.
  - Herramienta "asociar TODOS los alumnos a mí" ahora solo adopta huérfanos y es
    solo superadmin.
  - firestore.rules DESPLEGADAS: /alumnos se lee/escribe solo dentro de la misma
    escuela; crear exige schoolId. schools pasó a lectura pública (solo metadatos).
- Reglas desplegadas con `firebase deploy --only firestore:rules --project eduplanmx`
  (el CLI está en /usr/local/bin/firebase con credenciales activas).
- Pendientes menores RESUELTOS (21 jul 2026):
  - Regla comodín amplia → deny-por-defecto: cada colección con regla explícita
    (usuarios, materias, grupos, asignaciones, diagnosticos_grupo, pmc,
    pmc_diagnosis, pmc_metas, herramientas_generadas, api_usage, api_quotas);
    colección nueva nace bloqueada. Verificado en producción con sesión de
    maestro: planeaciones, PEC/pmc, alumnos, materias, flujo y bitácora sin
    errores de permisos. (El deny hizo visible al instante un hueco: faltaba la
    regla de `pmc`, se añadió y desplegó.)
  - Persistencia offline de Firestore activada (initializeFirestore +
    persistentLocalCache multi-pestaña) en src/config/firebase.ts.
  - Eliminado firestore_prod.rules divergente; firestore.rules es el único.
- Anotado como deuda (no de seguridad): 'usuarios' y 'users' son colecciones
  distintas — el panel de admin opera sobre 'usuarios' mientras los perfiles de
  auth viven en 'users'. Revisar si la gestión de usuarios apunta a la correcta.

## Desplegado a producción (20 jul 2026)
- Commit `e320cae` en `main`; GitHub Pages sirviendo bundle `index-7HVTOm5l.js`.
- URL: https://68sfszbqhq-stack.github.io/EDUPLANMX/
- Verificado en producción: panel de flujo, sidebar de 6 pasos y bitácora.
- Cambio de comportamiento visible para los 7 docentes: Word y PDF ya NO se
  descargan hasta confirmar la revisión docente (Fichas 16 y 34).
- RESUELTO el 20 jul 2026: flujo y bitácora ya sincronizan con la cuenta del
  docente (campos `flujoContexto` y `bitacoraDocente` en `users/{uid}`).
  Diseño offline-first: localStorage sigue siendo la lectura inmediata.
  Verificado en producción de punta a punta: dato escrito, almacenamiento local
  borrado, dato recuperado desde la nube.
- Bug de raíz encontrado al verificar: `authService.getUserData` devolvía
  `userDoc.data()`, que no incluye el id del documento, así que `user.id`
  quedaba undefined en cuentas sin campo `id` guardado. Rompía en silencio el
  respaldo del diagnóstico, la sincronización y el userId de las planeaciones.
  Corregido adjuntando siempre `id: userDoc.id`.
- La lógica de fusión de la bitácora tiene prueba: `npm run prueba:fusion`.

## Estado del flujo (fases 0–7 + bucle)
- Fases 0–4 (plantel, grupo, BAP, PAEC, curricular) → panel `flujo` ✅
- Fase 5 (IA + revisión docente) → `RevisionDocente.tsx` + `aiTrace` ✅
- Fase 6 (auditor con checklist Ficha 01) → `PedagogicalAuditor.tsx` reescrito ✅
- Fase 7 (export) → Word/PDF bloqueados hasta revisión; Word con constancia y ciclo 7-B ✅
- ↺ Bucle (bitácora semáforo → Fase 1) → `BitacoraDocente.tsx` ✅

## Siguiente paso sugerido
- Mejora #2: biblioteca de instrumentos de evaluación insertables (el auditor ya detecta cuándo
  faltan instrumentos dialógicos, así que la biblioteca cierra ese hueco).
- Mejora #6: Anexo 1 del PAEC prellenado + rúbricas oficiales DBEPA.
- Mejora #5: constructor de metas SMART + seguimiento PMC (perfil directivo).
