import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function History() {
  const { address, payments, refresh } = useAppStore()
  useEffect(() => { void refresh() }, [refresh])

  if (!address) return <div>Connect your wallet to see payment history.</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Payment History</h2>
      <div className="space-y-3">
        {payments.map((p, idx) => (
          <div key={idx} className="border border-gray-800 rounded p-4">
            <div className="font-medium">Plan: {p.planId}</div>
            <div className="text-sm text-gray-400">Amount: {p.amount}</div>
            <div className="text-sm text-gray-400">Time: {new Date(p.timestamp * 1000).toLocaleString()}</div>
          </div>
        ))}
        {payments.length === 0 && (
          <div className="text-gray-400">No payments yet.</div>
        )}
      </div>
    </div>
  )
}