import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

function formatMass(nanoMass: bigint): string {
  return (Number(nanoMass) / 1_000_000_000).toFixed(9).replace(/\.?0+$/, '') + ' MASS'
}

export default function Wallet() {
  const { address, depositBalance, deposit, withdraw, refresh, loading } = useAppStore()
  const [depositAmount, setDepositAmount] = useState('1')
  const [withdrawAmount, setWithdrawAmount] = useState('1')

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (!address) {
    return <div>Connect your wallet to manage deposits.</div>
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const amountInNanoMass = BigInt(parseFloat(depositAmount) * 1_000_000_000)
      await deposit(amountInNanoMass)
      setDepositAmount('1')
    } catch (error) {
      console.error('Deposit failed:', error)
      alert('Deposit failed. Please try again.')
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const amountInNanoMass = BigInt(parseFloat(withdrawAmount) * 1_000_000_000)
      await withdraw(amountInNanoMass)
      setWithdrawAmount('1')
    } catch (error) {
      console.error('Withdraw failed:', error)
      alert('Withdraw failed. Please try again.')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Wallet Management</h2>
      
      <div className="mb-6 p-4 border border-gray-800 rounded">
        <h3 className="text-lg font-medium mb-2">Balance</h3>
        <div className="text-2xl font-bold text-green-400">
          {formatMass(depositBalance)}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Available for subscription payments
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border border-gray-800 rounded">
          <h3 className="text-lg font-medium mb-4">Deposit</h3>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Amount (MASS)</label>
              <input
                type="number"
                value={depositAmount}
                min="0.000000001"
                step="0.000000001"
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full rounded bg-gray-900 border border-gray-800 p-2"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Deposit MASS tokens to pay for subscriptions
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !depositAmount}
              className="w-full px-4 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50"
            >
              {loading ? 'Depositing...' : 'Deposit'}
            </button>
          </form>
        </div>

        <div className="p-4 border border-gray-800 rounded">
          <h3 className="text-lg font-medium mb-4">Withdraw</h3>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Amount (MASS)</label>
              <input
                type="number"
                value={withdrawAmount}
                min="0.000000001"
                step="0.000000001"
                max={Number(depositBalance) / 1_000_000_000}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full rounded bg-gray-900 border border-gray-800 p-2"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Withdraw your deposited MASS tokens
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !withdrawAmount || depositBalance === 0n}
              className="w-full px-4 py-2 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? 'Withdrawing...' : 'Withdraw'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 p-4 border border-gray-800 rounded bg-gray-900/50">
        <h3 className="text-lg font-medium mb-2">How it works</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Deposit MASS tokens to fund your subscription payments</li>
          <li>• The contract will automatically deduct payments from your deposit balance</li>
          <li>• You can withdraw unused funds at any time</li>
          <li>• Make sure to maintain sufficient balance for active subscriptions</li>
        </ul>
      </div>
    </div>
  )
}