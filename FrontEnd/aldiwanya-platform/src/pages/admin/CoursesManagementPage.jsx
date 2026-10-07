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
  Edit3, 
  Trash2, 
  MoreVertical,
  Play
} from 'lucide-react';

import { PaymentStatCard } from '../../components/admin/payments/PaymentStatCard';
import { DataTable } from '../../components/admin/common/DataTable';
import { Pagination } from '../../components/admin/common/Pagination';

const API_BASE_URL = 'http://localhost:5000';

// دالة مساعدة لتشكيل رابط الصورة بشكل صحيح
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=150&q=80';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  
  // استبدال الباك سلاش بـ فورورد سلاش وإزالة أي سلاش زائدة في البداية
  const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, '');
  return `${API_BASE_URL}/${cleanPath}`;
};

export default function CoursesManagementPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [stats, setStats] = useState({
    coursesCount: '0',
    videosCount: '0',
    enrolledStudents: '0',
    totalLessons: '0',
  });

  const [coursesData, setCoursesData] = useState([]);
  const [gradesList, setGradesList] = useState([]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/admin/grades/getall`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => axios.get(`${API_BASE_URL}/admin/grades`, { headers: { Authorization: `Bearer ${token}` } }));
        
        const gradesData = res?.data?.data || res?.data?.grades || res?.data || [];
        if (Array.isArray(gradesData)) {
          setGradesList(gradesData);
        }
      } catch (err) {
        console.error('خطأ في جلب الصفوف:', err);
      }
    };
    fetchGrades();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/admin/courses/getall`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const responseData = res.data?.data || res.data?.courses || res.data || [];
      if (Array.isArray(responseData)) {
        setCoursesData(responseData);

        const totalLessons = responseData.reduce((acc, curr) => acc + (curr.lessonsCount || 0), 0);
        const totalVideos = responseData.reduce((acc, curr) => acc + (curr.videosCount || 0), 0);
        const totalEnrolled = responseData.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0);

        setStats({
          coursesCount: responseData.length.toString(),
          videosCount: totalVideos.toString(),
          enrolledStudents: totalEnrolled.toString(),
          totalLessons: totalLessons.toString(),
        });
      }
    } catch (err) {
      console.error('خطأ في جلب الكورسات:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage]);

  const handleDeleteCourse = async (id) => {
    if (window.confirm('هل أنت تأكد من حذف هذا الكورس بكل محتوياته؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/admin/courses/${id}/delete`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCourses();
      } catch (err) {
        console.error('فشل حذف الكورس:', err);
        alert(err.response?.data?.message || 'حدث خطأ أثناء الحذف');
      }
    }
  };

  const filteredCourses = coursesData.filter((course) => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject ? course.subject === selectedSubject : true;
    
    // فحص المرحلة سواء كانت كائن Populated أو ID مباشر
    const gradeId = typeof course.grade === 'object' ? course.grade?._id : course.grade;
    const matchesStage = selectedStage ? gradeId === selectedStage : true;
    
    const matchesStatus = selectedStatus ? course.status === selectedStatus : true;

    return matchesSearch && matchesSubject && matchesStage && matchesStatus;
  });

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
    { 
      header: '#', 
      cell: (_, index) => <span className="font-bold text-text-muted text-xs">{index + 1}</span>,
      className: 'w-8 text-center' 
    },
    {
      header: 'الكورس',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-9 rounded-lg overflow-hidden bg-slate-900 border border-border shrink-0 group">
            <img 
              src={getImageUrl(row.coverImage || row.image)} 
              alt={row.title} 
              className="w-full h-full object-cover opacity-80" 
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=150&q=80';
              }}
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
    { 
      header: 'المادة', 
      cell: (row) => row.subject || 'عام', 
      className: 'text-text-secondary font-medium text-xs' 
    },
    { 
      header: 'المرحلة', 
      cell: (row) => {
        // إذا كانت المرحلة Populated كـ Object
        if (typeof row.grade === 'object' && row.grade !== null) {
          return row.grade.name || row.grade.title || row.grade.gradeName || 'غير محدد';
        }
        // إذا كانت ID، يتم البحث عنها من قائمة الصفوف
        const matched = gradesList.find(g => (g._id || g.id) === row.grade);
        return matched ? (matched.name || matched.title || matched.gradeName) : 'غير محدد';
      }, 
      className: 'text-gray-800 font-medium text-xs' 
    },
    { 
      header: 'عدد الدروس', 
      cell: (row) => row.lessonsCount || 0, 
      className: 'font-bold text-navy-950 text-xs text-center' 
    },
    { 
      header: 'الطلاب المسجلين', 
      cell: (row) => row.enrolledCount || row.studentsCount || 0, 
      className: 'font-bold text-navy-950 text-xs text-center' 
    },
    { 
      header: 'تاريخ الإنشاء', 
      cell: (row) => {
        const dateVal = row.createdAt || row.created_at;
        return dateVal ? new Date(dateVal).toLocaleDateString('ar-EG') : '-';
      }, 
      className: 'text-text-muted text-xs font-mono' 
    },
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
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(`/admin/courses/edit/${row._id}`)}
            title="تعديل الكورس"
            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button 
            onClick={() => handleDeleteCourse(row._id)}
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
    <div className="space-y-5 select-none pb-10 dir-rtl text-right">
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

        <button
          type="button"
          onClick={() => navigate('/admin/courses/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كورس جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <PaymentStatCard 
          title="عدد الكورسات"
          value={stats.coursesCount}
          changeText={`+${stats.coursesCount} كورس`}
          icon={BookOpen}
          theme="red"
        />
        <PaymentStatCard 
          title="إجمالي الفيديوهات"
          value={stats.videosCount}
          changeText={`+${stats.videosCount} فيديو`}
          icon={Video}
          theme="blue"
        />
        <PaymentStatCard 
          title="الطلاب المسجلين"
          value={stats.enrolledStudents}
          changeText={`+${stats.enrolledStudents} طالب`}
          icon={Users}
          theme="green"
        />
        <PaymentStatCard 
          title="إجمالي الدروس"
          value={stats.totalLessons}
          changeText={`+${stats.totalLessons} درس`}
          icon={Layers}
          theme="purple"
        />
      </div>

      <div className="bg-white border border-border rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
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

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer font-medium"
          >
            <option value="">كل المواد</option>
            <option value="الرياضيات">الرياضيات</option>
            <option value="الفيزياء">الفيزياء</option>
            <option value="الكيمياء">الكيمياء</option>
            <option value="علوم">علوم</option>
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer font-medium"
          >
            <option value="">كل المراحل</option>
            {gradesList.map((grade) => (
              <option key={grade._id || grade.id} value={grade._id || grade.id}>
                {grade.name || grade.title || grade.gradeName}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer font-medium"
          >
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">معلق</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={filteredCourses} isLoading={isLoading} />

      <Pagination 
        currentPage={currentPage}
        totalPages={1}
        totalItems={filteredCourses.length}
        itemsPerPage={10}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}