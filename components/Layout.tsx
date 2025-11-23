import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { Button } from './ui/Button';
import { 
  Wallet, 
  Menu, 
  X, 
  LayoutDashboard, 
  Search, 
  PlusCircle, 
  CreditCard,
  LogOut,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

const BackgroundOrbs = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <motion.div 
      animate={{ 
        x: [0, 100, 0], 
        y: [0, -50, 0],
        scale: [1, 1.2, 1] 
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[128px] mix-blend-screen opacity-30"
    />
    <motion.div 
      animate={{ 
        x: [0, -100, 0], 
        y: [0, 100, 0],
        scale: [1, 1.3, 1] 
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[128px] mix-blend-screen opacity-30"
    />
    <motion.div 
      animate={{ 
        x: [0, 50, 0], 
        y: [0, 50, 0],
        scale: [1, 1.1, 1] 
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gray-500/10 rounded-full blur-[128px] mix-blend-screen opacity-20"
    />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
  </div>
);

const Navbar = () => {
  const { isConnected, connect, disconnect, address, balance } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    await connect();
    setIsConnecting(false);
  };

  const navLinks = [
    { name: 'Browse', path: '/browse', icon: <Search size={18} /> },
    { name: 'Create', path: '/create', icon: <PlusCircle size={18} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Subscriptions', path: '/subscriptions', icon: <CreditCard size={18} /> },
  ];

  // Helper to truncate address
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
             <div className="relative w-10 h-10 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                  <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="url(#logo_bg)" fillOpacity="0.15"/>
                  <path d="M20 0.5C30.7696 0.5 39.5 9.23045 39.5 20C39.5 30.7696 30.7696 39.5 20 39.5C9.23045 39.5 0.5 30.7696 0.5 20C0.5 9.23045 9.23045 0.5 20 0.5Z" stroke="url(#logo_border)" strokeOpacity="0.3"/>
                  <path d="M26 14.5C26 14.5 23.5 10 19 10C14.5 10 11 13.5 11 17C11 20.5 14 21 16.5 21.5C19 22 22 22.5 22 26C22 29.5 18.5 31 16 31C11.5 31 10 27 10 27" stroke="url(#logo_stroke)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="logo_bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff"/>
                      <stop offset="1" stopColor="#94a3b8"/>
                    </linearGradient>
                    <linearGradient id="logo_border" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white"/>
                      <stop offset="1" stopColor="white" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="logo_stroke" x1="10" y1="10" x2="26" y2="31" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white"/>
                      <stop offset="1" stopColor="#cbd5e1"/>
                    </linearGradient>
                  </defs>
                </svg>
             </div>
            <span className="text-xl font-bold font-display tracking-tight text-white group-hover:text-gray-300 transition-colors">Streamless</span>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `
                  flex items-center gap-2 text-sm font-medium transition-colors
                  ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-400 hover:text-white'}
                `}
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Wallet Button */}
          <div className="hidden md:block relative">
            {!isConnected ? (
              <Button 
                variant="white"
                onClick={handleConnect} 
                isLoading={isConnecting}
                leftIcon={<Wallet size={18} />}
                className="shadow-xl shadow-black/10 border border-white/20"
              >
                Connect Wallet
              </Button>
            ) : (
              <div className="relative">
                <Button 
                  variant="secondary"
                  onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                  className="gap-3 pl-3 pr-4"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-mono">{shortAddr}</span>
                  <ChevronDown size={14} className={`transition-transform ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>

                <AnimatePresence>
                  {isWalletDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-72 bg-[#111116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5"
                    >
                      <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Balance</p>
                        <div className="flex items-baseline gap-1">
                           <p className="text-2xl font-bold font-display text-white">{balance.toLocaleString()}</p>
                           <span className="text-sm font-medium text-gray-400">MASS</span>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors group">
                           <div className="flex items-center gap-3">
                             <div className="p-1.5 bg-white/10 text-white rounded-lg border border-white/10">
                               <ExternalLink size={16} />
                             </div>
                             View on Explorer
                           </div>
                        </button>
                        <button 
                          onClick={() => {
                            disconnect();
                            setIsWalletDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                        >
                          <div className="p-1.5 bg-red-500/10 text-red-400 rounded-lg">
                            <LogOut size={16} />
                          </div>
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-[#0a0a0f] border-b border-white/10"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 p-3 rounded-xl
                    ${isActive ? 'bg-white/10 text-white' : 'text-gray-400'}
                  `}
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
              <div className="pt-4 border-t border-white/10">
                {!isConnected ? (
                  <Button onClick={handleConnect} className="w-full" variant="white" isLoading={isConnecting}>
                    Connect Wallet
                  </Button>
                ) : (
                  <Button onClick={disconnect} variant="danger" className="w-full">
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen text-gray-100 font-sans selection:bg-white/20">
      <BackgroundOrbs />
      <Navbar />
      
      <main className="relative z-10 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full min-h-[calc(100vh-80px)]"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12 bg-[#0a0a0f]/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">© 2025 Streamless Protocol on Massa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};