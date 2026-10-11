# Cuaderno escolar · CAPEMS

Implementado en el menú docente y en el panel directivo. Permite conservar texto de documentos, acuerdos, diagnósticos agregados, contenidos de Antología, metas PMC, proyectos PAEC y evidencias de clases realizadas. No modifica el proyecto Antología ni sincroniza automáticamente sus diagnósticos.

## Uso pedagógico

1. Configurar el ciclo real en Contexto Escolar (los valores anteriores de la aplicación se conservan; revisar especialmente el ciclo).
2. Abrir Cuaderno escolar y agregar una fuente, pegando texto o importando PDF con texto, DOCX, TXT o MD. Registrar procedencia, ciclo, grupo con turno, asignatura, reunión y fechas.
3. Guardar borrador. Comprobar texto y alcance; después «Revisar y habilitar». La revisión humana no certifica obligatoriedad jurídica.
4. Consultar la IA indicando ciclo, grupo, asignatura y fecha. Examinar los fragmentos antes de enviarlos y las citas después. La clave Gemini se conserva durante la sesión del navegador. Se envían a Gemini la pregunta y los fragmentos seleccionados.
5. En Generar Planeación, activar «Usar fuentes revisadas», elegir cuaderno y escribir exactamente el mismo grupo y turno. El generador vuelve a leer las fuentes antes de cada generación; si falla la lectura o no hay fuentes aplicables, detiene esa generación con una explicación.
6. Tras impartir la clase, registrar una actividad: propósito, actividad realmente realizada, evidencia agregada, dificultades, apoyo aplicado y ajuste propuesto. Revisarla para que influya en el siguiente plan.
7. En cada CAPEMS, agregar acuerdos nuevos y archivar los sustituidos. Una nueva versión no archiva automáticamente la anterior; ambas seguirán aplicando mientras permanezcan revisadas y vigentes.

## Cómo selecciona información

Filtra escuela, ciclo exacto, grupo/turno y asignatura, estado revisado y vigencia a la fecha de aplicación. Fuentes sin grupo o asignatura tienen alcance general dentro del ciclo. Diagnósticos y actividades requieren grupo. Selecciona hasta 12 fragmentos de 1,800 caracteres por coincidencia de palabras y fecha, y muestra cuántos omite. No es un índice semántico ni una lectura exhaustiva de todo el acervo en cada consulta.

Las recomendaciones citan fragmentos existentes; una referencia inventada invalida la respuesta. Esta validación no garantiza que la interpretación de la IA sea correcta. El docente revisa propuestas, contradicciones y evidencias. No se entrena un modelo: se actualiza el contexto de las futuras consultas y planeaciones.

## Personal y compartido

El modo personal funciona con localStorage, separado por escuela y usuario. Sólo existe en ese navegador y puede perderse al borrar sus datos; exportar fuentes permite obtener un respaldo JSON. No hay restauración automática de ese respaldo en esta versión. Se guardan textos, no originales ni imágenes; revisar tablas extraídas. PDF escaneado requiere OCR externo. Máximo 10 MB por archivo y 80,000 caracteres por fuente.

El modo compartido usa Firestore: `schoolNotebooks/{schoolId}/sources/{sourceId}`. Las membresías se administran externamente en `schoolNotebooks/{schoolId}/members/{uid}`, con `role`:

- `reader`: lectura.
- `contributor`: lectura y creación de borradores.
- `reviewer`: también revisión y archivo.

Un administrador autorizado debe crear membresías mediante consola Firebase o Admin SDK, usando UID de Auth y el schoolId real. La aplicación no permite concederse membresías editando el perfil. El texto guardado es inmutable: una corrección requiere nueva fuente. No se permite borrar fuentes desde el cliente.

Antes de activar en producción: probar las reglas en el emulador (usuario ajeno, lector, colaborador y revisor), desplegar las reglas revisadas y aprovisionar las membresías autorizadas. **No se desplegaron reglas, no se asignaron membresías ni se publicó la web en esta entrega.** No se auditó ni modificó el sistema completo de permisos de colecciones anteriores. No se presenta como sincronizada una operación que falle.

## Verificación realizada

- `npm run build`: correcto. Permanecen avisos de tamaño de bundle e importaciones dinámicas de la aplicación.
- `npm run test:cuaderno`: seis pruebas correctas: aislamiento y vigencia, alcance, selección parcial, citas inventadas, archivo y validación.
- Navegador local en demo: entrada desde menú; validación de procedencia obligatoria; guardar borrador; revisar y observar una fuente aplicable; archivar y observar cero fuentes aplicables y consulta deshabilitada.
- Se conservó una fuente ficticia de prueba archivada en la demo local, sin datos reales.
- Pendiente: extracción PDF/DOCX en navegador con documentos representativos, pruebas de reglas en emulador, consulta real a Gemini y generación completa con IA. No se enviaron datos reales de estudiantes a Gemini.
- Corrección mínima adicional: tipo de alineación vertical en el exportador Word `formatoBGO.ts`, que impedía compilar. Se conservaron los demás cambios previos del proyecto.
