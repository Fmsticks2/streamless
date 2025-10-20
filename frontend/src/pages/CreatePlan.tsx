import { type FormEvent, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function CreatePlan() {
  const { createPlan, loading } = useAppStore()
  const [amount, setAmount] = useState(1)
  const [frequencyDays, setFrequencyDays] = useState(30)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await createPlan(amount, frequencyDays)
    setAmount(1)
    setFrequencyDays(30)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Create Plan</h2>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm mb-1">Amount</label>
          <input type="number" value={amount} min={1} onChange={(e) => setAmount(parseInt(e.target.value || '0'))} className="w-full rounded bg-gray-900 border border-gray-800 p-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Frequency (days)</label>
          <input type="number" value={frequencyDays} min={1} onChange={(e) => setFrequencyDays(parseInt(e.target.value || '0'))} className="w-full rounded bg-gray-900 border border-gray-800 p-2" />
        </div>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50">Create</button>
      </form>
    </div>
  )
}