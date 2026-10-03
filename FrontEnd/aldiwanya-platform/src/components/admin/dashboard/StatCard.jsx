import React from 'react';

export const StatCard = ({ icon: Icon, title, value, changeText, isPositive = true, iconBgColor, iconColor }) => {
  return (
    <div className="bg-white border border-border rounded-2xl p-4 flex items-center justify-between shadow-xs">
      <div className="space-y-1">
        <p className="text-xs text-text-muted">{title}</p>
        <h3 className="text-xl font-bold text-text-primary">{value}</h3>
        {changeText && (
          <p className={`text-xs font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            <span>{changeText}</span>
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${iconBgColor || 'bg-surface-blue'} ${iconColor || 'text-blue-500'}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};