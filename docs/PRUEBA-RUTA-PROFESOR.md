# Hoja de prueba: la ruta del profesor en la v2

Para la revisión del jueves 15 de octubre de 2026. Ve marcando cada casilla. Si algo
no te gusta o no funciona, anótalo en «Lo que no me convenció», al final.

## Antes de empezar (lo prepara Claude)

En la Mac, tres cosas corriendo:

```bash
npm run emulador                                     # simulador de Firebase
node scripts/sembrar-emulador.mjs && node scripts/sembrar-demo.mjs
npm run dev:v2:emulador                              # abre http://localhost:3002
```

Entra con **docente@prueba.mx / prueba123**. Todo lo que verás es inventado.

**Ojo:** el simulador borra las cuentas cada vez que se reinicia. Si el navegador
se quedó con una sesión anterior, la app parece abierta pero no carga nada (en la
consola sale `securetoken ... 400` y «false for 'get'»). Arreglo: **Cerrar sesión y
volver a entrar.** Antes de cualquier demo, hazlo siempre, aunque parezca que todo
está bien.

## 1. Primera impresión (5 min)

- [ ] La pantalla de entrada se ve limpia, estilo Apple
- [ ] El menú de la izquierda es claro y se entiende qué es «Tu día a día» y qué «Se llena una sola vez»
- [ ] La pantalla de inicio muestra tu nombre y tu escuela
- [ ] Los colores te gustan (si no, ¿más sobrio todavía o con más color?)

## 2. Mis clases: el cuaderno (15 min)

Abre **Mis clases → 1º A Vespertino**.

- [ ] Se ven los 24 alumnos con sus calificaciones
- [ ] Arriba aparece la ponderación (Exámenes 30 %, Tareas 25 %…)
- [ ] Cambia entre **Parcial 1**, **Parcial 2** y **Semestre**: las columnas cambian
- [ ] Haz clic en una casilla, escribe una nota y presiona **Enter**: baja al siguiente alumno
- [ ] En una casilla escribe **x**: queda como «no entregó»
- [ ] La columna **Módulo 1 · Diagnóstico** trae los resultados de Antología

## 3. Alumnos en riesgo (5 min)

- [ ] Junto a **Hernández Luna Leonardo** aparece la alerta ⚠
- [ ] Al hacer clic en su nombre se abre su ficha: promedio, asistencia y anotaciones
- [ ] Se entiende qué es una «acción de apoyo» y para qué sirve

## 4. Pasar lista y diario (5 min)

- [ ] **Pasar lista**: marca a un alumno con falta y a otro con retardo
- [ ] **Todos presentes** marca al resto
- [ ] **Diario de clase**: se leen las entradas de octubre; escribe una nueva de hoy

## 5. Documentos (5 min)

- [ ] **Documentos → Reporte de evaluación → Descargar Word**: ábrelo
- [ ] **Seguimiento de alumnos en riesgo**: ¿es lo que te pediría la dirección?
- [ ] El nombre del docente sale completo

## 6. La planeación (10 min)

- [ ] **Llevar a mi planeación**: revisa el resumen del grupo que se manda (sin nombres)
- [ ] **Generar planeación**: elige una progresión de Cultura Digital I y genera
- [ ] La planeación trae una actividad marcada «Adaptación al grupo»
- [ ] Tarda de 1 a 5 minutos (en la Mac la hace Claude)

## 7. Mi página de clases (10 min)

- [ ] Abre la de ejemplo en la Mac: http://localhost:3002/clase/jose-roberto-mendoza (en el iPhone todavía no abre: esa dirección solo existe en tu Mac hasta que se publique; para verla como en celular, haz la ventana del navegador angosta)
- [ ] Menú → **Mi página de clases** → **Editar**: recorre los 4 pasos del cuestionario
- [ ] Publica un aviso y agrega un material con su enlace
- [ ] **Modo avanzado**: lee el prompt; ¿se entiende para un maestro?
- [ ] ¿La quieres publicada el 19 junto con la v2, o después del 25? ________________

## 8. Pensando en el 25 de octubre

- [ ] ¿Qué 3 pantallas quieres mostrar en la demostración? ________________
- [ ] ¿Hay algo que te daría pena que apareciera en la exposición? ________________

## Lo que no me convenció

1.
2.
3.
