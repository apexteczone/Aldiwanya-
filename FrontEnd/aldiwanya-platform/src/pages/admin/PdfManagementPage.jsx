import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  Download, 
  Users, 
  Eye, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  BarChart2, 
  Edit3, 
  Trash2, 
  MoreVertical,
  FileCheck2
} from 'lucide-react';

// استيراد الكومبوننتس الريوزبول المعمولة مسبقاً
import { PaymentStatCard } from '../../components/admin/payments/PaymentStatCard';
import { DataTable } from '../../components/admin/common/DataTable';
import { Pagination } from '../../components/admin/common/Pagination';

export default function PdfManagementPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // حالات الفلاتر والبحث
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // 1. الإحصائيات العلوية الاربعة المطابقة للتصميم بالضبط
  const [stats] = useState({
    totalViews: '8,630',
    totalViewsChange: '+ 14%',
    beneficiaries: '1,248',
    beneficiariesChange: '+ 12%',
    totalFiles: '312',
    totalFilesChange: '+ 26',
    totalDownloads: '12,540',
    totalDownloadsChange: '+ 18%',
  });

  // 2. داتا جدول ملفات الـ PDF المطابقة للصورة
  const [pdfData, setPdfData] = useState([
    {
      id: 1,
      fileName: 'مذكرة الوحدة الأولى',
      subject: 'الرياضيات',
      grade: 'العاشر',
      type: 'مذكرة',
      fileSize: '2.4 MB',
      downloadsCount: '1,245',
      uploadDate: '2025-08-30',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 2,
      fileName: 'أوراق عمل الفصل الأول',
      subject: 'الرياضيات',
      grade: 'العاشر',
      type: 'أوراق عمل',
      fileSize: '1.8 MB',
      downloadsCount: '980',
      uploadDate: '2025-08-28',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 3,
      fileName: 'مراجعة على الاختبار الأول',
      subject: 'الرياضيات',
      grade: 'العاشر',
      type: 'مراجعة',
      fileSize: '3.2 MB',
      downloadsCount: '1,560',
      uploadDate: '2025-08-25',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 4,
      fileName: 'أسئلة سنوات سابقة',
      subject: 'الرياضيات',
      grade: 'العاشر',
      type: 'امتحانات',
      fileSize: '5.1 MB',
      downloadsCount: '2,340',
      uploadDate: '2025-08-20',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 5,
      fileName: 'ملخص القوانين الهامة',
      subject: 'الرياضيات',
      grade: 'العاشر',
      type: 'ملخص',
      fileSize: '1.2 MB',
      downloadsCount: '860',
      uploadDate: '2025-08-18',
      status: 'pending',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 6,
      fileName: 'مذكرة الهندسة التحليلية',
      subject: 'الرياضيات',
      grade: 'الحادي عشر',
      type: 'مذكرة',
      fileSize: '4.6 MB',
      downloadsCount: '1,920',
      uploadDate: '2025-08-15',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 7,
      fileName: 'أوراق عمل المتتاليات',
      subject: 'الرياضيات',
      grade: 'الحادي عشر',
      type: 'أوراق عمل',
      fileSize: '2.1 MB',
      downloadsCount: '780',
      uploadDate: '2025-08-10',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 8,
      fileName: 'مراجعة نهائية',
      subject: 'الرياضيات',
      grade: 'الثاني عشر',
      type: 'مراجعة',
      fileSize: '3.8 MB',
      downloadsCount: '1,640',
      uploadDate: '2025-08-05',
      status: 'active',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80'
    },
  ]);

  // جلب داتا الـ PDF من الباك إند عبر Axios
  useEffect(() => {
    const fetchPdfs = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/admin/pdfs', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, search: searchQuery }
        });
        if (res.data) {
          // setPdfData(res.data.data);
        }
      } catch (err) {
        console.error('خطأ في جلب بيانات الملفات:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdfs();
  }, [currentPage, searchQuery]);

  const handleDeletePdf = async (id) => {
    if (window.confirm('هل أنت تأكد من حذف هذا الملف؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/v1/admin/pdfs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPdfData(prev => prev.filter(pdf => pdf.id !== id));
      } catch (err) {
        console.error('فشل حذف الملف:', err);
      }
    }
  };

  // 3. اعمدة الجدول المطابقة للواجهة بالضبط
  const columns = [
    {
      header: '',
      cell: () => (
        <button className="text-text-muted hover:text-text-primary">
          <MoreVertical className="w-4 h-4" />
        </button>
      ),
      className: 'w-6 text-center'
    },
    { header: '#', accessor: 'id', className: 'w-8 text-center font-bold text-text-muted text-xs' },
    {
      header: 'اسم الملف',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-10 bg-slate-100 rounded-lg overflow-hidden border border-border flex items-center justify-center shrink-0">
            <span className="absolute bottom-0.5 right-0.5 bg-rose-600 text-white text-[7px] font-bold px-1 py-0.2 rounded">
              PDF
            </span>
          </div>
          <span className="font-extrabold text-navy-950 text-xs hover:text-blue-600 cursor-pointer">
            {row.fileName}
          </span>
        </div>
      )
    },
    { header: 'المادة', accessor: 'subject', className: 'text-text-secondary font-medium text-xs' },
    { header: 'الصف', accessor: 'grade', className: 'text-text-secondary font-medium text-xs' },
    { header: 'النوع', accessor: 'type', className: 'text-text-secondary font-medium text-xs' },
    { header: 'حجم الملف', accessor: 'fileSize', className: 'text-text-muted font-mono text-xs' },
    { header: 'عدد التحميلات', accessor: 'downloadsCount', className: 'font-bold text-navy-950 text-xs' },
    { header: 'تاريخ الرفع', accessor: 'uploadDate', className: 'text-text-muted text-xs font-mono' },
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
      header: 'إجراءات',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button 
            title="الإحصائيات"
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          
          <button 
            title="تعديل الملف"
            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button 
            onClick={() => handleDeletePdf(row.id)}
            title="حذف الملف"
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5 select-none pb-10">
      
      {/* Header الصفة والزر العلوى */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
            <span>إدارة الملفات المجانية (PDF)</span>
            <span>&lt;</span>
          </div>
          <h1 className="text-xl font-extrabold text-navy-950 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>إدارة الملفات المجانية (PDF)</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            يمكنك رفع وإدارة ملفات PDF المجانية المتاحة للطلاب
          </p>
        </div>

        {/* زر رفع ملف PDF جديد */}
        <button
          type="button"
          onClick={() => navigate('/admin/pdfs/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>رفع ملف PDF جديد</span>
        </button>
      </div>

      {/* 1. الكاردات الإحصائية 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <PaymentStatCard 
          title="إجمالي المشاهدات"
          value={stats.totalViews}
          changeText={`${stats.totalViewsChange} من الشهر الماضي`}
          icon={Eye}
          theme="blue"
        />
        <PaymentStatCard 
          title="الطلاب المستفيدين"
          value={stats.beneficiaries}
          changeText={`${stats.beneficiariesChange} من الشهر الماضي`}
          icon={Users}
          theme="green"
        />
        <PaymentStatCard 
          title="إجمالي الملفات"
          value={stats.totalFiles}
          changeText={`${stats.totalFilesChange} ملف جديد`}
          icon={FileCheck2}
          theme="purple"
        />
        <PaymentStatCard 
          title="إجمالي التحميلات"
          value={stats.totalDownloads}
          changeText={`${stats.totalDownloadsChange} من الشهر الماضي`}
          icon={Download}
          theme="purple"
        />
      </div>

      {/* 2. شريط الفلاتر والبحث المطابق للواجهة */}
      <div className="bg-white border border-border rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
        
        {/* حقل البحث */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن ملف..."
            className="w-full bg-surface text-text-primary rounded-xl pr-9 pl-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
          />
          <Search className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* الفلاتر المنسدلة */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer font-medium"
          >
            <option value="">كل المستويات</option>
            <option value="10">الصف العاشر</option>
            <option value="11">الصف الحادي عشر</option>
            <option value="12">الصف الثاني عشر</option>
          </select>

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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer font-medium"
          >
            <option value="">كل الأنواع</option>
            <option value="mothekra">مذكرة</option>
            <option value="work">أوراق عمل</option>
            <option value="review">مراجعة</option>
            <option value="exam">امتحانات</option>
            <option value="summary">ملخصات</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface border border-border text-text-primary rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer font-medium"
          >
            <option value="">الحالات</option>
            <option value="active">نشط</option>
            <option value="pending">معلق</option>
          </select>

          <button className="p-2.5 bg-surface border border-border rounded-xl text-text-secondary hover:bg-slate-100 transition-colors">
            <Calendar className="w-4 h-4" />
          </button>

          <button className="p-2.5 bg-surface border border-border rounded-xl text-text-secondary hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* 3. جدول داتا الـ PDF */}
      <DataTable columns={columns} data={pdfData} isLoading={isLoading} />

      {/* 4. الباجينيشن الشامل */}
      <Pagination 
        currentPage={currentPage}
        totalPages={10}
        totalItems={312}
        itemsPerPage={10}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
}