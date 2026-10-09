import { Link } from "react-router-dom";
import { ChevronLeft, List, Search } from "lucide-react";
import "./reference-admin.css";

export function ReferenceHeader({
  title,
  subtitle,
  icon: Icon,
  lessons = false,
}) {
  return (
    <header className="ref-header">
      <nav aria-label="مسار الصفحة">
        <Link to="/admin/dashboard">الرئيسية</Link>
        <ChevronLeft size={14} />
        {lessons && (
          <>
            <Link to="/admin/courses">إدارة الكورسات</Link>
            <ChevronLeft size={14} />
          </>
        )}
        <span>{title}</span>
      </nav>
      <div className="ref-heading">
        <span className="ref-square">
          <Icon size={25} />
        </span>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
export function ReferenceTable({ title, search, onSearch, children, label }) {
  return (
    <section className="ref-panel ref-table-panel">
      <div className="ref-table-heading">
        <h2>
          <span className="ref-square small">
            <List size={22} />
          </span>
          {title}
        </h2>
        <label className="ref-search">
          <input
            aria-label={label}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={label}
          />
          <Search size={20} />
        </label>
      </div>
      <div className="ref-table-scroll">{children}</div>
    </section>
  );
}
export function ReferenceMessage({ error, message, loading, retry }) {
  return (
    <>
      {loading && (
        <p className="ref-notice" role="status">
          جاري تحميل البيانات…
        </p>
      )}
      {error && (
        <div className="ref-notice error" role="alert">
          {error}
          {retry && (
            <button type="button" onClick={retry}>
              إعادة المحاولة
            </button>
          )}
        </div>
      )}
      {message && (
        <p className="ref-notice success" role="status">
          {message}
        </p>
      )}
    </>
  );
}
export function ReferenceStatus({ active }) {
  return (
    <span className={`ref-badge ${active ? "green" : "gray"}`}>
      {active ? "منشور" : "مسودة"}
    </span>
  );
}
