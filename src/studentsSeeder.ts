
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from './config/firebase';

const NOMBRES = ["Sofía", "Santiago", "Valentina", "Sebastián", "María", "Alejandro", "Ximena", "Mateo", "Camila", "Nicolás", "Valeria", "Diego", "Ana", "Samuel", "José", "Daniela", "Luis", "Fernanda", "Gabriel", "Mariana"];
const APELLIDOS = ["García", "Rodríguez", "Martínez", "Hernández", "López", "González", "Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Cruz", "Reyes", "Morales", "Ortiz", "Gutiérrez", "Castillo"];

const ESTILOS = ["Visual", "Auditivo", "Kinestésico", "Lecto-escritor"];
const SITUACIONES = ["Estudiante t/c", "Trabaja y estudia", "Apoyo en casa", "Deportista alto rendimiento"];
const NIVEL_SOCIOEMOCIONAL = ["Alto", "Medio", "Bajo", "En riesgo"];
const INTERESES = ["Tecnología", "Artes", "Deportes", "Ciencias", "Redes Sociales", "Música", "Videojuegos", "Lectura"];

export const seedAlumnos = async (cantidad: number = 60) => {
    const batch = writeBatch(db);
    const alumnosRef = collection(db, 'alumnos');

    // Generamos datos en memoria primero
    const nuevosAlumnos = Array.from({ length: cantidad }).map(() => {
        const nombre = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
        const apellidoP = APELLIDOS[Math.floor(Math.random() * APELLIDOS.length)];
        const apellidoM = APELLIDOS[Math.floor(Math.random() * APELLIDOS.length)];

        return {
            nombre,
            apellidoPaterno: apellidoP,
            apellidoMaterno: apellidoM,
            matricula: `2024${Math.floor(1000 + Math.random() * 9000)}`,
            email: `${nombre.toLowerCase()}.${apellidoP.toLowerCase()}@escuela.edu.mx`,
            estiloAprendizaje: ESTILOS[Math.floor(Math.random() * ESTILOS.length)],
            situacionLaboral: Math.random() > 0.7 ? "Trabaja y estudia" : "Estudiante", // 30% trabaja
            promedioAnterior: (6 + Math.random() * 4).toFixed(1), // 6.0 a 10.0
            nivelSocioemocional: NIVEL_SOCIOEMOCIONAL[Math.floor(Math.random() * NIVEL_SOCIOEMOCIONAL.length)],
            intereses: [
                INTERESES[Math.floor(Math.random() * INTERESES.length)],
                INTERESES[Math.floor(Math.random() * INTERESES.length)]
            ],
            asistencias: Math.floor(80 + Math.random() * 20), // 80-100%
            grupo: "A",
            grado: "1"
        };
    });

    // Firestore batch limit is 500 operations, so 60 is fine.
    // However, 'addDoc' cannot be batched directly with 'writeBatch' easily consistently without IDs.
    // Better to loop and addDoc, or use doc() to generate ID then set().

    // Using Promise.all for speed with addDoc might be simpler for this seed script type
    // but batch is cleaner. Let's use batch with generated IDs.

    nuevosAlumnos.forEach(alumno => {
        const newDocRef = doc(alumnosRef); // Generate ID
        batch.set(newDocRef, alumno);
    });

    await batch.commit();
    return nuevosAlumnos.length;
};
