/** Portable account identity — adapters may map provider ids onto userId. */
export type AuthUser = {
  userId: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  providerIds: string[];
};

export type AuthSession = {
  user: AuthUser | null;
  /** True while the adapter is resolving the initial session. */
  initializing: boolean;
};

export type BookProgress = {
  userId: string;
  bookId: string;
  lastPageId: string | null;
  lastStepIndex: number;
  updatedAt: string;
};

export type BookBookmark = {
  id: string;
  bookId: string;
  stepIndex: number;
  stepTitle?: string | null;
  note?: string | null;
  createdAt: string;
};

export type UserProgressSnapshot = {
  userId: string;
  favorites: string[];
  books: Record<string, BookProgress>;
  bookmarks: BookBookmark[];
  updatedAt: string;
};

export type Entitlement = {
  userId: string;
  plan: "free" | "premium" | string;
  unlockedBookIds: string[];
  stripeCustomerId: string | null;
  updatedAt: string;
};

export type CheckoutRequest = {
  userId: string;
  priceId?: string;
  bookId?: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutResult =
  | { status: "redirect"; url: string }
  | { status: "unavailable"; message: string };
