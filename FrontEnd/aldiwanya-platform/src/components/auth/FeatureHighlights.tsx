import React from 'react';
import { BookOpen, Smartphone, Headphones, ShieldCheck } from 'lucide-react';

export const FeatureHighlights: React.FC = () => {
  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-blue-600 stroke-[1.8]" />,
      title: 'تعلم بمرونة',
      subtitle: 'في أي وقت ومن أي مكان',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-blue-600 stroke-[1.8]" />,
      title: 'من أي جهاز',
      subtitle: 'تجربة سلسة على جميع الأجهزة',
    },
    {
      icon: <Headphones className="w-6 h-6 text-blue-600 stroke-[1.8]" />,
      title: 'دعم مستمر',
      subtitle: 'فريق دعم متواجد دائماً',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600 stroke-[1.8]" />,
      title: 'بياناتك آمنة',
      subtitle: 'تشفير وحماية متقدمة',
    },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-8 md:my-12">
      <div className="bg-white text-slate-800 rounded-2xl shadow-md border border-slate-100 py-6 px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center text-center px-4 ${
                idx !== features.length - 1 ? 'lg:border-l lg:border-slate-100' : ''
              }`}
            >
              <div className="mb-2.5 p-2 rounded-xl bg-blue-50/70">{feature.icon}</div>
              <h3 className="text-sm md:text-base font-extrabold text-slate-900 font-['Cairo']">
                {feature.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 font-medium font-['Cairo']">
                {feature.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
