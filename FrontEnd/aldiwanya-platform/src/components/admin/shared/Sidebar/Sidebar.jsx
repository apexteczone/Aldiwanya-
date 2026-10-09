import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from '../../../../services/api'; 
import logo from '/src/assets/whitelogo.png';
import footerImage from '/src/assets/kiwait.png';

import { 
  Home, 
  BookOpen, 
  Video, 
  FileText, 
  Users, 
  Crown, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  X 
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const {pathname} = useLocation();

  const menuItems = [
    { title: 'الرئيسية', icon: Home, path: '/admin/dashboard' },
    { title: 'إدارة المواد', icon: BookOpen, path: '/admin/courses' },
    { title: 'إدارة الدروس', icon: BookOpen, path: '/admin/lessons' },
    { title: 'الفيديوهات', icon: Video, path: '/admin/video' },
    { title: 'الملفات المجانية (PDF)', icon: FileText, path: '/admin/pdfs' },
    { title: 'الطلاب', icon: Users, path: '/admin/students' },
    { title: 'الاشتراكات', icon: Crown, path: '/admin/subscriptions' },
    { title: 'المدفوعات', icon: CreditCard, path: '/admin/payments' },
    { title: ' ادارة الصفوف', icon: BarChart3, path: '/admin/grades' },
    { title: 'إعدادات المنصة', icon: Settings, path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('خطأ أثناء تسجيل الخروج:', error?.response?.data || error.message);
    } finally {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/auth/login');
    }
  };

  
  const handleNavClick = () => {
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* side*/}
      <aside 
        style={{ 
          backgroundImage: `linear-gradient(to top, rgba(0, 24, 56, 0.25) 0%, rgba(0, 24, 56, 1) 45%), url(${footerImage})` 
        }}
        className={`
          fixed md:static top-0 right-0 z-50 h-screen w-64 bg-navy-950 text-white flex flex-col justify-between p-4 border-l border-border-dark select-none bg-bottom bg-no-repeat bg-contain transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-border-dark">
              <div> 
                <img src={logo} alt="logo" className="w-44 md:w-49" />
              </div>
              
              <button 
                onClick={() => setIsMobileOpen?.(false)}
                className="md:hidden text-text-muted hover:text-white p-1 rounded-lg hover:bg-navy-900 transition-colors"
                aria-label="إغلاق القائمة"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu */}
            <nav className="space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={index}
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        (isActive || (item.path === '/admin/video' && pathname === '/admin/upload'))
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'text-text-muted hover:bg-navy-900/80 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Logout */}
          <div className="pt-3 border-t border-border-dark/60">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
