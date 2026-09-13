import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showSubtitle = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} id="psicool-official-logo">
      {/* Abstract Continuous Monogram (P + C) in Brain Synapse Flow */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(191,90,242,0.5)] transition-transform duration-300 hover:scale-105"
        >
          <defs>
            {/* Synaptic Fluid Loop Gradient: Roxo Neon (#bf5af2) to Magenta Digital (#ff007f) */}
            <linearGradient id="psicoolSynapseGrad" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#bf5af2" />
              <stop offset="50%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#ff007f" />
            </linearGradient>

            <filter id="synapseGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Synaptic Glow Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#psicoolSynapseGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="opacity-30 animate-[spin_20s_linear_infinite]"
          />

          {/* Continuous Infinite Stroke uniting 'P' and 'C' as a synaptic loop */}
          <path
            d="M 30 82 L 30 26 C 30 15 48 15 54 26 C 60 36 44 48 30 48 L 52 48 C 66 48 80 56 80 68 C 80 82 62 82 50 82 C 38 82 32 76 32 70"
            stroke="url(#psicoolSynapseGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#synapseGlow)"
          />

          {/* Inner synaptic connection line */}
          <path
            d="M 30 36 C 42 36 50 30 46 22 C 42 16 34 18 30 24"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            className="opacity-70"
          />

          {/* Synapse Terminal Nodes */}
          <circle cx="30" cy="82" r="4.5" fill="#bf5af2" />
          <circle cx="32" cy="70" r="4" fill="#ff007f" />
          <circle cx="52" cy="48" r="3.5" fill="#ffffff" className="animate-pulse" />
          <circle cx="80" cy="68" r="4" fill="#ff007f" />
        </svg>
      </div>

      {/* Brand Typography: PSICOOL */}
      <div className="flex flex-col leading-none">
        <div className={`font-extrabold tracking-tight ${textSizes[size]} text-white flex items-center`}>
          <span>PSI</span>
          <span className="bg-gradient-to-r from-[#bf5af2] to-[#ff007f] bg-clip-text text-transparent">
            COOL
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-purple-300/70 uppercase tracking-widest font-medium mt-0.5">
            Consultório Virtual Clínico
          </span>
        )}
      </div>
    </div>
  );
};
