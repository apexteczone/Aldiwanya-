import { Navigate, useLocation } from "react-router-dom";
import usePlatform from "../../hooks/usePlatform";
export default function StudentGuard({ children }) {
  const { profile, loading, error } = usePlatform(),
    location = useLocation();
  if (loading)
    return (
      <p className="site-empty" role="status">
        جاري تحميل الحساب…
      </p>
    );
  if (error && !profile)
    return (
      <div className="site-empty" role="alert">
        {error}
        <button
          className="site-button"
          onClick={() => window.location.reload()}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  return profile ? (
    children
  ) : (
    <Navigate
      to={
        "/login?next=" + encodeURIComponent(location.pathname + location.search)
      }
      replace
    />
  );
}
