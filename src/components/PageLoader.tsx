import React from 'react';

export function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="relative">
        {/* Núcleo */}
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full animate-pulse flex items-center justify-center">
          <img
            src="/atom-logo.png" 
            alt="Loading" 
            className="w-8 h-8"
          />
        </div>
        
        {/* Órbita 1 */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
          <div className="w-2 h-2 bg-violet-400 rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
        </div>
        
        {/* Órbita 2 */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '0.66s' }}>
          <div className="w-2 h-2 bg-purple-400 rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
        </div>
        
        {/* Órbita 3 */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '1.33s' }}>
          <div className="w-2 h-2 bg-violet-300 rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
        </div>
      </div>
    </div>
  );
}
