# Fuentes normativas de EduPlanMX

Documentos oficiales que sustentan lo que la app genera. Cuando el generador o el
auditor pedagógico afirmen "así lo pide el MCCEMS", la afirmación debe poder
rastrearse hasta uno de estos documentos.

Los PDF **no se versionan en git** (pesan ~4 MB, misma regla que `data/pdfs_dgb/`).
Se recuperan con los comandos de abajo.

## Documentos incorporados

### 1. Modelo Educativo 2025 — MCC EMS
- **Archivo:** `MODELO-EDUCATIVO-2025-MCCEMS.pdf`
- **Qué es:** el documento pedagógico base del modelo vigente. 68 páginas.
- **Edición:** Primera edición 2025, D.R. © Secretaría de Educación Pública
- **Descargado:** 13 de agosto de 2026
- **Verificado:** directorio SEP (Mario Delgado Carrillo / Tania Rodríguez Mora);
  23 menciones de PAEC, 24 de transversalidad.
- **Nota de origen:** el enlace del portal `educacionmediasuperior.sep.gob.mx`
  devuelve 404. Se obtuvo de la réplica de la Subsecretaría de Educación Media
  Superior de Jalisco. **Conviene sustituirlo por la copia de SEP en cuanto el
  portal la reponga.**

```bash
curl -L -o docs/normativa/MODELO-EDUCATIVO-2025-MCCEMS.pdf \
  "https://apprende.jalisco.gob.mx/subsecretaria-media-superior/wp-content/uploads/sites/16/2025/11/Modelo-educativo-2025-.pdf"
```

### 2. Programa Aula, Escuela y Comunidad (PAEC)
- **Archivo:** `PAEC-Programa-Aula-Escuela-Comunidad-2a-edicion-2024.pdf`
- **Qué es:** fundamento del PAEC, sus fases, el diagnóstico colectivo y el
  diseño del Proyecto Escolar Comunitario (PEC). 76 páginas.
- **Edición:** Segunda edición 2024, Subsecretaría de Educación Media Superior
- **Descargado:** 13 de agosto de 2026
- **Verificado:** 164 menciones de PEC, 12 de Proyecto Escolar Comunitario.
- **Origen:** dominio oficial `dgb.sep.gob.mx`.

```bash
curl -L -o "docs/normativa/PAEC-Programa-Aula-Escuela-Comunidad-2a-edicion-2024.pdf" \
  "https://dgb.sep.gob.mx/storage/recursos/2024/02/FdPegDUj0i-Programa%20Aula,%20Escuela%20y%20Comunidad_Segunda%20Edici%C3%B3n.pdf"
```

## Ya disponibles en otra ubicación

- **Acuerdos 09/05/24 y 21/08/25 (MCCEMS)** — sintetizados en
  `~/USICAMM-EMS-2026-2027-corpus/fuentes/`. El 21/08/25 es el vigente.
- **105 programas de estudio DGB** — `data/pdfs_dgb/` (gitignoreado), ya
  procesados a `data/extraccion/`.

## Pendientes

### Fichas de trabajo (01, 03, 07, 08, 12, 13, 18, 19, 34, 35, 36, 37, 44)
**No localizadas en línea.** El código las cita con detalle en
`PedagogicalAuditor.tsx`, `FlujoContextualizacion.tsx`, `geminiService.ts` y
`Ficha12.tsx` — alguien las tuvo a la vista al programar. Búsquedas en los
portales de SEP, DGB y Formación Docente no las devuelven como PDF público;
parecen material de taller repartido por plantel o zona escolar.

Hasta conseguirlas, lo que el código atribuye a una ficha concreta
(p. ej. "la Ficha 08 pide…") **no está verificado contra su fuente.**

### Acuerdo 22/08/25 — SINBANEM
Apareció al buscar y **no está en el corpus**. Establece el Sistema Nacional de
Bachillerato de la NEM. Vale la pena incorporarlo.
