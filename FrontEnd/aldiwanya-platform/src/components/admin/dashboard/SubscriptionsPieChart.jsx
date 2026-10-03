// import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const SubscriptionsPieChart = ({ activeCount = 856, data: customData }) => {
  const defaultData = [
    { name: 'اشتراك شهري', value: 42, color: '#1080e8' },
    { name: 'اشتراك ربع سنوياً', value: 33, color: '#38bdf8' },
    { name: 'اشتراك سنوي', value: 25, color: '#cbd5e1' },
  ];

  const chartData = customData || defaultData;

  return (
    <div className="bg-white border border-border rounded-2xl p-5 flex flex-col justify-between h-full shadow-xs">
      <h3 className="text-sm font-bold text-text-primary mb-2">توزيع الاشتراكات</h3>

      {/* الشارت الدائري والرقم في منتصفه */}
      <div className="relative h-48 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                borderColor: '#dce8f2', 
                borderRadius: '10px', 
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* النص في المنتصف */}
        <div className="absolute text-center">
          <span className="text-2xl font-bold text-text-primary block leading-none">{activeCount}</span>
          <span className="text-[11px] text-text-muted mt-1 block">اشتراك نشط</span>
        </div>
      </div>

      {/* قائمة التفاصيل والنسب المئوية */}
      <div className="space-y-2 pt-3 border-t border-border">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-2 text-text-secondary">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-bold text-text-primary">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};