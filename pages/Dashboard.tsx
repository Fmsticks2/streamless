import React, { useMemo } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useStore } from '../store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Box, CreditCard } from 'lucide-react';

const StatBox = ({ label, value, icon, change }: any) => (
  <GlassCard className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-white/10 rounded-xl text-white border border-white/10">
        {icon}
      </div>
      {change && (
        <span className="text-green-400 text-sm font-medium flex items-center">
          +{change}%
          <TrendingUp size={14} className="ml-1" />
        </span>
      )}
    </div>
    <div className="text-2xl font-bold font-display text-white mb-1">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    <div className="text-gray-400 text-sm">{label}</div>
  </GlassCard>
);

export const Dashboard = () => {
  const { creatorStats, transactions, subscriptions } = useStore();
  const chartData = useMemo(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const now = new Date()
    const monthly: { name: string; monthly: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = months[d.getMonth()]
      const y = d.getFullYear()
      const value = transactions.filter(t => t.status === 'Success' && t.date.getMonth() === d.getMonth() && t.date.getFullYear() === y).reduce((a, b) => a + b.amount, 0)
      monthly.push({ name: m, monthly: value })
    }
    let cum = 0
    return monthly.map(pt => { cum += pt.monthly; return { name: pt.name, monthly: pt.monthly, cumulative: cum } })
  }, [transactions])
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-display mb-8">Creator Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatBox 
          label="Total Revenue" 
          value={`$${creatorStats.totalRevenue}`} 
          icon={<CreditCard size={20} />} 
          change={12}
        />
        <StatBox 
          label="Active Subscribers" 
          value={creatorStats.activeSubscribers} 
          icon={<Users size={20} />} 
          change={5.4}
        />
        <StatBox 
          label="Active Plans" 
          value={creatorStats.activePlans} 
          icon={<Box size={20} />} 
        />
        <StatBox 
          label="Avg Churn Rate" 
          value={`${creatorStats.churnRate}%`} 
          icon={<TrendingUp size={20} className="rotate-180 text-red-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-[400px]">
            <h3 className="text-lg font-bold mb-6">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(10, 10, 15, 0.8)', 
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="monthly" 
                  stroke="#60a5fa" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorMonthly)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#ffffff" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCumulative)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-[400px] overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold mb-4">Recent Subscribers</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {subscriptions.slice(0, 10).map((s, i) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                      {String(s.creator).slice(0,2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{s.creator}</p>
                      <p className="text-xs text-gray-500">Subscribed to {s.planName}</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-xs font-bold">+{s.planName ? (useStore.getState().plans.find(p => p.id === s.planId)?.amount || 0) : 0} MASS</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
