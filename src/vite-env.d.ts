/// <reference types="vite/client" />
declare module '*.json' {
    const value: any;
    export default value;
}



interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
    readonly VITE_EMULADOR?: string;
    /** 'terminal' en la versión 2: genera con Claude vía scripts/puente-ia.ts. */
    readonly VITE_MOTOR_IA?: string;
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly VITE_FIREBASE_APP_ID: string;
    readonly VITE_FIREBASE_MEASUREMENT_ID: string;
    readonly BASE_URL: string;
    readonly PROD: boolean;
    readonly DEV: boolean;
    readonly MODE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
