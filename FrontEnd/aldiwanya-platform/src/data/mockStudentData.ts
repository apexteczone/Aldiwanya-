import type { StudentProfile, SubscriptionInfo, EnrolledCourse, StudentPdfDownload, PlanPricing } from '@/types/student';

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'STD-KW-9421',
  fullName: 'عبدالرحمن مشعل العازمي',
  email: 'abdulrahman.azmi@student.kw',
  phone: '+965 9988 7766',
  grade: 'grade_12_sci',
  joinedAt: '2026-08-15',
  avatarUrl: ''
};

export const GRADE_LABELS: Record<string, string> = {
  grade_10: 'الصف العاشر الثانوي',
  grade_11_sci: 'الصف الحادي عشر - علمي',
  grade_11_lit: 'الصف الحادي عشر - أدبي',
  grade_12_sci: 'الصف الثاني عشر - علمي',
  grade_12_lit: 'الصف الثاني عشر - أدبي'
};

export const INITIAL_SUBSCRIPTION_ACTIVE: SubscriptionInfo = {
  status: 'active',
  currentPlan: {
    id: 'plan_semester',
    name: 'اشتراك الفصل الدراسي الأول',
    durationLabel: '3 أشهر (فصلي)',
    durationMonths: 3,
    price: 25,
    currency: 'د.ك',
    startsAt: '2026-09-01T00:00:00Z',
    endsAt: '2026-12-01T23:59:59Z',
    daysRemaining: 57,
    orderReference: 'ORD-2026-90412'
  },
  previousPeriods: [
    {
      id: 'sub_prev_1',
      planName: 'اشتراك شهر تمهيدي - مراجعة الصيف',
      amount: 10,
      currency: 'د.ك',
      startsAt: '2026-08-01',
      endsAt: '2026-09-01',
      status: 'expired',
      orderId: 'ORD-2026-88102',
      date: '01 أغسطس 2026'
    }
  ]
};

export const INITIAL_SUBSCRIPTION_EXPIRED: SubscriptionInfo = {
  status: 'expired',
  currentPlan: {
    id: 'plan_monthly',
    name: 'اشتراك شهري سابق',
    durationLabel: 'شهر واحد',
    durationMonths: 1,
    price: 10,
    currency: 'د.ك',
    startsAt: '2026-08-01T00:00:00Z',
    endsAt: '2026-09-01T23:59:59Z',
    daysRemaining: 0,
    orderReference: 'ORD-2026-77319'
  },
  previousPeriods: [
    {
      id: 'sub_prev_2',
      planName: 'اشتراك شهري (منتهي)',
      amount: 10,
      currency: 'د.ك',
      startsAt: '2026-08-01',
      endsAt: '2026-09-01',
      status: 'expired',
      orderId: 'ORD-2026-77319',
      date: '01 أغسطس 2026'
    }
  ]
};

export const INITIAL_SUBSCRIPTION_NONE: SubscriptionInfo = {
  status: 'none',
  previousPeriods: []
};

export const AVAILABLE_PLANS: PlanPricing[] = [
  {
    id: 'plan_semester',
    name: 'باقة الفصل الدراسي الواحد',
    durationMonths: 5,
    periodLabel: 'فصل دراسي واحد (5 أشهر)',
    price: 25,
    currency: 'د.ك',
    features: [
      'فتح جميع الدروس والفيديوهات للمنهج كاملاً',
      'مشاهدة غير محدودة وبجودة عالية HD',
      'تحميل وتصفح جميع بنوك الأسئلة المحلولة',
      'تغطية كاملة لاختبارات الفترة الأولى والفاينل',
      'مذكرات تلخيص القوانين الذهبية مجاناً'
    ]
  },
  {
    id: 'plan_yearly',
    name: 'الباقة السنوية الشاملة',
    durationMonths: 12,
    periodLabel: 'سنة كاملة (عام دراسي كامل)',
    price: 45,
    currency: 'د.ك',
    isPopular: true,
    savingsNote: 'الأوفر — وفر أكثر مقارنة بالاشتراك الفصلي',
    features: [
      'وصول شامل طوال الفصلين الأول والثاني مع الصيفي',
      'مراجعات ليلة الاختبار التفاعلية المكثفة',
      'شامل جميع مذكرات الشرح والتمارين والحلول النموذجية',
      'تحديثات مستمرة لجميع تعديلات منهج وزارة التربية بالكويت',
      'دعم الاستفسارات للتمارين الصعبة'
    ]
  }
];

export const MOCK_ENROLLED_COURSES: EnrolledCourse[] = [
  {
    id: 'course-math-12-sci',
    title: 'رياضيات الصف الثاني عشر - علمي (الفصل الأول)',
    gradeName: 'الصف الثاني عشر - علمي',
    gradeCode: 'grade_12_sci',
    totalLessons: 28,
    completedLessons: 19,
    lastLessonTitle: 'تطبيقات على القيم القصوى ونقاط الانقلاب',
    lastLessonId: 'les-12-04',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    accentColor: 'from-amber-500 to-orange-600',
    freeVideosCount: 3
  },
  {
    id: 'course-calc-limits',
    title: 'وحدة النهايات والاتصال - شرح وتطبيقات نموذجية',
    gradeName: 'الصف الثاني عشر - علمي',
    gradeCode: 'grade_12_sci',
    totalLessons: 14,
    completedLessons: 14,
    lastLessonTitle: 'نهايات الدوال المثلثية ونظرية الإحاطة (مكتمل)',
    lastLessonId: 'les-limits-final',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    accentColor: 'from-blue-600 to-indigo-700',
    freeVideosCount: 2
  },
  {
    id: 'course-math-11-sci',
    title: 'أساسيات وتأسيس الجبر والدوال الرياضية',
    gradeName: 'مراجعة وتأسيس للمرحلة الثانوية',
    gradeCode: 'grade_11_sci',
    totalLessons: 10,
    completedLessons: 6,
    lastLessonTitle: 'المعادلات الأسية واللوغاريتمية',
    lastLessonId: 'les-alg-03',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
    accentColor: 'from-emerald-600 to-teal-700',
    freeVideosCount: 4
  }
];

export const MOCK_STUDENT_PDFS: StudentPdfDownload[] = [
  {
    id: 'pdf-1',
    title: 'مذكرة التفاضل والتكامل الشاملة - الصف الثاني عشر علمي',
    category: 'مذكرات شاملة',
    gradeName: 'الصف الثاني عشر علمي',
    size: '14.2 ميجابايت',
    downloadDate: '28 سبتمبر 2026',
    downloadUrl: '#'
  },
  {
    id: 'pdf-2',
    title: 'حلول بنك أسئلة التوجيه الفني العام للرياضيات - 2026',
    category: 'حلول بنك الأسئلة',
    gradeName: 'الصف الثاني عشر علمي',
    size: '8.7 ميجابايت',
    downloadDate: '02 أكتوبر 2026',
    downloadUrl: '#'
  },
  {
    id: 'pdf-3',
    title: 'نموذج إجابة الاختبار التجريبي لمنطقة العاصمة التعليمية',
    category: 'نماذج امتحانات وزارة',
    gradeName: 'الصف الثاني عشر علمي',
    size: '4.5 ميجابايت',
    downloadDate: '04 أكتوبر 2026',
    downloadUrl: '#'
  },
  {
    id: 'pdf-4',
    title: 'ملخص قوانين حساب المثلثات والمتطابقات الهامة',
    category: 'قوانين ومراجعات سريعة',
    gradeName: 'الصف 11 و 12 علمي',
    size: '2.1 ميجابايت',
    downloadDate: '15 سبتمبر 2026',
    downloadUrl: '#'
  }
];
