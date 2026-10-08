import { StudentProvider } from '@/context/StudentContext';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage } from '@/components/auth/RegisterPage';
import { useStudent } from '@/hooks/useStudent';

function MainRouter() {
  const { pageView, isLoggedIn, loading } = useStudent();
  if (loading) return <p role="status" className="p-8">جاري التحميل…</p>;
  if (pageView === 'dashboard' && !isLoggedIn) return <LoginPage />;
  if (pageView === 'login') return <LoginPage />;
  if (pageView === 'register') return <RegisterPage />;
  return <StudentDashboard />;
}

export function App() {
  return (
    <StudentProvider>
      <MainRouter />
    </StudentProvider>
  );
}

export default App;

