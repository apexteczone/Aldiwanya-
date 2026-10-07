import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, CheckCircle2, Clock, XCircle, Eye, MoreVertical } from 'lucide-react';
import { PaymentStatCard } from '../../components/admin/payments/PaymentStatCard';
import { PaymentsFilterBar } from '../../components/admin/payments/PaymentsFilterBar';
import { DataTable } from '../../components/admin/common/DataTable';
import { Pagination } from '../../components/admin/common/Pagination';

export default function PaymentsPage() {
  const [filters, setFilters] = useState({ search: '', status: '', method: '', course: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // إحصائيات الصفحة العلويّة
  const [stats] = useState({
    totalAmount: '36,420 EGP',
    successCount: '1,248',
    pendingCount: '156',
    failedCount: '42',
  });

  // بيانات جدول المدفوعات المطابقة للتصميم
  const [paymentsData, setPaymentsData] = useState([
    { id: 1, trx: 'TRX-20250901-001', student: 'يوسف خالد', avatar: 'https://i.pravatar.cc/150?img=11', course: 'مقدمة في الجبر', amount: '250 EGP', method: 'فيزا / ماستر كارد', methodType: 'visa', date: '2025-09-01 14:25', status: 'success' },
    { id: 2, trx: 'TRX-20250829-015', student: 'سارة أحمد', avatar: 'https://i.pravatar.cc/150?img=5', course: 'المعادلات البسيطة', amount: '1,200 EGP', method: 'فودافون كاش', methodType: 'vodafone', date: '2025-08-29 10:15', status: 'success' },
    { id: 3, trx: 'TRX-20250828-006', student: 'علي محمد', avatar: 'https://i.pravatar.cc/150?img=12', course: 'قوانين الأسس والجذور', amount: '250 EGP', method: 'إنستا باي', methodType: 'instapay', date: '2025-08-28 18:40', status: 'pending' },
    { id: 4, trx: 'TRX-20250825-019', student: 'نورة عبدالله', avatar: 'https://i.pravatar.cc/150?img=9', course: 'المتباينات البسيطة', amount: '1,200 EGP', method: 'بطاقة بنكية', methodType: 'bank', date: '2025-08-25 12:10', status: 'success' },
    { id: 5, trx: 'TRX-20250820-003', student: 'فهد مبارك', avatar: 'https://i.pravatar.cc/150?img=68', course: 'الإحصاء', amount: '250 EGP', method: 'مدى', methodType: 'mada', date: '2025-08-20 09:30', status: 'failed' },
    { id: 6, trx: 'TRX-20250818-011', student: 'ريم عبدالله', avatar: 'https://i.pravatar.cc/150?img=47', course: 'الهندسة التحليلية', amount: '1,200 EGP', method: 'أبل باي', methodType: 'apple', date: '2025-08-18 16:50', status: 'success' },
  ]);

  // الربط مع الباك إند
  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/admin/payments', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, ...filters }
        });
        if (res.data) {
          // setPaymentsData(res.data.data);
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
            {row.methodType.toUpperCase()}
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
      cell: (row) => (
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
          changeText="+18%"
          icon={Wallet}
          theme="blue"
        />
        <PaymentStatCard 
          title="عملية ناجحة"
          value={stats.successCount}
          changeText="+12%"
          icon={CheckCircle2}
          theme="green"
        />
        <PaymentStatCard 
          title="قيد المراجعة"
          value={stats.pendingCount}
          changeText="+6%"
          icon={Clock}
          theme="orange"
        />
        <PaymentStatCard 
          title="مرفوضة"
          value={stats.failedCount}
          changeText="-8%"
          isPositive={false}
          icon={XCircle}
          theme="red"
        />
      </div>

      {/* 2. شريط البحث والفلترة */}
      <PaymentsFilterBar filters={filters} setFilters={setFilters} />

      {/* 3. الجدول الريوزبول */}
      <DataTable columns={columns} data={paymentsData} isLoading={isLoading} />

      {/* 4. شريط الترقيم والتنقل */}
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