# Ponencia — 2° EIIE "Pedagogías para el Mundo de Hoy" (Ibero Puebla)

> **Instrucciones de formato al pasar a Word:** Arial 12, interlineado 1.5, títulos y subtítulos en negritas, máximo 10 cuartillas. Enviar como adjunto a **innovacion.educativa@iberopuebla.mx** antes del **16 de agosto de 2026**.
> Los textos entre [corchetes] son datos que debes completar o ajustar tú.

---

## a. Autoría

José Roberto Mendoza [completa tu(s) apellido(s)]
Docente de Cultura Digital y Educación Física, Bachillerato General Oficial "Carlos Camacho Espíritu", turno vespertino, Zona Escolar 013, Puebla, Pue.
[Estudiante/egresado de — programa en la IBERO Puebla, si aplica]
Correo: [tu correo de contacto]

## b. Eje temático

**A) Alternativas para enseñar y aprender en un mundo hiperconectado** — integración crítica y creativa de la inteligencia artificial y recursos tecnológicos en el aula; alfabetización digital para docentes.

## c. Título

**EduPlan MX: de 50 minutos a 5 — una plataforma con inteligencia artificial, construida por un docente, para devolverle al profesorado de bachillerato su tiempo pedagógico**

## d. Contexto

El profesorado de los Bachilleratos Generales Oficiales del estado de Puebla enfrenta una paradoja cotidiana: el tiempo que debería dedicarse a diseñar buenas experiencias de aprendizaje se consume en producir documentos administrativos. La planeación didáctica alineada al Marco Curricular Común de la Educación Media Superior (MCCEMS) exige articular progresiones de aprendizaje oficiales, metas, categorías y subcategorías, vinculación con el Programa Aula-Escuela-Comunidad (PAEC), estrategias de inclusión (DUA), desglose socioemocional del currículum ampliado e instrumentos de evaluación — un formato que un docente tarda entre 40 y 50 minutos en completar por planeación, multiplicado por grupos, parciales y asignaturas, y revisado en cada Consejo Técnico Escolar.

A esta carga se suma un momento curricular inusualmente complejo: conviven en las aulas dos planes de estudio (la generación 2023-2026 y la generación 2025-2028 del MCCEMS), con programas oficiales publicados en decenas de documentos PDF dispersos en el portal de la Dirección General del Bachillerato (DGB), difíciles de consultar en el momento de planear.

Muchos docentes ya recurren a asistentes de IA conversacionales (ChatGPT, Gemini) para aliviar esta carga. Sin embargo, el chat genérico desconoce las progresiones oficiales, el formato que exige la supervisión escolar y — lo más importante — las características reales del grupo al que va dirigida la clase. El resultado suele ser una planeación genérica que "cumple" pero no transforma.

EduPlan MX nace en este contexto, desarrollada por un docente en servicio del Bachillerato General Oficial "Carlos Camacho Espíritu" (turno vespertino, Zona 013, Puebla), como una plataforma web gratuita que hoy utilizan los 7 docentes del plantel, de distintas asignaturas.

## e. Propósito de la práctica innovadora

Reducir drásticamente la carga administrativa de la planeación didáctica en el bachillerato mediante una plataforma web con inteligencia artificial que genera planeaciones alineadas al MCCEMS a partir de las progresiones oficiales de la DGB — para que el tiempo recuperado se reinvierta en lo pedagógico: contextualizar la enseñanza a partir del diagnóstico socioeducativo real del grupo, y no en llenar formatos.

La apuesta central no es que "la IA planee por el docente", sino invertir la ecuación del uso docente de la IA: en lugar de que cada profesor negocie con un chat genérico, la plataforma incorpora el criterio pedagógico (currículo oficial, formato de supervisión, diagnóstico del grupo, metodologías activas) y deja al docente las decisiones que sí son suyas: qué enseñar, con qué estrategia, para qué grupo y con qué adaptaciones.

## f. Fines de aprendizaje o competencias que busca desarrollar

**En el profesorado (destinatario directo de la práctica):**

1. Alfabetización digital y en inteligencia artificial con sentido crítico: comprender qué puede y qué no puede delegarse a un sistema de IA en el diseño didáctico (el docente conserva la selección curricular, la estrategia y la validación; la IA redacta y estructura).
2. Apropiación del MCCEMS: al planear sobre las progresiones oficiales textuales, el docente se familiariza con el nuevo marco curricular en el uso, no en cursos abstractos.
3. Planeación contextualizada: capacidad de traducir datos socioeducativos del grupo (conectividad, situación laboral, intereses) en decisiones didácticas explícitas.

**En el estudiantado (destinatario indirecto):**

4. Experiencias de aprendizaje más pertinentes: cada planeación generada incluye al menos una actividad adaptada explícitamente a las características del grupo (etiquetada como "Adaptación al grupo"), por ejemplo, evitar tareas dependientes de internet cuando el diagnóstico indica conectividad limitada.
5. Vinculación comunitaria: las planeaciones integran la problemática PAEC del plantel, conectando los contenidos con el entorno real de las y los estudiantes.

## g. Metodología: secuencia de actividades, recursos y materiales

**La práctica se desarrolló en cuatro fases:**

**Fase 1 — Diagnóstico del problema (ciclo 2025-2026).** Registro del tiempo real de planeación de los docentes del plantel (40-50 minutos por planeación en Word) y de las fricciones: búsqueda de progresiones en PDFs, recaptura de datos del formato, desconexión entre el diagnóstico socioeducativo (que se aplicaba y se archivaba) y la planeación.

**Fase 2 — Construcción de la plataforma.** Desarrollo web (React + Firebase, con el modelo Gemini de Google como motor de generación) bajo tres principios de diseño: (1) costo cero para el docente y la escuela — infraestructura en niveles gratuitos y cada docente usa su propia clave de API gratuita; (2) currículo oficial primero — se construyó un pipeline de extracción que procesó más de 100 programas oficiales de la DGB (generaciones 2023-2026 y 2025-2028) para que el selector de contenidos ofrezca las progresiones textuales, distinguiendo el plan de estudios de cada generación; (3) honestidad curricular — cuando un programa aún no está verificado contra el documento oficial, la plataforma lo advierte en lugar de inventar contenido.

**Fase 3 — El flujo docente (secuencia de uso, 4 pasos).**
1. *Contexto escolar:* el docente configura una sola vez los datos del plantel (visión, municipio, CCT).
2. *Diagnóstico del grupo:* el docente aplica su cuestionario socioeducativo (Google Forms); la plataforma le proporciona un "machote" — un prompt estructurado — para que cualquier asistente de IA resuma las respuestas en un perfil grupal sin datos personales (porcentajes y patrones, nunca nombres); ese resumen se guarda y alimenta todas sus planeaciones.
3. *Generación:* el docente selecciona la progresión oficial (o escribe su tema), el tipo de apoyo pedagógico que necesita ese día (estructurar, diferenciar con DUA, visualizar, evaluar, gamificar o contextualizar), la metodología activa (ABP, aula invertida, estudio de casos…), sesiones y evaluación. La IA genera en 20-40 segundos una planeación completa: secuencia didáctica por sesión, instrumentos de evaluación, estudio independiente, vinculación PAEC y la adaptación explícita al grupo.
4. *Validación e impresión:* un auditor pedagógico integrado revisa la alineación; el docente ajusta, guarda e imprime el documento con el formato que exige la supervisión.

**Fase 4 — Adopción acompañada.** Incorporación de los 7 docentes del plantel con acompañamiento entre pares; la fricción detectada (registro, claves de API, navegación) se corrigió iterativamente sobre la plataforma en producción.

**Recursos y materiales:** plataforma web EduPlan MX (acceso desde navegador, computadora o celular); cuenta gratuita de Google por docente; cuestionario socioeducativo del plantel; programas de estudio oficiales de la DGB (integrados en la plataforma). Costo de operación: $0.

## h. Resultados

**Resultados preliminares con los 7 docentes del plantel (ciclo 2025-2026):**

- El tiempo de elaboración de una planeación didáctica completa pasó de **40-50 minutos a aproximadamente 5 minutos**, manteniendo el formato exigido por la supervisión escolar.
- **Retención voluntaria del 100%:** los 7 docentes que probaron la plataforma regresaron a usarla sin requerimiento administrativo, y la valoración cualitativa destaca la calidad del documento entregable.
- Las planeaciones incorporan ahora progresiones oficiales textuales del MCCEMS (76 unidades de aprendizaje curricular con contenido oficial verificado integradas a la plataforma), reduciendo el riesgo de desalineación curricular entre planes de estudio 2023-2026 y 2025-2028.
- El diagnóstico socioeducativo dejó de ser un trámite archivado: alimenta directamente la generación de cada planeación con adaptaciones explícitas y verificables en el documento.

**Medición en curso:** la plataforma incorpora analítica de uso anónima (planeaciones generadas e impresas, tiempos reales de elaboración) y está en diseño un piloto formal de 6 semanas con pre/post-encuesta y evaluación ciega de calidad de planeaciones mediante rúbrica de doble juez, cuyos resultados se compartirían en la presentación. [Ajusta este párrafo según el avance que tengas en agosto.]

## i. Reflexión sobre la práctica

La experiencia deja tres aprendizajes que considero transferibles a otros contextos educativos:

**1. La innovación con IA en educación no es un problema de tecnología sino de criterio pedagógico incorporado.** La diferencia entre un chat genérico y EduPlan MX no está en el modelo de lenguaje (es el mismo tipo de tecnología), sino en dónde reside el conocimiento pedagógico: el currículo oficial, el formato de la supervisión, el diagnóstico del grupo y las metodologías activas están integrados en el sistema, de modo que el docente no necesita ser experto en "prompts" para obtener un resultado situado. Democratizar la IA para el profesorado significa exactamente esto: que el costo de entrada no sea la ingeniería de instrucciones.

**2. Reducir carga administrativa es una intervención pedagógica, no solo de gestión.** Los 45 minutos recuperados por planeación no desaparecen: se convierten en tiempo disponible para retroalimentar estudiantes, diseñar materiales y — de manera visible en esta práctica — para mirar los datos del diagnóstico grupal que antes nadie tenía tiempo de leer. La condición de posibilidad de la enseñanza contextualizada es el tiempo docente.

**3. La honestidad del sistema es una postura ética frente a la IA generativa.** Durante el desarrollo se detectó que la IA podía "rellenar" progresiones inexistentes con texto verosímil. La decisión de diseño fue advertir explícitamente al docente cuando un programa no está verificado contra el documento oficial, en lugar de simular certeza. En tiempos de desinformación, enseñar (y diseñar) con IA exige sistemas que sepan decir "esto no lo sé".

Queda abierta una tensión que la práctica no resuelve del todo: el riesgo de que la facilidad de generación produzca planeaciones que se entregan sin apropiación. Las decisiones de diseño (selección activa de progresión, estrategia y necesidad pedagógica; auditor integrado; adaptación al grupo visible) buscan mantener al docente como autor y no como espectador, pero la evaluación de este punto requiere el piloto formal en curso.

## j. Referencias (formato APA 7ª ed.)

[Completa/ajusta las que uses realmente en el texto final. Sugerencias:]

- Dirección General del Bachillerato. (2025). *Programas de estudio para la generación 2025-2028 y subsecuentes (MCCEMS)*. Secretaría de Educación Pública. https://dgb.sep.gob.mx/programas-de-estudio
- Secretaría de Educación Pública. (2022). *Marco Curricular Común de la Educación Media Superior*. Subsecretaría de Educación Media Superior.
- [Referencia sobre carga administrativa docente / uso de IA en educación que quieras citar]

---

## 📋 Checklist antes de enviar (no incluir en el documento)

- [ ] Pasar a Word: Arial 12, interlineado 1.5, títulos en negritas, **máximo 10 cuartillas**
- [ ] Completar apellidos, correo y afiliación IBERO
- [ ] Actualizar sección h con datos de analítica reales si ya activaste el MEASUREMENT_ID
- [ ] Enviar a **innovacion.educativa@iberopuebla.mx** antes del **16 de agosto de 2026**
- [ ] NO pagar inscripción todavía: los ponentes pagan ($500 MXN) solo después de ser aceptados (resultados: 21-25 de septiembre)
