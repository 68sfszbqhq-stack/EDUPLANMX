/**
 * Prueba de la fusión de bitácoras: el escenario real es "registré sesiones en la
 * escuela y otras en mi casa; al abrir en cualquiera de los dos deben estar todas".
 */
import { fusionarBitacoras } from '../src/services/fusionBitacora';
import type { BitacoraEntry } from '../types';

const e = (id: string, fecha: string, tema: string): BitacoraEntry => ({
    id, fecha, tema, grupo: '3°B', materia: 'Matemáticas',
    semaforo: 'verde', quePaso: '', queFallo: '', queSigue: ''
});

let fallos = 0;
const comprobar = (nombre: string, condicion: boolean, detalle = '') => {
    if (condicion) {
        console.log(`  ✅ ${nombre}`);
    } else {
        console.log(`  ❌ ${nombre} ${detalle}`);
        fallos++;
    }
};

console.log('\nFusión de bitácoras\n');

// 1. Escuela y casa registran sesiones distintas: deben sobrevivir las dos
const escuela = [e('a', '2026-07-20', 'Fracciones')];
const casa = [e('b', '2026-07-21', 'Porcentajes')];
const unidas = fusionarBitacoras(casa, escuela);
comprobar('no se pierde ninguna sesión de ningún dispositivo', unidas.length === 2, `(dio ${unidas.length})`);
comprobar('la más reciente queda primero', unidas[0].id === 'b', `(dio ${unidas[0].id})`);

// 2. La misma entrada editada localmente debe ganar sobre la copia de la nube
const localEditada = [{ ...e('a', '2026-07-20', 'Fracciones equivalentes'), queFallo: 'no distinguen numerador' }];
const remotaVieja = [e('a', '2026-07-20', 'Fracciones')];
const ganaLocal = fusionarBitacoras(localEditada, remotaVieja);
comprobar('no se duplica la entrada que existe en ambos lados', ganaLocal.length === 1, `(dio ${ganaLocal.length})`);
comprobar('gana la versión local recién editada', ganaLocal[0].tema === 'Fracciones equivalentes');

// 3. Lo borrado aquí no revive desde la nube
const trasBorrar = fusionarBitacoras([], [e('a', '2026-07-20', 'Fracciones')], ['a']);
comprobar('una entrada borrada no reaparece', trasBorrar.length === 0, `(dio ${trasBorrar.length})`);

// 4. Dispositivo nuevo, sin nada local: baja todo lo de la nube
const nuevoDispositivo = fusionarBitacoras([], [e('a', '2026-07-20', 'A'), e('b', '2026-07-19', 'B')]);
comprobar('un dispositivo nuevo recibe toda la bitácora', nuevoDispositivo.length === 2, `(dio ${nuevoDispositivo.length})`);

// 5. Sin internet (nube vacía): lo local queda intacto
const sinNube = fusionarBitacoras([e('a', '2026-07-20', 'A')], []);
comprobar('sin nube no se pierde lo local', sinNube.length === 1);

// 6. Entradas corruptas no tumban la fusión
const conBasura = fusionarBitacoras([e('a', '2026-07-20', 'A')], [null as any, { id: '' } as any]);
comprobar('ignora entradas inválidas sin romperse', conBasura.length === 1, `(dio ${conBasura.length})`);

console.log(fallos === 0 ? '\nTodas las comprobaciones pasaron.\n' : `\n${fallos} comprobación(es) fallaron.\n`);
process.exit(fallos === 0 ? 0 : 1);
