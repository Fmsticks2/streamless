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
  
  // Data State
  plans: MOCK_PLANS,
  subscriptions: MOCK_SUBSCRIPTIONS,

  connect: async () => {
    try {
      // 1. Try EVM (Rainbow/MetaMask/etc)
      if ((window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          set({ 
            isConnected: true, 
            address: accounts[0], 
            balance: 1450.23 // Mock balance
          });
          toast.success('Wallet connected successfully!');
          return;
        } catch (err) {
          console.error("User rejected EVM connection", err);
          throw err;
        }
      }

      // 2. Try Massa (Bearby)
      if ((window as any).bearby) {
        try {
          await (window as any).bearby.connect();
          const details = await (window as any).bearby.wallet.account.base58;
          set({ 
            isConnected: true, 
            address: details, 
            balance: 1450.23 
          });
          toast.success('Massa wallet connected!');
          return;
        } catch (err) {
          console.error("Bearby connection failed", err);
        }
      }

      // 3. Try Massa Station
      if ((window as any).massa) {
        try {
          const accounts = await (window as any).massa.request({ method: 'massa_requestAccounts' });
           set({ 
            isConnected: true, 
            address: accounts[0], 
            balance: 1450.23 
          });
          toast.success('Massa Station connected!');
          return;
        } catch (err) {
          console.error("Massa Station connection failed", err);
        }
      }

      // 4. Fallback Mock (for demo purposes if no extension)
      await delay(800);
      const mockAddress = '0x71C...9A23'; // Looks like EVM for Rainbow vibe
      set({
        isConnected: true,
        address: mockAddress,
        balance: 1450.23
      });
      toast.success('Mock Wallet Connected');
      
    } catch (error) {
      console.error("Connection failed", error);
      toast.error('Failed to connect wallet');
    }
  },

  disconnect: () => {
    set({
      isConnected: false,
      address: null,
      balance: 0
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