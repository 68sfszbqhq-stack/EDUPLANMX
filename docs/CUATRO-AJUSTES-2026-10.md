# Cuatro ajustes aplicados a EduPlan v 2

25 de octubre de 2026, hora de México. Cambios aplicados y verificados localmente. No se publicó el sitio ni se modificó Firebase en esta intervención.

## 1. Datos curriculares, horas y fechas

Cultura Digital I, modelo identificado como 2024 en el catálogo: se cotejaron horas, créditos, categorías/subcategorías, metas por progresión y aprendizajes de trayectoria con el [programa DGB enlazado, primera edición 2023](https://dgb.sep.gob.mx/storage/recursos/2025/09/UbN 2 iAEhFi-Cultura-Digital-I.pdf), páginas 3–9. Se corrigieron 2 a 3 horas semanales de mediación y 4 a 6 créditos, metas duplicadas y asociadas indebidamente, y un residuo de número de página en la última progresión. La categoría Pensamiento Computacional no se usa como sustituto de Ciudadanía Digital: ahora se copian categorías y subcategorías de la progresión seleccionada.

Se preservan las metas oficiales en el resultado y se identifican área/recurso y trayectoria. El cotejo es específico de este programa y fuente; no se afirma haber auditado todos los programas del catálogo ni su aplicabilidad universal.

Pantalla y Word comparten funciones de periodo, fecha y horas. Una fecha de calendario no se desplaza por UTC; la fecha de elaboración se muestra en horario local. Las horas vacías permanecen pendientes y no se rellenan con 4. Las fechas inicial/final capturadas se trasladan a la primera/última sesión; para sesiones intermedias sin calendario se indica Por asignar. Los rótulos del modelo 2025 usan el mismo vocabulario en ambas vistas.

## 2. Instrumento y coherencia

Se eliminó la instrucción contradictoria de generar niveles graduados para listas de cotejo. Ahora se solicitan y validan las columnas Sí, No, No observado y Observaciones. Una respuesta con columnas de escala se rechaza con mensaje comprensible y formulario conservado, sin presentarla como el instrumento elegido. No observado queda pendiente de evidencia, nunca se convierte automáticamente en cero.

Las instrucciones exigen información disponible antes de las preguntas, separación de transferencia, lectura y copia dentro del tiempo previsto y turnos orales con 90 segundos de respuesta y 30 de registro/transición como referencia operativa. Se pide recuperación equivalente cuando faltan cupos; sigue siendo necesaria la revisión del docente según su grupo.

## 3. Confianza comunicada

Se retiraron de portada Lista para entregar, Imprime y entrega y Formato listo para supervisión y CTE. La auditoría ya no atribuye vínculo PEC por la mera existencia de texto de transversalidad y enumera exactamente qué datos de identificación faltan. Los recursos muestran lenguaje docente en vez de teachingKit.

## 4. Fichas imprimibles

Los materiales nuevos incluyen sesión, momento de entrega y preguntas con espacio de respuesta. Cada ficha empieza en página propia; las soluciones/preparación se exportan en una guía docente separada. Se mantienen juntos encabezados y bloques de respuesta y se evita partir párrafos de referencias. Las planeaciones anteriores siguen abriendo: si no incluyen preguntas estructuradas, se conserva el contenido y se indica usar cuaderno para respuestas extensas.

## Verificación

- 103 pruebas automatizadas aprobadas: reglas de presentación, instrumento, datos del catálogo, Word y regresiones de funciones previas.
- Recorridos de navegador con respuestas controladas para selección curricular/modelos, revisión de contexto, error/reintento y móvil.
- Compilación correcta; advertencias existentes sobre tamaño de paquete/importaciones mixtas, sin error de compilación.
- Dos generaciones reales por interfaz con Codex gpt-6.1-sol, HTTP 200:138 y 134 segundos. La segunda incorpora la depuración final del catálogo. Sin respuestas prefabricadas en estas dos generaciones.
- Revisión del contenido antes de confirmar lectura y exportar el Word. Cero errores JavaScript observados en la segunda generación.
- Word final de 9 páginas, todas renderizadas e inspeccionadas: datos y periodo coherentes, matriz sin recortes, tres fichas en páginas 6–8, guía separada en 9. No se observaron superposición ni preguntas partidas entre páginas. El espacio libre de las fichas está previsto para escribir y distribuirlas por momento.

El ejemplo final tiene dos sesiones de 50 minutos,15 copias para la transferencia, diagnóstico/práctica en pizarrón y evidencia individual. Reserva 16 minutos para hasta 8 turnos de 90 segundos más 30 de registro; propone recuperación para pendientes. No asigna tarea fuera de clase. La lista conserva Sí/No/No observado/Observaciones y ponderación final 100%, sin calificar el diagnóstico.

Esto verifica funcionamiento y dos salidas concretas, no garantiza que toda generación esté libre de contradicciones ni demuestra aprendizaje en aula. El modo muestra no verifica permisos remotos de Firebase. Las mejoras se aplican a nuevas generaciones y a la presentación/exportación; no se reescribieron planeaciones históricas del usuario.

## Evidencias

- planeacion.docx: descarga fiel de la interfaz, sin retoque externo.
- respuesta-real.json, pantalla.txt/png, revision.txt y revision-aprobada.txt.
- render/: nueve páginas y PDF para inspección.
- pruebas.log, compilacion.log, contexto-navegador.log, curriculo-navegador.log, errores-navegador.json.
- primera-validacion/: primera generación conservada antes de terminar la depuración de metas.
