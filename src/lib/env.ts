const env = import.meta.env;

function envValue(key: keyof ImportMetaEnv): string {
  return env[key] ?? "";
}

export const appEnv = {
  apiBaseUrl: envValue("VITE_API_BASE_URL") || "http://localhost:8080",
  enableDemoMode: envValue("VITE_ENABLE_DEMO_MODE") === "true",
  firebase: {
    apiKey: envValue("VITE_FIREBASE_API_KEY"),
    authDomain: envValue("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: envValue("VITE_FIREBASE_PROJECT_ID"),
    appId: envValue("VITE_FIREBASE_APP_ID"),
  },
};

export function hasFirebaseConfig() {
  return Boolean(
    appEnv.firebase.apiKey &&
    appEnv.firebase.authDomain &&
    appEnv.firebase.projectId &&
    appEnv.firebase.appId,
  );
}
