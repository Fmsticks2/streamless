import { type FormEvent, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function CreatePlan() {
  const { createPlan, loading } = useAppStore()
  const [planId, setPlanId] = useState('')
  const [amount, setAmount] = useState('1')
  const [frequencyDays, setFrequencyDays] = useState(30)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!planId.trim()) {
      alert('Plan ID is required')
      return
    }
    
    const amountInNanoMass = BigInt(parseFloat(amount) * 1_000_000_000) // Convert MASS to nanoMASS
    await createPlan(planId.trim(), amountInNanoMass, frequencyDays)
    setPlanId('')
    setAmount('1')
    setFrequencyDays(30)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Create Plan</h2>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm mb-1">Plan ID</label>
          <input 
            type="text" 
            value={planId} 
            onChange={(e) => setPlanId(e.target.value)} 
            className="w-full rounded bg-gray-900 border border-gray-800 p-2" 
            placeholder="e.g., premium-monthly"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Amount (MASS)</label>
          <input 
            type="number" 
            value={amount} 
            min="0.000000001" 
            step="0.000000001"
            onChange={(e) => setAmount(e.target.value)} 
            className="w-full rounded bg-gray-900 border border-gray-800 p-2" 
            required
          />
          <p className="text-xs text-gray-400 mt-1">Amount in MASS tokens</p>
        </div>
        <div>
          <label className="block text-sm mb-1">Frequency (days)</label>
          <input 
            type="number" 
            value={frequencyDays} 
            min={1} 
            onChange={(e) => setFrequencyDays(parseInt(e.target.value || '1'))} 
            className="w-full rounded bg-gray-900 border border-gray-800 p-2" 
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !planId.trim() || !amount} 
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Plan'}
        </button>
      </form>
    </div>
  )
}