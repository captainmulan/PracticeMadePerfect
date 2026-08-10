import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAccountServices, type AccountServices } from "../services/createAccountServices";
import type { AuthPort, EmailPasswordCredentials } from "../services/ports/authPort";
import type { BillingPort } from "../services/ports/billingPort";
import type { ProgressPort } from "../services/ports/progressPort";
import type { AuthUser, BookBookmark, CheckoutResult, Entitlement } from "../services/types/account";
import { bindProgressBridge } from "../utils/courseUtils";

type AccountContextValue = {
  user: AuthUser | null;
  initializing: boolean;
  authBackend: AccountServices["authBackend"];
  supportsGoogle: boolean;
  paymentsEnabled: boolean;
  auth: AuthPort;
  progress: ProgressPort;
  billing: BillingPort;
  signInWithEmail: (credentials: EmailPasswordCredentials) => Promise<void>;
  registerWithEmail: (credentials: EmailPasswordCredentials) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshEntitlement: () => Promise<Entitlement | null>;
  entitlement: Entitlement | null;
  startCheckout: (input?: { priceId?: string; bookId?: string }) => Promise<CheckoutResult>;
  toggleFavorite: (bookId: string) => Promise<string[]>;
  favorites: string[];
  getBookmarks: (bookId?: string | null) => Promise<BookBookmark[]>;
  toggleBookmark: (input: {
    bookId: string;
    stepIndex: number;
    stepTitle?: string | null;
    note?: string | null;
  }) => Promise<{ created: BookBookmark | null; deleted: boolean; list: BookBookmark[] }>;
  removeBookmark: (bookmarkId: string) => Promise<BookBookmark[]>;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const services = useMemo(() => getAccountServices(), []);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    return services.auth.onSessionChange((session) => {
      setUser(session.user);
      setInitializing(session.initializing);
      bindProgressBridge(services.progress, session.user?.userId ?? null);
    });
  }, [services]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setEntitlement(null);
      setFavorites([]);
      return;
    }
    (async () => {
      try {
        const [nextEntitlement, nextFavorites] = await Promise.all([
          services.billing.getEntitlement(user.userId),
          services.progress.getFavorites(user.userId),
        ]);
        if (!active) return;
        setEntitlement(nextEntitlement);
        setFavorites(nextFavorites);
      } catch (error) {
        console.error("Failed to load account data:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, [services, user]);

  const signInWithEmail = useCallback(
    async (credentials: EmailPasswordCredentials) => {
      await services.auth.signInWithEmail(credentials);
    },
    [services],
  );

  const registerWithEmail = useCallback(
    async (credentials: EmailPasswordCredentials) => {
      await services.auth.registerWithEmail(credentials);
    },
    [services],
  );

  const signInWithGoogle = useCallback(async () => {
    await services.auth.signInWithGoogle();
  }, [services]);

  const signOut = useCallback(async () => {
    await services.auth.signOut();
  }, [services]);

  const refreshEntitlement = useCallback(async () => {
    if (!user) {
      setEntitlement(null);
      return null;
    }
    const next = await services.billing.getEntitlement(user.userId);
    setEntitlement(next);
    return next;
  }, [services, user]);

  const startCheckout = useCallback(
    async (input?: { priceId?: string; bookId?: string }): Promise<CheckoutResult> => {
      if (!user) {
        return { status: "unavailable", message: "Please log in before checkout." };
      }
      const result = await services.billing.startCheckout({
        userId: user.userId,
        priceId: input?.priceId,
        bookId: input?.bookId,
        successUrl: `${window.location.origin}/?billing=success`,
        cancelUrl: `${window.location.origin}/?billing=cancel`,
      });
      if (result.status === "redirect") {
        window.location.assign(result.url);
      }
      return result;
    },
    [services, user],
  );

  const toggleFavorite = useCallback(
    async (bookId: string) => {
      if (!user) {
        return [];
      }
      const isFavorite = favorites.includes(bookId);
      const next = await services.progress.setFavorite(user.userId, bookId, !isFavorite);
      setFavorites(next);
      return next;
    },
    [favorites, services, user],
  );

  const getBookmarks = useCallback(
    async (bookId?: string | null) => {
      if (!user) {
        return [];
      }
      try {
        return await services.progress.getBookmarks(user.userId, bookId ?? null);
      } catch (error) {
        console.warn("Failed to load bookmarks:", error);
        return [];
      }
    },
    [services, user],
  );

  const toggleBookmark = useCallback(
    async (input: {
      bookId: string;
      stepIndex: number;
      stepTitle?: string | null;
      note?: string | null;
    }) => {
      if (!user) {
        return { created: null, deleted: false, list: [] };
      }
      try {
        return await services.progress.toggleBookmark(user.userId, input);
      } catch (error) {
        console.warn("Failed to toggle bookmark:", error);
        return { created: null, deleted: false, list: [] };
      }
    },
    [services, user],
  );

  const removeBookmark = useCallback(
    async (bookmarkId: string) => {
      if (!user) {
        return [];
      }
      try {
        return await services.progress.removeBookmark(user.userId, bookmarkId);
      } catch (error) {
        console.warn("Failed to remove bookmark:", error);
        return [];
      }
    },
    [services, user],
  );

  const value = useMemo<AccountContextValue>(
    () => ({
      user,
      initializing,
      authBackend: services.authBackend,
      supportsGoogle: services.auth.supportsOAuth,
      paymentsEnabled: services.billing.paymentsEnabled,
      auth: services.auth,
      progress: services.progress,
      billing: services.billing,
      signInWithEmail,
      registerWithEmail,
      signInWithGoogle,
      signOut,
      refreshEntitlement,
      entitlement,
      startCheckout,
      toggleFavorite,
      favorites,
      getBookmarks,
      toggleBookmark,
      removeBookmark,
    }),
    [
      entitlement,
      favorites,
      initializing,
      registerWithEmail,
      refreshEntitlement,
      services,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      startCheckout,
      toggleFavorite,
      user,
      getBookmarks,
      toggleBookmark,
      removeBookmark,
    ],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const value = useContext(AccountContext);
  if (!value) {
    throw new Error("useAccount must be used within AccountProvider");
  }
  return value;
}

/** Safe for optional UI that may render outside the provider in tests. */
export function useAccountOptional(): AccountContextValue | null {
  return useContext(AccountContext);
}
