import { useState, useEffect } from 'react';
import axios from '../../services/api';
import { User, CheckCircle2, Clock, XCircle, Eye, Edit3, Trash2, Crown } from 'lucide-react';
import PlansManagementPage from './PlansManagementPage';
import {ReferenceHeader} from '../../components/admin/common/ReferenceUI';
import { PaymentStatCard } from '../../components/admin/payments/PaymentStatCard';
import { SubscriptionsFilterBar } from '../../components/admin/Subscription/SubscriptionsFilterBar';
import { DataTable } from '../../components/admin/common/DataTable';
import { Pagination } from '../../components/admin/common/Pagination';

export default function SubscriptionsPage() {
  const [tab,setTab]=useState('plans');
  return <div className="admin-reference"><ReferenceHeader title="إدارة الاشتراكات" subtitle="يمكنك إضافة وتعديل خطط الاشتراكات الخاصة بالمنصة." icon={Crown}/><div className="ref-tabs" role="tablist" aria-label="إدارة الاشتراكات"><button role="tab" aria-selected={tab==='plans'} onClick={()=>setTab('plans')}>خطط الاشتراكات</button><button role="tab" aria-selected={tab==='students'} onClick={()=>setTab('students')}>اشتراكات الطلاب</button></div><section role="tabpanel">{tab==='plans'?<PlansManagementPage/>:<StudentSubscriptions/>}</section></div>;
}
function StudentSubscriptions() {
  const [filters, setFilters] = useState({ search: '', status: '', type: '', course: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [subscriptionsData, setSubscriptionsData] = useState([]);
  // 1. الإحصائيات العلوية الخاصة بالاشتراكات كما في الصورة
  const stats = {totalSubscriptions:subscriptionsData.length,activeSubscriptions:subscriptionsData.filter(s=>s.status==='active').length,expiringSubscriptions:subscriptionsData.filter(s=>s.status==='expiring').length,expiredSubscriptions:subscriptionsData.filter(s=>s.status==='expired').length};

  // 2. البيانات المطابقة تماماً للصورة المرفقة


  // طلب البيانات من الباك إند
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const res = await axios.get('/admin/subscriptions', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, ...filters }
        });
        if (res.data) {
          setSubscriptionsData(res.data.data);
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
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        await axios.delete(`/admin/subscriptions/${id}`, {
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
          changeText=""
          icon={User}
          theme="blue"
        />
        <PaymentStatCard 
          title="اشتراكات نشطة"
          value={stats.activeSubscriptions}
          changeText=""
          icon={CheckCircle2}
          theme="green"
        />
        <PaymentStatCard 
          title="قيد الانتهاء"
          value={stats.expiringSubscriptions}
          changeText=""
          icon={Clock}
          theme="orange"
        />
        <PaymentStatCard 
          title="منتهية"
          value={stats.expiredSubscriptions}
          changeText=""
          isPositive={false}
          icon={XCircle}
          theme="red"
        />
      </div>

      {/* 2. شريط البحث والفلترة */}
      <SubscriptionsFilterBar filters={filters} setFilters={setFilters} />

      {/* 3. الجدول الريوزبول */}
      <DataTable columns={columns} data={subscriptionsData.slice((currentPage-1)*10,currentPage*10)} isLoading={isLoading} />

      {/* 4. شريط الترقيم والتصفح */}
      <Pagination 
        currentPage={currentPage}
        totalPages={Math.max(1,Math.ceil(subscriptionsData.length/10))}
        totalItems={subscriptionsData.length}
        itemsPerPage={10}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
}
