import { useState } from "react";
import { Download, FileText, Grid2X2, Search, ShieldCheck } from "lucide-react";
import useResource from "../../hooks/useResource";
import {
  Empty,
  Hero,
  Pagination,
  PdfCard,
  ResourceState,
} from "../../components/common/PlatformUI";
export default function LibraryPage() {
  const resource = useResource("/library/pdfs"),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [sort, setSort] = useState("newest"),
    [page, setPage] = useState(1);
  const pdfs = resource.data || [],
    categories = [...new Set(pdfs.map((p) => p.type).filter(Boolean))];
  const filtered = pdfs
    .filter(
      (p) =>
        (!category || p.type === category) &&
        `${p.title} ${p.description} ${p.course?.title || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title, "ar")
        : new Date(b.createdAt) - new Date(a.createdAt),
    );
  const pages = Math.ceil(filtered.length / 9),
    current = Math.min(page, pages || 1);
  return (
    <>
      <Hero
        title="المكتبة المجانية"
        subtitle="ملفات PDF تعليمية مجانية للزوار والطلاب على حد سواء"
        compact
      >
        <p className="hero-detail">
          اكتشف المذكرات والملفات التعليمية المتوفرة لتساعدك في رحلتك التعليمية.
        </p>
        <div className="hero-features">
          <span>
            <ShieldCheck />
            متاحة للجميع
          </span>
          <span>
            <FileText />
            مجانية دائمًا
          </span>
          <span>
            <Download />
            تحميل مباشر
          </span>
        </div>
      </Hero>
      <section className="site-container section">
        <div className="category-panel">
          <h2>تصفح حسب التصنيف</h2>
          <div className="category-grid">
            <button
              className={!category ? "active" : ""}
              onClick={() => {
                setCategory("");
                setPage(1);
              }}
            >
              <Grid2X2 />
              الكل
            </button>
            {categories.map((c) => (
              <button
                className={category === c ? "active" : ""}
                key={c}
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                }}
              >
                <FileText />
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="library-layout">
          <aside>
            <div className="quote-card">
              <BookQuote />
            </div>
            <div className="site-panel">
              <h3>الفئات المتاحة</h3>
              {categories.length ? (
                categories.map((c) => (
                  <button
                    className="filter-choice"
                    key={c}
                    onClick={() => {
                      setCategory(c);
                      setPage(1);
                    }}
                  >
                    {c}
                    <span>{pdfs.filter((p) => p.type === c).length}</span>
                  </button>
                ))
              ) : (
                <p>ستظهر التصنيفات مع الملفات المنشورة.</p>
              )}
            </div>
            <div className="soft-panel">
              <ShieldCheck size={38} />
              <h3>المعرفة للجميع</h3>
              <p>كل المذكرات مجانية، ويمكنك تحميلها بدون حساب أو اشتراك.</p>
            </div>
          </aside>
          <div>
            <div className="catalog-toolbar">
              <div className="input-wrap">
                <Search size={19} />
                <input
                  aria-label="ابحث عن ملف PDF"
                  placeholder="ابحث عن ملف PDF أو موضوع..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <select
                aria-label="ترتيب الملفات"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">الأحدث أولًا</option>
                <option value="title">حسب الاسم</option>
              </select>
            </div>
            <ResourceState resource={resource}>
              {filtered.length ? (
                <div className="card-grid">
                  {filtered.slice((current - 1) * 9, current * 9).map((p) => (
                    <PdfCard key={p._id} pdf={p} />
                  ))}
                </div>
              ) : (
                <Empty icon={FileText}>
                  {pdfs.length
                    ? "لا توجد ملفات تطابق البحث."
                    : "لا توجد مذكرات منشورة بعد."}
                </Empty>
              )}
            </ResourceState>
            <Pagination page={current} total={pages} onChange={setPage} />
          </div>
        </div>
      </section>
    </>
  );
}
function BookQuote() {
  return (
    <>
      <img className="quote-books" src="/learning-books.png" alt="" loading="lazy" />
      <h2>
        المعرفة .. هي
        <br />
        أجمل استثمار
      </h2>
      <p>الديوانية — منصة تعليمية</p>
    </>
  );
}
