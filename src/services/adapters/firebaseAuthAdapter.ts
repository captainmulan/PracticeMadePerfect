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

type FirebaseUserLike = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerData: Array<{ providerId: string }>;
};

function mapUser(user: FirebaseUserLike): AuthUser {
  return {
    userId: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoUrl: user.photoURL,
    providerIds: user.providerData.map((entry) => entry.providerId),
  };
}

async function loadFirebaseModules(): Promise<{
  // Loose typing keeps `firebase` an optional install.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  auth: any;
}> {
  try {
    const appSpec = "firebase/app";
    const authSpec = "firebase/auth";
    const [app, auth] = await Promise.all([
      import(/* @vite-ignore */ appSpec),
      import(/* @vite-ignore */ authSpec),
    ]);
    return { app, auth };
  } catch (error) {
    throw new Error(
      "Firebase SDK is not installed. Run `npm install firebase`, then set VITE_FIREBASE_* env vars." +
        (error instanceof Error && error.message ? ` (${error.message})` : ""),
    );
  }
}

/**
 * Firebase Auth adapter — activated only when VITE_FIREBASE_* is set.
 * Uses dynamic imports so the default (local) build does not require Firebase.
 */
export function createFirebaseAuthAdapter(config: FirebaseWebConfig): AuthPort {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authInstance: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authMod: any = null;

  const listeners = new Set<(session: AuthSession) => void>();
  let current: AuthSession = { user: null, initializing: true };

  const emit = (session: AuthSession) => {
    current = session;
    listeners.forEach((listener) => listener(session));
  };

  const ensureAuth = async () => {
    if (authInstance) return authInstance;
    const mods = await loadFirebaseModules();
    authMod = mods.auth;
    const app =
      mods.app.getApps().length > 0
        ? mods.app.getApps()[0]
        : mods.app.initializeApp({
            apiKey: config.apiKey,
            authDomain: config.authDomain,
            projectId: config.projectId,
            appId: config.appId,
            storageBucket: config.storageBucket,
            messagingSenderId: config.messagingSenderId,
          });
    authInstance = authMod.getAuth(app);
    authMod.onAuthStateChanged(authInstance, (user: FirebaseUserLike | null) => {
      emit({
        user: user ? mapUser(user) : null,
        initializing: false,
      });
    });
    return authInstance;
  };

  void ensureAuth().catch((error) => {
    console.error("Firebase Auth failed to initialize:", error);
    emit({ user: null, initializing: false });
  });

  return {
    id: "firebase-auth",
    supportsOAuth: true,

    async getSession() {
      await ensureAuth();
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
      const instance = await ensureAuth();
      const result = await authMod.signInWithEmailAndPassword(instance, email.trim(), password);
      return mapUser(result.user);
    },

    async registerWithEmail({ email, password, displayName }: EmailPasswordCredentials) {
      const instance = await ensureAuth();
      const result = await authMod.createUserWithEmailAndPassword(instance, email.trim(), password);
      if (displayName?.trim()) {
        await authMod.updateProfile(result.user, { displayName: displayName.trim() });
      }
      return mapUser(result.user);
    },

    async signInWithGoogle() {
      const instance = await ensureAuth();
      const provider = new authMod.GoogleAuthProvider();
      const result = await authMod.signInWithPopup(instance, provider);
      return mapUser(result.user);
    },

    async signOut() {
      const instance = await ensureAuth();
      await authMod.signOut(instance);
    },
  };
}
