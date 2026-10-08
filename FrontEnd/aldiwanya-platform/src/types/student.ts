export type SubscriptionStatus = 'active' | 'expired' | 'none';

export type KuwaitGrade = 
  | 'grade_10' 
  | 'grade_11_sci' 
  | 'grade_11_lit' 
  | 'grade_12_sci' 
  | 'grade_12_lit';

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  grade: KuwaitGrade;
  avatarUrl?: string;
  joinedAt: string;
}

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  currentPlan?: {
    id: string;
    name: string;
    durationLabel: string;
    durationMonths: number;
    price: number;
    currency: string;
    startsAt: string;
    endsAt: string;
    daysRemaining: number;
    orderReference: string;
  };
  previousPeriods: Array<{
    id: string;
    planName: string;
    amount: number;
    currency: string;
    startsAt: string;
    endsAt: string;
    status: 'succeeded' | 'expired';
    orderId: string;
    date: string;
  }>;
}

export interface EnrolledCourse {
  id: string;
  title: string;
  gradeName: string;
  gradeCode: KuwaitGrade;
  totalLessons: number;
  completedLessons: number;
  lastLessonTitle: string;
  lastLessonId: string;
  thumbnailUrl: string;
  accentColor: string;
  freeVideosCount: number;
}

export interface StudentPdfDownload {
  id: string;
  title: string;
  category: 'مذكرات شاملة' | 'نماذج امتحانات وزارة' | 'حلول بنك الأسئلة' | 'قوانين ومراجعات سريعة';
  gradeName: string;
  size: string;
  downloadDate?: string;
  downloadUrl: string;
}

export interface PlanPricing {
  id: string;
  name: string;
  durationMonths: number;
  periodLabel: string;
  price: number;
  currency: string;
  isPopular?: boolean;
  savingsNote?: string;
  features: string[];
}
