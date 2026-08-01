import type { CheckoutRequest, CheckoutResult, Entitlement } from "../types/account";

/**
 * Payments / entitlements — Stripe (or Play Billing) behind the port.
 * App only checks hasEntitlement / startCheckout.
 */
export interface BillingPort {
  readonly id: string;
  readonly paymentsEnabled: boolean;

  getEntitlement(userId: string): Promise<Entitlement>;
  hasEntitlement(userId: string, bookId?: string): Promise<boolean>;
  /**
   * Link Stripe customer id onto the entitlement record you own.
   * No-op for adapters that do not use Stripe yet.
   */
  linkStripeCustomer(userId: string, stripeCustomerId: string): Promise<Entitlement>;
  startCheckout(request: CheckoutRequest): Promise<CheckoutResult>;
}
