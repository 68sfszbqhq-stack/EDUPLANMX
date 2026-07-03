#!/bin/bash

# Script de deploy para GitHub Pages
echo "🚀 Iniciando deploy a GitHub Pages..."

# 1. Construir la aplicación (el base path /EDUPLANMX/ ya viene de vite.config.ts en modo producción)
echo "📦 Construyendo aplicación..."
npm run build

# 2. Navegar a la carpeta de build
cd dist

# 3. Crear archivo .nojekyll (importante para GitHub Pages)
touch .nojekyll
# IMPORTANTE: Copiar index.html a 404.html para que el ruteo de React funcione al recargar
cp index.html 404.html

# 4. Inicializar git en dist
git init
git add -A
git commit -m "Deploy to GitHub Pages"

# 5. Push a la rama gh-pages
echo "📤 Subiendo a GitHub Pages..."
git push -f git@github.com:68sfszbqhq-stack/EDUPLANMX.git main:gh-pages

cd ..

echo "✅ Deploy completado!"
echo "🌐 Tu app estará disponible en: https://68sfszbqhq-stack.github.io/EDUPLANMX/"
