#!/bin/bash

# 1. Navegar a la carpeta del proyecto
cd /Users/josemendoza/.gemini/antigravity/scratch/EDUPLANMX

# 2. Construir el proyecto (TypeScript a JS)
echo "🚀 Compilando EDUPLANMX..."
npm run build

# 3. Iniciar el servidor de vista previa en segundo plano
echo "🌐 Iniciando servidor local en puerto 3000..."
# Permitir todos los hosts ya configurado en vite.config.ts
npm run preview -- --port 3000 &

# Guardar el ID del proceso del servidor para cerrarlo después
SERVER_PID=$!

# 4. Esperar a que el servidor esté listo
sleep 3

# 5. Iniciar un Túnel Rápido de Cloudflare (Acceso Inmediato)
# Como el dominio eduplan.mx no está activo, usamos un enlace temporal.
echo "⚠️  El dominio app.eduplan.mx no está disponible (NXDOMAIN)."
echo "🔄 Iniciando un Túnel Rápido temporal..."
echo "👀  ¡Copia la URL que termina en .trycloudflare.com de abajo!"

cloudflared tunnel --url http://localhost:3000

# Al cerrar el túnel (Ctrl+C), también cerramos el servidor local
kill $SERVER_PID
echo "✅ Servidor detenido correctamente."
