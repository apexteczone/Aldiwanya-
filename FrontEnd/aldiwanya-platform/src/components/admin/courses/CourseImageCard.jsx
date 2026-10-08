import { Image, RefreshCw, Trash2, UploadCloud } from 'lucide-react';

export function CourseImageCard({ imagePreview, onImageChange, onClearImage }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Image className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="font-extrabold text-navy-950 text-sm">صورة الكورس</h3>
          <p className="text-[10px] text-text-muted">قم برفع صورة جذابة للكورس (نسبة 16:9)</p>
        </div>
      </div>

      <div className="space-y-3">
        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-border group bg-slate-900 aspect-video">
            <img 
              src={imagePreview} 
              alt="Course Banner" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white cursor-pointer transition-colors">
                <RefreshCw className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
              </label>
              <button 
                type="button" 
                onClick={onClearImage}
                className="p-2 bg-rose-500/80 hover:bg-rose-600 rounded-lg text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <label className="border-2 border-dashed border-border hover:border-blue-500 bg-surface hover:bg-blue-50/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all aspect-video">
            <UploadCloud className="w-8 h-8 text-text-muted" />
            <span className="text-xs font-bold text-text-secondary">اضغط هنا لرفع الصورة</span>
            <span className="text-[10px] text-text-muted">PNG, JPG حتى 5 ميجابايت</span>
            <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
}