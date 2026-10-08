import { useState, useEffect } from 'react';
import axios from '../../services/api';
import { GraduationCap, UserCheck, UserX, UserPlus, Eye, Edit3, Trash2 } from 'lucide-react';
import { PaymentStatCard } from '../../components/admin/payments/PaymentStatCard';
import { StudentsFilterBar } from '../../components/admin/students/StudentsFilterBar';
import { DataTable } from '../../components/admin/common/DataTable';
import { Pagination } from '../../components/admin/common/Pagination';

export default function StudentsPage() {
  const [filters, setFilters] = useState({ search: '', status: '', grade: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. الإحصائيات العلوية المطابقة للتصميم بالضبط
  

  // 2. بيانات الطلاب المطابقة للصورة المرفقة
  const [studentsData, setStudentsData] = useState([]);
  const stats = {totalStudents:studentsData.length,activeStudents:studentsData.filter(s=>s.status==='active').length,inactiveStudents:studentsData.filter(s=>s.status!=='active').length,newStudents:studentsData.filter(s=>s.joinDate>=new Date().toISOString().slice(0,7)).length};

  // طلب البيانات من الباك إند عبر Axios
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const res = await axios.get('/admin/students', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, ...filters }
        });
        if (res.data) {
          setStudentsData(res.data.data);
        }
      } catch (err) {
        console.error('خطأ أثناء جلب قائمة الطلاب:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [currentPage, filters]);

  // تحديد/إلغاء تحديد كل العناصر
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(studentsData.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  // تحديد عنصر واحد
  const handleSelectOne = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(item => item !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  // دالة الحذف
  const handleDeleteStudent = async (id) => {
    if (window.confirm('هل أنت تأكد من رغبتك في حذف هذا الطالب؟')) {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        await axios.delete(`/admin/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudentsData(prev => prev.filter(student => student.id !== id));
      } catch (err) {
        console.error('فشل عملية الحذف:', err);
      }
    }
  };

  // 3. تعريف أعمدة الجدول المخصصة مع الخانات التحديد والإجراءات الثلاثية
  const columns = [
    {
      header: (
        <input 
          type="checkbox" 
          onChange={handleSelectAll}
          checked={selectedStudents.length === studentsData.length && studentsData.length > 0}
          className="rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
      cell: (row) => (
        <input 
          type="checkbox" 
          checked={selectedStudents.includes(row.id)}
          onChange={() => handleSelectOne(row.id)}
          className="rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
      className: 'w-8 text-center'
    },
    { header: '#', accessor: 'id', className: 'w-10 text-center font-bold text-text-muted' },
    {
      header: 'اسم الطالب',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <img src={row.avatar} alt={row.name} className="w-8 h-8 rounded-full object-cover border border-border" />
          <span className="font-bold text-text-primary">{row.name}</span>
        </div>
      )
    },
    { header: 'البريد الإلكتروني', accessor: 'email', className: 'text-text-secondary font-mono text-[11px]' },
    { header: 'رقم الهاتف', accessor: 'phone', className: 'text-text-secondary font-mono text-[11px] dir-ltr text-right' },
    { header: 'المرحلة', accessor: 'grade', className: 'font-medium text-text-primary' },
    { 
      header: 'الكورسات المشترك بها', 
      accessor: 'coursesCount', 
      className: 'text-center font-bold text-text-primary' 
    },
    {
      header: 'الحالة',
      cell: (row) => {
        const statusConfig = {
          active: { label: 'نشط', style: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
          inactive: { label: 'غير نشط', style: 'bg-rose-100 text-rose-700 border-rose-200' },
          pending: { label: 'معلق', style: 'bg-amber-100 text-amber-700 border-amber-200' },
        };
        const conf = statusConfig[row.status] || statusConfig.active;
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${conf.style}`}>
            {conf.label}
          </span>
        );
      }
    },
    { header: 'تاريخ التسجيل', accessor: 'registerDate', className: 'text-text-muted text-[11px] font-mono' },
    {
      header: 'الإجراءات',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {/* زر عرض التفاصيل */}
          <button 
            title="عرض الملف"
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* زر التعديل */}
          <button 
            title="تعديل"
            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* زر الحذف */}
          <button 
            onClick={() => handleDeleteStudent(row.id)}
            title="حذف"
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 select-none">
      
      {/* 1. البطاقات الإحصائية الـ 4 المطابقة للتصميم */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <PaymentStatCard 
          title="إجمالي الطلاب"
          value={stats.totalStudents}
          changeText=""
          icon={GraduationCap}
          theme="purple"
        />
        <PaymentStatCard 
          title="الطلاب النشطين"
          value={stats.activeStudents}
          changeText=""
          icon={UserCheck}
          theme="green"
        />
        <PaymentStatCard 
          title="الطلاب غير النشطين"
          value={stats.inactiveStudents}
          changeText=""
          isPositive={false}
          icon={UserX}
          theme="blue"
        />
        <PaymentStatCard 
          title="الطلاب الجدد"
          value={stats.newStudents}
          changeText=""
          icon={UserPlus}
          theme="red"
        />
      </div>

      {/* 2. شريط البحث والفلترة */}
      <StudentsFilterBar filters={filters} setFilters={setFilters} />

      {/* 3. جدول البيانات الموحد */}
      <DataTable columns={columns} data={studentsData.slice((currentPage-1)*10,currentPage*10)} isLoading={isLoading} />

      {/* 4. الترقيم والتصفح */}
      <Pagination 
        currentPage={currentPage}
        totalPages={Math.max(1,Math.ceil(studentsData.length/10))}
        totalItems={studentsData.length}
        itemsPerPage={10}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
}

