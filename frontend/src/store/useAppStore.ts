import { create } from 'zustand'
import type { Plan, Subscription, Payment } from '../types'
import { contractService } from '../services/contract'

interface AppState {
  address: string | null
  plans: Plan[]
  subscriptions: Subscription[]
  payments: Payment[]
  loading: boolean
  depositBalance: bigint
  connect: () => Promise<void>
  refresh: () => Promise<void>
  createPlan: (planId: string, amount: bigint, frequencyDays: number) => Promise<void>
  subscribe: (planId: string, cycles?: number) => Promise<void>
  cancel: (planId: string) => Promise<void>
  deposit: (amount: bigint) => Promise<void>
  withdraw: (amount: bigint) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  address: null,
  plans: [],
  subscriptions: [],
  payments: [],
  loading: false,
  depositBalance: 0n,

  connect: async () => {
    set({ loading: true })
    try {
      await contractService.init()
      const addr = await contractService.connectWallet()
      set({ address: addr })
      await get().refresh()
    } catch (error) {
      console.error('Failed to connect:', error)
    } finally {
      set({ loading: false })
    }
  },

  refresh: async () => {
    const { address } = get()
    try {
      const [plans, subscriptions, payments] = await Promise.all([
        contractService.listPlans(),
        address ? contractService.getUserSubscriptions(address) : Promise.resolve([]),
        address ? contractService.getPaymentHistory(address) : Promise.resolve([]),
      ])
      
      const depositBalance = address ? await contractService.getDepositBalance(address) : 0n
      
      set({ plans, subscriptions, payments, depositBalance })
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  },

  createPlan: async (planId: string, amount: bigint, frequencyDays: number) => {
    set({ loading: true })
    try {
      await contractService.createPlan(planId, amount, frequencyDays)
      await get().refresh()
    } catch (error) {
      console.error('Failed to create plan:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  subscribe: async (planId: string, cycles?: number) => {
    set({ loading: true })
    try {
      await contractService.subscribe(planId, cycles)
      await get().refresh()
    } catch (error) {
      console.error('Failed to subscribe:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  cancel: async (planId: string) => {
    set({ loading: true })
    try {
      await contractService.cancelSubscription(planId)
      await get().refresh()
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  deposit: async (amount: bigint) => {
    set({ loading: true })
    try {
      await contractService.deposit(amount)
      await get().refresh()
    } catch (error) {
      console.error('Failed to deposit:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  withdraw: async (amount: bigint) => {
    set({ loading: true })
    try {
      await contractService.withdraw(amount)
      await get().refresh()
    } catch (error) {
      console.error('Failed to withdraw:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },
}))