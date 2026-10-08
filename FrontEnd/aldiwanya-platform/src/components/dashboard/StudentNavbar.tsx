import React from 'react';
import { useStudent } from '@/hooks/useStudent';
import { GRADE_LABELS } from '@/data/mockStudentData';
import { DiwaniyaLogo } from '@/components/common/DiwaniyaLogo';
import { 
  Sparkles,
  LogOut
} from 'lucide-react';

export const StudentNavbar: React.FC = () => {
  const { 
    student, 
    subscription, 
    setIsRenewModalOpen, 
    activeTab, 
    setActiveTab,
    logout
  } = useStudent();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1b3459] bg-[#071324]/90 backdrop-blur-xl">

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <DiwaniyaLogo size="md" variant="white" />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0b1d38] p-1 rounded-2xl border border-[#1d3b66]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/30'
              }`}
            >
              الرئيسية والمتابعة
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'courses'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/30'
              }`}
            >
              المناهج والدروس
            </button>

            <button
              onClick={() => setActiveTab('pdfs')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'pdfs'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/30'
              }`}
            >
              مكتبة المذكرات
            </button>

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'subscriptions'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/30'
              }`}
            >
              الاشتراك والفواتير
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'account'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/30'
              }`}
            >
              بيانات الحساب
            </button>
          </nav>

          {/* Student Status & Quick Renew Action */}
          <div className="flex items-center gap-3">
            {subscription.status === 'active' ? (
              <button 
                onClick={() => setIsRenewModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تمديد الاشتراك ({subscription.currentPlan?.daysRemaining} يوم متبقي)</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsRenewModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-sky-600 text-white font-bold text-xs shadow-md shadow-blue-600/25 hover:from-blue-500 hover:to-sky-500 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{subscription.status === 'expired' ? 'تجديد الاشتراك' : 'اشترك الآن'}</span>
              </button>
            )}

            {/* Profile Avatar Card */}
            <button
              onClick={() => setActiveTab('account')}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#0b1d38] border border-[#1d3b66] hover:border-sky-500/50 transition-all text-right cursor-pointer"
              title="عرض وتعديل بيانات الحساب"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-sm shadow">
                {student.fullName.slice(0, 2)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight font-['Cairo']">
                  {student.fullName}
                </div>
                <div className="text-[11px] text-slate-400 font-['Cairo']">
                  {GRADE_LABELS[student.grade] || student.grade}
                </div>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-[#0b1d38] border border-[#1d3b66] hover:bg-rose-950/40 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all"
              title="تسجيل الخروج والعودة لصفحة التسجيل"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="md:hidden flex items-center justify-around border-t border-[#1b3459] bg-[#071324] px-2 py-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            activeTab === 'overview' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
          }`}
        >
          الرئيسية
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            activeTab === 'courses' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
          }`}
        >
          المناهج
        </button>
        <button
          onClick={() => setActiveTab('pdfs')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            activeTab === 'pdfs' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
          }`}
        >
          المذكرات
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            activeTab === 'subscriptions' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
          }`}
        >
          الاشتراك
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
            activeTab === 'account' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
          }`}
        >
          بياناتي
        </button>
      </div>
    </header>
  );
};
