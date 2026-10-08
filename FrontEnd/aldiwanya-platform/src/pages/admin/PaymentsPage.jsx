import { useState, useEffect } from 'react';
import axios from '../../services/api';
import { Wallet, CheckCircle2, Clock, XCircle, Eye, MoreVertical } from 'lucide-react';
import { PaymentStatCard } from '../../components/admin/payments/PaymentStatCard';
import { PaymentsFilterBar } from '../../components/admin/payments/PaymentsFilterBar';
import { DataTable } from '../../components/admin/common/DataTable';
import { Pagination } from '../../components/admin/common/Pagination';

export default function PaymentsPage() {
  const [filters, setFilters] = useState({ search: '', status: '', method: '', course: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [paymentsData, setPaymentsData] = useState([]);
  // إحصائيات الصفحة العلويّة
  const stats = {totalAmount: [...new Set(paymentsData.map(p=>p.currency))].map(currency=>paymentsData.filter(p=>p.status==='success'&&p.currency===currency).reduce((sum,p)=>sum+p.amountValue,0).toFixed(3)+' '+currency).join(' / ') || '0 KWD', successCount:paymentsData.filter(p=>p.status==='success').length,pendingCount:paymentsData.filter(p=>p.status==='pending').length,failedCount:paymentsData.filter(p=>p.status==='failed').length};

  // بيانات جدول المدفوعات المطابقة للتصميم


  // الربط مع الباك إند
  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const res = await axios.get('/admin/payments', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, ...filters }
        });
        if (res.data) {
          setPaymentsData(res.data.data);
        }
      } catch (err) {
        console.error('خطأ في جلب البيانات:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [currentPage, filters]);

  // تعريف أعمدة الجدول بشكل ريوزبول
  const columns = [
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
    { header: 'المبلغ', accessor: 'amount', className: 'font-bold text-text-primary' },
    {
      header: 'طريقة الدفع',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-md bg-surface text-[10px] font-bold border border-border">
            {(row.methodType || '').toUpperCase()}
          </span>
          <span className="text-text-secondary">{row.method}</span>
        </div>
      )
    },
    { header: 'تاريخ الدفع', accessor: 'date', className: 'text-text-muted text-[11px] font-mono' },
    {
      header: 'الحالة',
      cell: (row) => {
        const statusMap = {
          success: { label: 'ناجحة', icon: CheckCircle2, style: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
          pending: { label: 'قيد المراجعة', icon: Clock, style: 'bg-amber-100 text-amber-700 border-amber-200' },
          failed: { label: 'مرفوضة', icon: XCircle, style: 'bg-rose-100 text-rose-700 border-rose-200' },
        };
        const conf = statusMap[row.status] || statusMap.pending;
        const Icon = conf.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${conf.style}`}>
            <Icon className="w-3 h-3" />
            {conf.label}
          </span>
        );
      }
    },
    { header: 'رقم العملية', accessor: 'trx', className: 'font-mono text-[11px] text-text-muted' },
    {
      header: 'إجراءات',
      cell: () => (
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
            <Eye className="w-3.5 h-3.5" />
            عرض
          </button>
          <button className="p-1 text-text-muted hover:text-text-primary rounded-lg">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 select-none">
      
      {/* 1. الكاردات الإحصائية 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <PaymentStatCard 
          title="إجمالي المدفوعات"
          value={stats.totalAmount}
          changeText=""
          icon={Wallet}
          theme="blue"
        />
        <PaymentStatCard 
          title="عملية ناجحة"
          value={stats.successCount}
          changeText=""
          icon={CheckCircle2}
          theme="green"
        />
        <PaymentStatCard 
          title="قيد المراجعة"
          value={stats.pendingCount}
          changeText=""
          icon={Clock}
          theme="orange"
        />
        <PaymentStatCard 
          title="مرفوضة"
          value={stats.failedCount}
          changeText=""
          isPositive={false}
          icon={XCircle}
          theme="red"
        />
      </div>

      {/* 2. شريط البحث والفلترة */}
      <PaymentsFilterBar filters={filters} setFilters={setFilters} />

      {/* 3. الجدول الريوزبول */}
      <DataTable columns={columns} data={paymentsData.slice((currentPage-1)*10,currentPage*10)} isLoading={isLoading} />

      {/* 4. شريط الترقيم والتنقل */}
      <Pagination 
        currentPage={currentPage}
        totalPages={Math.max(1,Math.ceil(paymentsData.length/10))}
        totalItems={paymentsData.length}
        itemsPerPage={10}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
}
