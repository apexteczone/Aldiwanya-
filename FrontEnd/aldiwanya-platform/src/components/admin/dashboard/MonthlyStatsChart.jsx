import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const MonthlyStatsChart = ({ data }) => {
  // بيانات افتراضية بأسماء الأشهر والقيم المطابقة للتصميم
  const defaultData = [
    { month: 'مارس', payments: 30, subscriptions: 40 },
    { month: 'أبريل', payments: 50, subscriptions: 90 },
    { month: 'مايو', payments: 65, subscriptions: 100 },
    { month: 'يونيو', payments: 45, subscriptions: 60 },
    { month: 'يوليو', payments: 132, subscriptions: 80 },
    { month: 'أغسطس', payments: 160, subscriptions: 170 },
  ];

  const chartData = data || defaultData;

  return (
    <div className="bg-white border border-border rounded-2xl p-5 space-y-4 shadow-xs">
      {/* الهيدر */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-text-primary">الإحصائيات الشهرية</h3>
        </div>
        <select className="bg-surface border border-border text-xs text-text-secondary rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer">
          <option>آخر 6 أشهر</option>
          <option>آخر سنة</option>
        </select>
      </div>

      {/* دليل الألوان (Legend) */}
      <div className="flex items-center gap-6 text-xs font-medium text-text-secondary">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> الاشتراكات الجديدة
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-300" /> المدفوعات (EGP)
        </span>
      </div>

      {/* منطقة الرسم البياني */}
      <div className="h-60 w-full dir-ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSubsLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1080e8" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#1080e8" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="month" stroke="#8298ae" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#8298ae" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                borderColor: '#dce8f2', 
                borderRadius: '12px', 
                color: '#12365c', 
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
              }}
            />
            <Area 
              type="monotone" 
              dataKey="subscriptions" 
              stroke="#1080e8" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorSubsLight)" 
            />
            <Area 
              type="monotone" 
              dataKey="payments" 
              stroke="#93c5fd" 
              strokeWidth={2} 
              strokeDasharray="4 4" 
              fill="none" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};