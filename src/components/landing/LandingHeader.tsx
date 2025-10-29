import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';

export const LandingHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/atom-logo.png"
              alt="atomicTrack Logo"
              className="w-8 h-8 flex-shrink-0"
            />
            <span className="text-xl font-semibold text-slate-50 font-display tracking-tight truncate">atomicTrack</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/auth")}
            className="text-slate-300 hover:text-slate-50 flex-shrink-0"
          >
            Entrar
          </Button>
        </div>
      </div>
    </header>
  );
};

