import {useState} from 'react';
import api from '../../services/api';
export default function PasswordPage({reset=false}){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e){e.preventDefault();setBusy(true);try{const r=await api.post(reset?'/auth/reset-password':'/auth/forgot-password',reset?{token:new URLSearchParams(location.search).get('token'),newPassword:password,confirmPassword:confirm}:{email});setMessage(r.data.message);}catch(e){setMessage(e.response?.data?.error?.message||'تعذر إرسال الطلب');}finally{setBusy(false);}}
 return <main dir="rtl" className="max-w-lg mx-auto p-8 space-y-4"><h1>{reset?'تعيين كلمة مرور جديدة':'استعادة كلمة المرور'}</h1><form onSubmit={submit} className="space-y-4">{reset?<><input aria-label="كلمة المرور الجديدة" type="password" minLength={12} maxLength={72} required value={password} onChange={e=>setPassword(e.target.value)}/><input aria-label="تأكيد كلمة المرور" type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></>:<input aria-label="البريد الإلكتروني" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/>}<button disabled={busy}>{busy?'جاري الإرسال…':'إرسال'}</button></form><p role="status">{message}</p><a href="/login">تسجيل الدخول</a></main>;
}

