import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

/**
 * Aviso de privacidad (LFPDPPP).
 * IMPORTANTE: es una base redactada de buena fe, no asesoría legal.
 * Los datos entre [corchetes] debe completarlos el responsable.
 */
const AvisoPrivacidad: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-3xl mx-auto px-6 py-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 mb-8"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver
                </button>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 space-y-6 text-slate-700 text-sm leading-relaxed">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Aviso de Privacidad</h1>
                    </div>

                    <p className="text-xs text-slate-400">Última actualización: julio de 2026</p>

                    <section>
                        <h2 className="font-bold text-slate-900 mb-2">1. Responsable del tratamiento</h2>
                        <p>
                            EduPlan MX es un proyecto educativo sin fines de lucro, desarrollado y administrado por
                            [José Roberto Mendoza — completa nombre completo], docente del Bachillerato General Oficial
                            "Carlos Camacho Espíritu" (Puebla, Pue.), con correo de contacto para asuntos de privacidad:
                            [tu correo de contacto].
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold text-slate-900 mb-2">2. Datos que recabamos</h2>
                        <p className="mb-2"><span className="font-semibold">De docentes y directivos (con cuenta):</span> nombre,
                            apellidos, correo electrónico, escuela de adscripción, puesto, materias que imparte y,
                            opcionalmente, teléfono.</p>
                        <p><span className="font-semibold">De estudiantes (cuestionario socioeducativo):</span> nombre, CURP,
                            grado y grupo, datos de contacto familiar, y datos de contexto socioeconómico y familiar.
                            Algunos de estos son <span className="font-semibold">datos personales sensibles</span>; se recaban
                            únicamente con fines de diagnóstico educativo y con la protesta de veracidad del propio formulario.
                            Tratándose de menores de edad, corresponde a la institución educativa recabar el consentimiento
                            de madres, padres o tutores.</p>
                    </section>

                    <section>
                        <h2 className="font-bold text-slate-900 mb-2">3. Finalidades</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Elaborar el diagnóstico socioeducativo del grupo y del plantel (PAEC/PMC).</li>
                            <li>Contextualizar las planeaciones didácticas del profesorado.</li>
                            <li>Gestionar cuentas de usuarios docentes y directivos.</li>
                            <li>Estadística educativa interna, siempre en forma agregada y sin identificar personas.</li>
                        </ul>
                        <p className="mt-2">No usamos los datos con fines comerciales, publicitarios ni de perfilado.</p>
                    </section>

                    <section>
                        <h2 className="font-bold text-slate-900 mb-2">4. Inteligencia artificial</h2>
                        <p>
                            La plataforma genera planeaciones con servicios de IA (Google Gemini). A esos servicios se envía
                            únicamente información pedagógica (contenidos curriculares, contexto escolar y resúmenes
                            <span className="font-semibold"> agregados y anónimos</span> del grupo). La plataforma instruye
                            expresamente no incluir datos personales identificables de estudiantes en dichos resúmenes.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold text-slate-900 mb-2">5. Almacenamiento y seguridad</h2>
                        <p>
                            Los datos se almacenan en Google Firebase (Firestore), con acceso restringido mediante
                            autenticación y reglas de seguridad: la información de estudiantes solo es legible por
                            personal educativo autenticado. Ninguna base de datos es infalible; reportaremos cualquier
                            incidente relevante a la comunidad afectada.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold text-slate-900 mb-2">6. Transferencias</h2>
                        <p>
                            No vendemos ni transferimos datos personales a terceros. Solo podrían comunicarse cuando lo
                            requiera una autoridad competente conforme a la ley, o a las autoridades educativas del
                            propio plantel en ejercicio de sus funciones.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold text-slate-900 mb-2">7. Derechos ARCO</h2>
                        <p>
                            Puedes solicitar el Acceso, Rectificación, Cancelación u Oposición al tratamiento de tus datos
                            (o de tu hija/o, si eres madre, padre o tutor) escribiendo a [tu correo de contacto], indicando
                            nombre y escuela. Responderemos en un plazo máximo de 20 días hábiles.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold text-slate-900 mb-2">8. Cambios a este aviso</h2>
                        <p>
                            Cualquier modificación se publicará en esta misma página, indicando la fecha de última
                            actualización.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AvisoPrivacidad;
