import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth,
  type User,
} from "firebase/auth";
import type { AuthPort, EmailPasswordCredentials } from "../ports/authPort";
import type { AuthSession, AuthUser } from "../types/account";

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
};

function mapUser(user: User): AuthUser {
  return {
    userId: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoUrl: user.photoURL,
    providerIds: user.providerData.map((entry) => entry.providerId),
  };
}

/**
 * Firebase Auth adapter (Google + email).
 * Uses static imports so Vite bundles the Firebase SDK correctly.
 */
export function createFirebaseAuthAdapter(config: FirebaseWebConfig): AuthPort {
  let app: FirebaseApp | null = null;
  let authInstance: Auth | null = null;

  const listeners = new Set<(session: AuthSession) => void>();
  let current: AuthSession = { user: null, initializing: true };

  const emit = (session: AuthSession) => {
    current = session;
    listeners.forEach((listener) => listener(session));
  };

  const ensureAuth = (): Auth => {
    if (authInstance) {
      return authInstance;
    }
    app =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            apiKey: config.apiKey,
            authDomain: config.authDomain,
            projectId: config.projectId,
            appId: config.appId,
            storageBucket: config.storageBucket,
            messagingSenderId: config.messagingSenderId,
          });
    authInstance = getAuth(app);
    onAuthStateChanged(authInstance, (user) => {
      emit({
        user: user ? mapUser(user) : null,
        initializing: false,
      });
    });
    return authInstance;
  };

  try {
    ensureAuth();
  } catch (error) {
    console.error("Firebase Auth failed to initialize:", error);
    emit({ user: null, initializing: false });
  }

  return {
    id: "firebase-auth",
    supportsOAuth: true,

    async getSession() {
      ensureAuth();
      return current;
    },

    onSessionChange(listener) {
      listeners.add(listener);
      listener(current);
      return () => {
        listeners.delete(listener);
      };
    },

    async signInWithEmail({ email, password }: EmailPasswordCredentials) {
      const result = await signInWithEmailAndPassword(ensureAuth(), email.trim(), password);
      return mapUser(result.user);
    },

    async registerWithEmail({ email, password, displayName }: EmailPasswordCredentials) {
      const result = await createUserWithEmailAndPassword(ensureAuth(), email.trim(), password);
      if (displayName?.trim()) {
        await updateProfile(result.user, { displayName: displayName.trim() });
      }
      return mapUser(result.user);
    },

    async signInWithGoogle() {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(ensureAuth(), provider);
        return mapUser(result.user);
      } catch (error) {
        const code =
          typeof error === "object" && error && "code" in error
            ? String((error as { code: string }).code)
            : "";
        if (code === "auth/operation-not-allowed") {
          throw new Error(
            "Google sign-in is not enabled yet in Firebase Console → Authentication → Sign-in method → Google.",
          );
        }
        if (code === "auth/unauthorized-domain") {
          throw new Error(
            "This domain is not authorized. Add it under Firebase Console → Authentication → Settings → Authorized domains.",
          );
        }
        if (code === "auth/popup-closed-by-user") {
          throw new Error("Google sign-in was cancelled.");
        }
        throw error instanceof Error ? error : new Error(String(error));
      }
    },

    async signOut() {
      await firebaseSignOut(ensureAuth());
    },
  };
}
