import React, { useState, useEffect } from 'react';
import { db } from '../../src/config/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../src/contexts/AuthContext';
import { Leaf, Sun, CheckCircle2, User, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { RubricaInteractiva } from '../../components/RubricaInteractiva';
import { VisualizacionFicha12 } from '../../components/VisualizacionFicha12';

const Ficha12: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(1);
    const [loading, setLoading] = useState(false);
    const [savedData, setSavedData] = useState<any>(null);

    // Form states
    const [arbol, setArbol] = useState({ raices: '', tronco: '', copa: '' });
    const [huella, setHuella] = useState('');
    const [reflexion, setReflexion] = useState('');
    const [mapaSol, setMapaSol] = useState({ identidad: '', areas: '', acciones: '' });

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                const q = query(collection(db, 'fichas12'), where('userId', '==', user.id));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const data = querySnapshot.docs[0].data();
                    setSavedData(data);
                    if (data.arbol) setArbol(data.arbol);
                    if (data.huella) setHuella(data.huella);
                    if (data.reflexion) setReflexion(data.reflexion);
                    if (data.mapaSol) setMapaSol(data.mapaSol);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [user]);

    const handleSave = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const dataToSave = {
                userId: user.id,
                userName: user.nombre || 'Usuario',
                arbol,
                huella,
                reflexion,
                mapaSol,
                updatedAt: new Date()
            };
            await addDoc(collection(db, 'fichas12'), dataToSave);
            alert("Respuestas guardadas exitosamente");
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Error al guardar las respuestas");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <BookOpen className="text-indigo-600" />
                        Ficha 12: Reflexión sobre la práctica
                    </h1>
                    <p className="text-slate-600 mt-2 text-lg">
                        Reflexionar de manera crítica y sistemática sobre las motivaciones, características e identidad profesional que orientan la labor docente.
                    </p>
                </header>

                <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    {[
                        { id: 1, title: '1. Árbol de Vida', icon: Leaf },
                        { id: 2, title: '2. Huella Docente', icon: User },
                        { id: 3, title: '3. Autoevaluación', icon: CheckCircle2 },
                        { id: 4, title: '4. Texto Reflexivo', icon: BookOpen },
                        { id: 5, title: '5. Mapa de Sol', icon: Sun },
                        { id: 6, title: 'Final: Mi Visualización', icon: Sparkles }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.title}
                        </button>
                    ))}
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    {activeTab === 1 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-2xl font-bold text-slate-800">1. Descripción – Sensibilización</h2>
                            <p className="text-slate-600">Elabora tu árbol de la vida docente o cartografía de motivaciones.</p>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Raíces (Origen personal y experiencias significativas)</label>
                                <textarea 
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 h-32"
                                    value={arbol.raices}
                                    onChange={e => setArbol({...arbol, raices: e.target.value})}
                                    placeholder="¿De dónde viene tu motivación para ser docente?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tronco (Cualidades personales, rasgos profesionales)</label>
                                <textarea 
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 h-32"
                                    value={arbol.tronco}
                                    onChange={e => setArbol({...arbol, tronco: e.target.value})}
                                    placeholder="¿Cuáles son tus fortalezas y cualidades que sostienen tu práctica?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Copa (Proyecciones futuras)</label>
                                <textarea 
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 h-32"
                                    value={arbol.copa}
                                    onChange={e => setArbol({...arbol, copa: e.target.value})}
                                    placeholder="¿Hacia dónde quieres crecer profesionalmente?"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 2 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-2xl font-bold text-slate-800">2. Resignificación – Profesores que dejan marca</h2>
                            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 mb-4">
                                <AlertCircle className="shrink-0" />
                                <p>Después de ver la charla TED "Profesores que dejan marca", elabora tu huella gráfica.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Rasgos presentes o deseables en tu práctica (Huella del docente)</label>
                                <textarea 
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 h-48"
                                    value={huella}
                                    onChange={e => setHuella(e.target.value)}
                                    placeholder="Lista las cualidades de un docente que deja huella y cómo las integras o integrarás en tu práctica..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 3 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-2xl font-bold text-slate-800">3. Confrontación – Autoevaluación</h2>
                            <RubricaInteractiva />
                        </div>
                    )}

                    {activeTab === 4 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-2xl font-bold text-slate-800">4. Reconstrucción – Texto Reflexivo</h2>
                            <p className="text-slate-600">Elabora un texto reflexivo (media cuartilla) sobre la práctica del semestre A y propósitos de mejora para el semestre B.</p>
                            <div>
                                <textarea 
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 h-64"
                                    value={reflexion}
                                    onChange={e => setReflexion(e.target.value)}
                                    placeholder="Escribe aquí tu reflexión..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 5 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Sun className="text-amber-500" />
                                Producto Final: Mapa de Sol
                            </h2>
                            <p className="text-slate-600 mb-6">Resignificación del quehacer docente integrando aprendizajes previos.</p>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Identidad Docente (Centro del sol)</label>
                                        <textarea 
                                            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:amber-500 h-32"
                                            value={mapaSol.identidad}
                                            onChange={e => setMapaSol({...mapaSol, identidad: e.target.value})}
                                            placeholder="¿Quién soy como docente hoy?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Áreas de Oportunidad (Rayos a transformar)</label>
                                        <textarea 
                                            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:amber-500 h-32"
                                            value={mapaSol.areas}
                                            onChange={e => setMapaSol({...mapaSol, areas: e.target.value})}
                                            placeholder="¿Qué aspectos necesito mejorar?"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Acciones de Mejora Semestre B (Nuevos rayos)</label>
                                    <textarea 
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:amber-500 h-[290px]"
                                        value={mapaSol.acciones}
                                        onChange={e => setMapaSol({...mapaSol, acciones: e.target.value})}
                                        placeholder="Acciones concretas que implementaré..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 6 && (
                        <VisualizacionFicha12 data={{ arbol, huella, reflexion, mapaSol }} />
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
                        >
                            {loading ? 'Guardando...' : 'Guardar Progreso'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ficha12;
