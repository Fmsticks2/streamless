import { create } from 'zustand';
import { WalletState, Plan, Subscription, PlanFrequency, Transaction, CreatorStats } from './types';
import { MOCK_PLANS, MOCK_SUBSCRIPTIONS, MOCK_TRANSACTIONS, MOCK_CREATOR_STATS } from './services/mockData';
import toast from 'react-hot-toast';

interface AppState extends WalletState {
  plans: Plan[];
  subscriptions: Subscription[];
  transactions: Transaction[];
  creatorStats: CreatorStats;
  revenueData: { name: string; value: number }[];
  addPlan: (plan: Plan) => void;
  subscribeToPlan: (plan: Plan) => void;
  cancelSubscription: (subId: string) => void;
  _updateDerived: () => void;
}

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useStore = create<AppState>((set, get) => ({
  // Wallet State
  isConnected: false,
  address: null,
  balance: 0,
  walletType: undefined,
  
  // Data State
  plans: MOCK_PLANS,
  subscriptions: MOCK_SUBSCRIPTIONS,
  transactions: MOCK_TRANSACTIONS,
  creatorStats: MOCK_CREATOR_STATS,
  revenueData: (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const tx = MOCK_TRANSACTIONS
    const now = new Date()
    const series: { name: string; value: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = months[d.getMonth()]
      const y = d.getFullYear()
      const value = tx.filter(t => t.status === 'Success' && t.date.getMonth() === d.getMonth() && t.date.getFullYear() === y).reduce((a, b) => a + b.amount, 0)
      series.push({ name: m, value })
    }
    return series
  })(),

  _updateDerived: () => {
    const state = get()
    const totalRevenue = state.transactions.filter(t => t.status === 'Success').reduce((a, b) => a + b.amount, 0)
    const activeSubscribers = state.subscriptions.filter(s => s.status === 'Active').length
    const activePlans = state.plans.filter(p => p.isActive).length
    const cancelled = state.subscriptions.filter(s => s.status === 'Cancelled').length
    const totalSubs = state.subscriptions.length || 1
    const churnRate = Math.round((cancelled / totalSubs) * 1000) / 10
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const now = new Date()
    const series: { name: string; value: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = months[d.getMonth()]
      const y = d.getFullYear()
      const value = state.transactions.filter(t => t.status === 'Success' && t.date.getMonth() === d.getMonth() && t.date.getFullYear() === y).reduce((a, b) => a + b.amount, 0)
      series.push({ name: m, value })
    }
    set({
      creatorStats: { totalRevenue, activeSubscribers, activePlans, churnRate },
      revenueData: series,
    })
  },

  connect: async (walletType?: 'metamask', options?: { silent?: boolean }) => {
    try {
      if (walletType === 'metamask' || (!walletType && (window as any).ethereum)) {
        const eth = (window as any).ethereum
        if (!eth) throw new Error('MetaMask not found')
        const accounts = await eth.request({ method: 'eth_requestAccounts' })
        set({ isConnected: true, address: accounts[0], balance: 0, walletType: 'metamask' })
        if (!options?.silent) toast.success('MetaMask connected')
        return
      }
      throw new Error('No supported wallet found')
    } catch (error) {
      if (!options?.silent) {
        console.error('Connection failed', error)
        toast.error((error as any)?.message || 'Failed to connect wallet')
      }
    }
  },


  disconnect: () => {
    set({
      isConnected: false,
      address: null,
      balance: 0,
      walletType: undefined
    });
    toast.success('Wallet disconnected');
  },

  // Actions
  addPlan: (plan: Plan) => {
    set((state) => ({ plans: [plan, ...state.plans] }));
    get()._updateDerived()
  },

  subscribeToPlan: (plan: Plan) => {
    const state = get();
    
    // Check if already subscribed to this plan (active)
    const existingSub = state.subscriptions.find(s => s.planId === plan.id && s.status === 'Active');
    if (existingSub) {
        toast.error(`You are already subscribed to ${plan.name}`);
        return;
    }

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      planId: plan.id,
      planName: plan.name,
      creator: plan.creator,
      nextPayment: new Date(Date.now() + 86400000 * (
        plan.frequency === PlanFrequency.DAILY ? 1 : 
        plan.frequency === PlanFrequency.WEEKLY ? 7 : 
        plan.frequency === PlanFrequency.MONTHLY ? 30 : 365
      )),
      cyclesCompleted: 0,
      totalPaid: 0,
      status: 'Active'
    };
    
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      hash: `op...${Math.random().toString(36).slice(2,8)}`,
      planName: plan.name,
      date: new Date(),
      amount: plan.amount,
      status: 'Success'
    }
    set((state) => ({ 
        subscriptions: [newSub, ...state.subscriptions],
        plans: state.plans.map(p => 
            p.id === plan.id ? { ...p, subscribers: p.subscribers + 1 } : p
        ),
        transactions: [newTx, ...state.transactions]
    }));
    get()._updateDerived()
  },

  cancelSubscription: (subId: string) => {
    set((state) => ({
      subscriptions: state.subscriptions.map(sub => 
        sub.id === subId ? { ...sub, status: 'Cancelled' } : sub
      ),
    }));
    get()._updateDerived()
  }
}));
