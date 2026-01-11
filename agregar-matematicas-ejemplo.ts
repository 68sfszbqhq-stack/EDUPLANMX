// Script para agregar Matemáticas III completa a Firebase
// Ejecutar con: npx tsx agregar-matematicas-ejemplo.ts

import { materiasService } from './src/services/materiasService';
import type { CrearMateriaData } from './types/materia';

const matematicasIII: CrearMateriaData = {
    nombre: "Matemáticas III",
    clave: "MAT-3",
    grado: 3,
    horasSemanales: 5,
    totalHoras: 80,

    proposito: "Desarrollar el pensamiento matemático mediante el razonamiento lógico, la resolución de problemas y el análisis de situaciones que permitan al estudiante comprender y aplicar conceptos algebraicos, geométricos y trigonométricos en contextos reales y abstractos.",

    competencias: [
        "Razonamiento lógico-matemático",
        "Resolución de problemas",
        "Pensamiento crítico y analítico",
        "Comunicación matemática",
        "Uso de herramientas tecnológicas",
        "Trabajo colaborativo"
    ],

    ejesFormativos: [
        "Sentido numérico y pensamiento algebraico",
        "Forma, espacio y medida",
        "Manejo de la información",
        "Actitud hacia las matemáticas"
    ],

    unidades: [
        {
            numero: 1,
            nombre: "Álgebra y Funciones",
            proposito: "Que el estudiante desarrolle habilidades para resolver problemas algebraicos mediante ecuaciones, sistemas y funciones, aplicándolos a situaciones de la vida cotidiana.",
            duracionHoras: 20,
            temas: [
                {
                    numero: "1.1",
                    nombre: "Ecuaciones Lineales",
                    duracionHoras: 6,
                    contenidos: [
                        "Concepto de ecuación lineal",
                        "Métodos de solución (despeje, sustitución)",
                        "Ecuaciones con fracciones y decimales",
                        "Aplicaciones prácticas"
                    ],
                    aprendizajesEsperados: [
                        "Identifica y clasifica ecuaciones lineales",
                        "Resuelve ecuaciones lineales por diferentes métodos",
                        "Aplica ecuaciones lineales a problemas de la vida real",
                        "Verifica soluciones de ecuaciones"
                    ]
                },
                {
                    numero: "1.2",
                    nombre: "Sistemas de Ecuaciones",
                    duracionHoras: 7,
                    contenidos: [
                        "Sistemas de 2x2 y 3x3",
                        "Método gráfico",
                        "Método de sustitución",
                        "Método de igualación",
                        "Método de eliminación",
                        "Aplicaciones en problemas"
                    ],
                    aprendizajesEsperados: [
                        "Resuelve sistemas de ecuaciones por diferentes métodos",
                        "Interpreta gráficamente sistemas de ecuaciones",
                        "Aplica sistemas de ecuaciones a problemas contextualizados",
                        "Determina el tipo de solución de un sistema"
                    ]
                },
                {
                    numero: "1.3",
                    nombre: "Funciones Lineales y Cuadráticas",
                    duracionHoras: 7,
                    contenidos: [
                        "Concepto de función",
                        "Dominio y rango",
                        "Función lineal: y = mx + b",
                        "Función cuadrática: y = ax² + bx + c",
                        "Gráficas de funciones",
                        "Aplicaciones"
                    ],
                    aprendizajesEsperados: [
                        "Identifica funciones y sus características",
                        "Grafica funciones lineales y cuadráticas",
                        "Determina dominio y rango de funciones",
                        "Modela situaciones reales con funciones"
                    ]
                }
            ],
            actividadesSugeridas: [
                "Resolución de problemas en equipo sobre situaciones cotidianas",
                "Uso de calculadora gráfica para visualizar funciones",
                "Proyecto: Modelado matemático de un problema real",
                "Ejercicios interactivos en plataformas digitales",
                "Presentación de soluciones ante el grupo"
            ]
        },
        {
            numero: 2,
            nombre: "Geometría y Trigonometría",
            proposito: "Que el estudiante comprenda y aplique conceptos geométricos y trigonométricos para resolver problemas de medición, cálculo de áreas y análisis de figuras.",
            duracionHoras: 20,
            temas: [
                {
                    numero: "2.1",
                    nombre: "Teorema de Pitágoras",
                    duracionHoras: 6,
                    contenidos: [
                        "Triángulos rectángulos",
                        "Teorema de Pitágoras: a² + b² = c²",
                        "Aplicaciones del teorema",
                        "Problemas de distancia y altura"
                    ],
                    aprendizajesEsperados: [
                        "Aplica el teorema de Pitágoras correctamente",
                        "Resuelve problemas de medición usando el teorema",
                        "Identifica triángulos rectángulos en figuras compuestas",
                        "Calcula distancias y alturas en problemas prácticos"
                    ]
                },
                {
                    numero: "2.2",
                    nombre: "Razones Trigonométricas",
                    duracionHoras: 7,
                    contenidos: [
                        "Seno, coseno y tangente",
                        "Razones trigonométricas en triángulos rectángulos",
                        "Ángulos notables (30°, 45°, 60°)",
                        "Aplicaciones prácticas"
                    ],
                    aprendizajesEsperados: [
                        "Calcula razones trigonométricas en triángulos rectángulos",
                        "Resuelve triángulos rectángulos",
                        "Aplica razones trigonométricas a problemas de altura y distancia",
                        "Utiliza calculadora para razones trigonométricas"
                    ]
                },
                {
                    numero: "2.3",
                    nombre: "Áreas y Perímetros",
                    duracionHoras: 7,
                    contenidos: [
                        "Perímetros de figuras planas",
                        "Áreas de triángulos, cuadriláteros y círculos",
                        "Figuras compuestas",
                        "Aplicaciones en diseño y construcción"
                    ],
                    aprendizajesEsperados: [
                        "Calcula perímetros y áreas de figuras planas",
                        "Resuelve problemas de figuras compuestas",
                        "Aplica fórmulas de área en contextos reales",
                        "Optimiza áreas y perímetros en problemas prácticos"
                    ]
                }
            ],
            actividadesSugeridas: [
                "Medición de objetos reales usando trigonometría",
                "Proyecto: Diseño de un espacio usando geometría",
                "Uso de simuladores de geometría dinámica",
                "Resolución de problemas de arquitectura y construcción",
                "Trabajo en campo: medición de alturas y distancias"
            ]
        },
        {
            numero: 3,
            nombre: "Probabilidad y Estadística",
            proposito: "Que el estudiante desarrolle habilidades para recopilar, organizar, analizar e interpretar datos, así como calcular probabilidades en situaciones cotidianas.",
            duracionHoras: 20,
            temas: [
                {
                    numero: "3.1",
                    nombre: "Estadística Descriptiva",
                    duracionHoras: 7,
                    contenidos: [
                        "Recopilación de datos",
                        "Tablas de frecuencias",
                        "Gráficas: barras, circular, histograma",
                        "Medidas de tendencia central: media, mediana, moda",
                        "Medidas de dispersión: rango, varianza, desviación estándar"
                    ],
                    aprendizajesEsperados: [
                        "Organiza datos en tablas y gráficas",
                        "Calcula medidas de tendencia central",
                        "Interpreta gráficas estadísticas",
                        "Analiza datos usando medidas de dispersión"
                    ]
                },
                {
                    numero: "3.2",
                    nombre: "Probabilidad Básica",
                    duracionHoras: 7,
                    contenidos: [
                        "Experimentos aleatorios",
                        "Espacio muestral",
                        "Eventos y probabilidad",
                        "Regla de Laplace",
                        "Probabilidad de eventos compuestos"
                    ],
                    aprendizajesEsperados: [
                        "Identifica experimentos aleatorios y espacios muestrales",
                        "Calcula probabilidades de eventos simples",
                        "Resuelve problemas de probabilidad compuesta",
                        "Aplica probabilidad a situaciones cotidianas"
                    ]
                },
                {
                    numero: "3.3",
                    nombre: "Análisis de Datos",
                    duracionHoras: 6,
                    contenidos: [
                        "Interpretación de gráficas",
                        "Comparación de conjuntos de datos",
                        "Predicciones basadas en datos",
                        "Uso de hojas de cálculo"
                    ],
                    aprendizajesEsperados: [
                        "Interpreta y compara conjuntos de datos",
                        "Realiza predicciones basadas en tendencias",
                        "Utiliza tecnología para análisis de datos",
                        "Presenta conclusiones de manera clara"
                    ]
                }
            ],
            actividadesSugeridas: [
                "Encuesta y análisis de datos de la comunidad escolar",
                "Proyecto: Investigación estadística sobre un tema de interés",
                "Uso de Excel o Google Sheets para análisis",
                "Juegos de probabilidad y análisis de resultados",
                "Presentación de resultados con gráficas"
            ]
        },
        {
            numero: 4,
            nombre: "Cálculo y Optimización",
            proposito: "Introducir al estudiante en conceptos básicos de cálculo y su aplicación en problemas de optimización y modelado matemático.",
            duracionHoras: 20,
            temas: [
                {
                    numero: "4.1",
                    nombre: "Sucesiones y Series",
                    duracionHoras: 7,
                    contenidos: [
                        "Sucesiones aritméticas",
                        "Sucesiones geométricas",
                        "Término general",
                        "Suma de series",
                        "Aplicaciones"
                    ],
                    aprendizajesEsperados: [
                        "Identifica y genera sucesiones",
                        "Calcula términos de sucesiones",
                        "Determina sumas de series",
                        "Aplica sucesiones a problemas financieros"
                    ]
                },
                {
                    numero: "4.2",
                    nombre: "Límites y Continuidad",
                    duracionHoras: 7,
                    contenidos: [
                        "Concepto intuitivo de límite",
                        "Límites de funciones",
                        "Continuidad de funciones",
                        "Aplicaciones gráficas"
                    ],
                    aprendizajesEsperados: [
                        "Comprende el concepto de límite",
                        "Calcula límites de funciones simples",
                        "Identifica funciones continuas",
                        "Interpreta límites gráficamente"
                    ]
                },
                {
                    numero: "4.3",
                    nombre: "Optimización",
                    duracionHoras: 6,
                    contenidos: [
                        "Problemas de máximos y mínimos",
                        "Modelado de situaciones",
                        "Análisis de funciones",
                        "Aplicaciones prácticas"
                    ],
                    aprendizajesEsperados: [
                        "Resuelve problemas de optimización",
                        "Modela situaciones para maximizar o minimizar",
                        "Analiza funciones para encontrar extremos",
                        "Aplica optimización a problemas reales"
                    ]
                }
            ],
            actividadesSugeridas: [
                "Proyecto: Optimización de un diseño o proceso",
                "Análisis de funciones con software matemático",
                "Problemas de economía y finanzas",
                "Modelado de situaciones de la vida real",
                "Presentación de soluciones óptimas"
            ]
        }
    ],

    bibliografiaBasica: [
        {
            tipo: 'libro',
            titulo: "Matemáticas 3",
            autor: "Baldor, Aurelio",
            editorial: "Patria",
            año: 2020,
            disponibilidad: 'biblioteca'
        },
        {
            tipo: 'libro',
            titulo: "Álgebra",
            autor: "Lehmann, Charles H.",
            editorial: "Limusa",
            año: 2019,
            disponibilidad: 'biblioteca'
        },
        {
            tipo: 'libro',
            titulo: "Geometría y Trigonometría",
            autor: "Ruiz Basto, Joaquín",
            editorial: "Patria",
            año: 2021,
            disponibilidad: 'digital'
        }
    ],

    bibliografiaComplementaria: [
        {
            tipo: 'libro',
            titulo: "Cálculo Diferencial e Integral",
            autor: "Granville, William Anthony",
            editorial: "Limusa",
            año: 2018,
            disponibilidad: 'biblioteca'
        },
        {
            tipo: 'articulo',
            titulo: "Aplicaciones de las Matemáticas en la Vida Cotidiana",
            autor: "Varios autores",
            disponibilidad: 'digital'
        }
    ],

    recursosDigitales: [
        {
            tipo: 'plataforma',
            nombre: "Khan Academy - Matemáticas",
            url: "https://es.khanacademy.org/math",
            descripcion: "Plataforma con videos y ejercicios interactivos de todos los temas de matemáticas"
        },
        {
            tipo: 'simulador',
            nombre: "GeoGebra",
            url: "https://www.geogebra.org",
            descripcion: "Software de matemáticas dinámicas para geometría, álgebra y cálculo"
        },
        {
            tipo: 'video',
            nombre: "Matemáticas Profe Alex",
            url: "https://www.youtube.com/@MatematicasprofeAlex",
            descripcion: "Canal de YouTube con explicaciones claras de matemáticas"
        },
        {
            tipo: 'app',
            nombre: "Photomath",
            url: "https://photomath.com",
            descripcion: "App para resolver problemas matemáticos paso a paso"
        },
        {
            tipo: 'plataforma',
            nombre: "Wolfram Alpha",
            url: "https://www.wolframalpha.com",
            descripcion: "Motor de conocimiento computacional para resolver problemas matemáticos"
        }
    ],

    criteriosEvaluacion: [
        {
            aspecto: "Exámenes Parciales",
            descripcion: "Evaluaciones escritas al final de cada unidad",
            porcentaje: 40
        },
        {
            aspecto: "Tareas y Ejercicios",
            descripcion: "Ejercicios en clase y tareas para casa",
            porcentaje: 25
        },
        {
            aspecto: "Proyecto Final",
            descripcion: "Proyecto integrador aplicando los conocimientos del semestre",
            porcentaje: 20
        },
        {
            aspecto: "Participación",
            descripcion: "Participación activa en clase y trabajo colaborativo",
            porcentaje: 10
        },
        {
            aspecto: "Autoevaluación",
            descripcion: "Reflexión sobre el propio aprendizaje",
            porcentaje: 5
        }
    ],

    instrumentosEvaluacion: [
        "Exámenes escritos",
        "Rúbricas para proyectos",
        "Listas de cotejo",
        "Portafolio de evidencias",
        "Exposiciones orales",
        "Resolución de problemas"
    ]
};

async function agregarMatematicasIII() {
    console.log('📐 Agregando Matemáticas III a Firebase...\n');

    try {
        const materia = await materiasService.crear(matematicasIII, 'system');

        console.log('✅ Matemáticas III agregada exitosamente!\n');
        console.log('📊 Resumen:');
        console.log(`   ID: ${materia.id}`);
        console.log(`   Nombre: ${materia.nombre}`);
        console.log(`   Grado: ${materia.grado}° Semestre`);
        console.log(`   Horas semanales: ${materia.horasSemanales}`);
        console.log(`   Total horas: ${materia.totalHoras}`);
        console.log(`   Unidades: ${materia.unidades.length}`);
        console.log(`   Temas totales: ${materia.unidades.reduce((sum, u) => sum + u.temas.length, 0)}`);
        console.log(`   Recursos digitales: ${materia.recursosDigitales.length}`);
        console.log('');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

// Ejecutar
agregarMatematicasIII()
    .then(() => {
        console.log('✅ Script completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
