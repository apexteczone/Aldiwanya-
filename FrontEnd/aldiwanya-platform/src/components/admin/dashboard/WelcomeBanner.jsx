import React from 'react';
import { Calendar } from 'lucide-react';
import towerBg from '/src/assets/kiwait2.png';

export const WelcomeBanner = ({ userName = "أحمد محمد" }) => {
  const todayDate = "السبت، 30 أغسطس 2025";

  return (
    <div 
      style={{ 
        backgroundImage: `linear-gradient(to left, rgba(0, 24, 56, 0.95) 40%, rgba(0, 24, 56, 0.5)), url(${towerBg})` 
      }}
      className="bg-navy-950 text-white rounded-2xl p-5 bg-cover bg-left-bottom bg-no-repeat flex flex-col justify-between h-full min-h-[150px] shadow-xs"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          مرحبًا، {userName} 
        </h2>
        <p className="text-xs text-slate-300">إليك نظرة عامة على منصتك التعليمية</p>
      </div>

      <div className="flex items-center gap-2 bg-navy-900/80 backdrop-blur-xs w-fit px-3 py-1 rounded-lg border border-navy-800 text-xs text-slate-200">
        <Calendar className="w-3.5 h-3.5 text-blue-400" />
        <span>{todayDate}</span>
      </div>
    </div>
  );
};