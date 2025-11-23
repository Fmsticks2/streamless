import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { ArrowRight, ShieldCheck, Zap, Repeat, TrendingUp, Search, Cpu } from 'lucide-react';
import CountUp from 'react-countup';

const StatCard = ({ label, value, prefix = "", suffix = "" }: { label: string, value: number, prefix?: string, suffix?: string }) => (
  <GlassCard className="p-6 text-center">
    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{label}</h3>
    <div className="text-4xl font-bold font-display bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
      <CountUp end={value} prefix={prefix} suffix={suffix} duration={2.5} separator="," />
    </div>
  </GlassCard>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <GlassCard variant="hover" className="p-8 h-full">
    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white mb-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </GlassCard>
);

export const Home = () => {
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 flex flex-col items-center justify-center text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white mb-8 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Live on Massa Testnet
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl font-bold font-display tracking-tight leading-tight mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Autonomous Payments <br />
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            Powered by Massa.
          </span>
        </motion.h1>

        <motion.p 
          className="text-xl text-gray-400 max-w-2xl mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Streamless leverages Massa's Autonomous Smart Contracts to execute recurring payments automatically on-chain. No scripts, no keepers, 100% decentralized.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/browse">
            <Button size="lg" leftIcon={<Search size={20} />}>
              Explore Plans
            </Button>
          </Link>
          <Link to="/create">
            <Button variant="secondary" size="lg" leftIcon={<Zap size={20} />}>
              Start Earning
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="px-4 mb-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Volume Locked" value={1245000} prefix="$" />
          <StatCard label="Active Subscriptions" value={8543} />
          <StatCard label="Creators Earning" value={1240} />
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 max-w-7xl mx-auto mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Why Streamless?</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Built on Massa to do what other blockchains can't.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Cpu size={24} />}
            title="Autonomous SCs" 
            description="Smart contracts that wake themselves up. Payments execute automatically without any off-chain infrastructure."
          />
          <FeatureCard 
            icon={<ShieldCheck size={24} />}
            title="Trustless & Secure" 
            description="Non-custodial architecture. Funds flow directly from subscriber to creator wallet via the Massa blockchain."
          />
          <FeatureCard 
            icon={<TrendingUp size={24} />}
            title="Creator Economy" 
            description="Empowering creators with real-time analytics, zero-friction onboarding, and recurring on-chain revenue."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4">
        <GlassCard className="max-w-5xl mx-auto p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
          
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-6 relative z-10">Ready to monetize on-chain?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto relative z-10">
            Join the first autonomous subscription protocol on DeWeb.
          </p>
          <div className="relative z-10">
            <Link to="/create">
              <Button size="lg" className="px-10">Create Your First Plan <ArrowRight className="ml-2" size={20} /></Button>
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};