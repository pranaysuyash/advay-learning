/**
 * LanguageFlag Component
 * CSS-based language flags to replace emoji flags
 */

import React from 'react';

interface LanguageFlagProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const flagStyles: Record<string, { colors: string[]; pattern?: 'horizontal' | 'vertical' | 'circle' }> = {
  en: {
    colors: ['#012169', '#FFFFFF', '#C8102E'], // UK: Blue, White, Red
    pattern: 'horizontal',
  },
  hi: {
    colors: ['#FF9932', '#FFFFFF', '#138808'], // India: Saffron, White, Green
    pattern: 'horizontal',
  },
  kn: {
    colors: ['#FF9932', '#FFFFFF', '#138808'], // India: Saffron, White, Green
    pattern: 'horizontal',
  },
  te: {
    colors: ['#FF9932', '#FFFFFF', '#138808'], // India: Saffron, White, Green
    pattern: 'horizontal',
  },
  ta: {
    colors: ['#FF9932', '#FFFFFF', '#138808'], // India: Saffron, White, Green
    pattern: 'horizontal',
  },
};

export const LanguageFlag: React.FC<LanguageFlagProps> = ({
  code,
  size = 'md',
  className = '',
}) => {
  const style = flagStyles[code] || flagStyles.en;
  const sizeClasses = {
    sm: 'w-5 h-4 text-xs',
    md: 'w-6 h-5 text-base',
    lg: 'w-8 h-6 text-lg',
  };

  // UK Flag (Union Jack simplified)
  if (code === 'en') {
    return (
      <div
        className={`${sizeClasses[size]} rounded overflow-hidden shadow-sm inline-block ${className}`}
        title="English"
      >
        <svg viewBox="0 0 60 40" className="w-full h-full">
          {/* Blue background */}
          <rect width="60" height="40" fill="#012169" />
          {/* White diagonals */}
          <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
          {/* Red diagonals */}
          <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
          {/* White cross */}
          <path d="M30,0 L30,40 M0,20 L60,20" stroke="#FFFFFF" strokeWidth="8" />
          {/* Red cross */}
          <path d="M30,0 L30,40 M0,20 L60,20" stroke="#C8102E" strokeWidth="4" />
        </svg>
      </div>
    );
  }

  // Indian Flag (applies to hi, kn, te, ta)
  return (
    <div
      className={`${sizeClasses[size]} rounded overflow-hidden shadow-sm inline-block ${className}`}
      title={code === 'hi' ? 'Hindi' : code === 'kn' ? 'Kannada' : code === 'te' ? 'Telugu' : 'Tamil'}
    >
      <svg viewBox="0 0 60 40" className="w-full h-full">
        {/* Saffron top */}
        <rect width="60" height="13.33" fill="#FF9932" />
        {/* White middle */}
        <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
        {/* Green bottom */}
        <rect y="26.66" width="60" height="13.33" fill="#138808" />
        {/* Ashoka Chakra (simplified as blue circle with spokes) */}
        <circle cx="30" cy="20" r="5" fill="#000080" />
        <circle cx="30" cy="20" r="4" fill="none" stroke="#000080" strokeWidth="0.5" />
        {/* 24 spokes represented as lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="30"
            y1="16"
            x2="30"
            y2="24"
            stroke="#000080"
            strokeWidth="0.3"
            transform={`rotate(${i * 30} 30 20)`}
          />
        ))}
      </svg>
    </div>
  );
};

// Language selector with flags
interface LanguageSelectorProps {
  languages: Array<{ code: string; name: string }>;
  selectedCode: string;
  onSelect: (code: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  selectedCode,
  onSelect,
  size = 'md',
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang.code)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
            ${selectedCode === lang.code
              ? 'bg-blue-100 border-blue-500 shadow-md'
              : 'bg-white border-slate-200 hover:border-blue-300'
            }
          `}
        >
          <LanguageFlag code={lang.code} size={size} />
          <span className="font-medium text-slate-700">{lang.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageFlag;
