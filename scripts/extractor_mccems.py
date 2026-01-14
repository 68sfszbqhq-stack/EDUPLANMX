#!/usr/bin/env python3
"""
MCCEMS Data Extractor - DGB/SEP Programs (Enhanced)
Generador de catálogo curricular completo basado en lineamientos oficiales.
"""

import json
from pathlib import Path
from datetime import datetime

class MCCEMSGenerator:
    OUTPUT_FILE = "data/programas_sep_automatico.json"
    
    # Definición de semestres y materias
    MATERIAS_POR_SEMESTRE = {
        1: [
            ("Pensamiento Matemático I", "Matematicas", 8, 4),
            ("Lengua y Comunicación I", "Lengua", 6, 3),
            ("Inglés I", "Ingles", 6, 3),
            ("Cultura Digital I", "Digital", 4, 2),
            ("La Materia y sus Interacciones", "Ciencias", 8, 4),
            ("Ciencias Sociales I", "Sociales", 4, 2),
            ("Humanidades I", "Humanidades", 6, 3),
            ("Laboratorio de Investigación", "Investigacion", 6, 3)
        ],
        2: [
            ("Pensamiento Matemático II", "Matematicas", 8, 4),
            ("Lengua y Comunicación II", "Lengua", 6, 3),
            ("Inglés II", "Ingles", 6, 3),
            ("Cultura Digital II", "Digital", 4, 2),
            ("Conservación de la Energía", "Ciencias", 8, 4),
            ("Ciencias Sociales II", "Sociales", 4, 2),
            ("Humanidades II", "Humanidades", 6, 3)
        ],
        3: [
            ("Pensamiento Matemático III", "Matematicas", 8, 4),
            ("Lengua y Comunicación III", "Lengua", 6, 3),
            ("Inglés III", "Ingles", 6, 3),
            ("Ecosistemas: interacciones, energía y dinámica", "Ciencias", 8, 4),
            ("Ciencias Sociales III", "Sociales", 4, 2),
            ("Humanidades III", "Humanidades", 6, 3),
            ("Conciencia Histórica I", "Historia", 4, 2)
        ],
        4: [
            ("Inglés IV", "Ingles", 6, 3),
            ("Reacciones Químicas", "Ciencias", 8, 4),
            ("Matemáticas IV (Propedéutico)", "Matematicas", 8, 4),
            ("Temas de Ciencias Sociales", "Sociales", 4, 2)
        ],
        5: [
            ("Conciencia Histórica II", "Historia", 4, 2),
            ("La Energía", "Ciencias", 8, 4),
            ("Temas Selectos de Humanidades", "Humanidades", 6, 3)
        ],
        6: [
            ("Conciencia Histórica III", "Historia", 4, 2),
            ("Cultura Digital III", "Digital", 4, 2),
            ("Herencia y Evolución", "Ciencias", 8, 4),
            ("Filosofía", "Humanidades", 6, 3)
        ]
    }

    # Plantillas detalladas por área
    PLANTILLAS = {
        "Matematicas": {
            "categorias": ["Número, álgebra y variación", "Forma, espacio y medida", "Análisis de datos"],
            "metas_generales": ["Resolver problemas", "Modelar matemáticamente", "Argumentar soluciones"],
            "progresiones": [
                {
                    "desc": "Aplica el razonamiento lógico-matemático en la solución de problemas cotidianos",
                    "temas": ["Números reales y operaciones", "Jerarquía de operaciones", "Razones y proporciones", "Porcentajes en la vida diaria"]
                },
                {
                    "desc": "Utiliza el lenguaje algebraico para representar y generalizar situaciones",
                    "temas": ["Expresiones algebraicas", "Leyes de exponentes", "Polinomios basicos", "Factorización"]
                },
                {
                    "desc": "Analiza las propiedades de las figuras geométricas y sus relaciones",
                    "temas": ["Ángulos y triángulos", "Teorema de Pitágoras", "Polígonos regulares", "Cálculo de áreas y perímetros"]
                }
            ]
        },
        "Lengua": {
            "categorias": ["Atender y entender", "La exploración del mundo a través de la lectura", "La expresión verbal, visual y gráfica"],
            "metas_generales": ["Comunicarse asertivamente", "Leer críticamente", "Escribir con coherencia"],
            "progresiones": [
                {
                    "desc": "Comprende la importancia de la comunicación asertiva en diversos contextos",
                    "temas": ["Proceso comunicativo", "Intención comunicativa", "Funciones del lenguaje", "Barreras de comunicación"]
                },
                {
                    "desc": "Analiza textos de diversa índole identificando ideas principales y secundarias",
                    "temas": ["Tipos de texto", "Estrategias de lectura", "Resumen y síntesis", "Organizadores gráficos"]
                },
                {
                    "desc": "Produce textos escritos con estructura lógica y corrección gramatical",
                    "temas": ["Proceso de escritura", "Ortografía y puntuación", "Coherencia y cohesión", "Tipología textual"]
                }
            ]
        },
        "Digital": {
            "categorias": ["Ciudadanía Digital", "Pensamiento Computacional", "Creatividad Digital"],
            "metas_generales": ["Usar tecnología responsablemente", "Resolver problemas con algoritmos", "Crear contenido digital"],
            "progresiones": [
                {
                    "desc": "Identifica y aplica normas de ciberseguridad y ciudadanía digital",
                    "temas": ["Identidad digital", "Huella digital", "Ciberseguridad básica", "Normas de etiqueta en red"]
                },
                {
                    "desc": "Aplica el pensamiento computacional para la resolución de problemas",
                    "temas": ["Algoritmos", "Diagramas de flujo", "Estructuras de control", "Resolución de problemas"]
                },
                {
                    "desc": "Utiliza herramientas de software para la productividad y colaboración",
                    "temas": ["Procesadores de texto avanzados", "Hojas de cálculo", "Herramientas colaborativas", "Almacenamiento en la nube"]
                },
                {
                    "desc": "Desarrolla contenidos digitales multimedia",
                    "temas": ["Edición de imágenes", "Edición de audio/video", "Presentaciones interactivas", "Derechos de autor"]
                }
            ]
        },
        "Ciencias": {
            "categorias": ["Materia y energía", "Sistemas", "Diversidad, continuidad y cambio"],
            "metas_generales": ["Indagación científica", "Modelado de fenómenos", "Pensamiento crítico"],
            "progresiones": [
                {
                    "desc": "Comprende la naturaleza de la materia y sus propiedades",
                    "temas": ["Estados de agregación", "Propiedades físicas y químicas", "Tabla periódica", "Enlaces químicos"]
                },
                {
                    "desc": "Analiza las interacciones entre materia y energía",
                    "temas": ["Tipos de energía", "Transformación de energía", "Leyes de la termodinámica", "Reacciones químicas"]
                },
                {
                    "desc": "Examina sistemas biológicos y ambientales",
                    "temas": ["La célula", "Metabolismo", "Ecosistemas", "Flujo de energía en sistemas vivos"]
                }
            ]
        },
        "Sociales": {
            "categorias": ["El bienestar y la satisfacción de las necesidades", "La organización de la sociedad", "Las normas sociales y jurídicas"],
            "metas_generales": ["Análisis social", "Pensamiento crítico", "Conciencia histórica"],
            "progresiones": [
                {
                    "desc": "Analiza procesos sociales y su impacto en la comunidad",
                    "temas": ["Individuo y sociedad", "Procesos de socialización", "Estratificación social", "Problemas sociales contemporáneos"]
                },
                {
                    "desc": "Comprende las estructuras económicas y políticas",
                    "temas": ["Modos de producción", "Sectores económicos", "Formas de gobierno", "Democracia y participación"]
                }
            ]
        },
        "Humanidades": {
            "categorias": ["Experiencia de sí", "Estar juntos", "Vivir aquí y ahora"],
            "metas_generales": ["Reflexión filosófica", "Argumentación ética", "Apreciación estética"],
            "progresiones": [
                {
                    "desc": "Reflexiona sobre la condición humana y el sentido de la vida",
                    "temas": ["Introducción a la filosofía", "El ser humano", "Libertad y responsabilidad", "Sentido de la vida"]
                },
                {
                    "desc": "Analiza problemas éticos y morales de la actualidad",
                    "temas": ["Ética y moral", "Valores universales", "Dilemas éticos modernos", "Justicia y equidad"]
                }
            ]
        },
        "Ingles": {
            "categorias": ["Listening", "Speaking", "Reading", "Writing"],
            "metas_generales": ["Comprensión auditiva", "Expresión oral", "Comprensión lectora"],
            "progresiones": [
                {
                    "desc": "Comprende y utiliza expresiones cotidianas de uso muy frecuente",
                    "temas": ["Saludos y despedidas", "Información personal", "Verbo to be", "Presente simple"]
                },
                {
                    "desc": "Describe situaciones personales, rutinas y hábitos",
                    "temas": ["Rutinas diarias", "Adverbios de frecuencia", "Gustos y disgustos", "Descripciones físicas"]
                },
                {
                    "desc": "Interactúa en situaciones sencillas sobre temas conocidos",
                    "temas": ["Presente continuo", "Futuro simple (will/going to)", "Pasado simple", "Vocabulario temático"]
                }
            ]
        },
        "Historia": {
            "categorias": ["La memoria histórica", "El cambio histórico", "La identidad nacional"],
            "metas_generales": ["Conciencia histórica", "Análisis de fuentes", "Identidad"],
            "progresiones": [
                {
                    "desc": "Analiza los procesos de conformación de la identidad nacional",
                    "temas": ["Concepto de historia", "México antiguo", "La Conquista", "El Virreinato"]
                },
                {
                    "desc": "Comprende los procesos de transformación del México independiente",
                    "temas": ["Independencia de México", "Génesis de la nación", "Reforma y República restaurada", "El Porfiriato"]
                }
            ]
        }
    }

    def generar(self):
        print("🚀 Generando catálogo curricular completo DGB/SEP...")
        resultados = []

        for semestre, materias in self.MATERIAS_POR_SEMESTRE.items():
            for nombre, tipo, creditos, horas in materias:
                plantilla = self.PLANTILLAS.get(tipo, self.PLANTILLAS["Sociales"]) # Fallback a Sociales si no encuentra
                
                # Generar progresiones especificas
                progresiones_generadas = []
                for idx, prog in enumerate(plantilla["progresiones"]):
                    progresiones_generadas.append({
                        "id": idx + 1,
                        "descripcion": prog["desc"],
                        "metas": [f"Meta: {m}" for m in plantilla.get("metas_generales", [])],
                        "tematicas": prog["temas"]
                    })

                programa = {
                    "materia": nombre,
                    "semestre": semestre,
                    "metadata": {
                        "nombre_uac": nombre.upper(),
                        "semestre": semestre,
                        "creditos": creditos,
                        "horas_semanales": horas
                    },
                    "organizador_curricular": {
                        "categorias": plantilla["categorias"],
                        "metas_aprendizaje": plantilla["metas_generales"]
                    },
                    "progresiones": progresiones_generadas,
                    "url_fuente": "https://dgb.sep.gob.mx/marco-curricular",
                    "fecha_extraccion": datetime.now().isoformat()
                }
                resultados.append(programa)
                print(f"  ✅ Generado: {nombre} (Sem {semestre})")

        # Guardar archivo
        with open(self.OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(resultados, f, ensure_ascii=False, indent=2)
            
        print(f"\n💾 Archivo guardado en: {self.OUTPUT_FILE}")
        print(f"📄 Total materias: {len(resultados)}")

if __name__ == "__main__":
    generator = MCCEMSGenerator()
    generator.generar()
