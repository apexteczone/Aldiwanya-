import React from 'react';
import { AuthNavbar } from './AuthNavbar';
import { AuthHero } from './AuthHero';
import { RegisterCard } from './RegisterCard';
import { FeatureHighlights } from './FeatureHighlights';
import { AuthFooter } from './AuthFooter';
import { CheckCircle2 } from 'lucide-react';
import { useStudent } from '@/hooks/useStudent';

export const RegisterPage: React.FC = () => {
  const { toastMessage } = useStudent();

  return (
    <div className="min-h-screen flex flex-col bg-[#071324] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0a1c36] border border-sky-500/40 text-white shadow-2xl text-xs font-semibold backdrop-blur-lg">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <AuthNavbar />

      {/* Hero Section */}
      <AuthHero />

      {/* Main Content Area: Register Card */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 z-20 pb-8">
        <div className="flex justify-center">
          <RegisterCard />
        </div>

        {/* 4 Feature Highlights Ribbon */}
        <FeatureHighlights />
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
};
