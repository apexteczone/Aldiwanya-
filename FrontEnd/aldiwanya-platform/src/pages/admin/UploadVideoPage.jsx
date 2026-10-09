import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Video,
  Link2,
  ImagePlus,
  Save,
  Pencil,
  Trash2,
  Play,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../services/api";
import { assetUrl, date, errorMessage } from "../../utils/platform";
import { videoSource } from "../../utils/videoSource";
import VideoPlayer from "../../components/common/VideoPlayer";
import {
  ReferenceHeader,
  ReferenceTable,
  ReferenceMessage,
  ReferenceStatus,
} from "../../components/admin/common/ReferenceUI";
const empty = {
  courseId: "",
  lessonId: "",
  title: "",
  videoUrl: "",
  description: "",
  thumbnailUrl: "",
  durationSeconds: 0,
  accessLevel: "paid",
  status: "draft",
};
export default function UploadVideoPage() {
  const [courses, setCourses] = useState([]),
    [lessons, setLessons] = useState([]),
    [videos, setVideos] = useState([]),
    [form, setForm] = useState(empty),
    [editing, setEditing] = useState(""),
    [file, setFile] = useState(null),
    [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [search, setSearch] = useState(""),
    [preview, setPreview] = useState(null);
  useEffect(
    () => () => {
      if (previewImage.startsWith("blob:")) URL.revokeObjectURL(previewImage);
    },
    [previewImage],
  );
  async function load() {
    setLoading(true);
    try {
      const [c, l, v] = await Promise.all([
        api.get("/admin/courses"),
        api.get("/admin/lessons"),
        api.get("/admin/videos"),
      ]);
      setCourses(c.data.data);
      setLessons(l.data.data);
      setVideos(v.data.data);
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let live = true;
    Promise.all([
      api.get("/admin/courses"),
      api.get("/admin/lessons"),
      api.get("/admin/videos"),
    ])
      .then(([c, l, v]) => {
        if (live) {
          setCourses(c.data.data);
          setLessons(l.data.data);
          setVideos(v.data.data);
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
  const courseLessons = lessons.filter(
    (l) => (l.courseId?._id || l.courseId) === form.courseId,
  );
  const rows = videos.filter(
    (v) =>
      (!form.lessonId || (v.lessonId?._id || v.lessonId) === form.lessonId) &&
      v.title.toLowerCase().includes(search.toLowerCase()),
  );
  function reset() {
    setForm(empty);
    setEditing("");
    setFile(null);
    setPreviewImage("");
    setPreview(null);
  }
  function edit(v) {
    const lesson = lessons.find(
      (l) => l._id === (v.lessonId?._id || v.lessonId),
    );
    setEditing(v._id);
    setForm({
      courseId: lesson?.courseId?._id || lesson?.courseId || "",
      lessonId: lesson?._id || "",
      title: v.title,
      videoUrl: v.videoUrl || "",
      description: v.description || "",
      thumbnailUrl: v.thumbnailUrl || "",
      durationSeconds: v.durationSeconds || 0,
      accessLevel: v.accessLevel,
      status:
        v.publicationStatus || (v.status === "active" ? "published" : "draft"),
    });
    setFile(null);
    setPreviewImage(v.thumbnailUrl || "");
    setPreview(null);
    document
      .getElementById("video-form")
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
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
    setPreviewImage(URL.createObjectURL(picked));
    e.target.value = "";
  }
  async function save(e) {
    e.preventDefault();
    if (!videoSource(form.videoUrl)) {
      setError(
        "أدخل رابط YouTube أو Vimeo صالحًا أو رابط ملف فيديو HTTPS مباشر.",
      );
      return;
    }
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const data = new FormData();
      for (const key of [
        "lessonId",
        "title",
        "videoUrl",
        "description",
        "durationSeconds",
        "accessLevel",
        "status",
      ])
        data.append(key, form[key]);
      if (file) data.append("thumbnail", file);
      else if (form.thumbnailUrl && !form.thumbnailUrl.startsWith("/uploads/"))
        data.append("thumbnailUrl", form.thumbnailUrl);
      if (editing) await api.patch("/admin/videos/" + editing, data);
      else await api.post("/admin/videos", data);
      const keep = { courseId: form.courseId, lessonId: form.lessonId };
      reset();
      setForm({ ...empty, ...keep });
      await load();
      setMessage("تم حفظ الفيديو وربطه بالدرس.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function action(v, remove = false) {
    if (remove && !window.confirm("حذف هذا الفيديو من الدرس؟")) return;
    setBusy(true);
    setError("");
    try {
      if (remove) await api.delete("/admin/videos/" + v._id);
      else
        await api.patch("/admin/videos/" + v._id, {
          status: v.status === "active" ? "draft" : "published",
        });
      if (editing === v._id) reset();
      await load();
      setMessage("تم حفظ التغييرات.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const poster = previewImage.startsWith("blob:")
    ? previewImage
    : assetUrl(previewImage || form.thumbnailUrl);
  return (
    <div className="admin-reference">
      <ReferenceHeader
        lessons
        icon={Video}
        title="إضافة فيديو للدرس"
        subtitle="يمكنك إضافة فيديو لدرس محدد داخل أحد الكورسات."
      />
      <ReferenceMessage
        error={error}
        message={message}
        loading={loading}
        retry={error ? load : undefined}
      />
      <section className="ref-panel ref-video-panel" id="video-form">
        <form onSubmit={save} className="ref-video-form">
          <fieldset disabled={loading || busy}>
            <div className="ref-grid">
              <label className="ref-field">
                <span>
                  اختر الكورس <em>*</em>
                </span>
                <select
                  aria-label="اختر الكورس"
                  required
                  value={form.courseId}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      courseId: e.target.value,
                      lessonId: "",
                    });
                    setPreview(null);
                  }}
                >
                  <option value="">اختر الكورس</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ref-field">
                <span>
                  اختر الدرس <em>*</em>
                </span>
                <select
                  aria-label="اختر الدرس"
                  name="lessonId"
                  required
                  value={form.lessonId}
                  onChange={change}
                >
                  <option value="">اختر الدرس</option>
                  {courseLessons.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ref-field ref-full">
                <span>
                  عنوان الفيديو <em>*</em>
                </span>
                <input
                  aria-label="عنوان الفيديو"
                  name="title"
                  required
                  minLength={2}
                  maxLength={200}
                  value={form.title}
                  onChange={change}
                  placeholder="أدخل عنوان الفيديو"
                />
              </label>
              <label className="ref-field ref-full">
                <span>
                  رابط الفيديو (YouTube / Vimeo) <em>*</em>
                </span>
                <span className="ref-input-icon">
                  <Link2 size={20} />
                  <input
                    aria-label="رابط الفيديو"
                    name="videoUrl"
                    type="url"
                    required
                    value={form.videoUrl}
                    onChange={(e) => {
                      change(e);
                      setPreview(null);
                    }}
                    dir="ltr"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </span>
                <small>
                  يدعم أيضًا روابط ملفات الفيديو المباشرة عبر HTTPS.
                </small>
              </label>
              <label className="ref-field">
                وصف الفيديو
                <textarea
                  aria-label="وصف الفيديو"
                  name="description"
                  maxLength={2000}
                  value={form.description}
                  onChange={change}
                  placeholder="أدخل وصف مختصر للفيديو..."
                />
              </label>
              <div className="ref-field">
                <span>صورة مصغرة للفيديو</span>
                <label className="ref-thumbnail">
                  {poster ? (
                    <img src={poster} alt="معاينة الصورة المصغرة" />
                  ) : (
                    <ImagePlus size={32} />
                  )}
                  <strong>اختر صورة مصغرة</strong>
                  <small>يفضل مقاس 16:9 — حتى 5 ميجابايت</small>
                  <input
                    aria-label="صورة مصغرة للفيديو"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={chooseFile}
                  />
                </label>
              </div>
            </div>
            <details className="ref-video-options">
              <summary>إعدادات النشر والوصول</summary>
              <div className="ref-grid">
                <label className="ref-field">
                  الوصول
                  <select
                    aria-label="وصول الفيديو"
                    name="accessLevel"
                    value={form.accessLevel}
                    onChange={change}
                  >
                    <option value="paid">للمشتركين</option>
                    <option value="free">معاينة مجانية</option>
                  </select>
                </label>
                <label className="ref-field">
                  الحالة
                  <select
                    aria-label="حالة الفيديو"
                    name="status"
                    value={form.status}
                    onChange={change}
                  >
                    <option value="draft">مسودة</option>
                    <option value="published">منشور</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                </label>
                <label className="ref-field">
                  المدة بالثواني
                  <input
                    aria-label="مدة الفيديو بالثواني"
                    type="number"
                    name="durationSeconds"
                    min={0}
                    value={form.durationSeconds}
                    onChange={change}
                  />
                </label>
              </div>
            </details>
            <div className="ref-actions">
              <button className="ref-button">
                <Save size={18} />
                {busy
                  ? "جاري الحفظ…"
                  : editing
                    ? "حفظ التعديلات"
                    : "حفظ الفيديو"}
              </button>
              <button
                type="button"
                className="ref-button secondary"
                onClick={reset}
              >
                إلغاء
              </button>
            </div>
          </fieldset>
        </form>
        <aside className="ref-video-preview">
          <h2>معاينة الفيديو</h2>
          <p>سيظهر الفيديو بهذا الشكل للطلاب</p>
          <div className="ref-video-stage">
            {videoSource(preview?.videoUrl || form.videoUrl) ? (
              <VideoPlayer
                key={preview?._id || form.videoUrl}
                title="معاينة الفيديو"
                src={preview?.videoUrl || form.videoUrl}
                poster={preview ? assetUrl(preview.thumbnailUrl) : poster}
                onError={() =>
                  setError(
                    "تعذر تشغيل الرابط. تأكد من إتاحة الفيديو والسماح بتضمينه.",
                  )
                }
              />
            ) : (
              <div className="ref-video-placeholder">
                {poster ? (
                  <img src={poster} alt="صورة الفيديو" />
                ) : (
                  <Video size={52} />
                )}
                <span>أضف رابط الفيديو لعرض المعاينة</span>
              </div>
            )}
          </div>
          {preview && <p>{preview.title}</p>}
          <Link to="/admin/video" className="ref-small-note">
            العودة إلى جميع الفيديوهات
          </Link>
        </aside>
      </section>
      <ReferenceTable
        title={form.lessonId ? "قائمة الفيديوهات في الدرس" : "قائمة الفيديوهات"}
        search={search}
        onSearch={setSearch}
        label="البحث في الفيديوهات..."
      >
        <table>
          <thead>
            <tr>
              {[
                "#",
                "عنوان الفيديو",
                "الصورة",
                "المدة",
                "تاريخ الإضافة",
                "الحالة",
                "العمليات",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((v, i) => (
              <tr key={v._id}>
                <td>{i + 1}</td>
                <td>{v.title}</td>
                <td>
                  {assetUrl(v.thumbnailUrl) ? (
                    <img
                      className="ref-video-thumb"
                      src={assetUrl(v.thumbnailUrl)}
                      alt={v.title}
                    />
                  ) : (
                    <Video size={22} />
                  )}
                </td>
                <td dir="ltr">
                  {Math.floor((v.durationSeconds || 0) / 60)}:
                  {String(Math.floor((v.durationSeconds || 0) % 60)).padStart(
                    2,
                    "0",
                  )}
                </td>
                <td>{date(v.createdAt)}</td>
                <td>
                  <ReferenceStatus active={v.status === "active"} />
                </td>
                <td>
                  <div className="ref-row-actions">
                    <button
                      disabled={busy}
                      className="ref-icon-button"
                      aria-label={`${v.status === "active" ? "إخفاء" : "نشر"} ${v.title}`}
                      onClick={() => action(v)}
                    >
                      {v.status === "active" ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                    <button
                      className="ref-icon-button"
                      aria-label={`معاينة ${v.title}`}
                      onClick={() => {
                        setPreview(v);
                        document
                          .getElementById("video-form")
                          ?.scrollIntoView({
                            block: "start",
                            behavior: "smooth",
                          });
                      }}
                    >
                      <Play size={16} />
                    </button>
                    <button
                      disabled={busy}
                      className="ref-icon-button edit"
                      aria-label={`تعديل ${v.title}`}
                      onClick={() => edit(v)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      disabled={busy}
                      className="ref-icon-button danger"
                      aria-label={`حذف ${v.title}`}
                      onClick={() => action(v, true)}
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
                  لا توجد فيديوهات لعرضها.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ReferenceTable>
    </div>
  );
}
