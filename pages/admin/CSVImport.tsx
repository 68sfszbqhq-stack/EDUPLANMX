import React, { useState } from 'react';
import {
    Upload, Download, FileText, Users, GraduationCap,
    CheckCircle, XCircle, AlertCircle, X, School
} from 'lucide-react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

interface School {
    id: string;
    nombre: string;
    codigo: string;
}

interface ImportResult {
    success: number;
    errors: number;
    warnings: number;
    details: {
        row: number;
        status: 'success' | 'error' | 'warning';
        message: string;
        data?: any;
    }[];
}

type ImportType = 'alumnos' | 'maestros';

export const CSVImport: React.FC = () => {
    const [importType, setImportType] = useState<ImportType>('alumnos');
    const [selectedSchool, setSelectedSchool] = useState<string>('');
    const [schools, setSchools] = useState<School[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [showResult, setShowResult] = useState(false);

    React.useEffect(() => {
        loadSchools();
    }, []);

    const loadSchools = async () => {
        try {
            const schoolsSnapshot = await getDocs(collection(db, 'schools'));
            const schoolsData = schoolsSnapshot.docs.map(doc => ({
                id: doc.id,
                nombre: doc.data().nombre,
                codigo: doc.data().codigo
            }));
            setSchools(schoolsData);
        } catch (error) {
            console.error('Error al cargar escuelas:', error);
        }
    };

    const generateAlumnosTemplate = () => {
        const headers = [
            'nombre',
            'apellidoPaterno',
            'apellidoMaterno',
            'matricula',
            'email',
            'grado',
            'grupo',
            'telefono',
            'fechaNacimiento'
        ];

        const examples = [
            'Juan,Pérez,García,2024001,juan.perez@ejemplo.com,1,A,3481234567,2008-05-15',
            'María,López,Martínez,2024002,maria.lopez@ejemplo.com,2,B,3481234568,2007-08-20',
            'Carlos,Sánchez,Rodríguez,2024003,carlos.sanchez@ejemplo.com,3,A,3481234569,2006-03-10'
        ];

        const csv = [headers.join(','), ...examples].join('\n');
        downloadCSV(csv, 'plantilla_alumnos.csv');
    };

    const generateMaestrosTemplate = () => {
        const headers = [
            'nombre',
            'apellidoPaterno',
            'apellidoMaterno',
            'email',
            'puesto',
            'telefono',
            'materias',
            'grados'
        ];

        const examples = [
            'Ana,Martínez,López,ana.martinez@ejemplo.com,Docente,3481234570,"Matemáticas;Física","1;2;3"',
            'Pedro,González,Hernández,pedro.gonzalez@ejemplo.com,Director,3481234571,"Administración",""',
            'Laura,Ramírez,Torres,laura.ramirez@ejemplo.com,Docente,3481234572,"Español;Literatura","2;3"'
        ];

        const csv = [headers.join(','), ...examples].join('\n');
        downloadCSV(csv, 'plantilla_maestros.csv');
    };

    const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const parseCSV = (text: string): string[][] => {
        const lines = text.split('\n').filter(line => line.trim());
        return lines.map(line => {
            const values: string[] = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            return values;
        });
    };

    const importAlumnos = async (rows: string[][]): Promise<ImportResult> => {
        const result: ImportResult = {
            success: 0,
            errors: 0,
            warnings: 0,
            details: []
        };

        const headers = rows[0].map(h => h.toLowerCase().trim());
        const dataRows = rows.slice(1);

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const rowNumber = i + 2; // +2 porque empezamos en 1 y saltamos el header

            try {
                const alumno: any = {};
                headers.forEach((header, index) => {
                    alumno[header] = row[index]?.trim() || '';
                });

                // Validaciones
                if (!alumno.nombre || !alumno.apellidopaterno || !alumno.matricula) {
                    result.errors++;
                    result.details.push({
                        row: rowNumber,
                        status: 'error',
                        message: 'Faltan campos obligatorios (nombre, apellidoPaterno, matricula)',
                        data: alumno
                    });
                    continue;
                }

                // Verificar si ya existe la matrícula
                const existingQuery = query(
                    collection(db, 'alumnos'),
                    where('matricula', '==', alumno.matricula),
                    where('schoolId', '==', selectedSchool)
                );
                const existing = await getDocs(existingQuery);

                if (!existing.empty) {
                    result.warnings++;
                    result.details.push({
                        row: rowNumber,
                        status: 'warning',
                        message: `Matrícula ${alumno.matricula} ya existe, se omitió`,
                        data: alumno
                    });
                    continue;
                }

                // Crear alumno
                await addDoc(collection(db, 'alumnos'), {
                    nombre: alumno.nombre,
                    apellidoPaterno: alumno.apellidopaterno,
                    apellidoMaterno: alumno.apellidomaterno || '',
                    matricula: alumno.matricula,
                    email: alumno.email || '',
                    grado: parseInt(alumno.grado) || 1,
                    grupo: alumno.grupo || 'A',
                    telefono: alumno.telefono || '',
                    fechaNacimiento: alumno.fechanacimiento || '',
                    schoolId: selectedSchool,
                    activo: true,
                    createdAt: new Date().toISOString()
                });

                result.success++;
                result.details.push({
                    row: rowNumber,
                    status: 'success',
                    message: `Alumno ${alumno.nombre} ${alumno.apellidopaterno} importado correctamente`,
                    data: alumno
                });

            } catch (error: any) {
                result.errors++;
                result.details.push({
                    row: rowNumber,
                    status: 'error',
                    message: `Error: ${error.message}`,
                    data: row
                });
            }
        }

        return result;
    };

    const importMaestros = async (rows: string[][]): Promise<ImportResult> => {
        const result: ImportResult = {
            success: 0,
            errors: 0,
            warnings: 0,
            details: []
        };

        const headers = rows[0].map(h => h.toLowerCase().trim());
        const dataRows = rows.slice(1);

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const rowNumber = i + 2;

            try {
                const maestro: any = {};
                headers.forEach((header, index) => {
                    maestro[header] = row[index]?.trim() || '';
                });

                // Validaciones
                if (!maestro.nombre || !maestro.apellidopaterno || !maestro.email) {
                    result.errors++;
                    result.details.push({
                        row: rowNumber,
                        status: 'error',
                        message: 'Faltan campos obligatorios (nombre, apellidoPaterno, email)',
                        data: maestro
                    });
                    continue;
                }

                // Verificar si ya existe el email
                const existingQuery = query(
                    collection(db, 'users'),
                    where('email', '==', maestro.email.toLowerCase())
                );
                const existing = await getDocs(existingQuery);

                if (!existing.empty) {
                    result.warnings++;
                    result.details.push({
                        row: rowNumber,
                        status: 'warning',
                        message: `Email ${maestro.email} ya existe, se omitió`,
                        data: maestro
                    });
                    continue;
                }

                // Procesar materias y grados
                const materias = maestro.materias
                    ? maestro.materias.split(';').map((m: string) => m.trim()).filter(Boolean)
                    : [];
                const grados = maestro.grados
                    ? maestro.grados.split(';').map((g: string) => parseInt(g.trim())).filter(Boolean)
                    : [];

                const schoolData = schools.find(s => s.id === selectedSchool);

                // Crear usuario maestro
                await addDoc(collection(db, 'users'), {
                    email: maestro.email.toLowerCase(),
                    nombre: maestro.nombre,
                    apellidoPaterno: maestro.apellidopaterno,
                    apellidoMaterno: maestro.apellidomaterno || '',
                    rol: 'maestro',
                    schoolId: selectedSchool,
                    schoolName: schoolData?.nombre || '',
                    puesto: maestro.puesto || 'Docente',
                    telefono: maestro.telefono || '',
                    materias: materias,
                    grados: grados,
                    activo: true,
                    onboardingCompleto: true,
                    createdAt: new Date().toISOString()
                });

                result.success++;
                result.details.push({
                    row: rowNumber,
                    status: 'success',
                    message: `Maestro ${maestro.nombre} ${maestro.apellidopaterno} importado correctamente`,
                    data: maestro
                });

            } catch (error: any) {
                result.errors++;
                result.details.push({
                    row: rowNumber,
                    status: 'error',
                    message: `Error: ${error.message}`,
                    data: row
                });
            }
        }

        return result;
    };

    const handleImport = async () => {
        if (!file) {
            alert('Por favor selecciona un archivo CSV');
            return;
        }

        if (!selectedSchool) {
            alert('Por favor selecciona una escuela');
            return;
        }

        setImporting(true);
        setResult(null);

        try {
            const text = await file.text();
            const rows = parseCSV(text);

            if (rows.length < 2) {
                alert('El archivo CSV está vacío o no tiene datos');
                setImporting(false);
                return;
            }

            let importResult: ImportResult;

            if (importType === 'alumnos') {
                importResult = await importAlumnos(rows);
            } else {
                importResult = await importMaestros(rows);
            }

            setResult(importResult);
            setShowResult(true);

        } catch (error: any) {
            console.error('Error al importar:', error);
            alert(`Error al procesar el archivo: ${error.message}`);
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Upload className="w-7 h-7 text-indigo-600" />
                    Importación Masiva CSV
                </h2>
                <p className="text-slate-600 mt-1">Importa alumnos o maestros desde archivos CSV</p>
            </div>

            {/* Tipo de Importación */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">1. Selecciona el Tipo de Importación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => setImportType('alumnos')}
                        className={`p-6 rounded-xl border-2 transition-all ${importType === 'alumnos'
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-slate-200 hover:border-indigo-300'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Users className={`w-6 h-6 ${importType === 'alumnos' ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <h4 className="font-bold text-slate-800">Alumnos</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                            Importa lista de alumnos con matrícula, grado y grupo
                        </p>
                    </button>

                    <button
                        onClick={() => setImportType('maestros')}
                        className={`p-6 rounded-xl border-2 transition-all ${importType === 'maestros'
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-slate-200 hover:border-indigo-300'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <GraduationCap className={`w-6 h-6 ${importType === 'maestros' ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <h4 className="font-bold text-slate-800">Maestros</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                            Importa lista de maestros con materias y grados
                        </p>
                    </button>
                </div>
            </div>

            {/* Descargar Plantilla */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">2. Descarga la Plantilla CSV</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Descarga la plantilla de ejemplo y llénala con tus datos. Incluye ejemplos para guiarte.
                </p>
                <button
                    onClick={importType === 'alumnos' ? generateAlumnosTemplate : generateMaestrosTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                    <Download className="w-5 h-5" />
                    Descargar Plantilla de {importType === 'alumnos' ? 'Alumnos' : 'Maestros'}
                </button>

                {/* Información de campos */}
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Campos del CSV
                    </h4>
                    {importType === 'alumnos' ? (
                        <ul className="text-sm text-slate-600 space-y-1">
                            <li>• <strong>nombre</strong> (obligatorio)</li>
                            <li>• <strong>apellidoPaterno</strong> (obligatorio)</li>
                            <li>• <strong>apellidoMaterno</strong></li>
                            <li>• <strong>matricula</strong> (obligatorio, único)</li>
                            <li>• <strong>email</strong></li>
                            <li>• <strong>grado</strong> (1-6)</li>
                            <li>• <strong>grupo</strong> (A, B, C, etc.)</li>
                            <li>• <strong>telefono</strong></li>
                            <li>• <strong>fechaNacimiento</strong> (YYYY-MM-DD)</li>
                        </ul>
                    ) : (
                        <ul className="text-sm text-slate-600 space-y-1">
                            <li>• <strong>nombre</strong> (obligatorio)</li>
                            <li>• <strong>apellidoPaterno</strong> (obligatorio)</li>
                            <li>• <strong>apellidoMaterno</strong></li>
                            <li>• <strong>email</strong> (obligatorio, único)</li>
                            <li>• <strong>puesto</strong> (Docente, Coordinador, etc.)</li>
                            <li>• <strong>telefono</strong></li>
                            <li>• <strong>materias</strong> (separadas por ;)</li>
                            <li>• <strong>grados</strong> (separados por ;)</li>
                        </ul>
                    )}
                </div>
            </div>

            {/* Seleccionar Escuela */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">3. Selecciona la Escuela</h3>
                <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                    >
                        <option value="">Selecciona una escuela</option>
                        {schools.map(school => (
                            <option key={school.id} value={school.id}>
                                {school.nombre} ({school.codigo})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Subir Archivo */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">4. Sube tu Archivo CSV</h3>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        {file ? (
                            <div>
                                <p className="text-lg font-semibold text-slate-800 mb-1">{file.name}</p>
                                <p className="text-sm text-slate-500">Click para cambiar archivo</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-lg font-semibold text-slate-800 mb-1">
                                    Click para seleccionar archivo CSV
                                </p>
                                <p className="text-sm text-slate-500">o arrastra y suelta aquí</p>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            {/* Botón de Importar */}
            <div className="flex justify-end">
                <button
                    onClick={handleImport}
                    disabled={!file || !selectedSchool || importing}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {importing ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Importando...
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            Importar {importType === 'alumnos' ? 'Alumnos' : 'Maestros'}
                        </>
                    )}
                </button>
            </div>

            {/* Modal de Resultados */}
            {showResult && result && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-800">Resultado de Importación</h3>
                                <button
                                    onClick={() => setShowResult(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Resumen */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <p className="text-sm font-medium text-green-600">Exitosos</p>
                                    </div>
                                    <p className="text-3xl font-bold text-green-900">{result.success}</p>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-5 h-5 text-amber-600" />
                                        <p className="text-sm font-medium text-amber-600">Advertencias</p>
                                    </div>
                                    <p className="text-3xl font-bold text-amber-900">{result.warnings}</p>
                                </div>

                                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                        <p className="text-sm font-medium text-red-600">Errores</p>
                                    </div>
                                    <p className="text-3xl font-bold text-red-900">{result.errors}</p>
                                </div>
                            </div>

                            {/* Detalles */}
                            <div>
                                <h4 className="font-bold text-slate-800 mb-3">Detalles de Importación</h4>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {result.details.map((detail, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg border ${detail.status === 'success'
                                                    ? 'bg-green-50 border-green-200'
                                                    : detail.status === 'warning'
                                                        ? 'bg-amber-50 border-amber-200'
                                                        : 'bg-red-50 border-red-200'
                                                }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {detail.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />}
                                                {detail.status === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />}
                                                {detail.status === 'error' && <XCircle className="w-4 h-4 text-red-600 mt-0.5" />}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-800">
                                                        Fila {detail.row}: {detail.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowResult(false)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
