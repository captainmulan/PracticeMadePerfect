import type { BillingPort } from "../ports/billingPort";
import type { CheckoutRequest, CheckoutResult, Entitlement } from "../types/account";

const STORE_KEY = "pmp-entitlements-v1";

type EntitlementStore = Record<string, Entitlement>;

function emptyEntitlement(userId: string): Entitlement {
  return {
    userId,
    plan: "free",
    unlockedBookIds: [],
    stripeCustomerId: null,
    updatedAt: new Date().toISOString(),
  };
}

function readStore(): EntitlementStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as EntitlementStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: EntitlementStore): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export type StripeBillingConfig = {
  /**
   * Backend that creates a Stripe Checkout Session and returns `{ url: string }`.
   * Example: https://api.example.com/billing/checkout
   */
  checkoutEndpoint?: string;
};

/**
 * Owns entitlements locally (portable record).
 * When checkoutEndpoint is set, startCheckout POSTs there (Stripe behind your server).
 */
export function createLocalBillingAdapter(config: StripeBillingConfig = {}): BillingPort {
  const paymentsEnabled = Boolean(config.checkoutEndpoint?.trim());

  return {
    id: paymentsEnabled ? "stripe-via-backend" : "local-billing",
    paymentsEnabled,

    async getEntitlement(userId) {
      const store = readStore();
      return store[userId] ?? emptyEntitlement(userId);
    },

    async hasEntitlement(userId, bookId) {
      const entitlement = await this.getEntitlement(userId);
      if (entitlement.plan === "premium") {
        return true;
      }
      if (!bookId) {
        return entitlement.unlockedBookIds.length > 0;
      }
      return entitlement.unlockedBookIds.includes(bookId);
    },

    async linkStripeCustomer(userId, stripeCustomerId) {
      const store = readStore();
      const current = store[userId] ?? emptyEntitlement(userId);
      const next: Entitlement = {
        ...current,
        stripeCustomerId,
        updatedAt: new Date().toISOString(),
      };
      store[userId] = next;
      writeStore(store);
      return next;
    },

    async startCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
      const endpoint = config.checkoutEndpoint?.trim();
      if (!endpoint) {
        return {
          status: "unavailable",
          message:
            "Payments are not configured yet. Set VITE_BILLING_CHECKOUT_URL to your Stripe checkout API.",
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        return {
          status: "unavailable",
          message: `Checkout failed (${response.status}). Try again later.`,
        };
      }
      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        return {
          status: "unavailable",
          message: "Checkout response missing redirect URL.",
        };
      }
      return { status: "redirect", url: data.url };
    },
  };
}
