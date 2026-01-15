# 🛡️ Informe de Auditoría de Seguridad

## 🚨 Hallazgos Críticos

### 1. Base de Datos Expuesta (Firestore)
*   **Problema:** Las reglas actuales de Firestore están configuradas como `allow read, write: if true;`.
*   **Riesgo:** **Extremo**. Cualquier persona en internet con tu Project ID (`eduplanmx`) puede leer toda tu base de datos, borrarla por completo o inyectar datos falsos sin necesidad de iniciar sesión.
*   **Solución:** Se bloquearán las reglas para requerir autenticación (`request.auth != null`).

### 2. Claves de API en Frontend
*   **Problema:** La API Key de Google Gemini (`VITE_API_KEY`) se utiliza directamente desde el navegador del cliente.
*   **Riesgo:** **Medio/Alto**. Un usuario técnico malintencionado podría inspeccionar el tráfico de red, copiar tu clave y usarla para sus propios proyectos, consumiendo tu cuota.
*   **Solución (Corto Plazo):** Usar restricciones de API en la consola de Google Cloud (restringir a tu dominio web específico).
*   **Solución (Largo Plazo):** Mover la lógica de IA a un Backend (Firebase Cloud Functions) para ocultar la clave.

### 3. Configuración Pública
*   **Problema:** El archivo `firebase.ts` expone las credenciales de configuración.
*   **Contexto:** Esto es normal en aplicaciones Firebase Web, siempre y cuando las reglas de seguridad (Punto 1) sean estrictas. Si las reglas son débiles, esta configuración es la llave de entrada.

---

## ✅ Acciones Correctivas Inmediatas (Aplicadas Ahora)

1.  **Cierre de Puertas:** Actualizaré `firestore.rules` para que **SOLO usuarios autenticados** puedan leer o escribir datos.
    *   Usuarios anónimos serán rechazados.
    *   Esto detiene ataques de borrado masivo por bots o curiosos.

2.  **Validación de Sesión:** Aseguramos que el sistema de `authService.ts` sea la única vía de acceso.

## ⚠️ Recomendaciones para el Usuario

1.  **Restringir API Key:** Ve a [Google Cloud Console > Credenciales](https://console.cloud.google.com/apis/credentials) y edita tu clave. En "Restricciones de aplicaciones", añade las URL de tu sitio web (ej. `tu-app.vercel.app`, `localhost:5173`).
2.  **Monitoreo:** Revisa periódicamente la pestaña "Uso" en Firebase consola para detectar picos anómalos de lectura/escritura.