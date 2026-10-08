import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import api from '../../services/api';

export default function LessonsManagementPage() {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [title, setTitle] = useState('');
  const [courseId, setCourse] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function load() {
    const [c, l] = await Promise.all([api.get('/admin/courses'), api.get('/admin/lessons')]);
    setCourses(c.data.data); setLessons(l.data.data);
  }
  useEffect(() => {
    let live = true;
    Promise.all([api.get('/admin/courses'), api.get('/admin/lessons')]).then(([c, l]) => {
      if (live) {setCourses(c.data.data); setLessons(l.data.data);}
    }).catch(() => {if (live) setMessage('تعذر تحميل البيانات');});
    return () => {live = false;};
  }, []);
  async function saveLesson(e) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {await api.post('/admin/lessons', {title, courseId}); await load(); setTitle(''); setMessage('تم إنشاء الدرس وربطه بالكورس');}
    catch (error) {setMessage(error.response?.data?.error?.message || 'تعذر إنشاء الدرس');}
    finally {setBusy(false);}
  }
  async function toggleLesson(row) {
    setBusy(true);
    try {await api.patch('/admin/lessons/' + row._id + (row.status === 'published' ? '/hide' : '/publish')); await load(); setMessage('تم الحفظ');}
    catch (error) {setMessage(error.response?.data?.error?.message || 'تعذر الحفظ');}
    finally {setBusy(false);}
  }
  return <main dir="rtl" className="bg-white p-6 rounded text-text-primary space-y-5">
    <h1 className="text-xl font-bold">إدارة الدروس</h1>
    <p>أنشئ الصف الدراسي، ثم كورسًا مرتبطًا بالصف، ثم أضف دروس الكورس.</p>
    <nav className="flex gap-4 text-blue-600"><Link to="/admin/grades/add">إضافة صف</Link><Link to="/admin/courses/new">إضافة كورس</Link></nav>
    <form className="flex flex-wrap gap-3" onSubmit={saveLesson}>
      <input aria-label="عنوان الدرس" placeholder="عنوان الدرس" required minLength={2} maxLength={150} value={title} onChange={e => setTitle(e.target.value)} className="border rounded p-2" />
      <select aria-label="الكورس" required value={courseId} onChange={e => setCourse(e.target.value)} className="border rounded p-2">
        <option value="">اختر الكورس</option>
        {courses.map(c => <option key={c._id} value={c._id}>{c.grade?.name ? c.grade.name + ' — ' : ''}{c.title}</option>)}
      </select>
      <button disabled={busy || !courses.length} className="bg-blue-600 text-white rounded px-4">إضافة الدرس</button>
    </form>
    {!courses.length && <p>أضف صفًا وكورسًا أولًا لتتمكن من إضافة الدروس.</p>}
    <p role="status">{message}</p>
    <section className="space-y-3"><h2 className="font-bold">الدروس المرتبطة بالكورسات</h2>
      {lessons.map(row => <div className="border rounded p-3 flex flex-wrap gap-3 items-center" key={row._id}>
        <span>{row.title}</span><span>{row.courseId?.title || 'كورس غير متاح'}</span>
        <span>{row.status === 'published' ? 'منشور' : 'مسودة'}</span>
        <button disabled={busy} onClick={() => toggleLesson(row)} className="text-blue-600">{row.status === 'published' ? 'إخفاء' : 'نشر'}</button>
      </div>)}
    </section>
  </main>;
}
