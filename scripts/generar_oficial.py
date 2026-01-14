import json

# ==========================================
# CATÁLOGO OFICIAL MCCEMS - PROGRESIONES REALES
# Fuente: Documentos DGB/SEP 2023-2024
# ==========================================

catalogo = []

# ==========================================
# SEMESTRE 1
# ==========================================

# 1. PENSAMIENTO MATEMÁTICO I (Ya lo teníamos, lo mantengo)
catalogo.append({
    "materia": "Pensamiento Matemático I",
    "semestre": 1,
    "metadata": { "nombre_uac": "PENSAMIENTO MATEMÁTICO I", "semestre": 1, "creditos": 8, "horas_semanales": 4 },
    "organizador_curricular": { "categorias": ["Procedural", "Procesos de intuición y razonamiento"], "metas_aprendizaje": ["M1", "M2"] },
    "progresiones": [
        {"id": 1, "descripcion": "Discute la importancia de la toma de decisiones basada en datos y cuestiona la validez de la información estadística.", "tematicas": ["Estadística básica", "Toma de decisiones"]},
        {"id": 2, "descripcion": "Identifica la incertidumbre como consecuencia de la variabilidad y a través de simulaciones considera la frecuencia de eventos.", "tematicas": ["Incertidumbre", "Variabilidad", "Frecuencia"]},
        {"id": 3, "descripcion": "Identifica la equiprobabilidad como hipótesis y observa la ley de los grandes números.", "tematicas": ["Equiprobabilidad", "Ley de los grandes números"]},
        {"id": 4, "descripcion": "Elige una técnica de conteo (combinaciones, ordenaciones) para calcular el total de casos posibles y favorables.", "tematicas": ["Técnicas de conteo", "Combinatoria"]},
        {"id": 5, "descripcion": "Observa cómo la probabilidad de un evento se actualiza con información adicional (Probabilidad condicional).", "tematicas": ["Probabilidad condicional"]},
        {"id": 6, "descripcion": "Selecciona una problemática para recolectar datos. Distingue variables cualitativas y cuantitativas.", "tematicas": ["Variables estadísticas", "Recolección de datos"]},
        {"id": 7, "descripcion": "Analiza datos categóricos y cuantitativos mediante representaciones gráficas (barras, pastel, puntos).", "tematicas": ["Gráficos estadísticos"]},
        {"id": 8, "descripcion": "Analiza la relación entre dos variables categóricas mediante tablas de doble entrada.", "tematicas": ["Tablas de contingencia"]},
        {"id": 9, "descripcion": "Analiza datos cuantitativos a través de medidas de tendencia central y dispersión.", "tematicas": ["Media, mediana, moda", "Dispersión"]},
        {"id": 10, "descripcion": "Analiza la distribución de datos cuantitativos (forma, centro, dispersión).", "tematicas": ["Distribuciones de datos"]},
        {"id": 11, "descripcion": "Construye e interpreta gráficas de caja y bigotes (Boxplots).", "tematicas": ["Boxplots", "Cuartiles"]},
        {"id": 12, "descripcion": "Introduce el concepto de correlación y la distingue de causalidad.", "tematicas": ["Correlación vs Causalidad"]},
        {"id": 13, "descripcion": "Analiza la asociación entre variables cuantitativas (regresión lineal simple).", "tematicas": ["Regresión lineal"]},
        {"id": 14, "descripcion": "Analiza la asociación entre dos variables cuantitativas a través del coeficiente de correlación de Pearson.", "tematicas": ["Coeficiente de Pearson"]},
        {"id": 15, "descripcion": "Valora la importancia de la Probabilidad y Estadística en la construcción de conocimiento.", "tematicas": ["Aplicaciones estadísticas"]}
    ]
})

# 2. LENGUA Y COMUNICACIÓN I
catalogo.append({
    "materia": "Lengua y Comunicación I",
    "semestre": 1,
    "metadata": { "nombre_uac": "LENGUA Y COMUNICACIÓN I", "semestre": 1, "creditos": 6, "horas_semanales": 3 },
    "progresiones": [
        {"id": 1, "descripcion": "Comprende por qué es importante saber resumir y relatar, e identifica la diferencia entre ambos.", "tematicas": ["Resumen y Relato"]},
        {"id": 2, "descripcion": "Identifica los tipos de fuentes de información y la validez de los contenidos.", "tematicas": ["Fuentes de información"]},
        {"id": 3, "descripcion": "Distingue la lengua oral de la lengua escrita y los usos en diferentes contextos.", "tematicas": ["Oralidad vs Escritura"]},
        {"id": 4, "descripcion": "Comprende y aplica las reglas de acentuación, puntuación y uso de grafías.", "tematicas": ["Ortografía", "Puntuación"]},
        {"id": 5, "descripcion": "Realiza la composición de resúmenes y relatos simples a partir de diversas fuentes.", "tematicas": ["Composición de textos"]},
        {"id": 6, "descripcion": "Identifica y aplica las etapas del proceso de lectura: prelectura, lectura y poslectura.", "tematicas": ["Proceso de lectura"]},
        {"id": 7, "descripcion": "Analiza un relato para identificar los elementos narrativos básicos.", "tematicas": ["Narrativa", "Personajes", "Trama"]},
        {"id": 8, "descripcion": "Distingue las ideas principales de las secundarias en un texto.", "tematicas": ["Comprensión lectora"]},
        {"id": 9, "descripcion": "Identifica las características del resumen y su utilidad académica.", "tematicas": ["El Resumen"]},
        {"id": 10, "descripcion": "Identifica las características del relato y su función social.", "tematicas": ["El Relato"]},
        {"id": 11, "descripcion": "Reconoce la estructura de los textos informativos básicos.", "tematicas": ["Textos informativos"]},
        {"id": 12, "descripcion": "Utiliza organizadores gráficos para procesar información.", "tematicas": ["Mapas mentales", "Cuadros sinópticos"]},
        {"id": 13, "descripcion": "Expone de manera oral un resumen o relato ante una audiencia.", "tematicas": ["Expresión oral"]},
        {"id": 14, "descripcion": "Revisa y corrige sus textos (propiedades de la redacción: adecuación, coherencia y cohesión).", "tematicas": ["Corrección de textos"]},
        {"id": 15, "descripcion": "Utiliza herramientas digitales para la elaboración de textos sencillos.", "tematicas": ["Herramientas digitales"]},
        {"id": 16, "descripcion": "Reflexiona sobre la importancia de la lengua para la interacción social.", "tematicas": ["Reflexión lingüística"]}
    ]
})

# 3. CULTURA DIGITAL I
catalogo.append({
    "materia": "Cultura Digital I",
    "semestre": 1,
    "metadata": { "nombre_uac": "CULTURA DIGITAL I", "semestre": 1, "creditos": 4, "horas_semanales": 2 },
    "progresiones": [
        {"id": 1, "descripcion": "Identifica y aplica la normatividad que regula el ciberespacio y servicios digitales; cuida su salud digital y el medio ambiente.", "tematicas": ["Ciudadanía Digital", "Ciberseguridad", "Salud digital"]},
        {"id": 2, "descripcion": "Reconoce su identidad como ciudadano en el ciberespacio con derechos y obligaciones.", "tematicas": ["Identidad digital", "Derechos digitales"]},
        {"id": 3, "descripcion": "Conoce y utiliza herramientas de productividad: procesadores de texto.", "tematicas": ["Procesadores de texto"]},
        {"id": 4, "descripcion": "Conoce y utiliza herramientas de productividad: hojas de cálculo.", "tematicas": ["Hojas de cálculo", "Excel básico"]},
        {"id": 5, "descripcion": "Conoce y utiliza herramientas de productividad: presentaciones electrónicas.", "tematicas": ["Presentaciones", "PowerPoint/Canva"]},
        {"id": 6, "descripcion": "Identifica y aplica estrategias de búsqueda de información confiable en internet.", "tematicas": ["Búsqueda de información", "Fuentes confiables"]},
        {"id": 7, "descripcion": "Utiliza herramientas digitales para la comunicación y colaboración en línea.", "tematicas": ["Correo electrónico", "Nube", "Colaboración"]},
        {"id": 8, "descripcion": "Comprende los conceptos básicos de algoritmos y pensamiento computacional.", "tematicas": ["Algoritmos", "Lógica computacional"]},
        {"id": 9, "descripcion": "Utiliza el pensamiento computacional para la resolución de problemas cotidianos.", "tematicas": ["Resolución de problemas", "Diagramas de flujo"]}
    ]
})

# 4. LA MATERIA Y SUS INTERACCIONES 
catalogo.append({
    "materia": "La Materia y sus Interacciones",
    "semestre": 1,
    "metadata": { "nombre_uac": "LA MATERIA Y SUS INTERACCIONES", "semestre": 1, "creditos": 8, "horas_semanales": 4 },
    "progresiones": [
        {"id": 1, "descripcion": "La materia es todo lo que ocupa un lugar en el espacio y tiene masa. Todas las sustancias están formadas por átomos.", "tematicas": ["Concepto de materia", "Átomos", "Modelos atómicos"]},
        {"id": 2, "descripcion": "Las moléculas están formadas por átomos unidos por enlaces químicos.", "tematicas": ["Moléculas", "Enlaces químicos (Iónico, Covalente)"]},
        {"id": 3, "descripcion": "Identifica que la temperatura es una medida de la energía cinética promedio de las partículas.", "tematicas": ["Temperatura", "Energía cinética"]},
        {"id": 4, "descripcion": "Utiliza la teoría cinético-molecular para explicar los estados de agregación.", "tematicas": ["Estados de la materia", "Cambios de estado"]},
        {"id": 5, "descripcion": "Comprende que en una reacción química la masa se conserva (Ley de Lavoisier).", "tematicas": ["Reacciones químicas", "Conservación de la materia"]},
        {"id": 6, "descripcion": "Distingue entre sistemas abiertos, cerrados y aislados.", "tematicas": ["Sistemas termodinámicos"]},
        {"id": 7, "descripcion": "Identifica las propiedades extensivas e intensivas de la materia.", "tematicas": ["Propiedades de la materia"]},
        {"id": 8, "descripcion": "Clasifica las sustancias en elementos, compuestos y mezclas.", "tematicas": ["Clasificación de la materia", "Tabla periódica"]},
        {"id": 9, "descripcion": "Examina cómo la estructura de los materiales determina sus propiedades y usos.", "tematicas": ["Materiales", "Estructura-Propiedad"]},
        {"id": 10, "descripcion": "Analiza la energía involucrada en las reacciones químicas (endotérmicas y exotérmicas).", "tematicas": ["Energía en reacciones", "Entalpía"]},
        {"id": 11, "descripcion": "Comprende el concepto de rapidez de reacción y los factores que la afectan.", "tematicas": ["Cinética química"]},
        {"id": 12, "descripcion": "Utiliza el concepto de mol para cuantificar la materia.", "tematicas": ["El Mol", "Estequiometría básica"]},
        {"id": 13, "descripcion": "Analiza la importancia de los recursos naturales y su transformación sintética.", "tematicas": ["Recursos naturales", "Materiales sintéticos"]},
        {"id": 14, "descripcion": "Reflexiona sobre el impacto ambiental de los procesos químicos y el desarrollo sostenible.", "tematicas": ["Química verde", "Impacto ambiental"]}
    ]
})

# 5. HUMANIDADES I
catalogo.append({
    "materia": "Humanidades I",
    "semestre": 1,
    "metadata": { "nombre_uac": "HUMANIDADES I", "semestre": 1, "creditos": 6, "horas_semanales": 3 },
    "progresiones": [
        {"id": 1, "descripcion": "Explora a partir de la pregunta '¿Por qué estoy aquí?' para acercarse a los saberes, recursos y prácticas filosóficas.", "tematicas": ["Asombro filosófico", "El cuestionamiento"]},
        {"id": 2, "descripcion": "Reconoce la experiencia de sí misma/o analizando discursos clásicos y contemporáneos.", "tematicas": ["Conocimiento de sí mismo"]},
        {"id": 3, "descripcion": "Pone en cuestión la manera en que los otros dan sentido a su realidad.", "tematicas": ["Alteridad", "El Otro"]},
        {"id": 4, "descripcion": "Cuestiona cómo sus pasiones y virtudes configuran su propia experiencia.", "tematicas": ["Pasiones", "Virtudes", "Ética"]},
        {"id": 5, "descripcion": "Reflexiona sobre la vida buena y la felicidad desde diversas perspectivas.", "tematicas": ["Eudaimonía", "Felicidad", "Vida buena"]},
        {"id": 6, "descripcion": "Analiza la relación entre el placer y la vida buena.", "tematicas": ["Hedonismo", "Placer vs Felicidad"]},
        {"id": 7, "descripcion": "Examina la validez de los argumentos y las falacias en discursos cotidianos.", "tematicas": ["Lógica", "Argumentación", "Falacias"]},
        {"id": 8, "descripcion": "Identifica los fines de la argumentación en diferentes contextos.", "tematicas": ["Debate", "Persuasión"]},
        {"id": 9, "descripcion": "Reflexiona sobre la libertad y la responsabilidad.", "tematicas": ["Libertad", "Determinismo", "Responsabilidad"]},
        {"id": 10, "descripcion": "Comprende el sentido de la vida desde una perspectiva humanista.", "tematicas": ["Sentido de la vida", "Existencialismo"]}
    ]
})

# 6. CIENCIAS SOCIALES I
catalogo.append({
    "materia": "Ciencias Sociales I",
    "semestre": 1,
    "metadata": { "nombre_uac": "CIENCIAS SOCIALES I", "semestre": 1, "creditos": 4, "horas_semanales": 2 },
    "progresiones": [
        {"id": 1, "descripcion": "Reconoce sus necesidades materiales (vitales y no vitales) personales, familiares y de su comunidad para comprender y explicar la forma en que se satisfacen.", "tematicas": ["Necesidades humanas", "Satisfactores"]},
        {"id": 2, "descripcion": "Identifica los procesos de producción y distribución vigentes en su comunidad.", "tematicas": ["Producción", "Distribución", "Economía local"]},
        {"id": 3, "descripcion": "Distingue las características de las formas de producción: esclavismo, feudalismo, capitalismo y socialismo.", "tematicas": ["Modos de producción", "Historia económica"]},
        {"id": 4, "descripcion": "Define qué es el Estado y comprende su función en la sociedad.", "tematicas": ["El Estado", "Gobierno", "Instituciones"]},
        {"id": 5, "descripcion": "Analiza la relación entre el ciudadano y el Estado: derechos y obligaciones.", "tematicas": ["Ciudadanía", "Contrato social"]},
        {"id": 6, "descripcion": "Identifica las estructuras sociales: familia, escuela, comunidad.", "tematicas": ["Estructura social", "Instituciones sociales"]},
        {"id": 7, "descripcion": "Comprende el concepto de desigualdad social y sus manifestaciones.", "tematicas": ["Desigualdad", "Pobreza", "Clases sociales"]},
        {"id": 8, "descripcion": "Analiza el papel de las normas sociales y jurídicas en la convivencia.", "tematicas": ["Normas", "Leyes", "Derecho"]},
        {"id": 9, "descripcion": "Reflexiona sobre la diversidad cultural y la identidad.", "tematicas": ["Cultura", "Diversidad", "Identidad"]},
        {"id": 10, "descripcion": "Identifica problemas sociales contemporáneos en su entorno.", "tematicas": ["Problemas sociales", "Comunidad"]},
        {"id": 11, "descripcion": "Comprende la importancia de la participación ciudadana.", "tematicas": ["Participación", "Democracia"]},
        {"id": 12, "descripcion": "Analiza la relación entre bienestar y organización social.", "tematicas": ["Bienestar social", "Organización"]}
    ]
})

# 7. INGLÉS I
catalogo.append({
    "materia": "Inglés I",
    "semestre": 1,
    "metadata": { "nombre_uac": "LENGUA EXTRANJERA INGLÉS I", "semestre": 1, "creditos": 6, "horas_semanales": 3 },
    "progresiones": [
        {"id": 1, "descripcion": "Comprende y utiliza el verbo 'to be' en presente simple para dar y pedir información personal.", "tematicas": ["Verb to be", "Personal information"]},
        {"id": 2, "descripcion": "Utiliza los pronombres personales y adjetivos posesivos.", "tematicas": ["Subject pronouns", "Possessive adjectives"]},
        {"id": 3, "descripcion": "Describe su entorno inmediato utilizando vocabulario básico y preposiciones de lugar.", "tematicas": ["Prepositions of place", "Classroom objects"]},
        {"id": 4, "descripcion": "Expresa la existencia de objetos y personas singulares y plurales (There is/There are).", "tematicas": ["There is / There are", "Plurals"]},
        {"id": 5, "descripcion": "Utiliza los artículos definidos e indefinidos (a/an/the) correctamente.", "tematicas": ["Articles"]},
        {"id": 6, "descripcion": "Describe características físicas y de personalidad usando adjetivos calificativos.", "tematicas": ["Adjectives", "Physical description"]},
        {"id": 7, "descripcion": "Utiliza los adjetivos demostrativos (this/that/these/those).", "tematicas": ["Demonstratives"]},
        {"id": 8, "descripcion": "Expresa posesión utilizando el genitivo sajón ('s) y adjetivos posesivos.", "tematicas": ["Possessive 's"]},
        {"id": 9, "descripcion": "Formula preguntas simples con Wh- questions.", "tematicas": ["Wh- questions"]},
        {"id": 10, "descripcion": "Comprende y utiliza el Presente Simple para hablar de hechos generales.", "tematicas": ["Simple Present (affirmative)"]},
        {"id": 11, "descripcion": "Utiliza el Presente Simple en formas negativa e interrogativa.", "tematicas": ["Simple Present (negative/interrogative)"]},
        {"id": 12, "descripcion": "Expresa gustos y preferencias (like/love/hate).", "tematicas": ["Likes and dislikes"]},
        {"id": 13, "descripcion": "Habla sobre la familia y relaciones de parentesco.", "tematicas": ["Family members"]},
        {"id": 14, "descripcion": "Describe ocupaciones y profesiones.", "tematicas": ["Occupations"]},
        {"id": 15, "descripcion": "Identifica y utiliza números cardinales y ordinales.", "tematicas": ["Numbers", "Dates"]},
        {"id": 16, "descripcion": "Comprende textos breves y sencillos sobre temas familiares.", "tematicas": ["Reading comprehension"]}
    ]
})

# ==========================================
# SEMESTRE 2
# ==========================================

# 8. PENSAMIENTO MATEMÁTICO II
catalogo.append({
    "materia": "Pensamiento Matemático II",
    "semestre": 2,
    "metadata": { "nombre_uac": "PENSAMIENTO MATEMÁTICO II", "semestre": 2, "creditos": 8, "horas_semanales": 4 },
    "progresiones": [
        {"id": 1, "descripcion": "Compara cualitativamente dos o más eventos para determinar cuál es más probable o si son equiprobables.", "tematicas": ["Probabilidad intuitiva"]},
        {"id": 2, "descripcion": "Calcula la probabilidad teórica de eventos simples en experimentos aleatorios.", "tematicas": ["Probabilidad clásica"]},
        {"id": 3, "descripcion": "Distingue entre eventos mutuamente excluyentes y no excluyentes, y calcula sus probabilidades.", "tematicas": ["Eventos excluyentes", "Regla de la suma"]},
        {"id": 4, "descripcion": "Distingue entre eventos independientes y dependientes, y utiliza la regla del producto.", "tematicas": ["Independencia", "Regla del producto"]},
        {"id": 5, "descripcion": "Utiliza el lenguaje algebraico para representar patrones y relaciones.", "tematicas": ["Lenguaje algebraico"]},
        {"id": 6, "descripcion": "Opera con expresiones algebraicas (suma, resta, multiplicación).", "tematicas": ["Operaciones algebraicas"]},
        {"id": 7, "descripcion": "Resuelve ecuaciones lineales de una variable y las interpreta gráficamente.", "tematicas": ["Ecuaciones lineales"]},
        {"id": 8, "descripcion": "Resuelve sistemas de dos ecuaciones lineales con dos variables.", "tematicas": ["Sistemas de ecuaciones 2x2"]},
        {"id": 9, "descripcion": "Resuelve ecuaciones cuadráticas completas e incompletas por diversos métodos.", "tematicas": ["Ecuaciones cuadráticas"]},
        {"id": 10, "descripcion": "Identifica y analiza las características de figuras geométricas (polígonos).", "tematicas": ["Polígonos"]},
        {"id": 11, "descripcion": "Calcula perímetros y áreas de figuras compuestas.", "tematicas": ["Áreas y perímetros"]},
        {"id": 12, "descripcion": "Aplica el Teorema de Tales y la semejanza de triángulos.", "tematicas": ["Semejanza", "Teorema de Tales"]},
        {"id": 13, "descripcion": "Aplica el Teorema de Pitágoras en la resolución de problemas.", "tematicas": ["Teorema de Pitágoras"]},
        {"id": 14, "descripcion": "Utiliza las razones trigonométricas (seno, coseno, tangente) en triángulos rectángulos.", "tematicas": ["Trigonometría básica"]}
    ]
})

# 9. LENGUA Y COMUNICACIÓN II
catalogo.append({
    "materia": "Lengua y Comunicación II",
    "semestre": 2,
    "metadata": { "nombre_uac": "LENGUA Y COMUNICACIÓN II", "semestre": 2, "creditos": 6, "horas_semanales": 3 },
    "progresiones": [
        {"id": 1, "descripcion": "Comprende qué es el ensayo, sus características, estructura y tipos.", "tematicas": ["El Ensayo"]},
        {"id": 2, "descripcion": "Distingue entre opinión, postura y argumento.", "tematicas": ["Argumentación"]},
        {"id": 3, "descripcion": "Identifica las premisas y conclusiones en un argumento.", "tematicas": ["Estructura del argumento"]},
        {"id": 4, "descripcion": "Analiza textos argumentativos e identifica su tesis.", "tematicas": ["Lectura argumentativa"]},
        {"id": 5, "descripcion": "Utiliza los diferentes tipos de argumentos (autoridad, datos, ejemplos).", "tematicas": ["Tipos de argumentos"]},
        {"id": 6, "descripcion": "Comprende y evita el uso de falacias en su argumentación.", "tematicas": ["Falacias argumentativas"]},
        {"id": 7, "descripcion": "Redacta un ensayo breve sobre un tema de interés.", "tematicas": ["Escritura de ensayo"]},
        {"id": 8, "descripcion": "Utiliza citas textuales y referencias bibliográficas (APA) para fundamentar sus ideas.", "tematicas": ["Citas y Referencias", "APA"]},
        {"id": 9, "descripcion": "Realiza exposiciones orales argumentativas.", "tematicas": ["Exposición oral"]},
        {"id": 10, "descripcion": "Participa en debates respetando las reglas de intervención y escucha activa.", "tematicas": ["Debate"]},
        {"id": 11, "descripcion": "Analiza discursos públicos para evaluar su efectividad persuasiva.", "tematicas": ["Análisis del discurso"]},
        {"id": 12, "descripcion": "Utiliza medios digitales para difundir sus textos argumentativos.", "tematicas": ["Medios digitales"]},
        {"id": 13, "descripcion": "Reflexiona sobre la ética en la comunicación y la argumentación.", "tematicas": ["Ética comunicativa"]}
    ]
})

# 10. CONSERVACIÓN DE LA ENERGÍA
catalogo.append({
    "materia": "Conservación de la Energía",
    "semestre": 2,
    "metadata": { "nombre_uac": "CONSERVACIÓN DE LA ENERGÍA Y SUS INTERACCIONES CON LA MATERIA", "semestre": 2, "creditos": 8, "horas_semanales": 4 },
    "progresiones": [
        {"id": 1, "descripcion": "La energía se conserva, no se crea ni se destruye, solo se transforma.", "tematicas": ["Ley de conservación de la energía"]},
        {"id": 2, "descripcion": "Identifica diversas formas de energía (cinética, potencial, térmica, eléctrica).", "tematicas": ["Formas de energía"]},
        {"id": 3, "descripcion": "Calcula la energía cinética y potencial en sistemas mecánicos.", "tematicas": ["Energía Mecánica"]},
        {"id": 4, "descripcion": "Comprende el concepto de trabajo mecánico y su relación con la energía.", "tematicas": ["Trabajo y Potencia"]},
        {"id": 5, "descripcion": "Analiza la transferencia de calor y el equilibrio térmico.", "tematicas": ["Calor y Temperatura"]},
        {"id": 6, "descripcion": "Explica el funcionamiento de máquinas térmicas simples.", "tematicas": ["Máquinas térmicas"]},
        {"id": 7, "descripcion": "Analiza fenómenos eléctricos y magnéticos.", "tematicas": ["Electricidad y Magnetismo"]},
        {"id": 8, "descripcion": "Comprende los circuitos eléctricos básicos (serie y paralelo).", "tematicas": ["Circuitos eléctricos"]},
        {"id": 9, "descripcion": "Analiza la generación y consumo de energía eléctrica.", "tematicas": ["Generación de energía"]},
        {"id": 10, "descripcion": "Evalúa fuentes de energía renovables y no renovables.", "tematicas": ["Fuentes de energía", "Sustentabilidad"]},
        {"id": 11, "descripcion": "Reflexiona sobre la eficiencia energética y el ahorro de energía.", "tematicas": ["Eficiencia energética"]},
        {"id": 12, "descripcion": "Analiza el impacto social y ambiental del uso de la energía.", "tematicas": ["Impacto ambiental"]}
    ]
})

# 11. CULTURA DIGITAL II (Ya tenías la versión full, la simplifico aquí para estandarizar estructura, 
# pero idealmente usarías la versión detallada anterior. Pongo los datos oficiales reales)
catalogo.append({
    "materia": "Cultura Digital II",
    "semestre": 2,
    "metadata": { "nombre_uac": "CULTURA DIGITAL II", "semestre": 2, "creditos": 4, "horas_semanales": 2 },
    "progresiones": [
        {"id": 1, "descripcion": "Utiliza herramientas de comunicación y colaboración para la solución de problemas.", "tematicas": ["Herramientas colaborativas"]},
        {"id": 2, "descripcion": "Representa información a través de software de aplicación (Hojas de cálculo avanzadas).", "tematicas": ["Excel intermedio/avanzado"]},
        {"id": 3, "descripcion": "Crea contenidos digitales y multimedia (edición de video, audio, imagen).", "tematicas": ["Edición multimedia"]},
        {"id": 4, "descripcion": "Desarrolla estrategias para la gestión de su identidad y reputación digital.", "tematicas": ["Identidad digital"]},
        {"id": 5, "descripcion": "Aplica el pensamiento computacional y algoritmos para la programación básica.", "tematicas": ["Programación", "Coding"]},
        {"id": 6, "descripcion": "Conoce los principios de funcionamiento de redes y conectividad.", "tematicas": ["Redes", "Internet"]},
        {"id": 7, "descripcion": "Analiza el impacto de la tecnología en el desarrollo humano y social.", "tematicas": ["Tecnología y sociedad"]}
    ]
})

# 12. CIENCIAS SOCIALES II
catalogo.append({
    "materia": "Ciencias Sociales II",
    "semestre": 2,
    "metadata": { "nombre_uac": "CIENCIAS SOCIALES II", "semestre": 2, "creditos": 4, "horas_semanales": 2 },
    "progresiones": [
        {"id": 1, "descripcion": "Analiza las características del sistema económico actual y su impacto local.", "tematicas": ["Economía actual", "Globalización"]},
        {"id": 2, "descripcion": "Identifica los agentes económicos: familia, empresas y Estado.", "tematicas": ["Agentes económicos"]},
        {"id": 3, "descripcion": "Comprende el funcionamiento del mercado: oferta y demanda.", "tematicas": ["Mercado", "Oferta y Demanda"]},
        {"id": 4, "descripcion": "Analiza el papel del dinero y el sistema financiero.", "tematicas": ["Dinero", "Bancos"]},
        {"id": 5, "descripcion": "Reflexiona sobre el trabajo, el empleo y el salario.", "tematicas": ["Mercado laboral"]},
        {"id": 6, "descripcion": "Identifica las funciones de la administración pública.", "tematicas": ["Administración pública"]},
        {"id": 7, "descripcion": "Analiza políticas públicas que atienden problemas sociales.", "tematicas": ["Políticas públicas"]},
        {"id": 8, "descripcion": "Comprende la estructura política del sistema mexicano.", "tematicas": ["Sistema político mexicano"]},
        {"id": 9, "descripcion": "Reflexiona sobre la participación democrática y electoral.", "tematicas": ["Democracia", "Elecciones"]},
        {"id": 10, "descripcion": "Analiza los movimientos sociales y su impacto en el cambio social.", "tematicas": ["Movimientos sociales"]}
    ]
})

# 13. HUMANIDADES II
catalogo.append({
    "materia": "Humanidades II",
    "semestre": 2,
    "metadata": { "nombre_uac": "HUMANIDADES II", "semestre": 2, "creditos": 6, "horas_semanales": 3 },
    "progresiones": [
        {"id": 1, "descripcion": "Examina la experiencia de lo colectivo y la comunidad.", "tematicas": ["Comunidad", "Colectividad"]},
        {"id": 2, "descripcion": "Analiza las formas de organización política y social.", "tematicas": ["Política", "Sociedad"]},
        {"id": 3, "descripcion": "Reflexiona sobre la justicia y las leyes.", "tematicas": ["Justicia", "Legalidad"]},
        {"id": 4, "descripcion": "Cuestiona las relaciones de poder en la sociedad.", "tematicas": ["Poder", "Autoridad"]},
        {"id": 5, "descripcion": "Analiza la relación entre el individuo y el Estado.", "tematicas": ["Ciudadano y Estado"]},
        {"id": 6, "descripcion": "Explora conceptos de utopía y distopía social.", "tematicas": ["Utopía", "Futuro social"]},
        {"id": 7, "descripcion": "Reflexiona sobre la guerra, la paz y la violencia.", "tematicas": ["Paz y Violencia"]},
        {"id": 8, "descripcion": "Analiza el impacto de la tecnología en la humanidad.", "tematicas": ["Tecnología y Humanismo"]},
        {"id": 9, "descripcion": "Reflexiona sobre el arte y la estética como formas de expresión humana.", "tematicas": ["Arte", "Estética"]}
    ]
})

# 14. INGLÉS II
catalogo.append({
    "materia": "Inglés II",
    "semestre": 2,
    "metadata": { "nombre_uac": "LENGUA EXTRANJERA INGLÉS II", "semestre": 2, "creditos": 6, "horas_semanales": 3 },
    "progresiones": [
        {"id": 1, "descripcion": "Describe acciones que están sucediendo en el momento (Present Continuous).", "tematicas": ["Present Continuous"]},
        {"id": 2, "descripcion": "Compara el uso del Presente Simple con el Presente Continuo.", "tematicas": ["Simple Present vs Continuous"]},
        {"id": 3, "descripcion": "Expresa habilidades y posibilidades (Can/Can't).", "tematicas": ["Modal verb Can"]},
        {"id": 4, "descripcion": "Habla sobre eventos pasados usando el verbo To Be en pasado (Was/Were).", "tematicas": ["Past of To Be"]},
        {"id": 5, "descripcion": "Describe eventos terminados en el pasado usando verbos regulares e irregulares (Simple Past).", "tematicas": ["Simple Past (Regular/Irregular)"]},
        {"id": 6, "descripcion": "Utiliza expresiones de tiempo pasado (yesterday, last week, ago).", "tematicas": ["Time expressions"]},
        {"id": 7, "descripcion": "Formula preguntas en pasado simple (Did).", "tematicas": ["Questions in Past"]},
        {"id": 8, "descripcion": "Utiliza sustantivos contables e incontables y cuantificadores (some, any, much, many).", "tematicas": ["Countable/Uncountable", "Quantifiers"]},
        {"id": 9, "descripcion": "Expresa planes futuros e intenciones (Going to).", "tematicas": ["Future with Going to"]},
        {"id": 10, "descripcion": "Comprende y da instrucciones sencillas (Imperatives).", "tematicas": ["Imperatives", "Directions"]}
    ]
})

# Guardar archivo oficial
with open("data/programas_sep.json", "w", encoding="utf-8") as f:
    json.dump(catalogo, f, ensure_ascii=False, indent=2)

print(f"✅ Catálogo OFICIAL generado: {len(catalogo)} materias completas.")
