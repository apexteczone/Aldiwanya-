import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, Clock, Link as LinkIcon, Save, ArrowRight } from 'lucide-react';

export default function UploadVideoPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالات القوائم مع ضمان أنها Arrays افتراضية
  const [gradesList, setGradesList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);

  // حالات لتفعيل الإدخال اليدوي عند اختيار "إضافة جديد"
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [isCustomCourse, setIsCustomCourse] = useState(false);

  // حالة النموذج
  const [formData, setFormData] = useState({
    title: 'مفهوم المتغيرات في الجبر',
    gradeId: '',
    customGradeName: '',
    courseId: '',
    customCourseName: '',
    moduleId: 'algebra_intro',
    lessonId: 'variables_concept',
    duration: '12:45',
    videoUrl: 'https://youtu.be/xxxxxxxx',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
  });

  // جلب البيانات مع الفحص والتأمين الضمني
  useEffect(() => {
    const fetchInitialData = async () => {
      const defaultGrades = [
        { id: 'g1', name: 'الصف الأول الثانوي' },
        { id: 'g2', name: 'الصف الثاني الثانوي' },
        { id: 'g3', name: 'الصف الثالث الثانوي' },
      ];

      const defaultCourses = [
        { id: 'math', name: 'الرياضيات' },
        { id: 'physics', name: 'الفيزياء' },
        { id: 'chemistry', name: 'الكيمياء' },
      ];

      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [gradesRes, coursesRes] = await Promise.allSettled([
          axios.get('/api/v1/admin/grades', { headers }),
          axios.get('/api/v1/admin/courses', { headers })
        ]);

        // استخراج مصفوفة الصفوف
        if (gradesRes.status === 'fulfilled' && gradesRes.value?.data) {
          const resData = gradesRes.value.data;
          const extractedGrades = Array.isArray(resData) 
            ? resData 
            : (resData.data || resData.grades || []);
          setGradesList(extractedGrades.length > 0 ? extractedGrades : defaultGrades);
        } else {
          setGradesList(defaultGrades);
        }

        // استخراج مصفوفة الكورسات
        if (coursesRes.status === 'fulfilled' && coursesRes.value?.data) {
          const resData = coursesRes.value.data;
          const extractedCourses = Array.isArray(resData) 
            ? resData 
            : (resData.data || resData.courses || []);
          setCoursesList(extractedCourses.length > 0 ? extractedCourses : defaultCourses);
        } else {
          setCoursesList(defaultCourses);
        }

      } catch (err) {
        console.error('خطأ في جلب البيانات، استخدام البيانات الافتراضية:', err);
        setGradesList(defaultGrades);
        setCoursesList(defaultCourses);
      }
    };

    fetchInitialData();
  }, []);

  // معالجة تغيير المدخلات
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'gradeId') {
      if (value === 'NEW_GRADE') {
        setIsCustomGrade(true);
        setFormData((prev) => ({ ...prev, gradeId: '', customGradeName: '' }));
      } else {
        setIsCustomGrade(false);
        setFormData((prev) => ({ ...prev, gradeId: value, customGradeName: '' }));
      }
      return;
    }

    if (name === 'courseId') {
      if (value === 'NEW_COURSE') {
        setIsCustomCourse(true);
        setFormData((prev) => ({ ...prev, courseId: '', customCourseName: '' }));
      } else {
        setIsCustomCourse(false);
        setFormData((prev) => ({ ...prev, courseId: value, customCourseName: '' }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // حفظ الفيديو
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title: formData.title,
      grade: isCustomGrade ? formData.customGradeName : formData.gradeId,
      course: isCustomCourse ? formData.customCourseName : formData.courseId,
      moduleId: formData.moduleId,
      lessonId: formData.lessonId,
      duration: formData.duration,
      videoUrl: formData.videoUrl,
      thumbnailUrl: formData.thumbnailUrl,
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/admin/videos', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('تم حفظ الفيديو بنجاح!');
      navigate('/admin/video');
    } catch (error) {
      console.error('خطأ أثناء حفظ الفيديو:', error);
      alert('حدث خطأ أثناء حفظ الفيديو، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  // التحقق المباشر قبل الـ Map لضمان العرض السليم
  const safeGradesList = Array.isArray(gradesList) ? gradesList : [];
  const safeCoursesList = Array.isArray(coursesList) ? coursesList : [];

  return (
    <div className="max-w-md mx-auto space-y-4 select-none pb-10">
      
      {/* زر العودة العلوي */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/admin/video')}
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لإدارة الدروس والفيديوهات</span>
        </button>
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-5">
        
        {/* 1. معاينة الفيديو */}
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-navy-950 text-center">معاينة الفيديو</h3>
          
          <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-border bg-slate-900 group shadow-xs">
            <img 
              src={formData.thumbnailUrl} 
              alt="معاينة الفيديو" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 text-navy-950 flex items-center justify-center shadow-lg group-hover:bg-blue-600 group-hover:text-white transition-all cursor-pointer">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
            {formData.duration && (
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                {formData.duration}
              </span>
            )}
          </div>

          <h4 className="text-sm font-extrabold text-navy-950 text-center pt-1">
            {formData.title || 'عنوان الفيديو'}
          </h4>
        </div>

        {/* 2. تبويبات التحكم */}
        <div className="flex items-center border-b border-border text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-2.5 text-center transition-all border-b-2 cursor-pointer ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            معلومات أساسية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 py-2.5 text-center transition-all border-b-2 cursor-pointer ${
              activeTab === 'advanced'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            إعدادات متقدمة
          </button>
        </div>

        {/* 3. النموذج */}
        {activeTab === 'basic' ? (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {/* عنوان الفيديو */}
            <div className="space-y-1">
              <label className="font-bold text-text-secondary block">
                عنوان الفيديو <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="أدخل عنوان الفيديو"
                className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>

            {/* الصف الدراسي */}
            <div className="space-y-1">
              <label className="font-bold text-text-secondary block">
                الصف الدراسي <span className="text-rose-500">*</span>
              </label>
              {!isCustomGrade ? (
                <select
                  name="gradeId"
                  value={formData.gradeId}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
                >
                  <option value="">اختر الصف الدراسي...</option>
                  {safeGradesList.map((g) => (
                    <option key={g.id || g._id} value={g.id || g._id}>{g.name || g.title}</option>
                  ))}
                  <option value="NEW_GRADE" className="font-bold text-blue-600">+ إضافة صف جديد...</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="customGradeName"
                    value={formData.customGradeName}
                    onChange={handleChange}
                    required
                    placeholder="اكتب اسم الصف الدراسي الجديد"
                    className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-blue-500 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomGrade(false)}
                    className="text-xs text-rose-500 hover:underline shrink-0 font-bold"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>

            {/* الكورس */}
            <div className="space-y-1">
              <label className="font-bold text-text-secondary block">
                الكورس <span className="text-rose-500">*</span>
              </label>
              {!isCustomCourse ? (
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
                >
                  <option value="">اختر الكورس...</option>
                  {safeCoursesList.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>{c.name || c.title}</option>
                  ))}
                  <option value="NEW_COURSE" className="font-bold text-blue-600">+ إضافة كورس جديد...</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="customCourseName"
                    value={formData.customCourseName}
                    onChange={handleChange}
                    required
                    placeholder="اكتب اسم الكورس الجديد"
                    className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-blue-500 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomCourse(false)}
                    className="text-xs text-rose-500 hover:underline shrink-0 font-bold"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>

            {/* الموديول */}
            <div className="space-y-1">
              <label className="font-bold text-text-secondary block">
                الموديول <span className="text-rose-500">*</span>
              </label>
              <select
                name="moduleId"
                value={formData.moduleId}
                onChange={handleChange}
                required
                className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
              >
                <option value="algebra_intro">مقدمة في الجبر</option>
                <option value="equations">المعادلات</option>
              </select>
            </div>

            {/* الدرس */}
            <div className="space-y-1">
              <label className="font-bold text-text-secondary block">
                الدرس <span className="text-rose-500">*</span>
              </label>
              <select
                name="lessonId"
                value={formData.lessonId}
                onChange={handleChange}
                required
                className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
              >
                <option value="variables_concept">مفهوم المتغيرات في الجبر</option>
                <option value="solving_eq">حل المعادلة البسيطة</option>
              </select>
            </div>

            {/* المدة */}
            <div className="space-y-1">
              <label className="font-bold text-text-secondary block">المدة</label>
              <div className="relative">
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="12:45"
                  className="w-full bg-surface text-text-primary rounded-xl pr-3 pl-9 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-left dir-ltr"
                />
                <Clock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* رابط الفيديو */}
            <div className="space-y-1">
              <label className="font-bold text-text-secondary block">رابط الفيديو</label>
              <div className="relative">
                <input
                  type="text"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://youtu.be/xxxxxxxx"
                  className="w-full bg-surface text-text-primary rounded-xl pr-3 pl-9 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-left dir-ltr"
                />
                <LinkIcon className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex items-center gap-2 pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/video')}
                className="px-5 py-2.5 bg-surface border border-border hover:bg-slate-100 text-text-secondary font-bold rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>

          </form>
        ) : (
          <div className="py-6 text-center text-xs text-text-muted space-y-2">
            <p>خيارات المعاينة المتقدمة والصلاحيات الخاصة بالفيديو</p>
          </div>
        )}

      </div>
    </div>
  );
}