
# Integración MCCEMS - EduPlan MX

Este documento explica cómo la plataforma utiliza los 18 PDFs oficiales de la SEP para la generación de planeaciones didácticas.

## Estructura de Datos
La metadata de los documentos se encuentra en `/data/mccemsData.ts`. Esta estructura jerarquiza:
- **Recursos Sociocognitivos**: Pensamiento Matemático, Lengua, Cultura Digital, etc.
- **Áreas de Conocimiento**: Ciencias Sociales, Humanidades, Naturales.
- **Ámbitos Socioemocionales**: Deportes, Artes, Salud.

## Proceso de Generación Alineada
1. **Selección**: El usuario elige una UAC en el `ContextManager`. El sistema recupera la URL del PDF oficial correspondiente.
2. **Grounding (IA)**: El `geminiService` recibe las URLs y los principios de la NEM como instrucción de sistema prioritaria.
3. **Validación**: La IA genera una "Progresión Relacionada" que coincide con los contenidos de los programas de estudio 2024.

## URLs Consultadas Directamente
- [Documento Base MCCEMS](https://dgb.sep.gob.mx/storage/recursos/marco-curricular-comun/XFVjVjC2r1-Documento-base-MCCEMS.pdf)
- [Fundamentos](https://dgb.sep.gob.mx/storage/recursos/marco-curricular-comun/ci3oHBtKrB-FundamentosDelMCCEMS.pdf)
- [Progresiones de Aprendizaje (Varios)](https://dgb.sep.gob.mx/marco-curricular)

## Implementación Técnica
Se utiliza el modelo `gemini-3-pro-preview` con una ventana de contexto amplia para procesar la lógica de las progresiones y asegurar que la secuencia didáctica siga el formato de Apertura, Desarrollo y Cierre exigido por la supervisión escolar.
