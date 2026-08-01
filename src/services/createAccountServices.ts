import type { AuthPort } from "./ports/authPort";
import type { BillingPort } from "./ports/billingPort";
import type { ProgressPort } from "./ports/progressPort";
import { createFirebaseAuthAdapter, type FirebaseWebConfig } from "./adapters/firebaseAuthAdapter";
import { createLocalAuthAdapter } from "./adapters/localAuthAdapter";
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

let cached: AccountServices | null = null;

/**
 * Single composition root — swap adapters here without touching UI.
 * Default: local auth/progress/billing so the app works with zero cloud config.
 * Set VITE_FIREBASE_* to plug in Firebase Auth (Google + email).
 * Set VITE_BILLING_CHECKOUT_URL to enable Stripe checkout redirects.
 */
export function getAccountServices(): AccountServices {
  if (cached) {
    return cached;
  }

  const firebaseConfig = readFirebaseConfig();
  const auth = firebaseConfig ? createFirebaseAuthAdapter(firebaseConfig) : createLocalAuthAdapter();
  const progress = createLocalProgressAdapter();
  const billing = createLocalBillingAdapter({
    checkoutEndpoint: import.meta.env.VITE_BILLING_CHECKOUT_URL?.trim() || undefined,
  });

  cached = {
    auth,
    progress,
    billing,
    authBackend: firebaseConfig ? "firebase" : "local",
  };
  return cached;
}
