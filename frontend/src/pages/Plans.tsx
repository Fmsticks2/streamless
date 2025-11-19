import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

function formatMass(nanoMass: number): string {
  return (nanoMass / 1_000_000_000).toFixed(9).replace(/\.?0+$/, '') + ' MASS'
}

export default function Plans() {
  const { plans, subscribe, refresh, loading } = useAppStore()
  useEffect(() => { void refresh() }, [refresh])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {plans.map(p => (
          <div key={p.id} className="border border-gray-800 rounded p-4">
            <div className="font-medium">{p.id}</div>
            <div className="text-sm text-gray-400">Every {p.frequencyDays} days</div>
            <div className="my-2">Amount: {formatMass(p.amount)}</div>
            <div className="text-xs text-gray-500 mb-2">Creator: {p.creator}</div>
            <div className="text-xs text-gray-500 mb-3">Status: {p.active ? 'Active' : 'Inactive'}</div>
            <button 
              disabled={loading || !p.active} 
              onClick={() => subscribe(p.id)} 
              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Subscribe'}
            </button>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="text-gray-400">No plans yet. Create one.</div>
        )}
      </div>
    </div>
  )
}