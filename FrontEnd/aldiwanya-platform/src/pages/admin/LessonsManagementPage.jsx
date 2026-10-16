import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Video,
  ImagePlus,
  Play,
  Link2,
  FileText,
} from "lucide-react";
import api from "../../services/api";
import VideoPlayer from "../../components/common/VideoPlayer";
import { youtubeId } from "../../utils/videoSource";
import {
  ReferenceHeader,
  ReferenceTable,
  ReferenceMessage,
  ReferenceStatus,
} from "../../components/admin/common/ReferenceUI";
import { assetUrl, errorMessage, date } from "../../utils/platform";
const empty = {
  title: "",
  courseId: "",
  description: "",
  internalNotes: "",
  position: 1,
  status: "draft",
  youtubeUrl: "",
  durationSeconds: 0,
  isFreePreview: false,
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
  const [file, setFile] = useState(null),
    [poster, setPoster] = useState(""),
    [preview, setPreview] = useState(null);
  useEffect(
    () => () => {
      if (poster.startsWith("blob:")) URL.revokeObjectURL(poster);
    },
    [poster],
  );
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
  const change = (e) =>
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  function reset() {
    setForm(empty);
    setEditing("");
    setFile(null);
    setPoster("");
    setPreview(null);
  }
  function edit(row) {
    setEditing(row._id);
    setFile(null);
    setPoster(assetUrl(row.thumbnailUrl));
    setPreview(null);
    setForm({
      title: row.title,
      courseId: row.courseId?._id || row.courseId,
      description: row.description || "",
      internalNotes: row.internalNotes || "",
      position: (row.position ?? 0) + 1,
      status: row.status,
      youtubeUrl: row.videoId
        ? "https://www.youtube.com/watch?v=" + row.videoId
        : "",
      durationSeconds: row.durationSeconds || 0,
      isFreePreview: !!row.isFreePreview,
    });
    document
      .getElementById("lesson-form")
      ?.scrollIntoView({ behavior: "smooth" });
  }
  function chooseFile(e) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(picked.type) ||
      picked.size > 5 * 1024 * 1024
    ) {
      setError("اختر صورة PNG أو JPG أو WebP لا تتجاوز 5 ميجابايت.");
      e.target.value = "";
      return;
    }
    setError("");
    setFile(picked);
    setPoster(URL.createObjectURL(picked));
    e.target.value = "";
  }
  async function save(e) {
    e.preventDefault();
    if (!youtubeId(form.youtubeUrl)) {
      setError("أدخل رابط فيديو YouTube صحيحًا.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = new FormData();
      Object.entries({ ...form, position: Number(form.position) - 1 }).forEach(
        ([key, value]) => data.append(key, String(value)),
      );
      if (file) data.append("thumbnail", file);
      if (editing) await api.patch("/admin/lessons/" + editing, data);
      else await api.post("/admin/lessons", data);
      reset();
      await load();
      setMessage("تم حفظ الدرس والفيديو معًا.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function action(row, remove = false) {
    if (
      remove &&
      !window.confirm(
        "حذف الدرس والفيديو المرتبط به؟ المذكرات المرتبطة يجب نقلها أولًا.",
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
    (l.title + " " + (l.courseId?.title || ""))
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const previewId = preview?.videoId || youtubeId(form.youtubeUrl);
  return (
    <div className="admin-reference">
      <ReferenceHeader
        lessons
        title="إدارة الدروس"
        subtitle="أضف معلومات الدرس ورابط الفيديو في مكان واحد."
        icon={Video}
      />
      <ReferenceMessage
        error={error}
        message={message}
        loading={loading}
        retry={error ? load : undefined}
      />
      <section className="ref-panel ref-video-panel" id="lesson-form">
        <div className="ref-video-form">
          <h2 className="ref-form-heading">
            <span className="ref-square small">
              <Plus size={22} />
            </span>
            {editing ? "تعديل الدرس" : "إضافة درس جديد"}
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
                      name="title"
                      aria-label="عنوان الدرس"
                      required
                      minLength={2}
                      maxLength={150}
                      placeholder="أدخل عنوان الدرس"
                      value={form.title}
                      onChange={change}
                    />
                  </span>
                </label>
                <label className="ref-field ref-full">
                  <span>
                    رابط فيديو YouTube <em>*</em>
                  </span>
                  <span className="ref-input-icon">
                    <Link2 size={20} />
                    <input
                      type="url"
                      dir="ltr"
                      name="youtubeUrl"
                      aria-label="رابط فيديو YouTube"
                      required
                      maxLength={2048}
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={form.youtubeUrl}
                      onChange={(e) => {
                        change(e);
                        setPreview(null);
                      }}
                    />
                  </span>
                  <small>
                    ارفع الفيديو على YouTube بوضع «غير مُدرج»، ثم ضع رابطه هنا.
                  </small>
                </label>
                <label className="ref-field">
                  وصف الدرس
                  <textarea
                    name="description"
                    aria-label="وصف الدرس"
                    maxLength={2000}
                    placeholder="أدخل وصفًا مختصرًا للدرس..."
                    value={form.description}
                    onChange={change}
                  />
                </label>
                <label className="ref-field">
                  <span>صورة مصغرة للدرس</span>
                  <span className="ref-thumbnail">
                    {poster ? (
                      <img src={poster} alt="الصورة المختارة" />
                    ) : (
                      <ImagePlus size={32} />
                    )}
                    <span>اختر صورة مصغرة</span>
                    <small>يفضل مقاس 16:9 — حتى 5 ميجابايت</small>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      aria-label="صورة مصغرة للدرس"
                      onChange={chooseFile}
                    />
                  </span>
                </label>
                <label className="ref-field">
                  ترتيب الدرس
                  <input
                    type="number"
                    name="position"
                    aria-label="ترتيب الدرس"
                    min={1}
                    step={1}
                    required
                    value={form.position}
                    onChange={change}
                  />
                </label>
                <label className="ref-field">
                  مدة الفيديو بالثواني
                  <input
                    type="number"
                    name="durationSeconds"
                    aria-label="مدة الفيديو بالثواني"
                    min={0}
                    max={86400}
                    step={1}
                    required
                    value={form.durationSeconds}
                    onChange={change}
                  />
                  <small>اختياري؛ اتركها صفرًا لو المدة غير معروفة.</small>
                </label>
                <label className="ref-field ref-full">
                  <span>
                    <FileText size={16} style={{ display: "inline" }} /> ملاحظات
                    داخلية (اختياري)
                  </span>
                  <textarea
                    name="internalNotes"
                    aria-label="ملاحظات داخلية"
                    maxLength={2000}
                    placeholder="تظهر للإدارة فقط..."
                    value={form.internalNotes}
                    onChange={change}
                  />
                </label>
                <label className="checkbox-label ref-full">
                  <input
                    type="checkbox"
                    name="isFreePreview"
                    checked={form.isFreePreview}
                    onChange={change}
                  />
                  الدرس مجاني — متاح للجميع بدون اشتراك
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
        </div>
        <aside className="ref-video-preview">
          <h2>معاينة فيديو الدرس</h2>
          <p>راجع الفيديو قبل نشره للطلاب.</p>
          <div className="ref-video-stage">
            {previewId ? (
              <VideoPlayer
                key={previewId}
                videoId={previewId}
                title={preview?.title || form.title}
              />
            ) : (
              <div className="ref-video-placeholder">
                <Video size={52} />
                <span>أضف الرابط لعرض المعاينة</span>
              </div>
            )}
          </div>
          <h3>{preview?.title || form.title}</h3>
          <p>{preview?.description || form.description}</p>
          <span
            className={
              "ref-badge " +
              ((preview?.isFreePreview ?? form.isFreePreview)
                ? "green"
                : "blue")
            }
          >
            {(preview?.isFreePreview ?? form.isFreePreview)
              ? "متاح مجانًا"
              : "يتطلب اشتراكًا فعالًا"}
          </span>
        </aside>
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
                "الصورة",
                "الوصول",
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
                <td>
                  {assetUrl(l.thumbnailUrl) ? (
                    <img
                      className="ref-video-thumb"
                      src={assetUrl(l.thumbnailUrl)}
                      alt=""
                    />
                  ) : (
                    <Video size={22} />
                  )}
                </td>
                <td>
                  <span
                    className={
                      "ref-badge " + (l.isFreePreview ? "green" : "blue")
                    }
                  >
                    {l.isFreePreview ? "مجاني" : "اشتراك"}
                  </span>
                </td>
                <td>{(l.position ?? 0) + 1}</td>
                <td>{date(l.createdAt)}</td>
                <td>
                  <ReferenceStatus active={l.status === "published"} />
                </td>
                <td>
                  <div className="ref-row-actions">
                    <button
                      disabled={busy || !l.videoId}
                      className="ref-icon-button"
                      aria-label={"معاينة " + l.title}
                      onClick={() => {
                        setPreview(l);
                        document
                          .getElementById("lesson-form")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <Play size={17} />
                    </button>
                    <button
                      disabled={busy}
                      className="ref-icon-button"
                      aria-label={
                        (l.status === "published" ? "إخفاء " : "نشر ") + l.title
                      }
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
                      aria-label={"تعديل " + l.title}
                      onClick={() => edit(l)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      disabled={busy}
                      className="ref-icon-button danger"
                      aria-label={"حذف " + l.title}
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
                <td colSpan={9} className="ref-empty">
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
