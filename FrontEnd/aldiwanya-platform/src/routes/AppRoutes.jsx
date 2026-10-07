// import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import GradesManager from '../pages/admin/GradesManager';
import AddGrade from '../pages/admin/AddGrade';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import PaymentsPage from '../pages/admin/PaymentsPage';
import SubscriptionsPage from '../pages/admin/SubscriptionsPage';
import StudentsPage from '../pages/admin/StudentsPage';
import VideosManagementPage from '../pages/admin/VideosManagementPage';
import UploadVideoPage from '../pages/admin/UploadVideoPage';
import PdfManagementPage from '../pages/admin/PdfManagementPage'
import UploadPdfPage from '../pages/admin/UploadPdfPage';
import CoursesManagementPage from '../pages/admin/CoursesManagementPage';
import CreateCoursePage from '../pages/admin/CreateCoursePage';

// الصفحات الفرعية والجانبية
// const CoursesManagementPage = () => <div className="p-4 bg-white rounded-2xl border border-border">إدارة الكورسات</div>;
// const PdfManagementPage = () => <div className="p-4 bg-white rounded-2xl border border-border">إدارة ملفات PDF</div>;
// const ReportsPage = () => <div className="p-4 bg-white rounded-2xl border border-border">التقارير والإحصائيات</div>;
const SettingsPage = () => <div className="p-4 bg-white rounded-2xl border border-border">إعدادات المنصة</div>;
const LoginPage = () => <div className="p-4 bg-white rounded-2xl border border-border">صفحة تسجيل الدخول</div>;
const NotFoundPage = () => (
  <div className="p-12 text-center space-y-3">
    <h1 className="text-4xl font-extrabold text-navy-950">404</h1>
    <p className="text-xs text-text-muted">الصفحة التي تطلبها غير موجودة</p>
  </div>
);

export default function AppRoutes() {
  const handleGlobalSearch = (query) => {
    console.log('جاري البحث عن:', query);
  };

  return (
    <Routes>
      {/* صفحة تسجيل الدخول */}
      <Route path="/auth/login" element={<LoginPage />} />

      
      <Route
        path="/admin/*"
        element={
          <AdminLayout onSearch={handleGlobalSearch}>
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              
              
              <Route path="dashboard" element={<AdminDashboardPage />} />
              
              
              <Route path="video" element={<VideosManagementPage />} />
              <Route path="upload" element={<UploadVideoPage />} />
              
              
              <Route path="courses" element={<CoursesManagementPage />} />
              <Route path="courses/new" element={<CreateCoursePage/>}/>
              <Route path="pdfs" element={<PdfManagementPage/>} />
              <Route path="pdfs/new" element={<UploadPdfPage />} />

              
              <Route path="students" element={<StudentsPage />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              
              
              <Route path="grades" element={<GradesManager/>} />
              <Route path="grades/add" element={<AddGrade/>} />
              <Route path="settings" element={<SettingsPage />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AdminLayout>
        }
      />

      {/* إعادة التوجيه الافتراضية للتطبيق */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}