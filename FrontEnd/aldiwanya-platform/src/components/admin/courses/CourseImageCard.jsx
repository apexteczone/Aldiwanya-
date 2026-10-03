// src/components/admin/courses/CourseImageCard.jsx
// import React from 'react';
import { Image, RefreshCw, Trash2 } from 'lucide-react';

export function CourseImageCard({ imagePreview, onImageChange, onClearImage, courseTitle ,level }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Image className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="font-extrabold text-navy-950 text-sm">صورة الكورس</h3>
          <p className="text-[10px] text-text-muted">قم برفع صورة جذابة للكورس (نسبة 16:9)</p>
        </div>
      </div>

      {/* المعاينة */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-900 shadow-xs group">
        <img 
          src={imagePreview} 
          alt="صورة الكورس" 
          className="w-full h-44 object-cover opacity-85"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
          <span className="text-[10px] bg-blue-600/80 px-2 py-0.5 rounded w-max mb-1 font-bold">{level || 'المستوى'}</span>
          <h4 className="font-extrabold text-sm">{courseTitle || 'عنوان الكورس'}</h4>
        </div>

        <button 
          type="button"
          onClick={onClearImage}
          className="absolute top-3 left-3 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

     
      <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-surface hover:bg-slate-100 border border-border rounded-xl font-bold text-text-secondary cursor-pointer transition-colors">
        <RefreshCw className="w-4 h-4 text-blue-600" />
        <span>تغيير الصورة</span>
        <input 
          type="file" 
          accept="image/*" 
          onChange={onImageChange} 
          className="hidden" 
        />
      </label>
    </div>
  );
}