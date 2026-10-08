import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../services/api';
import { 
  FileText, 
  UploadCloud, 
  ArrowRight, 
  Save, 
  X 
} from 'lucide-react';

export default function UploadPdfPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // حالات القوائم القادمة من قاعدة البيانات حصراً
  const [gradesList, setGradesList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);

  // ملف الـ PDF المرفق
  const [selectedFile, setSelectedFile] = useState(null);

  // حالة النموذج
  const [formData, setFormData] = useState({
    title: '',
    gradeId: '',
    courseId: '',
    type: 'مذكرة',
    status: 'active',
    description: '',
  });

  // جلب البيانات من قاعدة البيانات فقط عند التحميل
  useEffect(() => {
    const fetchDatabaseData = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [gradesRes, coursesRes] = await Promise.allSettled([
          axios.get('/admin/grades', { headers }),
          axios.get('/admin/courses', { headers })
        ]);

        if (gradesRes.status === 'fulfilled' && gradesRes.value?.data) {
          const data = gradesRes.value.data;
          setGradesList(Array.isArray(data) ? data : (data.data || []));
        }

        if (coursesRes.status === 'fulfilled' && coursesRes.value?.data) {
          const data = coursesRes.value.data;
          setCoursesList(Array.isArray(data) ? data : (data.data || []));
        }

      } catch (err) {
        console.error('خطأ في جلب البيانات من قاعدة البيانات:', err);
      }
    };

    fetchDatabaseData();
  }, []);

  // التعامل مع اختيار ملف الـ PDF
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('يرجى اختيار ملف بصيغة PDF فقط');
        return;
      }
      setSelectedFile(file);
      if (!formData.title) {
        const cleanName = file.name.replace('.pdf', '');
        setFormData(prev => ({ ...prev, title: cleanName }));
      }
    }
  };

  // التعامل مع تغير مدخلات الفورم
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // رفع الملف وإرسال البيانات
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('يرجى ارفاق ملف الـ PDF أولاً');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    const dataPayload = new FormData();
    dataPayload.append('file', selectedFile);
    dataPayload.append('title', formData.title);
    dataPayload.append('gradeId', formData.gradeId);
    dataPayload.append('course', formData.courseId);
    dataPayload.append('type', formData.type);
    dataPayload.append('status', formData.status);
    dataPayload.append('description', formData.description);

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.post('/admin/pdfs', dataPayload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      alert('تم رفع ملف الـ PDF بنجاح!');
      navigate('/admin/pdfs');
    } catch (error) {
      console.error('خطأ أثناء رفع الملف:', error);
      alert('حدث خطأ أثناء رفع الملف، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 select-none pb-10">
      
      {/* زر العودة */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/admin/pdfs')}
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لإدارة الملفات المجانية</span>
        </button>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* عنوان الصفحة */}
        <div className="border-b border-border pb-4">
          <h2 className="text-lg font-extrabold text-navy-950 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>رفع ملف PDF جديد</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            قم بإرفاق وتعبئة بيانات الملف المتاح للتحميل المجاني للطلاب
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* 1. منطقة رفع الملف */}
          <div className="space-y-1.5">
            <label className="font-bold text-text-secondary block">
              ملف الـ PDF <span className="text-rose-500">*</span>
            </label>

            {!selectedFile ? (
              <label className="border-2 border-dashed border-border hover:border-blue-500 bg-surface rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="font-bold text-text-primary">اضغط هنا لترفيق الملف أو اسحبه إلى هنا</span>
                <span className="text-[10px] text-text-muted">يدعم ملفات PDF فقط (بحد أقصى 50MB)</span>
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
              </label>
            ) : (
              <div className="bg-slate-50 border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold">
                    PDF
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-navy-950 truncate max-w-[250px]">{selectedFile.name}</p>
                    <p className="text-[10px] text-text-muted font-mono">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="حذف الملف"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 2. عنوان الملف */}
          <div className="space-y-1">
            <label className="font-bold text-text-secondary block">
              اسم / عنوان الملف <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="مثال: مذكرة الوحدة الأولى - الرياضيات"
              className="w-full bg-surface text-text-primary rounded-xl px-3.5 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>

          {/* 3. الصف الدراسي والكورس (من قاعدة البيانات حصراً) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* الصف الدراسي */}
            <div className="space-y-1">
              <label className="font-bold text-text-secondary block">
                الصف الدراسي <span className="text-rose-500">*</span>
              </label>
              <select
                name="gradeId"
                value={formData.gradeId}
                onChange={handleChange}
                required
                className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
              >
                <option value="">اختر الصف...</option>
                {gradesList.map((g) => (
                  <option key={g.id || g._id} value={g.id || g._id}>
                    {g.name || g.title}
                  </option>
                ))}
              </select>
            </div>

            {/* الكورس المسجل من الداتا بيز */}
            <div className="space-y-1">
              <label className="font-bold text-text-secondary block">
                الكورس / المادة <span className="text-rose-500">*</span>
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                required
                className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
              >
                <option value="">اختر الكورس...</option>
                {coursesList.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.title || c.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* 4. نوع الملف */}
          <div className="space-y-1">
            <label className="font-bold text-text-secondary block">
              نوع الملف <span className="text-rose-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
            >
              <option value="مذكرة">مذكرة</option>
              <option value="أوراق عمل">أوراق عمل</option>
              <option value="مراجعة">مراجعة</option>
              <option value="امتحانات">امتحانات</option>
              <option value="ملخص">ملخصات</option>
            </select>
          </div>

          {/* 5. الوصف */}
          <div className="space-y-1">
            <label className="font-bold text-text-secondary block">وصف مختصر للملف (اختياري)</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="اكتب نبذة أو ملاحظات عن الملف للطلاب..."
              className="w-full bg-surface text-text-primary rounded-xl p-3 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium resize-none"
            />
          </div>

          {/* مؤشر الرفع Progress */}
          {isSubmitting && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] font-bold text-text-muted">
                <span>جاري رفع الملف...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* الأزرار */}
          <div className="flex items-center gap-2 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الرفع والحفظ...' : 'حفظ ونشر الملف'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/pdfs')}
              className="px-5 py-2.5 bg-surface border border-border hover:bg-slate-100 text-text-secondary font-bold rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

