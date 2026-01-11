declare module '*.json' {
    const value: any;
    export default value;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
    readonly VITE_FIREBASE_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
