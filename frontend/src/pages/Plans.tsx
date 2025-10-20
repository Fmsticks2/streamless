import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

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
            <div className="my-2">Amount: {p.amount}</div>
            <button disabled={loading} onClick={() => subscribe(p.id)} className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50">Subscribe</button>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="text-gray-400">No plans yet. Create one.</div>
        )}
      </div>
    </div>
  )
}