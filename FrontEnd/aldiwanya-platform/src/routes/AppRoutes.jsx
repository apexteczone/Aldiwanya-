import {lazy,Suspense} from 'react';
// import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/home/HomePage';
import AccessPage from '../pages/auth/AccessPage';
import CoursesPage from '../pages/courses/CoursesPage';
import LibraryPage from '../pages/library/LibraryPage';
import PlansPage from '../pages/plans/PlansPage';
import DashboardPage, {SubscriptionHistory} from '../pages/dashboard/DashboardPage';
import AccountPage from '../pages/dashboard/AccountPage';
import PreviewsPage from '../pages/courses/PreviewsPage';
import InfoPage from '../pages/home/InfoPage';
import StudentGuard from '../components/common/StudentGuard';
import {PlatformLayout} from '../components/common/PlatformUI';
import PasswordPage from '../pages/auth/PasswordPage';
import CourseDetailsPage from '../pages/courses/CourseDetailsPage';
import AdminGuard from '../components/common/AdminGuard';
const LessonsManagementPage=lazy(()=>import('../pages/admin/LessonsManagementPage'));
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
const SettingsPage=lazy(()=>import('../pages/admin/SettingsPage'));
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
      <Route path="/auth/login" element={<Navigate to="/login" replace />} />

      
      <Route
        path="/admin/*"
        element={
          <AdminGuard><AdminLayout onSearch={handleGlobalSearch}>
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              
              
              <Route path="dashboard" element={<AdminDashboardPage />} />
              
              
              <Route path="lessons" element={<LessonsManagementPage />} />
              <Route path="plans" element={<Navigate to="/admin/subscriptions" replace />} />
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
      <Route element={<PlatformLayout/>}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AccessPage key="login" />} />
      <Route path="/register" element={<AccessPage key="register" register />} />
      <Route path="/dashboard" element={<StudentGuard><DashboardPage /></StudentGuard>} />
      <Route path="/account" element={<StudentGuard><AccountPage /></StudentGuard>} />
      <Route path="/subscriptions" element={<StudentGuard><SubscriptionHistory /></StudentGuard>} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/previews" element={<PreviewsPage />} />
      <Route path="/forgot-password" element={<PasswordPage />} />
      <Route path="/reset-password" element={<PasswordPage reset />} />
      <Route path="/courses/:id" element={<CourseDetailsPage />} />
      <Route path="/courses/:id/preview" element={<CourseDetailsPage preview />} />
      {['about','contact','privacy','terms'].map(type=><Route key={type} path={'/'+type} element={<InfoPage type={type}/>}/>)}
      <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes></Suspense>
  );
}
