import { useState, useEffect } from 'react';
import axios from '../../services/api';
import { Video, UploadCloud, CheckCircle2, PauseCircle, Play, BarChart2, Edit3, Trash2 } from 'lucide-react';
import { PaymentStatCard } from '../../components/admin/payments/PaymentStatCard';
import { VideosActionHeader } from '../../components/admin/video/VideosActionHeader';
import { DataTable } from '../../components/admin/common/DataTable';
import { Pagination } from '../../components/admin/common/Pagination';

export default function VideosManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. الإحصائيات العلوية
  

  // 2. البيانات المطابقة للتصميم
  const [videosData, setVideosData] = useState([]);
  const stats = {totalVideos:videosData.length,uploadingCount:videosData.filter(v=>v.processingStatus==='processing').length,activeCount:videosData.filter(v=>v.status==='active').length,inactiveCount:videosData.filter(v=>v.status!=='active').length};

  // طلب البيانات عبر Axios
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const res = await axios.get('/admin/videos', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage }
        });
        if (res.data) {
          setVideosData(res.data.data);
        }
      } catch (err) {
        console.error('خطأ أثناء جلب قائمة الفيديوهات:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [currentPage]);

  // تحديد إلغاء الكل
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedVideos(videosData.map(v => v.id));
    } else {
      setSelectedVideos([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedVideos.includes(id)) {
      setSelectedVideos(selectedVideos.filter(item => item !== id));
    } else {
      setSelectedVideos([...selectedVideos, id]);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm('هل أنت تأكد من حذف هذا الفيديو؟')) {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        await axios.delete(`/admin/videos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVideosData(prev => prev.filter(video => video.id !== id));
      } catch (err) {
        console.error('فشل حذف الفيديو:', err);
      }
    }
  };

  // 3. أعمدة جدول الفيديوهات
  const columns = [
    {
      header: (
        <input 
          type="checkbox" 
          onChange={handleSelectAll}
          checked={selectedVideos.length === videosData.length && videosData.length > 0}
          className="rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
      cell: (row) => (
        <input 
          type="checkbox" 
          checked={selectedVideos.includes(row.id)}
          onChange={() => handleSelectOne(row.id)}
          className="rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
      className: 'w-8 text-center'
    },
    { header: '#', accessor: 'id', className: 'w-10 text-center font-bold text-text-muted' },
    {
      header: 'صورة مصغرة',
      cell: (row) => (
        <div className="relative w-24 h-14 rounded-xl overflow-hidden border border-border bg-slate-900 group cursor-pointer shrink-0">
          <img src={row.thumbnail} alt={row.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white/90 text-navy-950 flex items-center justify-center shadow-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </div>
          </div>
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono px-1 rounded">
            {row.duration}
          </span>
        </div>
      )
    },
    { 
      header: 'عنوان الفيديو', 
      cell: (row) => (
        <span className="font-bold text-text-primary text-xs max-w-[180px] block leading-snug">
          {row.title}
        </span>
      )
    },
    { header: 'الدرس', accessor: 'lesson', className: 'font-medium text-text-primary' },
    { header: 'الكورس', accessor: 'course', className: 'text-text-secondary' },
    { header: 'المدة', accessor: 'duration', className: 'text-text-muted font-mono text-[11px]' },
    { header: 'تاريخ الرفع', accessor: 'uploadDate', className: 'text-text-muted text-[11px] font-mono' },
    {
      header: 'الحالة',
      cell: (row) => {
        const statusMap = {
          active: { label: 'مفعل', style: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
          review: { label: 'مراجعة', style: 'bg-amber-100 text-amber-700 border-amber-200' },
          inactive: { label: 'غير مفعل', style: 'bg-rose-100 text-rose-700 border-rose-200' },
        };
        const conf = statusMap[row.status] || statusMap.active;
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${conf.style}`}>
            {conf.label}
          </span>
        );
      }
    },
    {
      header: 'الإجراءات',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button 
            title="الإحصائيات"
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          
          <button 
            title="تعديل الفيديو"
            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button 
            onClick={() => handleDeleteVideo(row.id)}
            title="حذف الفيديو"
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
      
      {/* 1. الكاردات الإحصائية 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <PaymentStatCard 
          title="إجمالي الفيديوهات"
          value={stats.totalVideos}
          changeText=""
          icon={Video}
          theme="purple"
        />
        <PaymentStatCard 
          title="جاري الرفع"
          value={stats.uploadingCount}
          changeText=""
          icon={UploadCloud}
          theme="blue"
        />
        <PaymentStatCard 
          title="مفعل"
          value={stats.activeCount}
          changeText=""
          icon={CheckCircle2}
          theme="green"
        />
        <PaymentStatCard 
          title="غير مفعل"
          value={stats.inactiveCount}
          changeText=""
          isPositive={false}
          icon={PauseCircle}
          theme="red"
        />
      </div>

      {/* 2. شريط الأزرار والتحكم العلوي */}
      <VideosActionHeader />

      {/* 3. الجدول الريوزبول */}
      <DataTable columns={columns} data={videosData.slice((currentPage-1)*10,currentPage*10)} isLoading={isLoading} />

      {/* 4. الترقيم والتصفح */}
      <Pagination 
        currentPage={currentPage}
        totalPages={Math.max(1,Math.ceil(videosData.length/10))}
        totalItems={videosData.length}
        itemsPerPage={10}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
}


