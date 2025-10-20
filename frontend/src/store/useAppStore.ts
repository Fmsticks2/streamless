import { create } from 'zustand'
import type { Address, Plan, Subscription, Payment } from '../types'
import { contractService } from '../services/contract'

interface AppState {
  address: Address | null
  plans: Plan[]
  subscriptions: Subscription[]
  payments: Payment[]
  loading: boolean
  connect: () => Promise<void>
  refresh: () => Promise<void>
  createPlan: (amount: number, frequencyDays: number) => Promise<void>
  subscribe: (planId: string, cycles?: number) => Promise<void>
  cancel: (planId: string) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  address: null,
  plans: [],
  subscriptions: [],
  payments: [],
  loading: false,

  connect: async () => {
    set({ loading: true })
    const addr = await contractService.connectWallet()
    set({ address: addr })
    await get().refresh()
    set({ loading: false })
  },

  refresh: async () => {
    const { address } = get()
    const [plans, subscriptions, payments] = await Promise.all([
      contractService.listPlans(),
      address ? contractService.getUserSubscriptions(address) : Promise.resolve([]),
      address ? contractService.getPaymentHistory(address) : Promise.resolve([]),
    ])
    set({ plans, subscriptions, payments })
  },

  createPlan: async (amount: number, frequencyDays: number) => {
    set({ loading: true })
    await contractService.createPlan({ amount, frequencyDays })
    await get().refresh()
    set({ loading: false })
  },

  subscribe: async (planId: string, cycles?: number) => {
    set({ loading: true })
    const { address } = get()
    if (!address) throw new Error('Connect wallet first')
    await contractService.subscribe(planId, address, cycles)
    await get().refresh()
    set({ loading: false })
  },

  cancel: async (planId: string) => {
    set({ loading: true })
    const { address } = get()
    if (!address) throw new Error('Connect wallet first')
    await contractService.cancelSubscription(planId, address)
    await get().refresh()
    set({ loading: false })
  },
}))