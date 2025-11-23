import { Plan, PlanFrequency, Subscription, Transaction, CreatorStats } from '../types';

export const MOCK_PLANS: Plan[] = [
  {
    id: '1',
    name: 'Alpha Calls Premium',
    creator: 'AU1x...9k2p',
    amount: 50,
    token: 'MASS',
    frequency: PlanFrequency.MONTHLY,
    subscribers: 1240,
    description: 'Exclusive access to high-conviction trading setups and market analysis.',
    isActive: true,
  },
  {
    id: '2',
    name: 'Daily DeFi Digest',
    creator: 'AU1y...3m4q',
    amount: 10,
    token: 'MASS',
    frequency: PlanFrequency.DAILY,
    subscribers: 85,
    description: 'A concise daily summary of the most important DeFi news delivered on-chain.',
    isActive: true,
  },
  {
    id: '3',
    name: 'Artist Support Tier',
    creator: 'AU1z...7n5r',
    amount: 100,
    token: 'USDC',
    frequency: PlanFrequency.MONTHLY,
    subscribers: 342,
    description: 'Support my digital art journey and receive monthly NFT drops.',
    isActive: true,
  },
  {
    id: '4',
    name: 'Pro Tools Access',
    creator: 'AU1a...2b3c',
    amount: 250,
    token: 'MASS',
    frequency: PlanFrequency.YEARLY,
    subscribers: 56,
    description: 'Full license key access to the Massa Analytics suite.',
    isActive: true,
  }
];

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_1',
    planId: '1',
    planName: 'Alpha Calls Premium',
    creator: 'AU1x...9k2p',
    nextPayment: new Date(Date.now() + 86400000 * 15), // 15 days from now
    cyclesCompleted: 3,
    totalPaid: 150,
    status: 'Active',
  },
  {
    id: 'sub_2',
    planId: '3',
    planName: 'Artist Support Tier',
    creator: 'AU1z...7n5r',
    nextPayment: new Date(Date.now() + 86400000 * 2), // 2 days from now
    cyclesCompleted: 12,
    totalPaid: 1200,
    status: 'Active',
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    hash: 'op...3xn9',
    planName: 'Alpha Calls Premium',
    date: new Date(Date.now() - 86400000 * 15),
    amount: 50,
    status: 'Success',
  },
  {
    id: 'tx_2',
    hash: 'op...9vk2',
    planName: 'Artist Support Tier',
    date: new Date(Date.now() - 86400000 * 28),
    amount: 100,
    status: 'Success',
  },
  {
    id: 'tx_3',
    hash: 'op...1mz4',
    planName: 'Daily DeFi Digest',
    date: new Date(Date.now() - 86400000 * 40),
    amount: 10,
    status: 'Failed',
  }
];

export const MOCK_CREATOR_STATS: CreatorStats = {
  totalRevenue: 15420,
  activeSubscribers: 1667,
  activePlans: 3,
  churnRate: 2.4,
};

// Chart Data
export const REVENUE_DATA = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 7500 },
  { name: 'May', value: 6800 },
  { name: 'Jun', value: 9200 },
  { name: 'Jul', value: 15420 },
];
