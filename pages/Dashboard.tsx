import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { MOCK_CREATOR_STATS, REVENUE_DATA, MOCK_SUBSCRIPTIONS } from '../services/mockData';
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
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-display mb-8">Creator Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatBox 
          label="Total Revenue" 
          value={`$${MOCK_CREATOR_STATS.totalRevenue}`} 
          icon={<CreditCard size={20} />} 
          change={12}
        />
        <StatBox 
          label="Active Subscribers" 
          value={MOCK_CREATOR_STATS.activeSubscribers} 
          icon={<Users size={20} />} 
          change={5.4}
        />
        <StatBox 
          label="Active Plans" 
          value={MOCK_CREATOR_STATS.activePlans} 
          icon={<Box size={20} />} 
        />
        <StatBox 
          label="Avg Churn Rate" 
          value={`${MOCK_CREATOR_STATS.churnRate}%`} 
          icon={<TrendingUp size={20} className="rotate-180 text-red-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-[400px]">
            <h3 className="text-lg font-bold mb-6">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
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
                  dataKey="value" 
                  stroke="#ffffff" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
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
               {/* Mocking recent sub list from existing data */}
               {[1,2,3,4,5].map((_, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                       AU
                     </div>
                     <div>
                       <p className="text-sm font-medium text-white">AU1z...9k2p</p>
                       <p className="text-xs text-gray-500">Subscribed to Plan #{i + 1}</p>
                     </div>
                   </div>
                   <span className="text-green-400 text-xs font-bold">+50 MASS</span>
                 </div>
               ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};