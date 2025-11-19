import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

function formatTimestamp(timestamp: number): string {
  // Contract returns milliseconds, convert to Date
  return new Date(timestamp).toLocaleString()
}

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
            <div className="text-sm text-gray-400">Next Payment: {formatTimestamp(s.nextPaymentTime)}</div>
            <div className="text-sm">Status: {s.active ? 'Active' : 'Cancelled'}</div>
            {s.remainingCycles && (
              <div className="text-sm text-gray-400">Remaining Cycles: {s.remainingCycles}</div>
            )}
            {s.active && (
              <button 
                onClick={() => cancel(s.planId)} 
                disabled={loading} 
                className="mt-2 px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50"
              >
                {loading ? 'Cancelling...' : 'Cancel'}
              </button>
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