import { useStudent } from '@/hooks/useStudent';
import { StudentNavbar } from './StudentNavbar';
import { DashboardOverview } from './DashboardOverview';
import { ProfileEditSection } from './ProfileEditSection';
import { EnrolledCoursesSection } from './EnrolledCoursesSection';
import { PdfsSection } from './PdfsSection';
import { SubscriptionHistorySection } from './SubscriptionHistorySection';
import { RenewModal } from './RenewModal';
import { StudentFooter } from './StudentFooter';
import { CheckCircle2 } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { activeTab, toastMessage } = useStudent();

  return (
    <div className="min-h-screen flex flex-col bg-[#071324] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0a1c36] border border-sky-500/40 text-slate-100 shadow-2xl text-xs font-semibold backdrop-blur-lg">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Top Navigation & State Switcher */}
      <StudentNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'account' && <ProfileEditSection />}
        {activeTab === 'courses' && <EnrolledCoursesSection />}
        {activeTab === 'pdfs' && <PdfsSection />}
        {activeTab === 'subscriptions' && <SubscriptionHistorySection />}
      </main>

      {/* Renewal / Plans Modal */}
      <RenewModal />

      {/* Footer */}
      <StudentFooter />
    </div>
  );
};
