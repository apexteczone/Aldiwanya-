import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

export function PageTitle({ title }) {
  useEffect(() => {
    document.title = `${title} | الديوانية`;
  }, [title]);
  return null;
}

const titles = {
  '/': 'الرئيسية',
  '/login': 'تسجيل الدخول',
  '/register': 'إنشاء حساب جديد',
  '/dashboard': 'لوحة الطالب',
  '/account': 'إعدادات حسابك',
  '/subscriptions': 'اشتراكاتي',
  '/courses': 'المحتوى التعليمي',
  '/plans': 'خطط الاشتراك',
  '/library': 'المكتبة المجانية',
  '/previews': 'المعاينات المجانية',
  '/forgot-password': 'استعادة كلمة المرور',
  '/reset-password': 'تعيين كلمة مرور جديدة',
  '/payment/return': 'نتيجة الدفع',
  '/about': 'عن الديوانية',
  '/contact': 'الدعم والمساعدة',
  '/privacy': 'سياسة الخصوصية',
  '/terms': 'شروط الاستخدام',
  '/admin/dashboard': 'لوحة الإدارة',
  '/admin/lessons': 'إدارة الدروس',
  '/admin/lessons/new': 'إضافة درس جديد',
  '/admin/courses': 'إدارة المواد',
  '/admin/courses/new': 'إضافة مادة جديدة',
  '/admin/courses/edit/:id': 'تعديل المادة',
  '/admin/pdfs': 'إدارة الملفات المجانية',
  '/admin/pdfs/new': 'رفع ملف PDF',
  '/admin/students': 'إدارة الطلاب',
  '/admin/subscriptions': 'إدارة الاشتراكات',
  '/admin/payments': 'إدارة المدفوعات',
  '/admin/grades': 'إدارة الصفوف',
  '/admin/grades/add': 'إضافة صف جديد',
  '/admin/settings': 'إعدادات المنصة',
};

export default function RouteTitle() {
  const { pathname } = useLocation();
  // Detail pages set the title from the real course or lesson as it loads.
  if (['/courses/:id', '/courses/:id/preview', '/lessons/:id'].some(path => matchPath(path, pathname))) return null;
  const route = Object.keys(titles).find(path => matchPath(path, pathname));
  return <PageTitle title={titles[route] || 'الصفحة غير موجودة'} />;
}
