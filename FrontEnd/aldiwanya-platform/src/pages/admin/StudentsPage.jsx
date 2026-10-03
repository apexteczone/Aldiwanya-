import { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [stats] = useState({
    totalStudents: '1,248',
    activeStudents: '892',
    inactiveStudents: '356',
    newStudents: '120',
  });

  // 2. بيانات الطلاب المطابقة للصورة المرفقة
  const [studentsData, setStudentsData] = useState([
    { id: 1, name: 'يوسف خالد', avatar: 'https://i.pravatar.cc/150?img=11', email: 'yousif@example.com', phone: '+965 5012 3456', grade: 'الصف العاشر', coursesCount: 3, status: 'active', registerDate: '2025-08-30' },
    { id: 2, name: 'سارة أحمد', avatar: 'https://i.pravatar.cc/150?img=5', email: 'sara@example.com', phone: '+965 5123 9876', grade: 'الصف الحادي عشر', coursesCount: 2, status: 'active', registerDate: '2025-08-29' },
    { id: 3, name: 'علي محمد', avatar: 'https://i.pravatar.cc/150?img=12', email: 'ali@example.com', phone: '+965 5000 1122', grade: 'الصف الثاني عشر', coursesCount: 4, status: 'active', registerDate: '2025-08-28' },
    { id: 4, name: 'نورة عبدالله', avatar: 'https://i.pravatar.cc/150?img=9', email: 'nora@example.com', phone: '+965 5122 3344', grade: 'الصف العاشر', coursesCount: 1, status: 'inactive', registerDate: '2025-08-25' },
    { id: 5, name: 'فهد مبارك', avatar: 'https://i.pravatar.cc/150?img=68', email: 'fahad@example.com', phone: '+965 5666 7788', grade: 'الصف الثاني عشر', coursesCount: 3, status: 'active', registerDate: '2025-08-20' },
    { id: 6, name: 'ريم عبدالله', avatar: 'https://i.pravatar.cc/150?img=47', email: 'reem@example.com', phone: '+965 5999 2233', grade: 'الصف الحادي عشر', coursesCount: 2, status: 'pending', registerDate: '2025-08-18' },
    { id: 7, name: 'خالد سعود', avatar: 'https://i.pravatar.cc/150?img=33', email: 'khaled@example.com', phone: '+965 5777 4455', grade: 'الصف العاشر', coursesCount: 1, status: 'active', registerDate: '2025-08-15' },
    { id: 8, name: 'لطيفة محمد', avatar: 'https://i.pravatar.cc/150?img=44', email: 'latifa@example.com', phone: '+965 5888 9900', grade: 'الصف الثاني عشر', coursesCount: 5, status: 'active', registerDate: '2025-08-10' },
    { id: 9, name: 'عبدالله ناصر', avatar: 'https://i.pravatar.cc/150?img=60', email: 'abdullah@example.com', phone: '+965 5111 6677', grade: 'الصف الحادي عشر', coursesCount: 0, status: 'inactive', registerDate: '2025-08-05' },
    { id: 10, name: 'مريم خالد', avatar: 'https://i.pravatar.cc/150?img=20', email: 'mariam@example.com', phone: '+965 5333 8899', grade: 'الصف العاشر', coursesCount: 2, status: 'active', registerDate: '2025-08-01' },
  ]);

  // طلب البيانات من الباك إند عبر Axios
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/admin/students', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, ...filters }
        });
        if (res.data) {
          // setStudentsData(res.data.data);
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
        const token = localStorage.getItem('token');
        await axios.delete(`/api/v1/admin/students/${id}`, {
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
          changeText="+12%"
          icon={GraduationCap}
          theme="purple"
        />
        <PaymentStatCard 
          title="الطلاب النشطين"
          value={stats.activeStudents}
          changeText="+18%"
          icon={UserCheck}
          theme="green"
        />
        <PaymentStatCard 
          title="الطلاب غير النشطين"
          value={stats.inactiveStudents}
          changeText="-6%"
          isPositive={false}
          icon={UserX}
          theme="blue"
        />
        <PaymentStatCard 
          title="الطلاب الجدد"
          value={stats.newStudents}
          changeText="+24%"
          icon={UserPlus}
          theme="red"
        />
      </div>

      {/* 2. شريط البحث والفلترة */}
      <StudentsFilterBar filters={filters} setFilters={setFilters} />

      {/* 3. جدول البيانات الموحد */}
      <DataTable columns={columns} data={studentsData} isLoading={isLoading} />

      {/* 4. الترقيم والتصفح */}
      <Pagination 
        currentPage={currentPage}
        totalPages={25}
        totalItems={248}
        itemsPerPage={10}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
}