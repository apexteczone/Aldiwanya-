import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Crown, BookOpen, FileText, ArrowLeft } from 'lucide-react';
import { StatCard } from '../../components/admin/dashboard/StatCard';
import { WelcomeBanner } from '../../components/admin/dashboard/WelcomeBanner';
import { QuickActions } from '../../components/admin/dashboard/QuickActions';
import { StorageAndSupport } from '../../components/admin/dashboard/StorageAndSupport';
import { MonthlyStatsChart } from '../../components/admin/dashboard/MonthlyStatsChart';
import { SubscriptionsPieChart } from '../../components/admin/dashboard/SubscriptionsPieChart';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    freePdfs: { count: 312, newCount: 26 },
    totalCourses: { count: 24, newCount: 4 },
    activeSubscriptions: { count: 856, percent: 18 },
    registeredStudents: { count: 1248, percent: 12 },
  });

  const [recentSubscriptions, setRecentSubscriptions] = useState([
    { id: '#1284', name: 'عبدالله خالد', plan: 'سنوي', amount: '250 EGP', date: '2025-08-30', status: 'نشط' },
    { id: '#1283', name: 'سارة محمود', plan: 'شهري', amount: '100 EGP', date: '2025-08-30', status: 'نشط' },
    { id: '#1282', name: 'محمد أحمد', plan: 'ربع سنوي', amount: '150 EGP', date: '2025-08-29', status: 'نشط' },
    { id: '#1281', name: 'منى علي', plan: 'شهري', amount: '100 EGP', date: '2025-08-29', status: 'منتهي' },
    { id: '#1280', name: 'يوسف خالد', plan: 'سنوي', amount: '250 EGP', date: '2025-08-28', status: 'نشط' },
  ]);

  const [recentStudents, setRecentStudents] = useState([
    { id: '#1288', name: 'فاطمة أحمد', date: '2025-08-30' },
    { id: '#1287', name: 'علي محمود', date: '2025-08-30' },
    { id: '#1286', name: 'نور العمري', date: '2025-08-29' },
    { id: '#1285', name: 'خالد وليد', date: '2025-08-29' },
    { id: '#1284', name: 'عبدالله خالد', date: '2025-08-28' },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/admin/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          // setStats(res.data.stats);
        }
      } catch (err) {
        console.error('خطأ في جلب بيانات الصفحة الرئيسية:', err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-4 select-none bg-surface-light p-1 rounded-2xl">
      
      {/* 1. الصف العلوي: بنر الترحيب + الكاردات الـ 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <WelcomeBanner />
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard 
            title="الملفات المجانية"
            value={stats.freePdfs.count}
            changeText={`↑ +${stats.freePdfs.newCount} ملف جديد`}
            icon={FileText}
            iconBgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard 
            title="إجمالي الكورسات"
            value={stats.totalCourses.count}
            changeText={`↑ +${stats.totalCourses.newCount} كورس جديد`}
            icon={BookOpen}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard 
            title="الاشتراكات النشطة"
            value={stats.activeSubscriptions.count}
            changeText={`↑ +${stats.activeSubscriptions.percent}% من الشهر الماضي`}
            icon={Crown}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard 
            title="الطلاب المسجلين"
            value={stats.registeredStudents.count}
            changeText={`↑ +${stats.registeredStudents.percent}% من الشهر الماضي`}
            icon={Users}
            iconBgColor="bg-red-50"
            iconColor="text-red-500"
          />
        </div>
      </div>

      {/* 2. الصف الثاني: المخططات البيانية (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <MonthlyStatsChart />
        </div>
        <div className="lg:col-span-4">
          <SubscriptionsPieChart activeCount={stats.activeSubscriptions.count} />
        </div>
      </div>

      {/* 3. الصف الثالث: الإجراءات السريعة + الجداول */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3">
          <QuickActions />
        </div>

        {/* أحدث الطلاب */}
        <div className="lg:col-span-4 bg-white border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-text-primary">أحدث الطلاب المسجلين</h3>
            <button className="text-xs text-blue-500 hover:underline flex items-center gap-1">عرض الكل <ArrowLeft className="w-3 h-3" /></button>
          </div>
          <div className="space-y-2">
            {recentStudents.map((st, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 rounded-xl hover:bg-surface transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-text-primary flex items-center justify-center font-bold text-xs">
                    {st.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">{st.name}</h4>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-text-muted block">{st.id}</span>
                  <span className="text-[10px] text-text-muted">{st.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* أحدث الاشتراكات */}
        <div className="lg:col-span-5 bg-white border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-text-primary">أحدث الاشتراكات</h3>
            <button className="text-xs text-blue-500 hover:underline flex items-center gap-1">عرض الكل <ArrowLeft className="w-3 h-3" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-text-muted border-b border-border pb-2">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">الطالب</th>
                  <th className="pb-2 font-medium">الباقة</th>
                  <th className="pb-2 font-medium">المبلغ</th>
                  <th className="pb-2 font-medium">تاريخ الاشتراك</th>
                  <th className="pb-2 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentSubscriptions.map((sub, i) => (
                  <tr key={i} className="hover:bg-surface">
                    <td className="py-2 text-text-muted font-mono text-[10px]">{sub.id}</td>
                    <td className="py-2 font-bold text-text-primary">{sub.name}</td>
                    <td className="py-2 text-text-muted">{sub.plan}</td>
                    <td className="py-2 text-text-primary font-medium">{sub.amount}</td>
                    <td className="py-2 text-text-muted text-[10px]">{sub.date}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${sub.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. الصف الرابع: التخزين والدعم */}
      <StorageAndSupport />

    </div>
  );
}