# 🐍 Extractor de Programas MCCEMS - Guía Rápida

## Instalación

```bash
# Instalar dependencias Python
pip install -r requirements.txt
```

## Uso Básico

```bash
# Ejecutar extracción completa
python3 extractor_mccems.py
```

## ¿Qué hace?

1. **Descarga** PDFs de programas oficiales MCCEMS
2. **Extrae** información estructurada usando OCR y parsing
3. **Genera** archivo JSON con todos los datos

## Salida Esperada

```
data/
├── programas_sep.json          # Base de datos final
└── sep_downloads/              # PDFs descargados
    ├── Cultura_Digital.pdf
    ├── Pensamiento_Matematico.pdf
    └── ...
```

## Personalización

Para agregar más URLs de programas, edita el diccionario `PROGRAMAS` en el archivo:

```python
PROGRAMAS = {
    4: {
        "individuales": [
            ("Nueva Materia", "https://dgb.sep.gob.mx/..."),
        ]
    }
}
```

## Troubleshooting

**Error: "No module named 'pdfplumber'"**
→ Ejecuta: `pip install pdfplumber`

**Error: "File not found"**
→ Asegúrate de estar en el directorio `/scripts`

**Advertencia: "URL_A_DETERMINAR"**
→ Algunos programas tienen URLs pendientes de identificar manualmente en el sitio de la DGB.

## Notas Técnicas

- Los PDFs del semestre 1 están en un ZIP (se debe descomprimir manualmente si se necesita acceso individual)
- La extracción usa regex para identificar progresiones numeradas
- El script es resiliente: si un PDF falla, continúa con el siguiente

## Próximos Pasos

Una vez generado `programas_sep.json`:
1. Copia el archivo a `/data/programas_sep.json` en el proyecto principal
2. El servicio Node.js lo leerá automáticamente
3. Recarga el backend para que tome los nuevos datos
