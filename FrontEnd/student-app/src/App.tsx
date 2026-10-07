import { StudentProvider } from '@/context/StudentContext';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage } from '@/components/auth/RegisterPage';
import { useStudent } from '@/hooks/useStudent';

function MainRouter() {
  const { pageView } = useStudent();
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
