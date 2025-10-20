import type { Plan, Subscription, Payment, Address } from "../types";

/**
 * ContractService provides a uniform interface to interact with the
 * Streamless contract (real Massa Web3 or a local mock fallback).
 */
class ContractService {
  private initialized = false;
  private useMock = true;
  private address: Address | null = null;

  async init() {
    if (this.initialized) return;
    try {
      // Attempt dynamic import so the app runs even without the SDK installed.
      // const sdk = await import("@massalabs/massa-web3");
      // TODO: wire actual Massa provider here on availability.
      this.useMock = true; // force mock until real SDK is configured
    } catch (e) {
      this.useMock = true;
    }
    this.initialized = true;
  }

  async connectWallet(): Promise<Address> {
    await this.init();
    if (!this.useMock) {
      // TODO: connect to Massa wallet/provider
    }
    // Mock address for development without wallet
    this.address = "0xMOCKUSER";
    return this.address;
  }

  getAddress(): Address | null {
    return this.address;
  }

  // --- Plans ---
  async listPlans(): Promise<Plan[]> {
    const raw = localStorage.getItem("streamless_plans") || "[]";
    return JSON.parse(raw) as Plan[];
  }

  async createPlan(input: Omit<Plan, "creator" | "id" | "active"> & { id?: string; }): Promise<Plan> {
    const plans = await this.listPlans();
    const creator = this.address ?? "0xCREATOR";
    const id = input.id ?? `plan_${Date.now()}`;
    const plan: Plan = {
      id,
      creator,
      amount: input.amount,
      frequencyDays: input.frequencyDays,
      active: true,
    };
    localStorage.setItem("streamless_plans", JSON.stringify([plan, ...plans]));
    return plan;
  }

  async updatePlan(id: string, patch: Partial<Plan>): Promise<Plan | null> {
    const plans = await this.listPlans();
    const next = plans.map(p => p.id === id ? { ...p, ...patch } : p);
    localStorage.setItem("streamless_plans", JSON.stringify(next));
    return next.find(p => p.id === id) ?? null;
  }

  // --- Subscriptions ---
  async getUserSubscriptions(subscriber: Address): Promise<Subscription[]> {
    const raw = localStorage.getItem(`streamless_subs_${subscriber}`) || "[]";
    return JSON.parse(raw) as Subscription[];
  }

  async subscribe(planId: string, subscriber: Address, cycles?: number): Promise<Subscription> {
    const subs = await this.getUserSubscriptions(subscriber);
    const next: Subscription = {
      subscriber,
      planId,
      nextPaymentTime: Math.floor(Date.now() / 1000) + 86400, // tomorrow by default
      active: true,
      remainingCycles: cycles ?? null,
    };
    localStorage.setItem(`streamless_subs_${subscriber}`, JSON.stringify([next, ...subs]));
    return next;
  }

  async cancelSubscription(planId: string, subscriber: Address): Promise<boolean> {
    const subs = await this.getUserSubscriptions(subscriber);
    const next = subs.map(s => s.planId === planId ? { ...s, active: false } : s);
    localStorage.setItem(`streamless_subs_${subscriber}`, JSON.stringify(next));
    return true;
  }

  // --- Payments ---
  async getPaymentHistory(subscriber: Address): Promise<Payment[]> {
    const raw = localStorage.getItem(`streamless_payments_${subscriber}`) || "[]";
    return JSON.parse(raw) as Payment[];
  }
}

export const contractService = new ContractService();