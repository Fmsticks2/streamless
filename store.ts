import { create } from 'zustand';
import { WalletState, Plan, Subscription, PlanFrequency } from './types';
import { MOCK_PLANS, MOCK_SUBSCRIPTIONS } from './services/mockData';
import toast from 'react-hot-toast';

interface AppState extends WalletState {
  plans: Plan[];
  subscriptions: Subscription[];
  addPlan: (plan: Plan) => void;
  subscribeToPlan: (plan: Plan) => void;
  cancelSubscription: (subId: string) => void;
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
    
    set((state) => ({ 
        subscriptions: [newSub, ...state.subscriptions],
        plans: state.plans.map(p => 
            p.id === plan.id ? { ...p, subscribers: p.subscribers + 1 } : p
        )
    }));
  },

  cancelSubscription: (subId: string) => {
    set((state) => ({
      subscriptions: state.subscriptions.map(sub => 
        sub.id === subId ? { ...sub, status: 'Cancelled' } : sub
      ),
      // Optionally decrement subscriber count if we were tracking it strictly per plan in a real app
    }));
  }
}));
