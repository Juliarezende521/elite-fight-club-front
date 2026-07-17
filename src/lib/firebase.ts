import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence, type Auth } from "firebase/auth";
import { appEnv, hasFirebaseConfig } from "@/lib/env";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined" || !hasFirebaseConfig()) {
    return null;
  }

  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(appEnv.firebase);
  }

  if (!auth) {
    auth = getAuth(app);
    void setPersistence(auth, browserLocalPersistence);
  }

  return auth;
}
