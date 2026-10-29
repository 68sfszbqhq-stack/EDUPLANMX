# Correcciones de seguridad — EduPlan v2

Fecha: 25 de octubre de 2026 (México). Cambios preparados y probados localmente. **Las reglas nuevas aún no se han aplicado al proyecto Firebase remoto.** No se publicó GitHub Pages ni se modificaron datos de producción.

## Cambios

| Hallazgo | Corrección | Verificación |
|---|---|---|
| S1: lectura de documentos privados ajenos | Planeaciones, fichas e historial privados por autor. Solo las planeaciones marcadas `isPublic: true` se consultan por miembros aprobados del mismo plantel. | Lecturas directas y consultas; autor, colega y cuenta externa. |
| S2: operaciones entre planteles | Membresía aprobada para consultar; dirección verificada para gestión institucional. El diagnóstico admite aportaciones del plantel. Plantel inmutable. PMC indexado por escuela; se eliminó el ID fijo del servicio. Catálogo general: solo SuperAdmin escribe. | Modificar/borrar desde otro plantel se rechaza; dirección legítima conserva acceso. |
| S3: cuentas desactivadas | Las reglas exigen perfil activo; la interfaz observa el perfil y cierra la sesión cuando se desactiva. Login rechaza cuentas inactivas. Ambos paneles de administración usan `users`. | Revocación en sesión existente, en emulador y navegador. |
| S4: registros públicos arbitrarios | Enlaces individuales aleatorios de 256 bits, siete días, una creación por enlace, escuela existente, emisor activo y miembro aprobado. Esquema público acotado; sin lectura pública del expediente. Cuestionario heredado: creación exclusiva de SuperAdmin. | Registro completo de cinco pasos en navegador; reutilización, vencimiento, revocación, escuela ajena y datos inválidos rechazados. |
| S5: autor falso | El autor nuevo debe ser el UID autenticado; no se puede cambiar el autor ni el plantel al editar. | Creación falsificada y cambio posterior de identidad rechazados. |
| S6: datos del docente anterior | Borradores separados por UID y plantel; callbacks antiguos no escriben en la nueva cuenta. Se retira la clave de Gemini al cambiar/cerrar sesión. Firestore usa memoria y se reinicia el documento al cambiar de cuenta para vaciarla. Los formularios de menores no guardan progreso persistente. | Dos cuentas sucesivas en el mismo navegador; sin diagnóstico ni clave heredados, con recarga tras logout. |
| S7: puente local de IA | Escucha en loopback, host/origen permitidos, token efímero, JSON de hasta 2 MB, una generación simultánea, seis inicios/minuto y tiempo máximo. Los procesos reciben cancelación; salida acotada. Respaldos fuera del directorio web, permisos privados. | Pruebas HTTP adversarias; generación real con Codex mediante el cliente protegido. |
| S8: dependencias | Actualizaciones compatibles, Vite 7.3.7 y plugin React 5.2.0; overrides para las versiones corregidas de gRPC y el analizador de selectores CSS. | `npm audit`: cero avisos; compilación y regresiones. |

También se retiró el uso de `VITE_API_KEY` del servicio de herramientas: la clave de Gemini se obtiene de la sesión del docente, no del build.

## Pruebas

- 94 pruebas de reglas, sin fallos ni pendientes; incluyen las reglas compartidas con Antología y un formulario con todos sus campos/listas completos.
- 98 pruebas de lógica y seguridad local, sin fallos.
- Navegador: aislamiento de sesiones, desactivación, registro real en emuladores; regresiones de selección curricular y revisión de contexto.
- Generación real: HTTP 200, dos sesiones, modelo `gpt-6.1-sol`, sin errores de JavaScript. La generación real se validó con Codex; no se validó de extremo a extremo la cuenta de Claude.
- `npm run build` correcto. Permanece el aviso de tamaño del bundle; no es un fallo de compilación.

Comandos reproducibles:

```sh
npm run test:seguridad:local
npm run test:seguridad:reglas
npm run build
npm audit
```

El test de navegador `scripts/seguridad-sesiones.browser.cjs` exige Auth Emulator en 9099, Firestore Emulator en 8080 y Vite en 3016 con `VITE_EMULADOR=1`. Carga las reglas compartidas y crea únicamente identidades y expedientes sintéticos.

## Aplicación pendiente y compatibilidad

Las reglas locales no cambian por sí solas los permisos remotos. Antes de publicarlas, revisar estos cambios de comportamiento:

1. Se requiere `users/{uid}.activo: true` para operar como docente. Los perfiles históricos sin este campo deben revisarse; no se les concede acceso por defecto.
2. Los documentos institucionales sin `schoolId` no se reasignan automáticamente. El administrador debe identificar su plantel. PMC y su diagnóstico usan el ID de documento como escuela.
3. La biblioteca del plantel muestra únicamente documentos compartidos expresamente. Se añadió el índice `schoolId + isPublic + createdAt`.
4. Los enlaces antiguos basados solamente en CCT ya no autorizan registros. El docente genera un enlace individual desde Diagnóstico o Alumnos.
5. Los borradores antiguos sin UID permanecen en su ubicación del navegador para recuperación supervisada; no se muestran ni se suben a la cuenta que inicie sesión. Los nuevos borradores locales siguen siendo archivos del navegador, sin cifrado: el aislamiento evita mezclas entre cuentas de la aplicación, no protege contra quien controle físicamente el dispositivo o su perfil de navegador.
6. Se retira la caché persistente antigua de Firestore. Si otra pestaña antigua impide limpiarla, se registra un aviso para cerrar las otras pestañas y volver a abrir EduPlan. La sincronización offline persistente de Firestore deja de estar habilitada.

`firebase.json` apunta ahora a `firestore.pruebas.rules` para no reemplazar accidentalmente las reglas de Antología por las de EduPlan solamente. El destino de revisión es **eduplanmx-pruebas**, nunca el proyecto de producción `eduplanmx`. El archivo compartido se regenera con `node scripts/combinar-reglas.mjs`; no se edita a mano.

Los respaldos de IA se conservan en `~/.local/share/eduplanmx-v2/respaldos/`. Se trasladaron allí 14 archivos anteriores al subdirectorio `legado-20261025-221534`; ninguno se borró. Los servidores locales de 3012 y 3014 se reiniciaron con Vite actualizado. Los emuladores y el servidor temporal de 3016 se cerraron tras las pruebas.
