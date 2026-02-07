# 🔄 MIGRACIÓN SIMPLIFICADA - Sin Permisos de Sudo

## ⚠️ Problema Detectado

El script de migración requiere `ts-node` y hay un problema de permisos con npm.

## ✅ SOLUCIÓN ALTERNATIVA: Migración Manual

Como actualmente **NO HAY PLANEACIONES EN FIRESTORE** (es una instalación nueva), **NO NECESITAS MIGRAR NADA**.

### Verificar si hay planeaciones:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona proyecto: **eduplanmx**
3. Ve a **Firestore Database**
4. Busca la colección `planeaciones`

**Si la colección NO existe o está vacía:**
- ✅ **No necesitas migrar nada**
- ✅ Puedes saltar directamente a desplegar las reglas

**Si la colección tiene datos:**
- Usa la opción B o C abajo

---

## OPCIÓN A: Verificar desde el Código (Recomendado)

Crea un archivo temporal para verificar:

```javascript
// verificar-planeaciones.html
<!DOCTYPE html>
<html>
<head>
    <title>Verificar Planeaciones</title>
    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

        const firebaseConfig = {
            apiKey: "AIzaSyC-Ry46hCfXxez-lfA5ZX792AOIbmOc6Vw",
            authDomain: "eduplanmx.firebaseapp.com",
            projectId: "eduplanmx",
            storageBucket: "eduplanmx.firebasestorage.app",
            messagingSenderId: "144677335686",
            appId: "1:144677335686:web:cd82543b32b323e3ea5707"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        async function verificar() {
            const output = document.getElementById('output');
            output.innerHTML = '🔍 Verificando...<br>';

            try {
                const snapshot = await getDocs(collection(db, 'planeaciones'));
                
                output.innerHTML += `<br>📊 <strong>Total de planeaciones: ${snapshot.size}</strong><br><br>`;

                if (snapshot.size === 0) {
                    output.innerHTML += '✅ <strong style="color: green;">No hay planeaciones para migrar.</strong><br>';
                    output.innerHTML += 'Puedes proceder directamente a desplegar las reglas de Firestore.<br>';
                } else {
                    output.innerHTML += `⚠️ Hay ${snapshot.size} planeaciones.<br><br>`;
                    
                    let conSchoolId = 0;
                    let sinSchoolId = 0;

                    snapshot.docs.forEach(doc => {
                        const data = doc.data();
                        if (data.schoolId) {
                            conSchoolId++;
                        } else {
                            sinSchoolId++;
                            output.innerHTML += `❌ Sin schoolId: ${doc.id} (${data.title || 'Sin título'})<br>`;
                        }
                    });

                    output.innerHTML += `<br>✅ Con schoolId: ${conSchoolId}<br>`;
                    output.innerHTML += `❌ Sin schoolId: ${sinSchoolId}<br>`;

                    if (sinSchoolId > 0) {
                        output.innerHTML += '<br><strong style="color: orange;">⚠️ Necesitas migrar usando la Opción B o C</strong>';
                    } else {
                        output.innerHTML += '<br><strong style="color: green;">✅ Todas las planeaciones ya tienen schoolId</strong>';
                    }
                }
            } catch (error) {
                output.innerHTML += `<br>❌ Error: ${error.message}`;
            }
        }

        window.onload = verificar;
    </script>
</head>
<body style="font-family: monospace; padding: 20px; background: #1e1e1e; color: #fff;">
    <h1>🔍 Verificación de Planeaciones</h1>
    <div id="output"></div>
</body>
</html>
```

**Cómo usar:**
1. Guarda este código como `verificar-planeaciones.html`
2. Ábrelo en el navegador
3. Te dirá si necesitas migrar o no

---

## OPCIÓN B: Migración desde Firebase Console

Si tienes planeaciones sin `schoolId`:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Firestore Database → Planeaciones
3. Para cada planeación sin `schoolId`:
   - Click en el documento
   - Click en "Agregar campo"
   - Campo: `schoolId`
   - Valor: `21EBH0026G` (o el ID de tu escuela)
   - Guardar

---

## OPCIÓN C: Script de Migración desde Consola del Navegador

1. Abre tu aplicación en el navegador: `http://localhost:3000`
2. Abre la consola del navegador (F12)
3. Pega este código:

```javascript
// SCRIPT DE MIGRACIÓN - Ejecutar en consola del navegador
(async function migrar() {
    const { getFirestore, collection, getDocs, doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('./src/config/firebase');
    
    console.log('🚀 Iniciando migración...');
    
    const snapshot = await getDocs(collection(db, 'planeaciones'));
    console.log(`📊 Total: ${snapshot.size} planeaciones`);
    
    let migradas = 0;
    let yaConSchoolId = 0;
    
    for (const planDoc of snapshot.docs) {
        const data = planDoc.data();
        
        if (data.schoolId) {
            yaConSchoolId++;
            continue;
        }
        
        // Obtener schoolId del usuario
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        const schoolId = userDoc.data()?.schoolId || '21EBH0026G'; // Fallback
        
        await updateDoc(doc(db, 'planeaciones', planDoc.id), {
            schoolId: schoolId,
            migratedAt: new Date().toISOString()
        });
        
        migradas++;
        console.log(`✅ Migrada: ${planDoc.id} → ${schoolId}`);
    }
    
    console.log(`\n📊 RESULTADO:`);
    console.log(`✅ Migradas: ${migradas}`);
    console.log(`⏭️  Ya tenían schoolId: ${yaConSchoolId}`);
    console.log(`\n✅ ¡Migración completada!`);
})();
```

---

## 🎯 RECOMENDACIÓN

**Si es una instalación nueva (sin planeaciones):**
1. ✅ Salta la migración
2. ✅ Ve directo a desplegar las reglas de Firestore
3. ✅ Las nuevas planeaciones ya tendrán `schoolId` automáticamente

**Si tienes planeaciones existentes:**
1. Usa la Opción A para verificar
2. Si necesitas migrar, usa Opción B (manual) o C (script)

---

## 📋 Próximos Pasos

Una vez verificado/migrado:

1. **Desplegar Reglas de Firestore**
   - Firebase Console → Firestore → Reglas
   - Copiar contenido de `firestore.rules`
   - Publicar

2. **Crear Índices** (Firebase te lo pedirá automáticamente)

3. **Probar** creando una planeación nueva

---

## ❓ ¿Qué Prefieres?

- **Opción 1**: Usar el archivo HTML para verificar
- **Opción 2**: Migrar manualmente desde Firebase Console
- **Opción 3**: Usar el script en la consola del navegador
- **Opción 4**: Saltar migración (si no hay planeaciones)

**¿Cuál prefieres que hagamos?** 🤔
