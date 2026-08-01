import type { AuthSession, AuthUser } from "../types/account";

export type EmailPasswordCredentials = {
  email: string;
  password: string;
  displayName?: string;
};

/**
 * Auth boundary — UI depends on this, not on Firebase/Supabase/etc.
 * Swap adapters without rewriting screens.
 */
export interface AuthPort {
  readonly id: string;
  /** Google (or other OAuth) available for this adapter + config. */
  readonly supportsOAuth: boolean;

  getSession(): Promise<AuthSession>;
  onSessionChange(listener: (session: AuthSession) => void): () => void;

  signInWithEmail(credentials: EmailPasswordCredentials): Promise<AuthUser>;
  registerWithEmail(credentials: EmailPasswordCredentials): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  signOut(): Promise<void>;
}
