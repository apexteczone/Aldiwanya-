import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';

export const Navbar = ({ onSearch, isMobileOpen, setIsMobileOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [user, setUser] = useState({
    name: 'جاري التحميل...',
    role: 'مدير المنصة',
    avatar: ''
  });

  // جلب بيانات الحساب الحالي عند الفتح عبر Axios
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          setUser({
            name: response.data.full_name || response.data.name || 'أحمد محمد',
            role: response.data.role === 'admin' ? 'مدير المنصة' : 'مستخدم',
            avatar: response.data.avatar_url || ''
          });
        }
      } catch (error) {
        console.error('فشل جلب بيانات البروفايل:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // معالجة البحث وتمريره للمكون الأب
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <header className="bg-navy-950 text-white h-16 px-4 md:px-6 flex items-center justify-between border-b border-border-dark select-none">
      
      {/* الجزء الأيمن: زر فتح القائمة (للجوال) + حقل البحث */}
      <div className="flex items-center gap-3 flex-1 md:flex-initial">
        {/* 🍔 زر القائمة للسهولة في الجوال فقط */}
        <button
          onClick={() => setIsMobileOpen?.(!isMobileOpen)}
          className="md:hidden p-2 rounded-xl bg-navy-900 border border-border-dark text-text-muted hover:text-white transition-colors"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* حقل البحث (يتكيف حسـب كبر الشاشة) */}
        <div className="relative w-full sm:w-80 md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="إبحث عن طالب، كورس، اشتراك..."
            className="w-full bg-navy-900 text-white text-xs sm:text-sm rounded-xl pr-9 sm:pr-10 pl-3 sm:pl-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-border-dark placeholder:text-text-muted transition-all"
          />
          <Search className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* الجزء الأيسر: التنبيهات والبروفايل */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 mr-2">
        {/* زر التنبيهات */}
        <div className="relative">
          <button 
            className="p-2 rounded-xl bg-navy-900 border border-border-dark text-text-muted hover:text-white transition-colors"
            aria-label="التنبيهات"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {notificationsCount}
            </span>
          )}
        </div>

        {/* البروفايل */}
        <div className="flex items-center gap-2 sm:gap-3 pr-2 sm:pr-3 border-r border-border-dark cursor-pointer group">
          <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-white transition-colors hidden sm:block" />
          <div className="text-left hidden md:block">
            <h4 className="text-sm font-bold text-white leading-snug">{user.name}</h4>
            <p className="text-xs text-text-muted">{user.role}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 border-2 border-blue-600 overflow-hidden flex items-center justify-center font-bold text-white shadow-md text-xs sm:text-base">
            {user.avatar ? (
              <img
                src={user.avatar} 
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user.name?.charAt(0) || 'أ'}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};