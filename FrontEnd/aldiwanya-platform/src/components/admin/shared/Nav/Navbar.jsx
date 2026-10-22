import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu } from "lucide-react";
import usePlatform from "../../../../hooks/usePlatform";
import AccountAvatar from "../../../common/AccountAvatar";
import NotificationBell from "../../../common/NotificationBell";
export const Navbar = ({ onSearch, isMobileOpen, setIsMobileOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { profile } = usePlatform();
  const user = profile?.user;
  return (
    <header className="bg-navy-950 text-white h-16 shrink-0 px-4 md:px-6 flex items-center justify-between border-b border-border-dark select-none">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={() => setIsMobileOpen?.(!isMobileOpen)}
          className="md:hidden p-2 rounded-xl bg-navy-900 border border-border-dark text-text-muted"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full min-w-0 max-w-80 md:max-w-96 hidden sm:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="إبحث عن طالب، مادة، اشتراك..."
            className="w-full bg-navy-900 text-white text-xs sm:text-sm rounded-xl pr-10 pl-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-border-dark placeholder:text-text-muted"
          />
          <Search className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 mr-2">
        <NotificationBell />
        <Link
          to="/admin/settings"
          className="admin-account-identity"
          aria-label="إعدادات حساب الأدمن"
        >
          <div>
            <strong>{user?.fullName || "جاري التحميل…"}</strong>
            <small>مدير المنصة</small>
          </div>
          <AccountAvatar user={user} />
        </Link>
      </div>
    </header>
  );
};
