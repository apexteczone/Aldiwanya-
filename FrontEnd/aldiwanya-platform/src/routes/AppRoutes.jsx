// import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';

// الصفحات المؤقتة (استبدليها بالصفحات الحقيقية من مجلد pages عند جاهزيتها)
const DashboardHome = () => <div>صفحة الرئيسية للوحة التحكم</div>;
const CoursesPage = () => <div>إدارة الكورسات</div>;
const LessonsPage = () => <div>الدروس والفيديوهات</div>;
const PdfsPage = () => <div>الملفات المجانية</div>;
const StudentsPage = () => <div>إدارة الطلاب</div>;
const SubscriptionsPage = () => <div>الاشتراكات</div>;
const PaymentsPage = () => <div>إدارة المدفوعات</div>;
const ReportsPage = () => <div>التقارير والإحصائيات</div>;
const SettingsPage = () => <div>إعدادات المنصة</div>;
const LoginPage = () => <div>صفحة تسجيل الدخول</div>;
const NotFoundPage = () => <div>404 - الصفحة غير موجودة</div>;

export default function AppRoutes() {
  const handleGlobalSearch = (query) => {
    console.log('جاري البحث عن:', query);
  };

  return (
    <Routes>
      {/* 1. مسار تسجيل الدخول (خارج الـ AdminLayout) */}
      <Route path="/auth/login" element={<LoginPage />} />

      {/* 2. مسارات لوحة التحكم للأدمن (داخل AdminLayout) */}
      <Route
        path="/admin/*"
        element={
          <AdminLayout onSearch={handleGlobalSearch}>
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="lessons" element={<LessonsPage />} />
              <Route path="pdfs" element={<PdfsPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AdminLayout>
        }
      />

      {/* 3. التوجيه الافتراضي */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}