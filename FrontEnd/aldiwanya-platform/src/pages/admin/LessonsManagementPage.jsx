import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Video,
  FileText,
} from "lucide-react";
import api from "../../services/api";
import {
  ReferenceHeader,
  ReferenceTable,
  ReferenceMessage,
  ReferenceStatus,
} from "../../components/admin/common/ReferenceUI";
import { errorMessage, date } from "../../utils/platform";
const empty = {
  title: "",
  courseId: "",
  description: "",
  internalNotes: "",
  position: 1,
  status: "draft",
};
export default function LessonsManagementPage() {
  const [courses, setCourses] = useState([]),
    [lessons, setLessons] = useState([]),
    [form, setForm] = useState(empty),
    [editing, setEditing] = useState("");
  const [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [search, setSearch] = useState("");
  async function load() {
    setLoading(true);
    try {
      const [c, l] = await Promise.all([
        api.get("/admin/courses"),
        api.get("/admin/lessons"),
      ]);
      setCourses(c.data.data);
      setLessons(l.data.data);
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let live = true;
    Promise.all([api.get("/admin/courses"), api.get("/admin/lessons")])
      .then(([c, l]) => {
        if (live) {
          setCourses(c.data.data);
          setLessons(l.data.data);
        }
      })
      .catch((e) => {
        if (live) setError(errorMessage(e));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  function reset() {
    setForm(empty);
    setEditing("");
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = { ...form, position: Number(form.position) - 1 };
      if (editing) await api.patch("/admin/lessons/" + editing, data);
      else await api.post("/admin/lessons", data);
      reset();
      await load();
      setMessage(editing ? "تم تحديث الدرس." : "تم إضافة الدرس.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  function edit(row) {
    setEditing(row._id);
    setForm({
      title: row.title,
      courseId: row.courseId?._id || row.courseId,
      description: row.description || "",
      internalNotes: row.internalNotes || "",
      position: (row.position ?? 0) + 1,
      status: row.status,
    });
    document
      .getElementById("lesson-form")
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  async function action(row, remove = false) {
    if (
      remove &&
      !window.confirm(
        "حذف هذا الدرس؟ لا يمكن حذفه إذا كان مرتبطًا بفيديوهات أو مذكرات.",
      )
    )
      return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (remove) await api.delete("/admin/lessons/" + row._id);
      else
        await api.patch(
          "/admin/lessons/" +
            row._id +
            (row.status === "published" ? "/hide" : "/publish"),
        );
      if (editing === row._id) reset();
      await load();
      setMessage("تم حفظ التغييرات.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const rows = lessons.filter((l) =>
    `${l.title} ${l.courseId?.title || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="admin-reference">
      <ReferenceHeader
        lessons
        title="إدارة الدروس"
        subtitle="أضف درسًا جديدًا داخل أحد الكورسات وأدر محتواه."
        icon={Video}
      />
      <ReferenceMessage
        error={error}
        message={message}
        loading={loading}
        retry={error ? load : undefined}
      />
      <section className="ref-panel" id="lesson-form">
        <h2 className="ref-form-heading">
          {editing ? "تعديل معلومات الدرس" : "معلومات الدرس"}
        </h2>
        <form onSubmit={save}>
          <fieldset disabled={busy || loading}>
            <div className="ref-grid">
              <label className="ref-field">
                <span>
                  اختر الكورس <em>*</em>
                </span>
                <select
                  name="courseId"
                  aria-label="اختر الكورس"
                  required
                  value={form.courseId}
                  onChange={change}
                  disabled={
                    !!editing &&
                    !!lessons.find((l) => l._id === editing)?.moduleId
                  }
                >
                  <option value="">اختر الكورس</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.grade?.name} — {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ref-field">
                <span>
                  عنوان الدرس <em>*</em>
                </span>
                <span className="ref-input-icon">
                  <BookOpen size={20} />
                  <input
                    aria-label="عنوان الدرس"
                    name="title"
                    required
                    minLength={2}
                    maxLength={150}
                    placeholder="أدخل عنوان الدرس"
                    value={form.title}
                    onChange={change}
                  />
                </span>
              </label>
              <label className="ref-field">
                الوصف (اختياري)
                <textarea
                  aria-label="وصف الدرس"
                  name="description"
                  maxLength={2000}
                  placeholder="أدخل وصف مختصر للدرس..."
                  value={form.description}
                  onChange={change}
                />
                <small className="ref-hint">
                  {form.description.length}/2000
                </small>
              </label>
              <label className="ref-field">
                ترتيب الدرس
                <input
                  aria-label="ترتيب الدرس"
                  type="number"
                  min={1}
                  step={1}
                  required
                  name="position"
                  value={form.position}
                  onChange={change}
                />
              </label>
              <label className="ref-field ref-full">
                <span>
                  ملاحظات إضافية (اختياري){" "}
                  <FileText size={16} style={{ display: "inline" }} />
                </span>
                <textarea
                  aria-label="ملاحظات داخلية"
                  name="internalNotes"
                  maxLength={2000}
                  placeholder="ملاحظات داخلية للمدير أو المعلمين..."
                  value={form.internalNotes}
                  onChange={change}
                />
              </label>
            </div>
            <div className="ref-actions">
              <button className="ref-button" disabled={!courses.length}>
                <Plus size={18} />
                {busy
                  ? "جاري الحفظ…"
                  : editing
                    ? "حفظ التعديلات"
                    : "إضافة الدرس"}
              </button>
              <button
                type="button"
                className="ref-button secondary"
                onClick={reset}
              >
                إلغاء
              </button>
            </div>
            <p className="ref-small-note">
              يُحفظ الدرس الجديد كمسودة. يمكنك نشره من قائمة الدروس.
            </p>
          </fieldset>
        </form>
      </section>
      <ReferenceTable
        title="قائمة الدروس"
        search={search}
        onSearch={setSearch}
        label="البحث في الدروس..."
      >
        <table>
          <thead>
            <tr>
              {[
                "#",
                "عنوان الدرس",
                "الكورس",
                "الترتيب",
                "تاريخ الإضافة",
                "الحالة",
                "العمليات",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((l, i) => (
              <tr key={l._id}>
                <td>{i + 1}</td>
                <td>{l.title}</td>
                <td>{l.courseId?.title || "—"}</td>
                <td>{(l.position ?? 0) + 1}</td>
                <td>{date(l.createdAt)}</td>
                <td>
                  <ReferenceStatus active={l.status === "published"} />
                </td>
                <td>
                  <div className="ref-row-actions">
                    <button
                      disabled={busy}
                      className="ref-icon-button"
                      aria-label={`${l.status === "published" ? "إخفاء" : "نشر"} ${l.title}`}
                      onClick={() => action(l)}
                    >
                      {l.status === "published" ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                    <button
                      disabled={busy}
                      className="ref-icon-button edit"
                      aria-label={`تعديل ${l.title}`}
                      onClick={() => edit(l)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      disabled={busy}
                      className="ref-icon-button danger"
                      aria-label={`حذف ${l.title}`}
                      onClick={() => action(l, true)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !rows.length && (
              <tr>
                <td colSpan={7} className="ref-empty">
                  {search
                    ? "لا توجد دروس تطابق البحث."
                    : "لا توجد دروس بعد. أضف أول درس من النموذج أعلاه."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ReferenceTable>
    </div>
  );
}
