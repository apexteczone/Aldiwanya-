import {lazy,Suspense} from 'react';
// import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentApp from '../pages/dashboard/StudentApp';
import PasswordPage from '../pages/auth/PasswordPage';
import CourseDetailsPage from '../pages/courses/CourseDetailsPage';
import AdminGuard from '../components/common/AdminGuard';
const LessonsManagementPage=lazy(()=>import('../pages/admin/LessonsManagementPage'));
const PlansManagementPage=lazy(()=>import('../pages/admin/PlansManagementPage'));
import { AdminLayout } from '../layouts/AdminLayout';
const GradesManager=lazy(()=>import('../pages/admin/GradesManager'));
const AddGrade=lazy(()=>import('../pages/admin/AddGrade'));
const AdminDashboardPage=lazy(()=>import('../pages/admin/AdminDashboardPage'));
const PaymentsPage=lazy(()=>import('../pages/admin/PaymentsPage'));
const SubscriptionsPage=lazy(()=>import('../pages/admin/SubscriptionsPage'));
const StudentsPage=lazy(()=>import('../pages/admin/StudentsPage'));
const VideosManagementPage=lazy(()=>import('../pages/admin/VideosManagementPage'));
const UploadVideoPage=lazy(()=>import('../pages/admin/UploadVideoPage'));
const PdfManagementPage=lazy(()=>import('../pages/admin/PdfManagementPage'));
const UploadPdfPage=lazy(()=>import('../pages/admin/UploadPdfPage'));
const CoursesManagementPage=lazy(()=>import('../pages/admin/CoursesManagementPage'));
const CreateCoursePage=lazy(()=>import('../pages/admin/CreateCoursePage'));

// الصفحات الفرعية والجانبية
// const CoursesManagementPage = () => <div className="p-4 bg-white rounded-2xl border border-border">إدارة الكورسات</div>;
// const PdfManagementPage = () => <div className="p-4 bg-white rounded-2xl border border-border">إدارة ملفات PDF</div>;
// const ReportsPage = () => <div className="p-4 bg-white rounded-2xl border border-border">التقارير والإحصائيات</div>;
const SettingsPage = () => <div className="p-4 bg-white rounded-2xl border border-border">إعدادات المنصة</div>;
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
    <Suspense fallback={<p role="status">جاري التحميل…</p>}><Routes>
      {/* صفحة تسجيل الدخول */}
      <Route path="/auth/login" element={<StudentApp />} />

      
      <Route
        path="/admin/*"
        element={
          <AdminGuard><AdminLayout onSearch={handleGlobalSearch}>
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              
              
              <Route path="dashboard" element={<AdminDashboardPage />} />
              
              
              <Route path="lessons" element={<LessonsManagementPage />} />
              <Route path="plans" element={<PlansManagementPage />} />
              <Route path="video" element={<VideosManagementPage />} />
              <Route path="upload" element={<UploadVideoPage />} />
              
              
              <Route path="courses" element={<CoursesManagementPage />} />
              <Route path="courses/edit/:id" element={<CreateCoursePage/>}/>
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
          </AdminLayout></AdminGuard>
        }
      />

      {/* إعادة التوجيه الافتراضية للتطبيق */}
      <Route path="/" element={<StudentApp />} />
      <Route path="/login" element={<StudentApp />} />
      <Route path="/register" element={<StudentApp />} />
      <Route path="/dashboard" element={<StudentApp />} />
      <Route path="/forgot-password" element={<PasswordPage />} />
      <Route path="/reset-password" element={<PasswordPage reset />} />
      <Route path="/courses/:id" element={<CourseDetailsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes></Suspense>
  );
}
