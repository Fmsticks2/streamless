export enum PlanFrequency {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly'
}

export interface Plan {
  id: string;
  name: string;
  creator: string;
  amount: number;
  token: string;
  frequency: PlanFrequency;
  subscribers: number;
  description: string;
  isActive: boolean;
  imageUrl?: string;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  creator: string;
  nextPayment: Date;
  cyclesCompleted: number;
  totalPaid: number;
  status: 'Active' | 'Cancelled' | 'Past Due';
}

export interface Transaction {
  id: string;
  hash: string;
  planName: string;
  date: Date;
  amount: number;
  status: 'Success' | 'Failed' | 'Pending';
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export interface CreatorStats {
  totalRevenue: number;
  activeSubscribers: number;
  activePlans: number;
  churnRate: number;
}