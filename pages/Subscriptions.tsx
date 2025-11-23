import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Calendar, AlertCircle, History, XCircle, CheckCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Subscription } from '../types';

// Cancel Modal Component
const CancelModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  sub 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  sub: Subscription | null 
}) => {
  if (!isOpen || !sub) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-md bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-4 mx-auto">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-xl font-bold text-center mb-2">Cancel Subscription?</h3>
        <p className="text-gray-400 text-center text-sm mb-6">
          Are you sure you want to cancel your subscription to <span className="text-white font-semibold">{sub.planName}</span>? You will lose access at the end of the current billing period.
        </p>
        
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Go Back</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm}>Yes, Cancel</Button>
        </div>
      </motion.div>
    </div>
  );
};

// Details Modal Component
const DetailsModal = ({ 
  isOpen, 
  onClose, 
  sub 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  sub: Subscription | null 
}) => {
  if (!isOpen || !sub) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-lg bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 border-b border-white/10">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-2xl font-bold font-display">{sub.planName}</h3>
                <p className="text-gray-400 text-sm">ID: {sub.id}</p>
             </div>
             <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${sub.status === 'Active' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {sub.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {sub.status.toUpperCase()}
             </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Creator</p>
              <p className="font-mono text-sm truncate">{sub.creator}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
               <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Paid</p>
               <p className="font-bold text-primary">{sub.totalPaid} MASS</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
               <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Next Payment</p>
               <p>{format(new Date(sub.nextPayment), 'MMM d, yyyy')}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
               <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Cycles</p>
               <p>{sub.cyclesCompleted}</p>
            </div>
          </div>

          <Button className="w-full" variant="secondary" onClick={onClose}>Close Details</Button>
        </div>
      </motion.div>
    </div>
  );
};

export const Subscriptions = () => {
  const { subscriptions, cancelSubscription } = useStore();
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleCancelClick = (sub: Subscription) => {
    setSelectedSub(sub);
    setIsCancelModalOpen(true);
  };

  const handleDetailsClick = (sub: Subscription) => {
    setSelectedSub(sub);
    setIsDetailsModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedSub) {
      cancelSubscription(selectedSub.id);
      toast.success('Subscription cancelled successfully');
      setIsCancelModalOpen(false);
      setSelectedSub(null);
    }
  };

  const activeSubs = subscriptions.filter(s => s.status === 'Active');
  const inactiveSubs = subscriptions.filter(s => s.status !== 'Active');
  const displaySubs = [...activeSubs, ...inactiveSubs];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">My Subscriptions</h1>
          <p className="text-gray-400 mt-1">Manage your recurring payments</p>
        </div>
        <Button variant="ghost" leftIcon={<History size={18} />}>History</Button>
      </div>

      {displaySubs.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">No subscriptions found</h3>
          <p className="text-gray-400">You haven't subscribed to any plans yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displaySubs.map(sub => (
            <GlassCard 
              key={sub.id} 
              className={`p-0 overflow-hidden flex flex-col ${sub.status !== 'Active' ? 'opacity-75 grayscale-[0.5]' : ''}`}
            >
              {/* Status Bar */}
              <div className={`h-1.5 w-full ${sub.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold font-display mb-1 line-clamp-1" title={sub.planName}>{sub.planName}</h3>
                    <p className="text-sm text-gray-400 font-mono truncate max-w-[150px]">{sub.creator}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-400 mb-1">Total Paid</p>
                    <p className="text-lg font-bold text-primary">{sub.totalPaid} <span className="text-xs">MASS</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <Calendar size={16} />
                      Next
                    </div>
                    <p className="text-sm font-medium text-white">
                      {sub.status === 'Active' ? format(new Date(sub.nextPayment), 'MMM d') : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <AlertCircle size={16} />
                      Cycles
                    </div>
                    <p className="text-sm font-medium text-white">
                      {sub.cyclesCompleted}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex gap-3">
                  {sub.status === 'Active' ? (
                    <Button 
                      variant="danger" 
                      className="flex-1" 
                      size="sm"
                      onClick={() => handleCancelClick(sub)}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button 
                      variant="secondary" 
                      className="flex-1" 
                      size="sm"
                      disabled
                    >
                      Cancelled
                    </Button>
                  )}
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    size="sm"
                    leftIcon={<Eye size={14} />}
                    onClick={() => handleDetailsClick(sub)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isCancelModalOpen && (
          <CancelModal 
            isOpen={isCancelModalOpen} 
            onClose={() => setIsCancelModalOpen(false)} 
            onConfirm={handleConfirmCancel}
            sub={selectedSub}
          />
        )}
        {isDetailsModalOpen && (
          <DetailsModal 
            isOpen={isDetailsModalOpen} 
            onClose={() => setIsDetailsModalOpen(false)} 
            sub={selectedSub}
          />
        )}
      </AnimatePresence>
    </div>
  );
};