import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from '../../services/api';
import { Plus, Edit2, Trash2, BookOpen, Loader2 } from "lucide-react";

const API_BASE_URL = '';

export default function GradesManager() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");


  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

 
  const fetchGrades = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/grades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrades(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching grades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {let live=true;axios.get('/admin/grades').then(res=>{if(live)setGrades(res.data.data);}).catch(()=>{if(live)setError('تعذر التحميل');}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};}, []);

  
  const handleOpenModal = (grade = null) => {
    setError("");
    if (grade) {
      setEditingGrade(grade);
      setFormData({ name: grade.name, description: grade.description || "" });
    } else {
      setEditingGrade(null);
      setFormData({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (editingGrade) {
        // Update Grade
        await axios.patch(
          `${API_BASE_URL}/admin/grades/${editingGrade._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create Grade
        await axios.post(`${API_BASE_URL}/admin/grades/create`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setIsModalOpen(false);
      fetchGrades();
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "حدث خطأ أثناء حفظ البيانات"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 4. حذف صف دراسي
  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الصف الدراسي؟")) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/grades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGrades();
    } catch (err) {
      alert(err.response?.data?.error?.message || "تعذر حذف الصف الدراسي");
    }
  };

  return (
    <div className="p-6 dir-rtl bg-gray-50 min-h-screen text-right">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" /> إدارة الصفوف الدراسية
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            إضافة وتعديل المراحل والصفوف الدراسية للتحكم في الكورسات
          </p>
        </div>
<Link
  to="/admin/grades/add"
  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm hover:shadow"
>
  <Plus size={20} /> إضافة صف جديد
</Link>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={36} />
        </div>
      ) : grades.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">لا توجد صفوف دراسية مضافة بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grades.map((grade) => (
            <div
              key={grade._id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-800">
                    {grade.name}
                  </h3>
                  <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-semibold">
                    صف دراسي
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {grade.description || "لا يوجد وصف مضاف."}
                </p>
              </div>

              <div className="flex justify-end items-center gap-2 pt-4 border-t border-gray-50">
                <button
                  onClick={() => handleOpenModal(grade)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="تعديل"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(grade._id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="حذف"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

     
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingGrade ? "تعديل الصف الدراسي" : "إضافة صف دراسي جديد"}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الصف الدراسي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الصف الأول الثانوي"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف / الملاحظات
                </label>
                <textarea
                  rows="3"
                  placeholder="وصف مختصر للمرحلة أو الصف..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="animate-spin" size={18} />}
                  {editingGrade ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



