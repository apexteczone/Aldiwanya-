// src/components/admin/courses/CourseBasicInfoForm.jsx
// import React from 'react';
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

export function CourseBasicInfoForm({ formData, handleChange, subjectsList, gradesList }) {
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
              value={formData.title}
              onChange={handleChange}
              placeholder="مثال: مقدمة في الجبر"
              className="w-full bg-surface text-text-primary rounded-xl pr-3 pl-9 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
            <BookOpen className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* المادة */}
        <div className="space-y-1">
          <label className="font-bold text-text-secondary block">المادة</label>
          <select
            name="subjectId"
            value={formData.subjectId}
            onChange={handleChange}
            className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
          >
            <option value="">اختر المادة</option>
            {subjectsList.map((s) => (
              <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* مستوى الكورس */}
        <div className="space-y-1">
          <label className="font-bold text-text-secondary block">الترم الدراسي </label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
          >
            <option value="">اختر المستوى</option>
            <option value="beginner">الاول</option>
            <option value="intermediate">الثاني</option>
          </select>
        </div>

        {/* الصف الدراسي */}
        <div className="space-y-1">
          <label className="font-bold text-text-secondary block">الصف الدراسي</label>
          <select
            name="gradeId"
            value={formData.gradeId}
            onChange={handleChange}
            className="w-full bg-surface text-text-primary rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
          >
            <option value="">اختر الصف الدراسي</option>
            {gradesList.map((g) => (
              <option key={g.id || g._id} value={g.id || g._id}>{g.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* وصف الكورس مع Rich Text Editor Toolbar */}
      <div className="space-y-1 pt-2">
        <label className="font-bold text-text-secondary block">
          وصف الكورس 
          {/* <span className="text-rose-500">*</span> */}
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
            value={formData.description}
            onChange={handleChange}
            placeholder="اكتب وصف الكورس هنا ..."
            className="w-full p-3 bg-transparent text-text-primary focus:outline-none resize-none font-medium"
          />
        </div>
      </div>
    </div>
  );
}