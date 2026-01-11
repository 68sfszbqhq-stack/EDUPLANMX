#!/usr/bin/env python3
"""
MCCEMS Data Extractor - DGB/SEP Programs
Extrae programas de estudio y progresiones del Marco Curricular Común
Autor: Ingeniero de Datos Senior - EDUPLANMX
"""

import requests
import json
import re
import pdfplumber
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

class MCCEMSExtractor:
    """Extractor de datos del Marco Curricular Común (MCCEMS)"""
    
    BASE_URL = "https://dgb.sep.gob.mx"
    STORAGE_PATH = Path("./data/sep_downloads")
    OUTPUT_FILE = "programas_sep.json"
    
    # Catálogo de progresiones identificadas
    PROGRESIONES = {
        "Cultura Digital": f"{BASE_URL}/storage/recursos/2023/05/29/Cultura_Digital.pdf",
        "Pensamiento Matemático": f"{BASE_URL}/storage/recursos/2023/05/29/Pensamiento_Matematico.pdf",
        "Lengua y Comunicación": f"{BASE_URL}/storage/recursos/2023/05/29/Lengua_y_Comunicacion.pdf",
        "Humanidades": f"{BASE_URL}/storage/recursos/2023/05/29/Humanidades.pdf",
        "Ciencias Sociales": f"{BASE_URL}/storage/recursos/2023/05/29/Ciencias_Sociales.pdf",
        "Ciencias Naturales": f"{BASE_URL}/storage/recursos/2023/05/29/Ciencias_Naturales.pdf",
        "Conciencia Histórica": f"{BASE_URL}/storage/recursos/2023/05/29/Conciencia_Historica.pdf"
    }
    
    # Programas por semestre (enlaces directos identificados)
    PROGRAMAS = {
        1: {
            "zip": f"{BASE_URL}/storage/recursos/2023/08/Programas-de-Estudio-1er-Semestre.zip",
            "individuales": [
                ("Laboratorio de Investigación I", f"{BASE_URL}/storage/recursos/2023/08/..."),
                ("Pensamiento Matemático I", "URL_A_DETERMINAR"),
                ("Lengua y Comunicación I", "URL_A_DETERMINAR"),
            ]
        },
        2: {
            "individuales": [
                ("Pensamiento Matemático II", f"{BASE_URL}/storage/recursos/2023/08/NPMCx1C06u-Pensamiento-Matematico-II.pdf"),
                ("Conservación de la Energía", "URL_A_DETERMINAR"),
            ]
        },
        # ... continuar para semestres 3-6
    }
    
    def __init__(self):
        """Inicializa el extractor"""
        self.STORAGE_PATH.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (EDUPLANMX Data Extraction Bot)'
        })
        
    def descargar_pdf(self, url: str, nombre_archivo: str) -> Optional[Path]:
        """Descarga un PDF desde la URL proporcionada"""
        try:
            print(f"📥 Descargando: {nombre_archivo}")
            response = self.session.get(url, stream=True, timeout=30)
            response.raise_for_status()
            
            filepath = self.STORAGE_PATH / f"{nombre_archivo}.pdf"
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"✅ Descargado: {filepath}")
            return filepath
        except Exception as e:
            print(f"❌ Error descargando {nombre_archivo}: {e}")
            return None
    
    def extraer_metadata_portada(self, pdf_path: Path) -> Dict:
        """Extrae metadatos de la portada del programa"""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                primera_pagina = pdf.pages[0].extract_text()
                
                # Patrones para extraer información
                metadata = {
                    "nombre_uac": None,
                    "semestre": None,
                    "creditos": None,
                    "horas_semanales": None
                }
                
                # Buscar nombre de la UAC (generalmente en mayúsculas y resaltado)
                lineas = primera_pagina.split('\n')
                for linea in lineas:
                    if re.search(r'(PENSAMIENTO|MATEMÁTICO|LENGUA|COMUNICACIÓN|CULTURA)', linea):
                        metadata["nombre_uac"] = linea.strip()
                        break
                
                # Buscar semestre
                semestre_match = re.search(r'SEMESTRE\s*(\d+)', primera_pagina, re.IGNORECASE)
                if semestre_match:
                    metadata["semestre"] = int(semestre_match.group(1))
                
                # Buscar créditos
                creditos_match = re.search(r'CRÉDITOS?:?\s*(\d+)', primera_pagina, re.IGNORECASE)
                if creditos_match:
                    metadata["creditos"] = int(creditos_match.group(1))
                
                # Buscar horas semanales
                horas_match = re.search(r'HORAS?\s+SEMANALES?:?\s*(\d+)', primera_pagina, re.IGNORECASE)
                if horas_match:
                    metadata["horas_semanales"] = int(horas_match.group(1))
                
                return metadata
        except Exception as e:
            print(f"❌ Error extrayendo metadata: {e}")
            return {}
    
    def extraer_organizador_curricular(self, pdf_path: Path) -> Dict:
        """Extrae la tabla de Organizador Curricular del programa"""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # El organizador suele estar entre páginas 4-6
                organizador = {
                    "categorias": [],
                    "subcategorias": [],
                    "metas_aprendizaje": []
                }
                
                for page_num in range(min(3, len(pdf.pages)), min(7, len(pdf.pages))):
                    page = pdf.pages[page_num]
                    texto = page.extract_text()
                    
                    # Buscar sección "ORGANIZADOR CURRICULAR"
                    if 'ORGANIZADOR CURRICULAR' in texto or 'CATEGORÍAS' in texto:
                        tablas = page.extract_tables()
                        
                        for tabla in tablas:
                            if not tabla:
                                continue
                            
                            # Procesar filas de la tabla
                            for fila in tabla[1:]:  # Saltar encabezado
                                if fila and len(fila) >= 3:
                                    categoria = fila[0].strip() if fila[0] else ""
                                    subcategoria = fila[1].strip() if fila[1] else ""
                                    meta = fila[2].strip() if fila[2] else ""
                                    
                                    if categoria:
                                        organizador["categorias"].append(categoria)
                                    if subcategoria:
                                        organizador["subcategorias"].append(subcategoria)
                                    if meta:
                                        organizador["metas_aprendizaje"].append(meta)
                
                return organizador
        except Exception as e:
            print(f"❌ Error extrayendo organizador: {e}")
            return {"categorias": [], "subcategorias": [], "metas_aprendizaje": []}
    
    def extraer_progresiones(self, pdf_path: Path) -> List[Dict]:
        """Extrae las progresiones de aprendizaje del programa"""
        progresiones = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # Las progresiones suelen estar desde la página 6 en adelante
                for page_num in range(5, len(pdf.pages)):
                    page = pdf.pages[page_num]
                    texto = page.extract_text()
                    
                    # Buscar patrones de progresiones (generalmente numeradas)
                    # Formato típico: "1. Descripción de la progresión..."
                    patron_progresion = r'(\d+)\.\s+(.+?)(?=\n\d+\.|$)'
                    matches = re.finditer(patron_progresion, texto, re.DOTALL)
                    
                    for match in matches:
                        id_progresion = int(match.group(1))
                        descripcion = match.group(2).strip()
                        
                        # Buscar metas asociadas (si las hay en el mismo párrafo)
                        metas_asociadas = re.findall(
                            r'Meta[s]?\s*\d*:?\s*(.+?)(?=\n|$)', 
                            descripcion
                        )
                        
                        progresiones.append({
                            "id": id_progresion,
                            "descripcion": descripcion,
                            "metas": metas_asociadas
                        })
        except Exception as e:
            print(f"❌ Error extrayendo progresiones: {e}")
        
        return progresiones
    
    def procesar_programa(self, nombre: str, url: str, semestre: int) -> Optional[Dict]:
        """Procesa un programa completo"""
        print(f"\n{'='*60}")
        print(f"📚 Procesando: {nombre} (Semestre {semestre})")
        print(f"{'='*60}")
        
        # Generar nombre de archivo seguro
        nombre_archivo = re.sub(r'[^\w\s-]', '', nombre).strip().replace(' ', '_')
        
        # Descargar PDF
        pdf_path = self.descargar_pdf(url, nombre_archivo)
        if not pdf_path:
            return None
        
        # Extraer datos
        metadata = self.extraer_metadata_portada(pdf_path)
        organizador = self.extraer_organizador_curricular(pdf_path)
        progresiones = self.extraer_progresiones(pdf_path)
        
        programa = {
            "materia": nombre,
            "semestre": semestre,
            "metadata": metadata,
            "organizador_curricular": organizador,
            "progresiones": progresiones,
            "url_fuente": url,
            "fecha_extraccion": datetime.now().isoformat()
        }
        
        print(f"✅ Extraídas {len(progresiones)} progresiones")
        return programa
    
    def ejecutar_extraccion_completa(self):
        """Ejecuta la extracción completa de todos los programas"""
        print("\n🚀 Iniciando extracción MCCEMS - DGB/SEP")
        print("="*60)
        
        programas_extraidos = []
        
        # Procesar progresiones fundamentales
        print("\n📖 FASE 1: Extrayendo Progresiones Fundamentales")
        for nombre, url in self.PROGRESIONES.items():
            programa = self.procesar_programa(nombre, url, semestre=0)  # 0 = transversal
            if programa:
                programas_extraidos.append(programa)
        
        # Procesar programas por semestre
        print("\n📖 FASE 2: Extrayendo Programas por Semestre")
        for semestre, data in self.PROGRAMAS.items():
            print(f"\n--- Semestre {semestre} ---")
            for nombre, url in data.get("individuales", []):
                if url != "URL_A_DETERMINAR":
                    programa = self.procesar_programa(nombre, url, semestre)
                    if programa:
                        programas_extraidos.append(programa)
        
        # Guardar resultados
        output_path = Path(self.OUTPUT_FILE)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(programas_extraidos, f, ensure_ascii=False, indent=2)
        
        print(f"\n{'='*60}")
        print(f"✅ EXTRACCIÓN COMPLETA")
        print(f"📄 Programas extraídos: {len(programas_extraidos)}")
        print(f"💾 Archivo generado: {output_path}")
        print(f"{'='*60}\n")
        
        return programas_extraidos


def main():
    """Función principal"""
    extractor = MCCEMSExtractor()
    extractor.ejecutar_extraccion_completa()


if __name__ == "__main__":
    main()
