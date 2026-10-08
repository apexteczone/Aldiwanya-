import {useState} from 'react';
import api from '../../services/api';

export default function SettingsPage() {
  const [values, setValues] = useState({currentPassword: '', newPassword: '', confirmPassword: ''});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);
  async function submit(event) {
    event.preventDefault(); setMessage('');
    if (values.newPassword !== values.confirmPassword) {setMessage('تأكيد كلمة المرور غير مطابق'); return;}
    setBusy(true);
    try {
      await api.patch('/admin/password', values);
      sessionStorage.removeItem('token'); localStorage.removeItem('token');
      setValues({currentPassword: '', newPassword: '', confirmPassword: ''});
      setSaved(true);
    } catch (error) {setMessage(error.response?.data?.error?.message || 'تعذر تغيير كلمة المرور');}
    finally {setBusy(false);}
  }
  return <main dir="rtl" className="bg-white border border-border rounded-2xl p-6 space-y-5">
    <h1 className="text-xl font-bold">إعدادات حساب الأدمن</h1>
    {saved ? <div className="space-y-4"><p role="status">تم تغيير كلمة المرور وإنهاء الجلسات السابقة.</p><a className="text-blue-600" href="/login">تسجيل الدخول بكلمة المرور الجديدة</a></div> : <>
      <p>غيّر كلمة مرور حسابك. سيتم تسجيل الخروج من كل الجلسات بعد الحفظ.</p>
      <form onSubmit={submit} className="max-w-md space-y-4">
        {[['currentPassword', 'كلمة المرور الحالية'], ['newPassword', 'كلمة المرور الجديدة'], ['confirmPassword', 'تأكيد كلمة المرور الجديدة']].map(([name, label]) => <label key={name} className="block space-y-2">
          <span>{label}</span><input type="password" name={name} required minLength={name === 'currentPassword' ? 1 : 12} maxLength={name === 'currentPassword' ? 256 : 72} autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'} value={values[name]} onChange={e => setValues({...values, [name]: e.target.value})} className="block border rounded-lg p-3 w-full" />
        </label>)}
        <p className="text-sm">كلمة المرور الجديدة لا تقل عن 12 حرفًا.</p>
        {message && <p role="alert">{message}</p>}
        <button disabled={busy} className="bg-blue-600 text-white rounded-lg px-5 py-2">{busy ? 'جاري الحفظ…' : 'تغيير كلمة المرور'}</button>
      </form>
    </>}
  </main>;
}
