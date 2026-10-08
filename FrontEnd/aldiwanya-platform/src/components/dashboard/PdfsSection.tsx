import { useState } from 'react';
import { useStudent } from '@/hooks/useStudent';
import { 
  FileText, 
  Download, 
  Search, 
  CheckCircle2, 
  FileCheck
} from 'lucide-react';

export const PdfsSection: React.FC = () => {
  const { pdfs, downloadPdf } = useStudent();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  const categories = ['الكل', 'مذكرات شاملة', 'نماذج امتحانات وزارة', 'حلول بنك الأسئلة', 'قوانين ومراجعات سريعة'];

  const filteredPdfs = pdfs.filter(pdf => {
    const matchesSearch = pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pdf.gradeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || pdf.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (id: string) => {void downloadPdf(id);};

  return (
    <div className="space-y-6">
      {/* Header with Free PDF Guarantee Note */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/30 p-6 rounded-3xl border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
              <FileText className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-white">
              مكتبة المذكرات ونماذج الاختبارات المجانية
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-2xl">
            وفقاً لسياسة منصة الديوانية (البند R05)، جميع المذكرات ونماذج اختبارات وزارة التربية وبنوك الأسئلة متاحة للتحميل مجاناً ولا تشترط اشتراكاً نشطاً — حتى بعد انتهاء اشتراكك تظل متاحة لك دائماً.
          </p>
        </div>

        <div className="shrink-0 bg-slate-950/60 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>تحميل فوري مجاني 100%</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المذكرة، الوحدة، أو الصف..."
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-right"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PDFs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPdfs.map((pdf) => (
          <div
            key={pdf.id}
            className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-4 transition-all duration-200"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 border border-slate-700">
                  {pdf.category}
                </span>
                <h4 className="text-sm font-bold text-white leading-snug font-['Cairo']">
                  {pdf.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{pdf.gradeName}</span>
                  <span>•</span>
                  <span>الحجم: {pdf.size}</span>
                  {pdf.downloadDate && (
                    <>
                      <span>•</span>
                      <span className="text-slate-500">تم تنزيله: {pdf.downloadDate}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload(pdf.id)}
              className="shrink-0 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="تحميل الملف بصيغة PDF"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">تحميل PDF</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

