import type { AuthPort, EmailPasswordCredentials } from "../ports/authPort";
import type { AuthSession, AuthUser } from "../types/account";

const USERS_KEY = "pmp-auth-local-users-v1";
const SESSION_KEY = "pmp-auth-local-session-v1";

type StoredUser = {
  userId: string;
  email: string;
  displayName: string | null;
  passwordHash: string;
  createdAt: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toAuthUser(user: StoredUser): AuthUser {
  return {
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    photoUrl: null,
    providerIds: ["password"],
  };
}

function readSessionUserId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeSessionUserId(userId: string | null): void {
  try {
    if (!userId) {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    localStorage.setItem(SESSION_KEY, userId);
  } catch {
    /* private mode */
  }
}

/**
 * Offline / default auth until Firebase (or another provider) is configured.
 * Not a production password store — swap via AuthPort.
 */
export function createLocalAuthAdapter(): AuthPort {
  const listeners = new Set<(session: AuthSession) => void>();

  const emit = (session: AuthSession) => {
    listeners.forEach((listener) => listener(session));
  };

  const resolveUser = (): AuthUser | null => {
    const userId = readSessionUserId();
    if (!userId) return null;
    const user = readUsers().find((entry) => entry.userId === userId);
    return user ? toAuthUser(user) : null;
  };

  return {
    id: "local-auth",
    supportsOAuth: false,

    async getSession() {
      return { user: resolveUser(), initializing: false };
    },

    onSessionChange(listener) {
      listeners.add(listener);
      listener({ user: resolveUser(), initializing: false });
      return () => {
        listeners.delete(listener);
      };
    },

    async signInWithEmail({ email, password }) {
      const normalized = normalizeEmail(email);
      const users = readUsers();
      const existing = users.find((entry) => entry.email === normalized);
      if (!existing) {
        throw new Error("No account found for that email. Register first.");
      }
      const hash = await sha256(`${normalized}:${password}`);
      if (hash !== existing.passwordHash) {
        throw new Error("Incorrect email or password.");
      }
      writeSessionUserId(existing.userId);
      const user = toAuthUser(existing);
      emit({ user, initializing: false });
      return user;
    },

    async registerWithEmail({ email, password, displayName }) {
      const normalized = normalizeEmail(email);
      if (!normalized || password.length < 6) {
        throw new Error("Use a valid email and a password of at least 6 characters.");
      }
      const users = readUsers();
      if (users.some((entry) => entry.email === normalized)) {
        throw new Error("An account with that email already exists. Try logging in.");
      }
      const userId =
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const passwordHash = await sha256(`${normalized}:${password}`);
      const stored: StoredUser = {
        userId,
        email: normalized,
        displayName: displayName?.trim() || null,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      writeUsers([...users, stored]);
      writeSessionUserId(userId);
      const user = toAuthUser(stored);
      emit({ user, initializing: false });
      return user;
    },

    async signInWithGoogle() {
      throw new Error(
        "Google sign-in needs the Firebase auth adapter. Set VITE_FIREBASE_* in .env to enable it.",
      );
    },

    async signOut() {
      writeSessionUserId(null);
      emit({ user: null, initializing: false });
    },
  };
}
