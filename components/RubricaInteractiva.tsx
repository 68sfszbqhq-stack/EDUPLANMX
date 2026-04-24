import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const criteria = [
    {
        id: 'sueno',
        title: 'Dimensión 1: Análisis del Sueño',
        options: [
            { level: 'Excelente', points: 10, desc: 'Preguntas profundas sobre hábitos, entorno y el impacto de la tecnología antes de dormir.' },
            { level: 'Bueno', points: 8, desc: 'Incluye horarios y hábitos comunes, pero falta mencionar el factor digital.' },
            { level: 'Regular', points: 6, desc: 'Preguntas muy generales (ej: ¿duermes bien?) sin explorar causas o frecuencia.' },
            { level: 'Insuficiente', points: 0, desc: 'Faltan preguntas sobre el sueño o no son relevantes.' }
        ]
    },
    {
        id: 'salud',
        title: 'Dimensión 2: Salud Mental (Estrés/Ansiedad)',
        options: [
            { level: 'Excelente', points: 10, desc: 'Identifica indicadores claros de estrés y ansiedad sin ser invasivo. Lenguaje empático.' },
            { level: 'Bueno', points: 8, desc: 'Cubre emociones básicas pero algunas preguntas son redundantes.' },
            { level: 'Regular', points: 6, desc: 'Preguntas de "si/no" que no permiten medir la intensidad de los síntomas.' },
            { level: 'Insuficiente', points: 0, desc: 'Las preguntas no ayudan a identificar estados de ánimo o riesgos.' }
        ]
    },
    {
        id: 'escala',
        title: 'Metodología: Escala de Medición',
        options: [
            { level: 'Excelente', points: 10, desc: 'Usa escalas Likert claras (ej: Nunca a Siempre) ideales para el análisis de datos.' },
            { level: 'Bueno', points: 8, desc: 'Usa escalas pero los valores numéricos no están bien definidos.' },
            { level: 'Regular', points: 6, desc: 'Mezcla formatos de respuesta, lo que dificultará crear gráficas después.' },
            { level: 'Insuficiente', points: 0, desc: 'Respuestas abiertas o sin estructura de medición.' }
        ]
    },
    {
        id: 'claridad',
        title: 'Claridad y Lenguaje',
        options: [
            { level: 'Excelente', points: 10, desc: 'Redacción impecable, clara para alumnos y sin errores.' },
            { level: 'Bueno', points: 8, desc: 'Se entiende bien, aunque algunas preguntas son demasiado largas.' },
            { level: 'Regular', points: 6, desc: 'Lenguaje muy técnico o rebuscado que puede confundir al encuestado.' },
            { level: 'Insuficiente', points: 0, desc: 'Muchas faltas de ortografía o redacción incomprensible.' }
        ]
    },
    {
        id: 'etica',
        title: 'Ética y Protección de Datos',
        options: [
            { level: 'Excelente', points: 10, desc: 'Garantiza el anonimato y explica claramente que los datos son para ayudar.' },
            { level: 'Bueno', points: 8, desc: 'Menciona el uso de datos pero no profundiza en la confidencialidad.' },
            { level: 'Regular', points: 6, desc: 'Aviso de privacidad muy breve o poco convincente.' },
            { level: 'Insuficiente', points: 0, desc: 'No menciona qué pasará con la información personal recolectada.' }
        ]
    }
];

export const RubricaInteractiva: React.FC = () => {
    const [selections, setSelections] = useState<Record<string, number>>({});
    const [average, setAverage] = useState(0);

    const handleSelect = (criteriaId: string, points: number) => {
        const newSelections = { ...selections, [criteriaId]: points };
        setSelections(newSelections);

        const values = Object.values(newSelections);
        const sum = values.reduce((a, b) => a + b, 0);
        setAverage(sum / criteria.length);
    };

    const getScoreColor = () => {
        if (average >= 9) return 'text-emerald-500';
        if (average >= 7) return 'text-indigo-500';
        return 'text-rose-500';
    };

    return (
        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 text-slate-100 font-sans print:bg-white print:text-black print:shadow-none print:border-none">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 print:text-black">
                    Evaluador de Alertas Digitales
                </h1>
                <p className="text-slate-400 print:text-slate-600">
                    Taller de Cultura Digital - Diseño del Test de Bienestar
                </p>
            </header>

            <div className="space-y-8">
                {criteria.map((item) => (
                    <div key={item.id} className="border-b border-slate-800 pb-6 last:border-0 print:border-slate-300">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white print:text-slate-900">
                            <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                            {item.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {item.options.map((opt, idx) => {
                                const isSelected = selections[item.id] === opt.points;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelect(item.id, opt.points)}
                                        className={`p-4 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-center min-h-[100px]
                                            ${isSelected 
                                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-transparent shadow-lg shadow-indigo-500/30 scale-[1.02] print:bg-slate-200 print:border-black print:text-black' 
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 print:bg-white print:border-slate-300'
                                            }
                                        `}
                                    >
                                        <div className={`font-black text-xs uppercase tracking-wider mb-2 ${isSelected ? 'text-white print:text-black' : 'text-indigo-400 print:text-indigo-700'}`}>
                                            {opt.level} ({opt.points} pts)
                                        </div>
                                        <div className={`text-xs leading-relaxed ${isSelected ? 'text-indigo-100 print:text-slate-800' : 'text-slate-400 print:text-slate-600'}`}>
                                            {opt.desc}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6 print:hidden">
                <div className="flex items-baseline gap-3">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Puntaje Final:</span>
                    <span className={`text-4xl font-black transition-colors duration-500 ${getScoreColor()}`}>
                        {average.toFixed(1)}
                    </span>
                    <span className="text-xl font-bold text-slate-600">/ 10</span>
                </div>
                <button 
                    onClick={() => window.print()}
                    className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-xl"
                >
                    <Download className="w-4 h-4" />
                    Guardar PDF de Evaluación
                </button>
            </div>
        </div>
    );
};
