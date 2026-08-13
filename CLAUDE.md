# EDUPLANMX

Plataforma de planeación didáctica para **Educación Media Superior**, alineada al **MCCEMS 2024**. Genera planeaciones de clase con IA a partir de los programas de estudio oficiales.

Este proyecto es estratégico para José: presentó el examen USICAMM para plaza docente en Media Superior y esta es la herramienta que usaría en ese puesto.

## Stack
React + TypeScript + Vite + Tailwind CSS. Firebase (Auth + Firestore). **Google Gemini 2.5 Flash** para la generación. Iconos con lucide-react.

## Comandos
```bash
npm run dev            # desarrollo
npm run build          # tsc && vite build
npm run deploy         # ./deploy.sh -> GitHub Pages
npm run respaldo       # respaldo de Firestore
```

## Despliegue
https://68sfszbqhq-stack.github.io/EDUPLANMX/

## Reglas al trabajar aquí
- Las llaves viven en `.env` (`VITE_API_KEY` para Gemini). Está gitignoreado junto con `.env.*`. Nunca imprimir su contenido ni moverlo a código.
- Al tocar `services/geminiService.ts`: los prompts están calibrados contra la terminología oficial del MCCEMS (progresiones, metas de aprendizaje, categorías, subcategorías). No "simplificar" esos términos — son los que exige la SEP en la documentación entregable.
- Cualquier cambio en la generación debe probarse con una planeación real completa antes de desplegar; un plan mal formado le cuesta trabajo real a un docente.
