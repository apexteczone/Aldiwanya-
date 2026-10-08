import { useState } from "react";
import axios from '../../services/api';
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, ArrowRight, Save, Loader2, AlertCircle } from "lucide-react";

const API_BASE_URL = '';

export default function AddGrade() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    position: 0,
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");

    try {
      await axios.post(`${API_BASE_URL}/admin/grades/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/admin/grades");
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "حدث خطأ أثناء إضافة الصف الدراسي"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 dir-rtl bg-gray-50 min-h-screen text-right font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/grades"
              className="p-2.5 bg-white text-gray-600 hover:text-blue-600 rounded-xl border border-gray-200 transition shadow-sm hover:shadow"
            >
              <ArrowRight size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="text-blue-600" /> إضافة صف دراسي جديد
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                قم بملء البيانات التالية لإضافة صف أو مرحلة تعليمية جديدة
              </p>
            </div>
          </div>
        </div>

        {/* Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="shrink-0 text-red-500" size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grade Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                اسم الصف الدراسي <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                placeholder="مثال: الصف السادس الابتدائى"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الوصف / تفاصيل المرحلة
              </label>
              <textarea
                rows="3"
                placeholder="مرحلة ابتدائية..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
              ></textarea>
            </div>

            {/* Row for Position and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Position */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الترتيب (Position)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      position: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الحالة (Status)
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition bg-white"
                >
                  <option value="active">مفعل (Active)</option>
                  <option value="inactive">غير مفعل (Inactive)</option>
                </select>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <Link
                to="/admin/grades"
                className="px-6 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-2.5 rounded-xl font-medium transition flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    حفظ الصف الدراسي
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
