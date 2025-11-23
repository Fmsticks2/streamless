import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { PlanFrequency } from '../types';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

export const Create = () => {
  const { addPlan, isConnected, connect, address } = useStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    token: 'MASS',
    frequency: PlanFrequency.MONTHLY
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
        toast.error("Please connect your wallet to create a plan");
        try {
          await connect();
        } catch {
          return;
        }
        if (!useStore.getState().isConnected) return;
    }

    setIsSubmitting(true);
    
    // Simulate contract interaction
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add to store
    addPlan({
        id: `plan_${Date.now()}`,
        name: formData.name,
        creator: address || 'Unknown',
        amount: parseFloat(formData.amount),
        token: formData.token,
        frequency: formData.frequency,
        subscribers: 0,
        description: formData.description,
        isActive: true
    });

    setIsSubmitting(false);
    toast.success('Plan created successfully!');
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      amount: '',
      token: 'MASS',
      frequency: PlanFrequency.MONTHLY
    });

    // Navigate to browse
    navigate('/browse');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Section */}
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Create New Plan</h1>
          <p className="text-gray-400 mb-8">Setup your recurring payment stream on-chain.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <GlassCard className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Plan Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-colors"
                  placeholder="e.g. Premium Access"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-colors"
                  placeholder="What do subscribers get?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Token</label>
                  <select 
                    value={formData.token}
                    onChange={(e) => setFormData({...formData, token: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-colors appearance-none"
                  >
                    <option value="MASS">MASS</option>
                    <option value="USDC">USDC</option>
                    <option value="WETH">WETH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Billing Frequency</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(PlanFrequency).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFormData({...formData, frequency: freq})}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                        formData.frequency === freq 
                          ? 'bg-white/20 border-white/40 text-white' 
                          : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                Create Subscription Contract
              </Button>
            </GlassCard>
          </form>
        </div>

        {/* Preview Section */}
        <div className="flex flex-col justify-center">
          <div className="sticky top-24">
            <h3 className="text-gray-400 font-medium mb-4 uppercase text-sm tracking-wider">Preview</h3>
            <GlassCard className="p-6 border-white/20 shadow-2xl shadow-black/20">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white/10 border border-white/20 w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  ⚡
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                  NEW
                </div>
              </div>

              <h3 className="text-2xl font-bold font-display mb-2 text-white">
                {formData.name || 'Plan Name'}
              </h3>
              <p className="text-sm text-gray-400 font-mono mb-4">By {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'You'}</p>
              
              <p className="text-gray-300 text-sm mb-6 min-h-[4.5rem]">
                {formData.description || 'Description will appear here...'}
              </p>

              <div className="pt-6 border-t border-white/10">
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-white">
                    {formData.amount || '0'}
                  </span>
                  <span className="text-sm text-gray-400 ml-1 font-bold">
                    {formData.token}
                  </span>
                  <span className="text-gray-500 ml-2 text-sm">
                    / {formData.frequency}
                  </span>
                </div>
                <Button className="w-full" disabled>Subscribe</Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};