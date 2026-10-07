// src/components/admin/courses/CourseBasicInfoForm.jsx
import { 
  BookOpen, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Table, 
  Code, 
  Image, 
  Link2, 
  MoreHorizontal 
} from 'lucide-react';

export function CourseBasicInfoForm({ formData, handleChange, gradesList = [] }) {
  
  const safeGradesList = Array.isArray(gradesList) ? gradesList : [];

  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="font-extrabold text-navy-950 text-sm">المعلومات الأساسية</h3>
          <p className="text-[10px] text-text-muted">أدخل المعلومات الرئيسية للكورس</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* عنوان الكورس */}
        <div className="space-y-1">
          <label className="font-bold text-text-secondary block">
            عنوان المادة <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              placeholder="مثال : الرياضيات"
              className="w-full bg-surface text-text-primary rounded-xl pr-3 pl-9 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              required
            />
            <BookOpen className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* الصف الدراسي */}
        <div className="space-y-1">
          <label className="font-bold text-text-secondary block">
            الصف الدراسي <span className="text-rose-500">*</span>
          </label>
          <select
            name="grade"
            value={formData.grade || ''}
            onChange={handleChange}
            className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
            required
          >
            <option value="">اختر الصف الدراسي</option>
            {safeGradesList.map((g) => (
              <option key={g._id || g.id} value={g._id || g.id}>
                {g.name || g.title || g.gradeName || 'صف بدون اسم'}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* وصف الكورس */}
      <div className="space-y-1 pt-2">
        <label className="font-bold text-text-secondary block">
          وصف الكورس 
        </label>
        
        <div className="border border-border rounded-xl overflow-hidden bg-surface">
          <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-border text-text-secondary">
            <button type="button" className="p-1 hover:bg-slate-200 rounded font-bold"><Underline className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1 hover:bg-slate-200 rounded font-bold"><Italic className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1 hover:bg-slate-200 rounded font-bold"><Bold className="w-3.5 h-3.5" /></button>
            <div className="w-[1px] h-4 bg-border mx-1" />
            <button type="button" className="p-1 hover:bg-slate-200 rounded"><List className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1 hover:bg-slate-200 rounded"><ListOrdered className="w-3.5 h-3.5" /></button>
            <div className="w-[1px] h-4 bg-border mx-1" />
            <button type="button" className="p-1 hover:bg-slate-200 rounded"><Table className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1 hover:bg-slate-200 rounded"><Code className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1 hover:bg-slate-200 rounded"><Image className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1 hover:bg-slate-200 rounded"><Link2 className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1 hover:bg-slate-200 rounded ml-auto"><MoreHorizontal className="w-3.5 h-3.5" /></button>
          </div>

          <textarea
            name="description"
            rows={4}
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="اكتب وصف الكورس هنا ..."
            className="w-full p-3 bg-transparent text-text-primary focus:outline-none resize-none font-medium"
          />
        </div>
      </div>
    </div>
  );
}