import { useNavigate } from 'react-router-dom';
import { PlusCircle, Video, FileUp, Users } from 'lucide-react';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { title: 'إضافة كورس جديد', icon: PlusCircle, path: '/admin/courses/new', color: 'text-blue-600 bg-blue-50' },
    { title: 'إضافة فيديو جديد', icon: Video, path: '/admin/lessons/new', color: 'text-emerald-600 bg-emerald-50' },
    { title: 'رفع ملف PDF', icon: FileUp, path: '/admin/pdfs/upload', color: 'text-purple-600 bg-purple-50' },
    { title: 'إدارة الطلاب', icon: Users, path: '/admin/students', color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="bg-white border border-border rounded-2xl p-4 h-full shadow-xs">
      <h3 className="text-xs font-bold text-text-primary mb-3">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              onClick={() => navigate(act.path)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-surface hover:bg-surface-blue transition-all group"
            >
              <div className={`p-2 rounded-xl ${act.color} mb-1.5 group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-text-primary">{act.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};