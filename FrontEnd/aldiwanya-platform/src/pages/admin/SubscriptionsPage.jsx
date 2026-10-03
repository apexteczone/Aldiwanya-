import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, CheckCircle2, Clock, XCircle, Eye, Edit3, Trash2 } from 'lucide-react';
import { PaymentStatCard } from '../../components/admin/payments/PaymentStatCard';
import { SubscriptionsFilterBar } from '../../components/admin/Subscription/SubscriptionsFilterBar';
import { DataTable } from '../../components/admin/common/DataTable';
import { Pagination } from '../../components/admin/common/Pagination';

export default function SubscriptionsPage() {
  const [filters, setFilters] = useState({ search: '', status: '', type: '', course: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. الإحصائيات العلوية الخاصة بالاشتراكات كما في الصورة
  const [stats] = useState({
    totalSubscriptions: '1,248',
    activeSubscriptions: '892',
    expiringSubscriptions: '156',
    expiredSubscriptions: '200',
  });

  // 2. البيانات المطابقة تماماً للصورة المرفقة
  const [subscriptionsData, setSubscriptionsData] = useState([
    { id: 1, student: 'يوسف خالد', avatar: 'https://i.pravatar.cc/150?img=11', course: 'مقدمة في الجبر', planType: 'شهري', startDate: '2025-08-01', endDate: '2025-09-01', status: 'active', amount: '250 EGP' },
    { id: 2, student: 'سارة أحمد', avatar: 'https://i.pravatar.cc/150?img=5', course: 'المعادلات البسيطة', planType: 'ترم كامل', startDate: '2025-06-15', endDate: '2025-12-15', status: 'active', amount: '1,200 EGP' },
    { id: 3, student: 'علي محمد', avatar: 'https://i.pravatar.cc/150?img=12', course: 'قوانين الأسس والجذور', planType: 'شهري', startDate: '2025-09-10', endDate: '2025-09-10', status: 'expiring', amount: '250 EGP' },
    { id: 4, student: 'نورة عبدالله', avatar: 'https://i.pravatar.cc/150?img=9', course: 'المتباينات البسيطة', planType: 'ترم كامل', startDate: '2025-07-01', endDate: '2025-12-31', status: 'active', amount: '1,200 EGP' },
    { id: 5, student: 'فهد مبارك', avatar: 'https://i.pravatar.cc/150?img=68', course: 'الاحصاء', planType: 'شهري', startDate: '2025-06-20', endDate: '2025-07-20', status: 'expired', amount: '250 EGP' },
    { id: 6, student: 'ريم عبدالله', avatar: 'https://i.pravatar.cc/150?img=47', course: 'الهندسة التحليلية', planType: 'ترم كامل', startDate: '2025-06-01', endDate: '2025-11-30', status: 'active', amount: '1,200 EGP' },
    { id: 7, student: 'خالد سعود', avatar: 'https://i.pravatar.cc/150?img=33', course: 'التفاضل والتكامل', planType: 'شهري', startDate: '2025-08-05', endDate: '2025-09-05', status: 'active', amount: '250 EGP' },
    { id: 8, student: 'لطيفة محمد', avatar: 'https://i.pravatar.cc/150?img=44', course: 'المعادلات من الدرجة الأولى', planType: 'شهري', startDate: '2025-07-15', endDate: '2025-08-15', status: 'expired', amount: '250 EGP' },
    { id: 9, student: 'عبدالله ناصر', avatar: 'https://i.pravatar.cc/150?img=60', course: 'المتتاليات', planType: 'ترم كامل', startDate: '2025-08-01', endDate: '2026-01-31', status: 'active', amount: '1,200 EGP' },
    { id: 10, student: 'مريم خالد', avatar: 'https://i.pravatar.cc/150?img=20', course: 'الإحصاء والاحتمالات', planType: 'شهري', startDate: '2025-08-12', endDate: '2025-09-12', status: 'expiring', amount: '250 EGP' },
  ]);

  // طلب البيانات من الباك إند
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/admin/subscriptions', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, ...filters }
        });
        if (res.data) {
          // setSubscriptionsData(res.data.data);
        }
      } catch (err) {
        console.error('خطأ أثناء جلب قائمة الاشتراكات:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [currentPage, filters]);

  // تحديد/إلغاء تحديد الكل
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSubscriptions(subscriptionsData.map(s => s.id));
    } else {
      setSelectedSubscriptions([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedSubscriptions.includes(id)) {
      setSelectedSubscriptions(selectedSubscriptions.filter(item => item !== id));
    } else {
      setSelectedSubscriptions([...selectedSubscriptions, id]);
    }
  };

  const handleDeleteSubscription = async (id) => {
    if (window.confirm('هل أنت تأكد من إلغاء/حذف هذا الاشتراك؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/v1/admin/subscriptions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubscriptionsData(prev => prev.filter(sub => sub.id !== id));
      } catch (err) {
        console.error('فشل إلغاء الاشتراك:', err);
      }
    }
  };

  // 3. تعريف الأعمدة الخاصة بجدول الاشتراكات
  const columns = [
    {
      header: (
        <input 
          type="checkbox" 
          onChange={handleSelectAll}
          checked={selectedSubscriptions.length === subscriptionsData.length && subscriptionsData.length > 0}
          className="rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
      cell: (row) => (
        <input 
          type="checkbox" 
          checked={selectedSubscriptions.includes(row.id)}
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
          <img src={row.avatar} alt={row.student} className="w-8 h-8 rounded-full object-cover border border-border" />
          <span className="font-bold text-text-primary">{row.student}</span>
        </div>
      )
    },
    { header: 'الكورس', accessor: 'course', className: 'font-medium text-text-primary' },
    { 
      header: 'نوع الاشتراك', 
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-100">
          {row.planType}
        </span>
      )
    },
    { header: 'تاريخ البداية', accessor: 'startDate', className: 'text-text-muted text-[11px] font-mono' },
    { header: 'تاريخ الانتهاء', accessor: 'endDate', className: 'text-text-muted text-[11px] font-mono' },
    {
      header: 'الحالة',
      cell: (row) => {
        const statusMap = {
          active: { label: 'نشط', style: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
          expiring: { label: 'قيد الانتهاء', style: 'bg-amber-100 text-amber-700 border-amber-200' },
          expired: { label: 'منتهي', style: 'bg-rose-100 text-rose-700 border-rose-200' },
        };
        const conf = statusMap[row.status] || statusMap.active;
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${conf.style}`}>
            {conf.label}
          </span>
        );
      }
    },
    { header: 'المبلغ', accessor: 'amount', className: 'font-bold text-text-primary' },
    {
      header: 'الإجراءات',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button 
            title="عرض التفاصيل"
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            title="تعديل الاشتراك"
            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDeleteSubscription(row.id)}
            title="حذف / إلغاء"
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
      
      {/* 1. الكاردات الإحصائية الأربعة من الصورة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <PaymentStatCard 
          title="إجمالي الاشتراكات"
          value={stats.totalSubscriptions}
          changeText="+12%"
          icon={User}
          theme="blue"
        />
        <PaymentStatCard 
          title="اشتراكات نشطة"
          value={stats.activeSubscriptions}
          changeText="+18%"
          icon={CheckCircle2}
          theme="green"
        />
        <PaymentStatCard 
          title="قيد الانتهاء"
          value={stats.expiringSubscriptions}
          changeText="+6%"
          icon={Clock}
          theme="orange"
        />
        <PaymentStatCard 
          title="منتهية"
          value={stats.expiredSubscriptions}
          changeText="-8%"
          isPositive={false}
          icon={XCircle}
          theme="red"
        />
      </div>

      {/* 2. شريط البحث والفلترة */}
      <SubscriptionsFilterBar filters={filters} setFilters={setFilters} />

      {/* 3. الجدول الريوزبول */}
      <DataTable columns={columns} data={subscriptionsData} isLoading={isLoading} />

      {/* 4. شريط الترقيم والتصفح */}
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