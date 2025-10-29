import React from 'react';

interface FeatureLockProps {
  feature: 'calendar' | 'stats' | 'habits';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureLock: React.FC<FeatureLockProps> = ({ 
  feature, 
  children,
  fallback 
}) => {
  // Todos os recursos estão liberados - sempre retorna children
  return <>{children}</>;
};
