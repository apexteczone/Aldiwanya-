import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, 
  Video, 
  Users, 
  Layers, 
  Plus, 
  Search, 
  BarChart2, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Play
} from 'lucide-react';

// استيراد المكونات المعاد استخدامها المعتمدة بالمنصة
import { PaymentStatCard } from '../../components/admin/payments/PaymentStatCard';
import { DataTable } from '../../components/admin/common/DataTable';
import { Pagination } from '../../components/admin/common/Pagination';

export default function CoursesManagementPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // حالات الفلاتر والبحث
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // 1. الإحصائيات العلوية الـ 4 المطابقة للصورة بالضبط
  const [stats] = useState({
    coursesCount: '24',
    coursesChange: '+ 4 كورس جديد',
    videosCount: '456',
    videosChange: '+ 24 فيديو جديد',
    enrolledStudents: '1,248',
    enrolledStudentsChange: '+ 18% من الشهر الماضي',
    totalLessons: '320',
    totalLessonsChange: '+ 12 درس جديد',
  });

  // 2. داتا جدول الكورسات المطابقة للواجهة في الصورة
  const [coursesData, setCoursesData] = useState([
    {
      id: 1,
      title: 'مقدمة في الجبر',
      subject: 'الرياضيات',
      stage: 'الصف العاشر',
      lessonsCount: 12,
      videosCount: 12,
      enrolledCount: '320',
      createdAt: '2025-08-01',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 2,
      title: 'الهندسة التحليلية',
      subject: 'الرياضيات',
      stage: 'الصف الحادي عشر',
      lessonsCount: 16,
      videosCount: 18,
      enrolledCount: '456',
      createdAt: '2025-07-15',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 3,
      title: 'التفاضل والتكامل',
      subject: 'الرياضيات',
      stage: 'الصف الثاني عشر',
      lessonsCount: 20,
      videosCount: 24,
      enrolledCount: '512',
      createdAt: '2025-06-28',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 4,
      title: 'الإحصاء والاحتمالات',
      subject: 'الرياضيات',
      stage: 'الصف الثاني عشر',
      lessonsCount: 14,
      videosCount: 14,
      enrolledCount: '274',
      createdAt: '2025-05-20',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 5,
      title: 'مراجعة شاملة للصف العاشر',
      subject: 'الرياضيات',
      stage: 'الصف العاشر',
      lessonsCount: 10,
      videosCount: 10,
      enrolledCount: '198',
      createdAt: '2025-05-05',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 6,
      title: 'بنك الأسئلة والتطبيقات',
      subject: 'الرياضيات',
      stage: 'الصف الحادي عشر',
      lessonsCount: 15,
      videosCount: 16,
      enrolledCount: '402',
      createdAt: '2025-04-18',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 7,
      title: 'كورس الأساسيات',
      subject: 'الرياضيات',
      stage: 'الصف العاشر',
      lessonsCount: 8,
      videosCount: 9,
      enrolledCount: '365',
      createdAt: '2025-04-02',
      status: 'pending',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 8,
      title: 'تحديات ومسائل متقدمة',
      subject: 'الرياضيات',
      stage: 'الصف الثاني عشر',
      lessonsCount: 18,
      videosCount: 20,
      enrolledCount: '286',
      createdAt: '2025-03-15',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=150&q=80'
    },
  ]);

  // جلب البيانات الفعلية من API عند التوفر
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/admin/courses', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, search: searchQuery }
        });
        if (res.data && Array.isArray(res.data.data)) {
          // setCoursesData(res.data.data);
        }
      } catch (err) {
        console.error('خطأ في جلب الكورسات:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, searchQuery]);

  // معالجة حذف كورس
  const handleDeleteCourse = async (id) => {
    if (window.confirm('هل أنت تأكد من حذف هذا الكورس بكل محتوياته؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/v1/admin/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCoursesData(prev => prev.filter(course => course.id !== id));
      } catch (err) {
        console.error('فشل حذف الكورس:', err);
      }
    }
  };

  // 3. تعريف أعمدة جدول الكورسات بنفس ترتيب وحدود الصورة
  const columns = [
    {
      header: '',
      cell: () => (
        <button className="text-text-muted hover:text-text-primary cursor-pointer">
          <MoreVertical className="w-4 h-4" />
        </button>
      ),
      className: 'w-6 text-center'
    },
    { header: '#', accessor: 'id', className: 'w-8 text-center font-bold text-text-muted text-xs' },
    {
      header: 'الكورس',
      cell: (row) => (
        <div className="flex items-center gap-3">
          {/* الصورة المصغرة مع علامة التشغيل التوضيحية */}
          <div className="relative w-14 h-9 rounded-lg overflow-hidden bg-slate-900 border border-border shrink-0 group">
            <img 
              src={row.thumbnail} 
              alt={row.title} 
              className="w-full h-full object-cover opacity-80" 
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-white/90 text-navy-950 flex items-center justify-center">
                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
              </div>
            </div>
          </div>
          
          <span className="font-extrabold text-navy-950 text-xs hover:text-blue-600 cursor-pointer">
            {row.title}
          </span>
        </div>
      )
    },
    { header: 'المادة', accessor: 'subject', className: 'text-text-secondary font-medium text-xs' },
    { header: 'المرحلة', accessor: 'stage', className: 'text-text-secondary font-medium text-xs' },
    { header: 'عدد الدروس', accessor: 'lessonsCount', className: 'font-bold text-navy-950 text-xs text-center' },
    { header: 'عدد الفيديوهات', accessor: 'videosCount', className: 'font-bold text-navy-950 text-xs text-center' },
    { header: 'الطلاب المسجلين', accessor: 'enrolledCount', className: 'font-bold text-navy-950 text-xs text-center' },
    { header: 'تاريخ الإنشاء', accessor: 'createdAt', className: 'text-text-muted text-xs font-mono' },
    {
      header: 'الحالة',
      cell: (row) => (
        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${
          row.status === 'active' 
            ? 'bg-emerald-100 text-emerald-700' 
            : 'bg-amber-100 text-amber-700'
        }`}>
          {row.status === 'active' ? 'نشط' : 'معلق'}
        </span>
      )
    },
    {
      header: 'الإجراءات',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button 
            title="إحصائيات الكورس"
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button 
            onClick={() => navigate(`/admin/courses/edit/${row.id}`)}
            title="تعديل الكورس"
            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button 
            onClick={() => handleDeleteCourse(row.id)}
            title="حذف الكورس"
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5 select-none pb-10">
      
      {/* Header الصفحة مع زر إضافة كورس جديد */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-navy-950 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>إدارة الكورسات</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            يمكنك إضافة وتعديل وتنظيم الكورسات والموديولات والدروس الخاصة بك
          </p>
        </div>

        {/* زر إضافة كورس جديد */}
        <button
          type="button"
          onClick={() => navigate('/admin/courses/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كورس جديد</span>
        </button>
      </div>

      {/* 1. الكاردات الإحصائية الـ 4 المطابقة للصورة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <PaymentStatCard 
          title="عدد الكورسات"
          value={stats.coursesCount}
          changeText={stats.coursesChange}
          icon={BookOpen}
          theme="red"
        />
        <PaymentStatCard 
          title="إجمالي الفيديوهات"
          value={stats.videosCount}
          changeText={stats.videosChange}
          icon={Video}
          theme="blue"
        />
        <PaymentStatCard 
          title="الطلاب المسجلين"
          value={stats.enrolledStudents}
          changeText={stats.enrolledStudentsChange}
          icon={Users}
          theme="green"
        />
        <PaymentStatCard 
          title="إجمالي الدروس"
          value={stats.totalLessons}
          changeText={stats.totalLessonsChange}
          icon={Layers}
          theme="purple"
        />
      </div>

      {/* 2. شريط الفلاتر والبحث */}
      <div className="bg-white border border-border rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
        
        {/* حقل البحث عن كورس */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن كورس..."
            className="w-full bg-surface text-text-primary rounded-xl pr-9 pl-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
          />
          <Search className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* الفلاتر المنسدلة */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer font-medium"
          >
            <option value="">كل المواد</option>
            <option value="math">الرياضيات</option>
            <option value="physics">الفيزياء</option>
            <option value="chemistry">الكيمياء</option>
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer font-medium"
          >
            <option value="">كل المراحل</option>
            <option value="10">الصف العاشر</option>
            <option value="11">الصف الحادي عشر</option>
            <option value="12">الصف الثاني عشر</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer font-medium"
          >
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="pending">معلق</option>
          </select>

        </div>

      </div>

      {/* 3. جدول داتا الكورسات */}
      <DataTable columns={columns} data={coursesData} isLoading={isLoading} />

      {/* 4. مكون الباجينيشن الموحد */}
      <Pagination 
        currentPage={currentPage}
        totalPages={5}
        totalItems={24}
        itemsPerPage={10}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
}