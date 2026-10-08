import React from 'react';

interface DiwaniyaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'white' | 'colored' | 'dark' | 'light';
  showSubtitle?: boolean;
}

export const DiwaniyaLogo: React.FC<DiwaniyaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'white',
}) => {
  const heightClasses = {
    sm: 'h-8',
    md: 'h-11 sm:h-12',
    lg: 'h-16 sm:h-20',
  }[size];

  const logoSrc =
    variant === 'colored' || variant === 'dark'
      ? '/diwaniya-logo-colored.png'
      : '/diwaniya-logo-white.png';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="شعار منصة الديوانية التعليمية"
        className={`${heightClasses} w-auto object-contain drop-shadow-xs transition-transform duration-200 hover:scale-102`}
      />
    </div>
  );
};
