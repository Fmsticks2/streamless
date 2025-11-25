import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'
import toast from 'react-hot-toast'
import { useStore } from '../store'
import { createPlanOnChain, subscribeOnChain, cancelSubscriptionOnChain } from '../services/massa'
import { PlanFrequency } from '../types'
import { getContractEvents } from '../services/massaEvents'

export const Test = () => {
  const { address, connect, isConnected, addPlan, subscribeToPlan, cancelSubscription, walletType } = useStore()
  const [lastPlanId, setLastPlanId] = useState<string>('')
  const [lastSubId, setLastSubId] = useState<string>('')
  const [events, setEvents] = useState<any[]>([])
  const contractAddress = import.meta.env.VITE_MASSA_CONTRACT_ADDRESS as string

  const ensureWallet = async () => {
    if (!isConnected || walletType !== 'metamask') {
      await connect('metamask')
      if (!useStore.getState().isConnected || useStore.getState().walletType !== 'metamask') throw new Error('MetaMask not connected')
    }
  }

  const doCreatePlan = async () => {
    try {
      await ensureWallet()
      const id = await createPlanOnChain({
        name: 'E2E Test Plan',
        description: 'End-to-end test plan',
        amount: 1,
        token: 'MASS',
        frequency: 'Monthly',
      })
      setLastPlanId(id)
      addPlan({ id, name: 'E2E Test Plan', description: 'End-to-end test plan', amount: 1, token: 'MASS', frequency: PlanFrequency.MONTHLY, subscribers: 0, creator: address || 'Unknown', isActive: true })
      toast.success(`Created plan: ${id}`)
    } catch (e: any) {
      const id = `plan_${Date.now()}`
      setLastPlanId(id)
      addPlan({ id, name: 'E2E Test Plan', description: 'End-to-end test plan', amount: 1, token: 'MASS', frequency: PlanFrequency.MONTHLY, subscribers: 0, creator: address || 'Unknown', isActive: true })
      toast.success('Created plan (off-chain)')
    }
  }

  const doSubscribe = async () => {
    try {
      await ensureWallet()
      if (!lastPlanId) throw new Error('No planId')
      const subId = await subscribeOnChain(lastPlanId)
      setLastSubId(subId)
      const plan = useStore.getState().plans.find(p => p.id === lastPlanId)
      if (plan) subscribeToPlan(plan)
      toast.success(`Subscribed: ${subId}`)
    } catch (e: any) {
      const plan = useStore.getState().plans.find(p => p.id === lastPlanId)
      if (plan) subscribeToPlan(plan)
      const subId = `sub_${Date.now()}`
      setLastSubId(subId)
      toast.success('Subscribed (off-chain)')
    }
  }

  const doCancel = async () => {
    try {
      await ensureWallet()
      if (!lastSubId) throw new Error('No subId')
      const ok = await cancelSubscriptionOnChain(lastSubId)
      if (!ok) toast('On-chain cancel may have failed; local state updated')
      cancelSubscription(lastSubId)
      toast.success('Cancelled subscription')
    } catch (e: any) {
      if (!lastSubId) return
      cancelSubscription(lastSubId)
      toast.success('Cancelled subscription (off-chain)')
    }
  }

  const fetchEvents = async () => {
    try {
      const ev = await getContractEvents(contractAddress, true)
      setEvents(ev)
      toast.success(`Fetched ${ev.length} events`)
    } catch (e: any) {
      toast.error(e?.message || 'Fetch events failed')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">E2E On-chain Test</h1>
      <GlassCard className="p-6 space-y-4">
        <div className="flex gap-3">
          <Button onClick={doCreatePlan}>Create Plan</Button>
          <Button onClick={doSubscribe} disabled={!lastPlanId}>Subscribe</Button>
          <Button onClick={doCancel} disabled={!lastSubId} variant="danger">Cancel</Button>
          <Button onClick={fetchEvents} variant="secondary">Fetch Events</Button>
        </div>
        <div className="text-sm text-gray-300">
          <p>Wallet: {address || 'Not connected'}</p>
          <p>Contract: {contractAddress}</p>
          <p>Last Plan ID: {lastPlanId || '—'}</p>
          <p>Last Sub ID: {lastSubId || '—'}</p>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Events</h3>
          <div className="space-y-2">
            {events.map((e, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-md border border-white/10">
                <div className="text-xs text-gray-400">op: {e?.original_operation_id || '—'}</div>
                <div className="text-white text-sm">{e?.data || '—'}</div>
              </div>
            ))}
            {events.length === 0 && <div className="text-gray-400 text-sm">No events yet</div>}
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
