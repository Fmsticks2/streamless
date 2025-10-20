import { Link, Outlet } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export default function Layout() {
  const { address, connect, loading } = useAppStore()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">Streamless</Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/plans" className="hover:text-indigo-400">Plans</Link>
            <Link to="/create" className="hover:text-indigo-400">Create Plan</Link>
            <Link to="/subs" className="hover:text-indigo-400">My Subscriptions</Link>
            <Link to="/history" className="hover:text-indigo-400">History</Link>
          </nav>
          <button onClick={connect} disabled={loading} className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50">
            {address ? address.slice(0, 6) + '...' + address.slice(-4) : 'Connect'}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}