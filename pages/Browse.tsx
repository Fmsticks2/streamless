import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Search, Filter, User, Clock, CheckCircle } from 'lucide-react';
import { useStore } from '../store';
import { Plan } from '../types';
import toast from 'react-hot-toast';

const PlanCard = ({ plan, onSubscribe }: { plan: Plan, onSubscribe: (plan: Plan) => Promise<void> }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    await onSubscribe(plan);
    setLoading(false);
  };

  return (
    <GlassCard variant="hover" className="flex flex-col h-full p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-white/5 p-3 rounded-xl">
           <span className="text-2xl">💎</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          ACTIVE
        </div>
      </div>

      <h3 className="text-xl font-bold font-display mb-1">{plan.name}</h3>
      <p className="text-sm text-gray-400 font-mono mb-4 truncate">By {plan.creator}</p>
      
      <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
        {plan.description}
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-white" />
            <span>{plan.frequency}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={16} className="text-white" />
            <span>{plan.subscribers} subs</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-white">{plan.amount}</span>
            <span className="text-sm text-gray-400 ml-1">{plan.token}</span>
          </div>
          <Button size="sm" onClick={handleSubscribe} isLoading={loading}>
            Subscribe
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

export const Browse = () => {
  const { plans, subscribeToPlan, isConnected, connect } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlans = useMemo(() => {
    return plans.filter(plan => 
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, plans]);

  const handleSubscribe = async (plan: Plan) => {
    if (!isConnected) {
        toast.error("Please connect your wallet first");
        try {
            await connect();
        } catch {
            // Error handled in connect()
            return;
        }
        // Check connection status after attempt
        if (!useStore.getState().isConnected) return;
    }
    
    // Simulate contract transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    subscribeToPlan(plan);
    toast.success(`Successfully subscribed to ${plan.name}`);
  };

  const handleFilter = () => {
    toast('Filter functionality coming in v1.1', {
        icon: '🌪️',
        style: {
            background: '#333',
            color: '#fff',
        },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Explore Plans</h1>
          <p className="text-gray-400">Discover premium content and services</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search plans..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
            />
          </div>
          <Button variant="secondary" leftIcon={<Filter size={18} />} onClick={handleFilter}>
            Filter
          </Button>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        {filteredPlans.map(plan => (
          <motion.div key={plan.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <PlanCard plan={plan} onSubscribe={handleSubscribe} />
          </motion.div>
        ))}
      </motion.div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 text-gray-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">No plans found</h3>
          <p className="text-gray-400">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
};