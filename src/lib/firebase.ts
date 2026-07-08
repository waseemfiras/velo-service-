import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";

let cachedConfig: any = null;

export const getFirebaseConfig = async () => {
    if (cachedConfig) return cachedConfig;
    try {
        const response = await fetch('/firebase-applet-config.json');
        if (!response.ok) {
            console.warn('Failed to load Firebase config, using empty config');
            return {};
        }
        const text = await response.text();
        if (text.trim().startsWith('<')) {
            console.warn('Firebase config returned HTML, using empty config');
            return {};
        }
        cachedConfig = JSON.parse(text);
        return cachedConfig;
    } catch (e) {
        console.warn('Error fetching Firebase config:', e);
        return {};
    }
};

let dbInstance: any = null;

export const initializeFirebase = async () => {
    const config = await getFirebaseConfig();
    
    // Fallback if no valid config is found
    if (!config || !config.apiKey) {
        console.warn('Using empty mock Firebase app because config is invalid or missing.');
        return {
            app: {} as any,
            db: null as any,
            auth: null as any
        };
    }

    if (getApps().length === 0) {
        const app = initializeApp(config);
        dbInstance = initializeFirestore(app, {
            experimentalForceLongPolling: true,
            ignoreUndefinedProperties: true,
        }, config.firestoreDatabaseId || undefined);
        return {
           app,
           db: dbInstance,
           auth: getAuth(app)
         };
    }
    
    const app = getApp();
    if (!dbInstance) {
        try {
            dbInstance = initializeFirestore(app, {
                experimentalForceLongPolling: true,
                ignoreUndefinedProperties: true,
            }, config.firestoreDatabaseId || undefined);
        } catch (e) {
            dbInstance = getFirestore(app, config.firestoreDatabaseId || undefined);
        }
    }
    return {
        app,
        db: dbInstance,
        auth: getAuth(app)
    };
};

export const googleProvider = new GoogleAuthProvider();
