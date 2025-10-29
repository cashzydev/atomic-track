import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatMetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  className?: string;
}

const StatMetricCard = ({ icon, title, value, subtitle, className }: StatMetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-xl bg-card/50 backdrop-blur-sm p-5 shadow-[0_4px_15px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 text-violet-400 shadow-[0_2px_10px_rgba(139,92,246,0.15)]">
          {icon}
        </div>
      </div>
      
      <div className="space-y-1">
        <h4 className="text-xs text-muted-foreground font-medium">{title}</h4>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </motion.div>
  );
};

export default StatMetricCard;
