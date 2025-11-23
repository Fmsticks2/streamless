import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hover' | 'active';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl";
  
  const variants = {
    default: "",
    hover: "hover:bg-white/[0.06] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300",
    active: "bg-white/[0.08] border-primary/50 shadow-primary/20",
  };

  return (
    <motion.div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      {...props}
    >
      {/* Glossy sheen effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};