// src/pages/admin/CreateCoursePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// استيراد المكونات المتبقية
import { CourseBasicInfoForm } from '../../components/admin/courses/CourseBasicInfoForm';
import { CourseExtraDetailsForm } from '../../components/admin/courses/CourseExtraDetailsForm';
import { CourseImageCard } from '../../components/admin/courses/CourseImageCard';
import { CoursePreviewBanner } from '../../components/admin/courses/CoursePreviewBanner';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [subjectsList, setSubjectsList] = useState([]);
  const [gradesList, setGradesList] = useState([]);

  const [imagePreview, setImagePreview] = useState(
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80'
  );
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: 'مقدمة في الجبر',
    subjectId: '',
    level: '',
    gradeId: '',
    description: 'اكتب وصف الكورس هنا ...',
    price: '250',
    lessonsCount: '20',
    durationHours: '12',
    isFeatured: 'نعم',
    prerequisites: 'مثال: لا توجد متطلبات سابقة ...',
    publishNow: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const defaultSubjects = [
        { id: 'math', name: 'الرياضيات' },
        { id: 'physics', name: 'الفيزياء' },
        { id: 'chemistry', name: 'الكيمياء' }
      ];

      const defaultGrades = [
        { id: '10', name: 'الصف العاشر' },
        { id: '11', name: 'الصف الحادي عشر' },
        { id: '12', name: 'الصف الثاني عشر' }
      ];

      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [subRes, gradeRes] = await Promise.allSettled([
          axios.get('/api/v1/admin/subjects', { headers }),
          axios.get('/api/v1/admin/grades', { headers })
        ]);

        if (subRes.status === 'fulfilled' && subRes.value?.data) {
          const data = subRes.value.data;
          setSubjectsList(Array.isArray(data) ? data : (data.data || defaultSubjects));
        } else {
          setSubjectsList(defaultSubjects);
        }

        if (gradeRes.status === 'fulfilled' && gradeRes.value?.data) {
          const data = gradeRes.value.data;
          setGradesList(Array.isArray(data) ? data : (data.data || defaultGrades));
        } else {
          setGradesList(defaultGrades);
        }

      } catch (err) {
        console.error('استخدام البيانات الافتراضية للكورس:', err);
        setSubjectsList(defaultSubjects);
        setGradesList(defaultGrades);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (isDraft = false) => {
    setIsSubmitting(true);
    
    const payload = new FormData();
    Object.keys(formData).forEach(key => payload.append(key, formData[key]));
    if (imageFile) payload.append('thumbnail', imageFile);
    payload.append('isDraft', isDraft);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/admin/courses', payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(isDraft ? 'تم حفظ الكورس كمسودة!' : 'تم إنشاء ونشر الكورس بنجاح!');
      navigate('/admin/courses');
    } catch (err) {
      console.error('خطأ في حفظ الكورس:', err);
      alert('حدث خطأ أثناء حفظ الكورس');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none pb-12 text-xs">
      
      {/* 1. Header الشاشة */}
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

      {/* 2. شبكة المكونات الموزعة */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* العمود الأيسر */}
        <div className="lg:col-span-8 space-y-5">
          <CourseBasicInfoForm 
            formData={formData} 
            handleChange={handleChange} 
            subjectsList={subjectsList} 
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

        {/* العمود الأيمن */}
        <div className="lg:col-span-4 space-y-5">
          <CourseImageCard 
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
            onClearImage={() => setImagePreview('')}
            courseTitle={formData.title}
          />
        </div>

      </div>

    </div>
  );
}