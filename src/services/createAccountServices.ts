import type { AuthPort } from "./ports/authPort";
import type { BillingPort } from "./ports/billingPort";
import type { ProgressPort } from "./ports/progressPort";
import { createFirebaseAuthAdapter, type FirebaseWebConfig } from "./adapters/firebaseAuthAdapter";
import { createLocalBillingAdapter } from "./adapters/localBillingAdapter";
import { createLocalProgressAdapter } from "./adapters/localProgressAdapter";

export type AccountServices = {
  auth: AuthPort;
  progress: ProgressPort;
  billing: BillingPort;
  /** Which auth backend is active — useful for UI copy. */
  authBackend: "firebase" | "local";
};

function readFirebaseConfig(): FirebaseWebConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim();
  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || undefined,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || undefined,
  };
}

/** Public client config for this Hosting project (safe to ship; restricted by Auth domains). */
const MAGIC_LIBRARY_FIREBASE: FirebaseWebConfig = {
  apiKey: "AIzaSyAldVOSqUCO41TUQ6kR5VTK3U-aAWQqGMU",
  authDomain: "magiclibrary-143b7.firebaseapp.com",
  projectId: "magiclibrary-143b7",
  appId: "1:64804616100:web:e0499bde2744d0da567331",
  storageBucket: "magiclibrary-143b7.firebasestorage.app",
  messagingSenderId: "64804616100",
};

let cached: AccountServices | null = null;

/**
 * Single composition root — swap adapters here without touching UI.
 * Auth: Firebase (Google + email). Progress/billing stay behind ports (local today).
 * Set VITE_BILLING_CHECKOUT_URL to enable Stripe checkout redirects.
 */
export function getAccountServices(): AccountServices {
  if (cached) {
    return cached;
  }

  const firebaseConfig = readFirebaseConfig() ?? MAGIC_LIBRARY_FIREBASE;
  const auth = createFirebaseAuthAdapter(firebaseConfig);
  const progress = createLocalProgressAdapter();
  const billing = createLocalBillingAdapter({
    checkoutEndpoint: import.meta.env.VITE_BILLING_CHECKOUT_URL?.trim() || undefined,
  });

  cached = {
    auth,
    progress,
    billing,
    authBackend: "firebase",
  };
  return cached;
}
