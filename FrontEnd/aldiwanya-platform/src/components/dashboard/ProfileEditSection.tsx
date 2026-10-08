import { useState } from 'react';
import { useStudent } from '@/hooks/useStudent';
import type { KuwaitGrade } from '@/types/student';
import { GRADE_LABELS } from '@/data/mockStudentData';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Save, 
  AlertCircle,
  Hash,
  ShieldCheck,
  Edit3
} from 'lucide-react';

export const ProfileEditSection: React.FC = () => {
  const { student, subscription, updateProfile } = useStudent();

  const [fullName, setFullName] = useState(student.fullName);
  const [email, setEmail] = useState(student.email);
  const [phone, setPhone] = useState(student.phone);
  const [grade, setGrade] = useState<KuwaitGrade>(student.grade);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'يرجى كتابة الاسم الثلاثي على الأقل';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      errs.email = 'يرجى إدخال بريد إلكتروني صالح';
    }
    if (!phone.trim() || phone.trim().length < 8) {
      errs.phone = 'يرجى إدخال رقم هاتف كويتي صالح';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {await updateProfile({fullName:fullName.trim(),email:email.trim(),phone:phone.trim(),grade});setIsEditing(false);}
    catch(e){setErrors({fullName:e instanceof Error?e.message:'تعذر الحفظ'});}
    finally{setIsSaving(false);}
  };

  const handleCancel = () => {
    setFullName(student.fullName);
    setEmail(student.email);
    setPhone(student.phone);
    setGrade(student.grade);
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a1c36] p-6 rounded-3xl border border-[#1b3459]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-0.5 shadow-xl">
              <div className="w-full h-full bg-[#071324] rounded-[14px] flex items-center justify-center text-white font-black text-2xl font-['Cairo']">
                {student.fullName.slice(0, 2)}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-1 shadow" title="حساب موثق">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Cairo']">
                {student.fullName}
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-sky-300 border border-blue-500/30">
                طالب مسجل
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2 font-['Cairo']">
              <span>{GRADE_LABELS[student.grade]}</span>
              <span>•</span>
              <span className="font-mono text-xs text-slate-500">كود: {student.id}</span>
            </p>
          </div>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-sky-300 font-medium text-sm border border-blue-500/30 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-sky-400" />
              <span>تعديل بيانات الحساب</span>
            </button>
          ) : (
            <span className="text-xs text-sky-300 bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-500/30">
              وضع تعديل البيانات مفعّل
            </span>
          )}
        </div>
      </div>

      {/* Account Info Form / Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details Form (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0a1c36] p-6 md:p-8 rounded-3xl border border-[#1b3459]">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1b3459]">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-['Cairo']">
                <User className="w-5 h-5 text-sky-400" />
                <span>البيانات الأساسية للطالب</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-['Cairo']">
                تُستخدم هذه البيانات لتحديد المنهج المناسب والتواصل الدراسي وتفعيل الاشتراك.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الاسم الكامل (الثلاثي / الرباعي)
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={!isEditing}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                    errors.fullName ? 'border-rose-500' : 'border-slate-800'
                  } ${!isEditing ? 'opacity-80 cursor-not-allowed bg-slate-950/40' : 'hover:border-slate-700'}`}
                  placeholder="مثال: أحمد ناصر المطيري"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
              {errors.fullName && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email & Phone in 2 Cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  البريد الإلكتروني للتعريف وتسجيل الدخول
                </label>
                <div className="relative">
                  <input
                    type="email"
                    dir="ltr"
                    disabled={!isEditing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-left transition-all ${
                      errors.email ? 'border-rose-500' : 'border-slate-800'
                    } ${!isEditing ? 'opacity-80 cursor-not-allowed bg-slate-950/40' : 'hover:border-slate-700'}`}
                    placeholder="student@example.com"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-['Cairo']">
                  رقم الهاتف (دولة الكويت 🇰🇼)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-left transition-all ${
                      errors.phone ? 'border-rose-500' : 'border-slate-800'
                    } ${!isEditing ? 'opacity-80 cursor-not-allowed bg-slate-950/40' : 'hover:border-slate-700'}`}
                    placeholder="+965 9988 7766"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                </div>
                {errors.phone && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Kuwait Grade Preference */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-['Cairo']">
                المرحلة الدراسية المسجل بها (منهج الرياضيات)
              </label>
              <div className="relative">
                <select
                  disabled={!isEditing}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as KuwaitGrade)}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                    !isEditing ? 'opacity-80 cursor-not-allowed bg-slate-950/40' : 'hover:border-slate-700'
                  } border-slate-800`}
                >
                  <option value="grade_10">الصف العاشر الثانوي</option>
                  <option value="grade_11_sci">الصف الحادي عشر - علمي</option>
                  <option value="grade_11_lit">الصف الحادي عشر - أدبي</option>
                  <option value="grade_12_sci">الصف الثاني عشر - علمي</option>
                  <option value="grade_12_lit">الصف الثاني عشر - أدبي</option>
                </select>
                <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-['Cairo']">
                وفقاً لسياسة المنصة، يمنحك الاشتراك النشط حق الوصول لجميع الصفوف، وتحديد مرحلتك يعرض دروس صفك كأولوية في لوحتك.
              </p>
            </div>

            {/* Buttons when editing */}
            {isEditing && (
              <div className="pt-4 flex items-center gap-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
                >
                  إلغاء
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account Details & Security Summary (1 Col) */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-sky-400" />
              <span>معلومات النظام والتوثيق</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">رقم الطالب التعريفي:</span>
                <span className="font-mono text-slate-200 font-bold">{student.id}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">تاريخ الانضمام للمنصة:</span>
                <span className="text-slate-200">{student.joinedAt}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">نوع الحساب:</span>
                <span className="text-emerald-400 font-semibold">حساب طالب موثق</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400">حالة الاشتراك الحالية:</span>
                <span className={`font-bold ${
                  subscription.status === 'active' ? 'text-emerald-400' :
                  subscription.status === 'expired' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {subscription.status === 'active' ? 'نشط ومفعّل' :
                   subscription.status === 'expired' ? 'منتهي الصلاحية' : 'بدون اشتراك'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/60 p-6 rounded-3xl border border-indigo-500/20 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>حماية الخصوصية والأمان</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              جميع بياناتك محمية ومشفرة وفق أعلى معايير أمان المنصات التعليمية. لا يتم مشاركة رقم هاتفك أو بريدك الإلكتروني مع أي أطراف خارجية.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

