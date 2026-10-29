# Versión 2 — EduPlan + Antología conectadas

Copias de prueba (iniciadas el 2026-10-10). La versión 1 (`~/proyectos/eduplanmx`,
`~/proyectos/ANTOLOGIA DIGITAL`) no se toca.

| | Carpeta | Rama | Puerto | Base de datos |
|---|---|---|---|---|
| EduPlan v2 | `~/proyectos/eduplanmx-v2` | `v2` | 3002 | `eduplanmx-pruebas` |
| Antología v2 | `~/proyectos/antologia-v2` | `v2` | 4322 | `eduplanmx-pruebas` (compartida) |

`eduplanmx-pruebas` vive en la cuenta alemarci2202@gmail.com. Candados: EduPlan v2 no
arranca si su `.env` apunta a otro proyecto; los scripts de Antología v2 rechazan
llaves de otro proyecto; `.firebaserc` de ambas apunta a pruebas.

## Probar sin internet, con datos inventados

```bash
# Terminal 1 (eduplanmx-v2): simulador de Firebase
npm run emulador
# Terminal 2 (eduplanmx-v2)
node scripts/sembrar-emulador.mjs && npm run dev:v2:emulador   # http://localhost:3002
# Terminal 3 (antologia-v2)
npm run dev:emulador                                            # http://localhost:4322/antologia-digital/
```
Cuentas sintéticas: docente@prueba.mx / prueba123 · alumno 2024001 / código ABC234.

**Grupo de demostración (ponencia EIIE):** después de `sembrar-emulador.mjs`, correr
`node scripts/sembrar-demo.mjs`. Agrega «1º A Vespertino» (Cultura Digital I) con 24 alumnos
inventados, 9 actividades en dos parciales, 15 sesiones de asistencia, diario, anotaciones,
resultados de Antología y 3 alumnos en riesgo; además deja al docente como miembro aprobado
(sin la franja de «verifica tu acceso») y con nombre José Roberto Mendoza. No correrlo si se va a
ensayar la migración de membresías. Hoja de revisión: `docs/PRUEBA-RUTA-PROFESOR.md`.

**Estilo (2026-10-14):** paleta neutral estilo Apple definida en `tailwind.config.js` (grises
neutros, un solo azul `#0071e3`; verde, rojo y naranja solo para estados) y degradados
aplanados en `index.css`. Menú lateral e inicio rediseñados claros. Volver a los colores
anteriores = vaciar `colors` en `tailwind.config.js` y quitar la regla de degradados.

## Cómo se conectan

- **Mis grupos** (EduPlan): el docente crea un grupo e importa su lista. Cada alumno se
  guarda con su matrícula como ID → importar dos veces no duplica. Vista previa con
  nuevos, sin cambios, nombres corregidos, matrículas repetidas y filas ilegibles.
- **Antología**: el alumno escribe su matrícula una vez; reclama su lugar en la lista
  (solo si está libre) y cada diagnóstico llega a `misGrupos/{grupo}/resultados`.
- **Resultados → planeación**: resumen por eje; quien no contestó es dato faltante, no
  cero; aviso de cobertura baja. El texto se agrega al diagnóstico del grupo, editable.
- Colección renombrada en Antología v2: `alumnos` → `cuentasAlumno` (EduPlan ya usaba
  `alumnos` para otra cosa y ahora comparten base).

## IA por terminal (planeaciones)

En la versión 2 las planeaciones las genera **Claude desde la terminal de esta Mac**, con la
suscripción de José; no hace falta clave de Gemini. Viene activado en `npm run dev:v2` y en
`npm run dev:v2:emulador`.

- `services/geminiService.ts` arma el prompt igual que siempre (programa oficial, perfil
  docente, cuaderno, Formación Laboral, diagnóstico del grupo); solo cambia a quién se envía.
- `scripts/puente-ia.ts` (plugin del servidor de desarrollo) ejecuta `claude -p --model opus`
  en una carpeta temporal, **sin herramientas, sin MCP y sin configuración personal**: aunque
  un documento trajera instrucciones escondidas, el modelo solo puede devolver texto.
- Reintenta hasta 3 veces si el servicio corta o el JSON llega roto. Cada planeación se
  respalda en `planeaciones-generadas/` (fuera de git).
- El build de producción no incluye nada de esto: sigue con Gemini.
- Solo funciona mientras el servidor corre en esta Mac. Otros docentes no pueden usarlo:
  una suscripción no es una API para terceros.
- Lo demás que usa IA (consulta del Cuaderno, Herramientas, diagnóstico) sigue con Gemini.

Probado el 2026-10-10 con una planeación real de Cultura Digital I (2 sesiones): 61 s con
claude-opus-5-5, tiempos y porcentajes cuadrados, y usó el diagnóstico de Antología pidiendo
un rediagnóstico por la cobertura baja.

## Mis clases: el cuaderno completo (reemplaza a iDoceo)

EduPlan → **Mis clases**. Código en `components/clase/` y `src/features/clase/`; exámenes en
`components/evaluacion/Examenes.tsx` y `src/features/evaluacion/`. Pruebas: `npm run test:clase`,
`npm run test:evaluacion`, `npm run test:grupos`, `npm run test:clase`.

1. **Nueva clase**: nombre del grupo + pegar los nombres desde Excel (o subir el .xlsx). Acepta una
   columna de nombres, apellidos en columnas separadas, con o sin numeración, con o sin matrícula.
   Vista previa en vivo; los títulos de la hoja se proponen desmarcados. Quien no trae matrícula
   recibe una **clave** de 6 caracteres (sin 0/O/1/I/L) que usa en Antología en lugar de la
   matrícula; si el mismo nombre ya tiene clave en otra clase del docente, se reutiliza.
   Reimportar solo nombres no duplica (empata sin acentos ni orden de palabras).
2. **Cuaderno** (pestaña principal): cuadrícula con colores por tipo (exámenes, tareas, proyectos,
   participación, otros). Clic en una casilla → nota; **Enter** guarda y baja, **Tab** siguiente
   columna; atajos x (no entregó), e (exento), t (tarde), a (ausente). Rúbricas con IA: al guardar
   un alumno pasa al siguiente. Columnas automáticas: cada examen (se califica solo al abrir la
   clase o con "Actualizar"; con respuestas escritas la casilla dice "revisar") y cada diagnóstico
   de Antología (%). Asistencia % y promedio a la derecha; promedio del grupo abajo. Descarga a Excel.
3. **Ponderación** como iDoceo: % por tipo (también asistencia). Cada tipo promedia y luego pesa; un
   tipo sin notas reparte su peso. Dentro de un tipo, "vale doble". Sin ponderación: todo vale igual.
4. **Pasar lista**: P / Retardo / Falta / Justificada, "presentes los sin marcar". Retardo cuenta
   como asistencia; justificada no cuenta; sin marcar no es falta.
5. **Diario de clase**: qué pasó realmente cada día. "Hacer examen de esta clase" (o de varias
   marcadas) lleva el texto al examen con IA; la planeación también lo usa.
6. **Ficha del alumno** (clic en el nombre): promedio, % por tipo, asistencia y fechas de falta,
   anotaciones (positiva / a atender / nota), cada actividad y sus resultados de Antología.
7. **Llevar a mi planeación**: promedio del grupo, tipos débiles, actividades sin entregar,
   asistencia, últimas 3 entradas del diario y Antología → diagnóstico del grupo. Sin nombres.

8. **Parciales**: se ponen las fechas una vez por clase (botón "Parciales"); todo lo que tiene
   fecha cae solo en el suyo. El cuaderno abre en el parcial de hoy; "Semestre" muestra la final =
   promedio de los parciales calificados.
9. **Alerta de riesgo** (⚠ junto al nombre): promedio < 6, asistencia < 80 % con 3+ sesiones, o 2+
   actividades sin entregar. En la ficha se registran **acciones de apoyo** (plática, aviso a la
   familia, canalización): son la evidencia del seguimiento.
10. **Documentos** (pestaña): Word editable, por parcial o semestre, sin capturar nada otra vez —
    reporte de evaluación, seguimiento de alumnos en riesgo, registro de clases impartidas y
    diagnóstico del grupo. Solo dicen lo registrado ("sin registro" donde falta). Escuela, CCT y
    docente se recuerdan en ese navegador. Lógica en `src/features/clase/documentos.ts`.

**Menú (v2)**: "Tu día a día" (Mis clases, Generar planeación, Mis planeaciones) arriba; "Se llena
una sola vez" (Cómo doy clase, Contexto, Flujo, Cuaderno escolar · CAPEMS) abajo. Diagnóstico y
Bitácora anteriores quedan en "Más herramientas" porque Mis clases ya los cubre.

Mismas reglas de siempre: vacío no es cero; "no entregó" sí; exento nunca cuenta; la clave del
examen vive en `privado/clave` y nunca llega al alumno; el reloj lo lleva el servidor.
Nuevas colecciones (solo el docente dueño): `misGrupos/{g}/asistencia/{fecha}`,
`misGrupos/{g}/diario/{fecha}`, `misGrupos/{g}/anotaciones/{id}`; campo `ponderacion` en el grupo.

Probado de punta a punta el 2026-10-10 en el simulador: clase creada pegando 6 nombres con título
y apellidos separados; lista pasada; diario → examen (21 s, usó el ejemplo real de la clase); la
alumna entró a Antología **con Google** y su clave; entregó y la nota cayó sola al cuaderno;
captura por teclado; ponderación 40/30/20/10 verificada a mano (4.5); resumen a la planeación.

## Reglas

Un proyecto de Firebase tiene un solo archivo de reglas. Cada app conserva el suyo;
`node scripts/combinar-reglas.mjs` genera `firestore.pruebas.rules`, que es lo que se
publica en pruebas. Pruebas: `npm run test:reglas`, `npm run test:reglas-compartidas`,
`npm run test:grupos`, `npm run test:clase`.

## Pendiente conocido

- **Cerrado en v2 (2026-10-10), falta llevarlo a producción:** cualquiera podía escoger una
  escuela y leer las CURP de sus alumnos (el "código de acceso" era el inicio del CCT y además
  se mostraba en la búsqueda). Ahora hay **membresía verificada** en `schools/{id}/miembros/{uid}`:
  se entra aprobado con el código secreto (`schools/{id}/privado/acceso`, 8 caracteres al azar,
  solo lo ven directivos) o se pide acceso y un directivo aprueba en **Mi escuela y su personal**.
  `/alumnos` solo lo lee un miembro aprobado. Se quitó el "grupo demostrativo" inventado que se
  metía en la planeación cuando no había permiso.
  **Orden para producción:** 1) `npm run respaldo`; 2) publicar reglas; 3) en seguida
  `npx tsx scripts/migrar-membresias.ts` (ensayo) y `--aplicar` (registra a los docentes actuales,
  crea códigos y borra el código público); 4) publicar la app. Entre 2 y 3 los docentes no ven
  alumnos unos minutos (falla cerrado, no abierto). Ensayado completo en el simulador.
- Un alumno que entra con Google podría teclear una matrícula ajena si nadie la ha
  reclamado. El docente ve el correo ligado a cada matrícula, se marca en rojo si una
  cuenta aparece en dos matrículas y puede desvincularla.
- Antología solo reporta Cultura Digital I (`cultura-digital-1`); Lengua y Comunicación
  aún no.
- La entrada con Google se probó en el simulador con una credencial de prueba (la ventana real de
  Google no se puede manejar desde la automatización).
- La clave generada vale por docente: si dos maestros distintos tienen al mismo alumno sin
  matrícula, recibe dos claves y Antología solo guarda una. Con matrícula no pasa.

## Decidido para después del congreso (2026-10-14)

- **Diagnóstico de inicio (EDIEMS) dentro de EduPlan.** Lo activa la dirección desde «Mi escuela»
  (abrir/cerrar, subir la clave oficial). Cada profesor ve en Mis clases el avance y los
  resultados por grupo y por alumno, y los lleva a la planeación. Los alumnos siguen en Antología
  con Google. Reemplaza los scripts `abrir-diagnostico.mjs` / `exportar-diagnostico.mjs`.
- **«Crea tu página de clases».** ✅ Construida el 2026-10-14 (ver sección «Mi página de clases»).

## Mi página de clases (2026-10-14)

Menú → «Se llena una sola vez» → **5. Mi página de clases**. Código: `components/pagina/MiPagina.tsx`,
`pages/PaginaClase.tsx` y `src/features/pagina/`. Pruebas: `npm run test:pagina` y las de reglas.

1. **Cuestionario de 4 pasos**: nombre, escuela, presentación e ícono → color y dirección (revisa en
   vivo que esté libre) → qué grupos de Mis clases aparecen → secciones (avisos, materiales,
   exámenes, diagnóstico, asesoría).
2. **Panel**: copiar enlace, ver la página, ocultar/publicar, publicar avisos, agregar materiales por
   tema, editar (si cambia la dirección, la vieja deja de funcionar y se avisa).
3. **Página pública** `/clase/{dirección}`: sin cuenta, pensada para celular. Los botones de exámenes
   y diagnóstico llevan a Antología, donde el alumno entra con Google y sus resultados llegan al
   cuaderno del docente. La página **no guarda ni muestra datos de alumnos**.
4. **Modo avanzado**: prompt para pedirle a una IA un sitio propio, con la regla de no guardar datos
   de alumnos y los enlaces a Antología.

Seguridad (`paginasClase/{slug}` en `firestore.rules`): lectura pública solo si está publicada;
crear/editar/borrar solo el dueño; campos y tamaños revisados; la dirección debe coincidir con el
documento. Las reglas no pueden revisar cada enlace de una lista, así que la página solo convierte
en enlace lo que empieza con `https://` (un `javascript:` se muestra como texto) y el panel lo
rechaza antes de guardar. En producción la ruta funciona en GitHub Pages gracias a `404.html`.

## Modo muestra (2026-10-17)

Inicio → **«Probar con datos de muestra»**. Pensado para el QR de la ponencia y para quien quiera
conocer EduPlan sin cuenta. Código en `src/demo/modoMuestra.ts` y `components/AvisoMuestra.tsx`.

- Abre una escuela ficticia («Bachillerato General Oficial de Muestra», grupo 1º A Vespertino, 30
  estudiantes inventados) con «Cómo doy clase» contestado, contexto escolar, flujo 4/4, cuaderno con
  3 fuentes revisadas (PAEC, metas, diagnóstico) y una planeación de ejemplo en Mis planeaciones.
- **No toca Firebase**: cero lecturas y escrituras (probado contando peticiones). Todo vive en el
  navegador. Mientras la pestaña está en modo muestra, cada clave de localStorage lleva el prefijo
  `muestra:` para no pisar los datos de un docente real que use el mismo navegador. Al iniciar
  sesión con una cuenta real se borra la bandera y la app vuelve a las claves normales.
- En Generar: «Ver planeación de ejemplo» muestra `src/demo/planMuestra.json` (generada con estos
  mismos datos ficticios, sin datos reales). Para generar de verdad, el visitante pega su propia
  llave de Gemini; nunca se usa la del proyecto.
- Mis clases no entra en la muestra (guarda datos de alumnos reales): muestra un aviso.
- «Volver a empezar» borra solo las claves `muestra:` y vuelve a sembrar.
- Para cambiar los datos ficticios: editar `sembrarMuestra()`; si cambian, subir `SEMBRADO` a v2
  para que los visitantes que ya entraron reciban los nuevos.

## Revisión del contexto antes de generar (2026-10-25)

Implementado localmente como primer cambio autorizado para la ponencia; pendiente de publicar.

- «Revisar información antes de generar» prepara una copia de los textos, sin llamar al modelo.
- Permite editar/excluir diagnóstico, diario importado desde Mis clases, flujo de contextualización,
  perfil docente y cada fragmento del cuaderno (incluidos título y procedencia).
- El diario se separa cuando conserva el encabezado que produce Mis clases. Un diagnóstico pegado
  manualmente sin ese encabezado se revisa íntegro en el campo de diagnóstico.
- «Enviar lo revisado y generar» usa esa copia. No recarga perfiles, diagnósticos ni fuentes originales
  después de confirmar. Las fuentes del cuaderno se recuperan antes de mostrar la revisión.
- Cancelar mantiene el formulario y la selección del cuaderno. Un error de IA conserva las ediciones
  para reintentar. Los originales de diagnóstico y cuaderno no se modifican con esta revisión.
- No hay anonimización automática. El usuario debe revisar los textos. El currículo, los esquemas
  de salida y el contexto escolar que utiliza el servicio siguen formando parte de la solicitud.

Validación: TypeScript y build de producción correctos (avisos existentes de tamaño/importaciones);
70 pruebas locales correctas. Prueba de navegador en Chrome con datos ficticios y respuesta de IA
interceptada: ausencia de solicitud antes de confirmar, cancelar, excluir diario/flujo/perfil/cuaderno,
editar diagnóstico, conservar originales, error/reintento y visualización de la planeación completa.
Revisión visual en escritorio y móvil. No se invocó un proveedor real ni se desplegó. Antes de publicar,
falta la prueba de generación real completa requerida por CLAUDE.md.

Pruebas nuevas: `node --import tsx --test scripts/revision-contexto.test.ts`.
Prueba de navegador: iniciar v2 en puerto 3012 y ejecutar `node scripts/revision-contexto.browser.cjs`
con Playwright disponible mediante NODE_PATH; utiliza Chrome instalado. Se puede cambiar la URL
con EDUPLAN_TEST_URL. La ruta de IA se intercepta y no consume cuota.

### Ajuste de sencillez de la revisión

La pantalla abre con «Revisa qué compartes», una indicación breve y vistas de hasta tres líneas
del diagnóstico y diario. «Editar» abre el texto completo; «Listo» vuelve a la vista breve.
«No compartir» excluye el contenido y «Compartir» permite recuperarlo sin perder su texto.
El resto queda plegado en «Más información que se compartirá», con el número de elementos
adicionales seleccionados. Los botones principales son «Volver» y «Generar planeación».

Se conserva la preparación y el envío del cambio anterior. Verificado con TypeScript y prueba
de navegador actualizada: edición desplegable, sección adicional cerrada inicialmente, exclusión
y reincorporación, cancelación, error/reintento y contenido de la petición interceptada. Revisado
visualmente a 1280 px y 390 px de ancho. Cambio local, sin publicar ni avanzar al punto 2.

## Selección curricular explícita (paso 2)

Implementación local autorizada, sin publicación:

- El generador muestra modelo, generación de referencia del catálogo, asignatura, semestre,
  estado de verificación y enlace a la fuente cuando está registrado.
- Si hay varios programas para la asignatura/modelo, el docente elige uno. Si hay uno solo,
  se propone ese. Cambiar modelo o programa limpia la progresión previa.
- La selección viaja al servicio por identidad de materia/semestre/modelo; no se vuelve a
  elegir el primer programa por nombre. Una selección inválida falla sin sustitución silenciosa.
- Borradores y modelos sin programa generan una propuesta general por tema. No se incorporan
  sus progresiones provisionales ni se reutiliza otro modelo como fuente oficial.
- El contexto contiene la progresión elegida completa (también si es posterior a la quinta).
  El esquema ya no recorta ese contexto a 800 caracteres. El resultado conserva el texto literal.
- La fuente seleccionada se guarda en curricularSource y aparece en la impresión y en Word.
  mccemsAlignment.validated queda false: disponer de una fuente no valida la planeación.
- Formación Laboral conserva la selección de módulo/submódulo y muestra generación/fuente propia.
- «Verificado en el catálogo» refleja el estado existente en los datos. Este cambio no añade
  programas ni constituye un cotejo nuevo de todos los PDF. Las generaciones se muestran como
  referencia del catálogo, no se infieren de la fecha del ciclo escolar.

Validación: TypeScript, compilación de producción y 76 pruebas locales correctas. Pruebas de
navegador con transporte de IA interceptado: cambio de modelo, exclusión de currículo anterior,
propuesta general visible, progresión completa en petición y resultado, metadatos exactos,
exportación Word con estado/modelo y continuidad del paso 1. Inspección visual de escritorio y
móvil. Pendiente la generación real completa antes de cualquier despliegue, conforme a CLAUDE.md.

Pruebas nuevas: scripts/seleccion-curricular.test.ts y scripts/seleccion-curricular.browser.cjs.

## Experimento local con Codex — 25 de octubre de 2026

Por petición del usuario se conectó Codex para completar cinco recorridos de agentes con
perfiles docentes y de acompañamiento escolar. Claude no pudo generar por un bloqueo de
autorización organizacional. El conector experimental se inicia con:

```sh
npx vite --config vite.experimento.config.ts
```

Escucha en `http://127.0.0.1:3014/`, exige el proyecto Firebase `eduplanmx-pruebas` y usa
la sesión autorizada del CLI Codex. No necesita clave Gemini ni modifica el despliegue.
Recibe el prompt real armado por Eduplan y devuelve el JSON generado, sin respuestas de muestra.
Usa directorio temporal, CLI efímero sin configuración personal, sandbox de solo lectura,
shell y búsqueda web desactivadas. Respalda cada respuesta con nombre único en
`planeaciones-generadas/codex-*.json`; el modelo efectivo se devuelve en los metadatos.

Conexión y primeras planeaciones reales comprobadas con `gpt-6.1-sol`; TypeScript del
producto y del conector y compilación de producción correctos. Evaluaciones y documentos
exportados en el proyecto de ponencia, carpeta `evaluaciones-usuarios/`. La revisión detectó
pendientes en auditoría curricular, composición del PAEC y presentación de instrumentos;
una generación exitosa no equivale a validación pedagógica ni autoriza publicación.

## Mejora 1 de la evaluación: confianza de la auditoría

Implementada localmente el 25 de octubre de 2026. El componente ahora recibe solo la
planeación: el formulario no puede cambiar retroactivamente el modelo auditado.
Se resuelve la fuente por materia, semestre, modelo, estado oficial y URL registrados
en `curricularSource`; no se usa el primer programa ni se infiere procedencia de planes antiguos.
Fuentes ausentes, generales, incompletas, ambiguas o retiradas del catálogo quedan
«no evaluables». Formación Laboral no se coteja contra progresiones del componente fundamental.
Se compara el texto íntegro de la progresión, sin atribuir por ello alineación de actividades.

Se retiraron porcentaje global, dictamen «lista para entregar», equivalencia con supervisión
y encabezado fijo Modelo 2025. La vista «Revisa antes de usar» muestra conteos descriptivos,
procedencia del resultado y observaciones desplegables. Las búsquedas textuales se presentan
como orientativas; no encontrar una palabra no acredita lenguaje excluyente.

Validación: 20 pruebas (9 nuevas de auditoría y 11 previas de selección/revisión), TypeScript
y build correctos. Vista comprobada en navegador con dos resultados reales ya guardados
del experimento: fuente oficial 2024 y propuesta general 2025; enlace exacto, ausencia de
fuente heredada, detalle desplegable y ancho móvil. No hubo nueva generación: el cambio
afecta la revisión de resultados, no los prompts ni el proveedor. Sin despliegue.

## Cierre de las cinco mejoras de la evaluación — 25 de octubre de 2026

Se completó la conservación de instrumento y contexto actual, con fuentes anteriores
opcionales y comprobación explícita de compatibilidad. PAEC distingue solo aula,
pendiente y vinculado, conserva nombre/productos y no convierte una propuesta manual
en aprobación institucional. La auditoría marca «no aplica» para solo aula.

El resumen previo presenta decisiones docentes; las opciones complementarias quedan
plegadas. El resultado muestra instrumento completo y materiales desarrollados.
Ambos esquemas de generación requieren un paquete mínimo de materiales con caso,
consignas, respuestas orientativas separadas y logística ajustada al tiempo y recursos.

Word exporta la matriz y los materiales, separa material estudiantil de guía docente,
usando tablas por momento con filas indivisibles y cabeceras repetidas. Las nuevas
planeaciones conservan plantel/CCT en `institution`, también al exportar desde biblioteca.
Los planes históricos sin esa información no se completan con datos supuestos.
Las fechas inválidas tienen texto alternativo. La portada ya no promete ahorro fijo
ni cumplimiento automático de supervisión.

Validación final: 31 pruebas de esta funcionalidad correctas, TypeScript/build y diff
sin errores; dos generaciones reales por Codex, fuente 2024 y propuesta general 2025,
guardadas y exportadas desde la interfaz. Word revisado íntegramente (6 y 7 páginas).
Pruebas anteriores de navegador para selección/revisión y casos de error también
correctas. Evidencias en el proyecto de ponencia:
`evaluaciones-usuarios/mejoras/CIERRE-CINCO-MEJORAS.md` y `validacion-final/`.
Cambios locales, sin despliegue. Las pruebas con agentes no son validación en aula.

## Seguridad — octubre de 2026

Correcciones y pruebas locales en [SEGURIDAD-2026-10.md](SEGURIDAD-2026-10.md). Las nuevas reglas compartidas requieren publicación explícita en `eduplanmx-pruebas`; no se han aplicado al Firebase remoto ni al sitio de producción.

## Revisión posterior a los cinco perfiles — cuatro ajustes

Implementados localmente: cotejo específico de Cultura Digital I, fechas/horas/periodo comunes entre web y Word, lista de cotejo sin conversión a escala, instrucciones de coherencia y turnos, portada/auditoría precisas y fichas separadas por momento con espacio de respuesta. Dos generaciones reales y Word renderizado. Detalles y alcance en [CUATRO-AJUSTES-2026-10.md](CUATRO-AJUSTES-2026-10.md). No publicado.

## Publicación v2 y formato institucional restaurado (2026-10-25)

Publicado por autorización de José en https://eduplanmx-pruebas.web.app/ con Firebase Hosting del proyecto `eduplanmx-pruebas`. GitHub Pages y Firebase de v1 no se modificaron. Configuración independiente: `firebase.hosting-v2.json`; despliegue exclusivamente de Hosting. La web utiliza Gemini con la clave del docente; el puente Codex sigue siendo local.

Word vuelve a usar `formatoBGO.ts`: tres logos originales, oficio horizontal, barras guinda, casillas y tabla de sesiones, evaluación y cuatro espacios de firmas. Los nombres del plantel y CCT se toman del documento; no se copian los nombres de directivos de la plantilla a otras escuelas. Conserva instrumento completo, estado PAEC, datos curriculares cotejados, fechas/horas, fichas por sesión, guía y constancia de revisión. Se reexportó la respuesta real anterior mediante reproducción controlada en navegador, sin otra llamada de IA. Diez páginas renderizadas y revisadas visualmente.

Para volver a publicar, comprobar primero que el entorno de build corresponde a `eduplanmx-pruebas`, sin motor terminal ni emulador ni claves privadas incorporadas. Compilar con `npm run build -- --base /`, copiar `dist/index.html` a `dist/registro.html` para retirar la entrada antigua con hashes fijos y ejecutar:

```sh
firebase deploy --only hosting --config firebase.hosting-v2.json --project eduplanmx-pruebas --account alemarci2202@gmail.com
```

Las comprobaciones de Word ahora verifican los tres PNG embebidos, orientación horizontal, color institucional, conservación del plantel y del contenido actual.
