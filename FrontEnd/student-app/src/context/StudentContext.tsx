import React, { createContext, useState, useEffect } from 'react';
import type { 
  StudentProfile, 
  SubscriptionInfo, 
  EnrolledCourse, 
  StudentPdfDownload
} from '@/types/student';
import { 
  INITIAL_STUDENT_PROFILE, 
  INITIAL_SUBSCRIPTION_ACTIVE, 
  AVAILABLE_PLANS,
  MOCK_ENROLLED_COURSES, 
  MOCK_STUDENT_PDFS 
} from '@/data/mockStudentData';

export type PageViewMode = 'login' | 'register' | 'dashboard';

interface StudentContextType {
  student: StudentProfile;
  subscription: SubscriptionInfo;
  courses: EnrolledCourse[];
  pdfs: StudentPdfDownload[];
  activeTab: 'overview' | 'account' | 'subscriptions' | 'courses' | 'pdfs';
  setActiveTab: (tab: 'overview' | 'account' | 'subscriptions' | 'courses' | 'pdfs') => void;
  pageView: PageViewMode;
  setPageView: (view: PageViewMode) => void;
  isLoggedIn: boolean;
  register: (userData: { fullName: string; email: string; phone: string; password: string }) => void;
  login: (credentials: { identifier: string; password: string }) => void;
  logout: () => void;
  updateProfile: (updated: Partial<StudentProfile>) => { success: boolean; message: string };
  renewSubscription: (planId: string) => void;
  isRenewModalOpen: boolean;
  setIsRenewModalOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const PROFILE_KEY = 'diwaniya_student_profile_v2';
const SUB_KEY = 'diwaniya_student_subscription_v2';
const AUTH_KEY = 'diwaniya_auth_state_v2';

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STUDENT_PROFILE;
    } catch {
      return INITIAL_STUDENT_PROFILE;
    }
  });

  const [subscription, setSubscription] = useState<SubscriptionInfo>(() => {
    try {
      const saved = localStorage.getItem(SUB_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTION_ACTIVE;
    } catch {
      return INITIAL_SUBSCRIPTION_ACTIVE;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Default page view is 'login'
  const [pageView, setPageView] = useState<PageViewMode>('login');
  const [courses] = useState<EnrolledCourse[]>(MOCK_ENROLLED_COURSES);
  const [pdfs] = useState<StudentPdfDownload[]>(MOCK_STUDENT_PDFS);
  const [activeTab, setActiveTab] = useState<'overview' | 'account' | 'subscriptions' | 'courses' | 'pdfs'>('overview');
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(student));
  }, [student]);

  useEffect(() => {
    localStorage.setItem(SUB_KEY, JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const register = (userData: { fullName: string; email: string; phone: string; password: string }) => {
    const updated: StudentProfile = {
      ...student,
      id: `STD-KW-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setStudent(updated);
    setIsLoggedIn(true);
    setPageView('dashboard');
    showToast(`مرحباً بك يا ${userData.fullName}! تم إنشاء حسابك بنجاح وجاري فتح لوحة التحكم.`);
  };

  const login = (credentials: { identifier: string; password: string }) => {
    if (credentials.identifier.includes('@')) {
      setStudent(prev => ({ ...prev, email: credentials.identifier }));
    }
    setIsLoggedIn(true);
    setPageView('dashboard');
    showToast(`مرحباً بعودتك مجدداً! تم تسجيل الدخول بنجاح.`);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPageView('login');
    showToast('تم تسجيل الخروج بنجاح. أهلاً بك دائماً في الديوانية.');
  };

  const updateProfile = (updated: Partial<StudentProfile>) => {
    setStudent(prev => ({ ...prev, ...updated }));
    showToast('تم حفظ وتحديث بيانات حسابك بنجاح');
    return { success: true, message: 'تم التحديث بنجاح' };
  };

  const renewSubscription = (planId: string) => {
    const selectedPlan = AVAILABLE_PLANS.find(p => p.id === planId) || AVAILABLE_PLANS[1];
    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + selectedPlan.durationMonths);

    const newPeriodId = `sub_${Date.now()}`;
    const orderRef = `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newSub: SubscriptionInfo = {
      status: 'active',
      currentPlan: {
        id: selectedPlan.id,
        name: selectedPlan.name,
        durationLabel: selectedPlan.periodLabel,
        durationMonths: selectedPlan.durationMonths,
        price: selectedPlan.price,
        currency: selectedPlan.currency,
        startsAt: now.toISOString(),
        endsAt: expiry.toISOString(),
        daysRemaining: selectedPlan.durationMonths * 30,
        orderReference: orderRef
      },
      previousPeriods: [
        {
          id: newPeriodId,
          planName: selectedPlan.name,
          amount: selectedPlan.price,
          currency: selectedPlan.currency,
          startsAt: now.toISOString().split('T')[0],
          endsAt: expiry.toISOString().split('T')[0],
          status: 'succeeded',
          orderId: orderRef,
          date: now.toLocaleDateString('ar-KW', { day: 'numeric', month: 'long', year: 'numeric' })
        },
        ...subscription.previousPeriods
      ]
    };

    setSubscription(newSub);
    setIsRenewModalOpen(false);
    showToast(`تم تفعيل "${selectedPlan.name}" بنجاح! تم فتح كافة الدروس والمحتوى.`);
  };

  return (
    <StudentContext.Provider
      value={{
        student,
        subscription,
        courses,
        pdfs,
        activeTab,
        setActiveTab,
        pageView,
        setPageView,
        isLoggedIn,
        register,
        login,
        logout,
        updateProfile,
        renewSubscription,
        isRenewModalOpen,
        setIsRenewModalOpen,
        toastMessage,
        showToast
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export { StudentContext };
