import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import api, {ASSET_BASE_URL} from '../../services/api';

export default function PublicLibraryPage() {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    let live = true;
    api.get('/library/pdfs').then(({data}) => {if (live) setPdfs(data.data);})
      .catch(() => {if (live) setError('تعذر تحميل المذكرات. حاول مرة أخرى.');})
      .finally(() => {if (live) setLoading(false);});
    return () => {live = false;};
  }, []);
  const rows = pdfs.filter(pdf => (pdf.title + ' ' + (pdf.course?.title || '')).includes(query));
  return <main dir="rtl" className="min-h-screen bg-slate-950 text-white p-6">
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/" className="text-sky-300">الرئيسية</Link>
      <h1 className="text-3xl font-bold">مكتبة المذكرات المجانية</h1>
      <p>كل ملفات PDF مجانية ومتاحة للجميع، بدون تسجيل دخول أو اشتراك.</p>
      <input aria-label="البحث في المذكرات" placeholder="ابحث باسم المذكرة أو الكورس" value={query} onChange={e => setQuery(e.target.value)} className="w-full rounded-xl p-3 bg-slate-800" />
      {loading && <p role="status">جاري تحميل المذكرات…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && !rows.length && <p>لا توجد مذكرات مطابقة حاليًا.</p>}
      <div className="grid gap-4 md:grid-cols-2">{rows.map(pdf => <article key={pdf._id} className="rounded-xl bg-slate-900 p-5 space-y-3">
        <h2 className="text-xl font-bold">{pdf.title}</h2>
        <p>{pdf.course?.title}</p><p>{pdf.description}</p>
        <a href={ASSET_BASE_URL + pdf.pdfUrl} className="inline-block rounded-lg bg-blue-600 px-4 py-2">تحميل PDF مجانًا</a>
      </article>)}</div>
    </div>
  </main>;
}
