// src/pages/admin/CreateCoursePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../services/api';

import { CourseBasicInfoForm } from '../../components/admin/courses/CourseBasicInfoForm';
import { CourseExtraDetailsForm } from '../../components/admin/courses/CourseExtraDetailsForm';
import { CourseImageCard } from '../../components/admin/courses/CourseImageCard';
import { CoursePreviewBanner } from '../../components/admin/courses/CoursePreviewBanner';

const API_BASE_URL = '';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const {id}=useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradesList, setGradesList] = useState([]);

  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    grade: '',
    description: '',
    subject: '',
    price: '',
    lessonsCount: '',
    durationHours: '',
    position: 0,
    status: 'published',
  });

  // 1. جلب الصفوف بالروت الخاص بك
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const response = await axios.get('/admin/grades', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const gradesData = 
          response.data?.data || 
          response.data?.grades || 
          response.data?.doc ||
          (Array.isArray(response.data) ? response.data : []);

        setGradesList(gradesData);
      } catch (err) {
        console.error('خطأ في جلب الصفوف:', err);
      }
    };

    fetchGrades();
  }, []);

  useEffect(()=>{if(!id)return;let live=true;axios.get('/admin/courses/'+id).then(r=>{if(live){const c=r.data.data;setFormData({...c,grade:c.grade?._id||c.grade});setImagePreview(c.coverImage||'');}});return()=>{live=false;};},[id]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  // 2. إرسال البيانات بـ FormData بالتطابق التام مع الـ Joi Schema في الباك إند
  const handleSubmit = async () => {
    if (!formData.title || !formData.grade) {
      alert('برجاء تعبئة اسم المادة واختيار الصف الدراسي أولاً');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');

      const data = new FormData();
      data.append('title', formData.title);
      data.append('grade', formData.grade);
      data.append('description', formData.description || '');
      data.append('subject', formData.subject || formData.title);
      data.append('position', Number(formData.position) || 0);
      data.append('status', formData.status || 'published');

      for (const field of ['price','lessonsCount','durationHours']) data.append(field, Number(formData[field]) || 0);

      if (imageFile) {
        data.append('coverImage', imageFile);
      }

      await axios[id ? 'patch' : 'post'](id ? `/admin/courses/${id}` : `${API_BASE_URL}/admin/courses/Create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('تم إنشاء الكورس بنجاح!');
      navigate('/admin/courses');
    } catch (err) {
      console.error('خطأ في حفظ الكورس:', err.response?.data || err);
      
      const serverMessage = 
        err.response?.data?.error?.message || 
        err.response?.data?.message || 
        'حدث خطأ أثناء حفظ الكورس';
        
      alert(`فشل الحفظ: ${serverMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none pb-12 text-xs dir-rtl text-right">
      
      {/* Header الشاشة */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <button 
              onClick={() => navigate('/admin/courses')}
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              إدارة الكورسات
            </button>
            <span>&gt;</span>
            <span className="text-blue-600 font-bold">إضافة كورس</span>
          </div>
          <h1 className="text-xl font-extrabold text-navy-950 flex items-center gap-2">
            <span>+ إضافة كورس جديد</span>
          </h1>
          <p className="text-text-muted mt-0.5">أضف تفاصيل الكورس والمحتوى التعليمي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        <div className="lg:col-span-8 space-y-5">
          <CourseBasicInfoForm 
            formData={formData} 
            handleChange={handleChange} 
            gradesList={gradesList} 
          />

          <CourseExtraDetailsForm 
            formData={formData} 
            handleChange={handleChange} 
          />

          <CoursePreviewBanner 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        <div className="lg:col-span-4 space-y-5">
          <CourseImageCard 
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
            onClearImage={handleClearImage}
          />
        </div>

      </div>

    </div>
  );
}

