import React from 'react';

export const PaymentStatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  changeText, 
  isPositive = true, 
  theme = 'blue' // blue | green | orange | red
}) => {
  const themeStyles = {
    blue: { bg: 'bg-blue-50/60', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', text: 'text-blue-600' },
    green: { bg: 'bg-emerald-50/60', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', text: 'text-emerald-600' },
    orange: { bg: 'bg-amber-50/60', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', text: 'text-amber-600' },
    red: { bg: 'bg-rose-50/60', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', text: 'text-rose-600' },
  };

  const currentTheme = themeStyles[theme] || themeStyles.blue;

  return (
    <div className={`bg-white border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs`}>
      <div className={`p-3 rounded-2xl mb-2 ${currentTheme.iconBg} ${currentTheme.iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-xl font-extrabold text-text-primary leading-tight">{value}</h3>
      <p className="text-xs font-medium text-text-muted mt-0.5">{title}</p>
      
      {changeText && (
        <div className={`mt-2 text-xs font-bold flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{changeText}</span>
          <span className="text-[10px] text-text-muted font-normal mr-0.5">من الشهر الماضي</span>
        </div>
      )}
    </div>
  );
};