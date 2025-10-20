export type Address = string;

export interface Plan {
  id: string;
  creator: Address;
  amount: number; // smallest units
  frequencyDays: number;
  active: boolean;
}

export interface Subscription {
  subscriber: Address;
  planId: string;
  nextPaymentTime: number; // unix seconds
  active: boolean;
  remainingCycles?: number | null;
}

export interface Payment {
  subscriber: Address;
  planId: string;
  amount: number;
  timestamp: number;
}