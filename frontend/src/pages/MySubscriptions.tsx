import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function MySubscriptions() {
  const { address, subscriptions, refresh, cancel, loading } = useAppStore()
  useEffect(() => { void refresh() }, [refresh])

  if (!address) return <div>Connect your wallet to see subscriptions.</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Subscriptions</h2>
      <div className="space-y-3">
        {subscriptions.map(s => (
          <div key={s.planId} className="border border-gray-800 rounded p-4">
            <div className="font-medium">Plan: {s.planId}</div>
            <div className="text-sm text-gray-400">Next: {new Date(s.nextPaymentTime * 1000).toLocaleString()}</div>
            <div className="text-sm">Status: {s.active ? 'Active' : 'Cancelled'}</div>
            {s.active && (
              <button onClick={() => cancel(s.planId)} disabled={loading} className="mt-2 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50">Cancel</button>
            )}
          </div>
        ))}
        {subscriptions.length === 0 && (
          <div className="text-gray-400">No active subscriptions.</div>
        )}
      </div>
    </div>
  )
}