import React from 'react';

interface KuwaitFlagProps {
  className?: string;
  width?: number;
  height?: number;
}

export const KuwaitFlag: React.FC<KuwaitFlagProps> = ({
  className = '',
  width = 24,
  height = 16,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-xs overflow-hidden shrink-0 shadow-xs inline-block ${className}`}
    >
      {/* Top Green Stripe */}
      <rect width="24" height="5.33" fill="#007A3D" />
      {/* Middle White Stripe */}
      <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
      {/* Bottom Red Stripe */}
      <rect y="10.66" width="24" height="5.34" fill="#CE1126" />
      {/* Black Trapezoid on Hoist */}
      <path d="M0 0L7 5.33V10.66L0 16V0Z" fill="#000000" />
    </svg>
  );
};
