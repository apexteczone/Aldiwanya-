import VideoPlayer from '../../components/common/VideoPlayer';
import { PageTitle } from '../../components/common/PageTitle';
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  Crown,
  Heart,
  LockKeyhole,
  PlayCircle,
} from "lucide-react";
import useResource from "../../hooks/useResource";
import usePlatform from "../../hooks/usePlatform";
import api from "../../services/api";
import { assetUrl, errorMessage } from "../../utils/platform";
import {
  Empty,
  Hero,
  ResourceState,
} from "../../components/common/PlatformUI";
export default function CourseDetailsPage({ preview = false }) {
  const { id } = useParams(),
    resource = useResource("/courses/" + id);
  return (
    <><PageTitle title={resource.data?.title ? `${preview ? 'معاينة: ' : ''}${resource.data.title}` : 'تفاصيل المادة'} />
    <ResourceState resource={resource}>
      {resource.data && (
        <CourseView
          key={id + preview}
          course={resource.data}
          preview={preview}
        />
      )}
    </ResourceState></>
  );
}
export function CourseView({ course, preview=false, initialLessonId }) {
  const navigate=useNavigate();
  const { profile } = usePlatform(),
    [params] = useSearchParams(),
    [tab, setTab] = useState("intro");
  const [activity, setActivity] = useState(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const lessons = course.lessons || [],
    lesson = lessons.find((l) => l._id === (initialLessonId || params.get("lesson"))) || (preview ? lessons.find(l=>l.isFreePreview) : lessons[0]);
  useEffect(() => {
    if (!profile) return;
    let live = true;
    api
      .get("/student/activity")
      .then((r) => {
        if (live) setActivity(r.data.data);
      })
      .catch((e) => {
        if (live) setMessage(errorMessage(e));
      });
    return () => {
      live = false;
    };
  }, [profile]);
  async function markComplete() {
    if (!lesson) return;
    setBusy(true);
    setMessage("");
    try {
      await api.patch("/student/activity", {
        kind: "complete",
        id: lesson._id,
        enabled: !activity?.completedLessons.some((l) => l._id === lesson._id),
      });
      setActivity((await api.get("/student/activity")).data.data);
    } catch (e) {
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const selected = (id) => navigate('/lessons/'+id);
  const lessonList = (rows) =>
    rows.map((l) => (
      <button
        className={`lesson-choice ${lesson?._id === l._id ? "active" : ""}`}
        key={l._id}
        onClick={() => selected(l._id)}
      >
        <PlayCircle size={17} />
        <span>{l.title}</span>
        {activity?.completedLessons.some((done) => done._id === l._id) && (
          <CheckCircle size={17} />
        )}
      </button>
    ));
  return (
    <>
      <Hero
        title={preview ? "جرّب قبل أن تشترك" : course.title}
        subtitle={
          preview ? "شاهد المحتوى المنشور كمعاينة مجانية" : course.description
        }
        compact
      />
      <section
        className={`site-container course-layout section ${preview ? "preview-layout" : ""}`}
      >
        <aside className="course-sidebar">
          <div className="site-panel course-summary">
            {assetUrl(course.coverImage || course.thumbnail) ? (
              <img
                src={assetUrl(course.coverImage || course.thumbnail)}
                alt={course.title}
              />
            ) : (
              <div className="cover-placeholder">
                <BookOpen size={60} />
              </div>
            )}
            <h2>{course.title}</h2>
            <p>{course.subject}</p>
            <div className="course-stats">
              <span>
                <BookOpen />
                {lessons.length} درس
              </span>
              {course.durationHours > 0 && (
                <span>{course.durationHours} ساعة</span>
              )}
            </div>
            <Link className="site-button full" to={lesson?"/plans?next="+encodeURIComponent("/lessons/"+lesson._id):"/plans"}>
              <Crown size={17} />
              عرض الاشتراكات
            </Link>
          </div>
          <div className="soft-panel">
            <h3>محتوى مجاني متاح</h3>
            <p>جرّب المعاينات المنشورة قبل الاشتراك.</p>
            <Link
              to={`/courses/${course._id}/preview`}
              className="site-button light full"
            >
              مشاهدة المحتوى التجريبي
              <PlayCircle size={17} />
            </Link>
          </div>
          {preview && (
            <div className="site-panel">
              <h3>محتويات المادة</h3>
              {lessonList(lessons)}
            </div>
          )}
        </aside>
        <div className="site-panel course-player-panel">
          <h2>{lesson?.title || course.title}</h2>
          {lesson ? (
            <LessonPlayer
              key={lesson._id + preview}
              lesson={lesson}
              courseId={course._id}
              preview={preview}
              profile={profile}
              activity={activity}
              autoRedirect={!!initialLessonId || !!params.get("lesson")}
              onActivity={setActivity}
            />
          ) : (
            <Empty>لم تُنشر دروس لهذه المادة بعد.</Empty>
          )}
          {profile && lesson && (
            <button
              className="site-button light"
              disabled={busy}
              onClick={markComplete}
            >
              <CheckCircle size={17} />
              {activity?.completedLessons.some((l) => l._id === lesson._id)
                ? "إلغاء تحديد الدرس كمكتمل"
                : "تحديد الدرس كمكتمل"}
            </button>
          )}
          {message && (
            <p role="alert" className="form-error">
              {message}
            </p>
          )}
          {preview ? (
            <div className="soft-panel preview-callout">
              <Crown size={32} />
              <div>
                <h3>هذه معاينة من المحتوى التعليمي</h3>
                <p>
                  المعاينات المنشورة هنا مجانية. الاشتراك يتيح المحتوى المدفوع.
                </p>
              </div>
              <Link to={lesson?"/plans?next="+encodeURIComponent("/lessons/"+lesson._id):"/plans"} className="site-button">
                خطط الاشتراك
              </Link>
            </div>
          ) : (
            <>
              <div
                className="course-tabs"
                role="tablist"
                aria-label="تفاصيل المادة"
              >
                {[
                  ["intro", "مقدمة"],
                  ["description", "الوصف"],
                  ["lessons", "الدروس"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => setTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="course-tab-content" role="tabpanel">
                {tab === "lessons" ? (
                  lessonList(lessons)
                ) : (
                  <>
                    <h3>
                      {tab === "intro" ? "مقدمة عن المادة" : "وصف المادة"}
                    </h3>
                    <p>
                      {tab === "intro"
                        ? lesson?.description ||
                          course.description ||
                          "لم يُضف وصف بعد."
                        : course.description || "لم يُضف وصف بعد."}
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        {!preview && (
          <aside className="site-panel lesson-sidebar">
            <h2>محتويات المادة</h2>
            {lessons.length ? (
              <>
                {lessonList(lessons.filter((l) => !l.moduleId))}
                {course.modules?.map((m) => (
                  <details className="lesson-group" key={m._id} open>
                    <summary>
                      {m.title}
                      <small>{m.lessons.length} درس</small>
                    </summary>
                    {lessonList(m.lessons)}
                  </details>
                ))}
              </>
            ) : (
              <Empty>لا توجد دروس منشورة.</Empty>
            )}
            <div className="soft-panel">
              <CheckCircle />
              <p>تابع الدروس وحدّد ما أتممته لحفظ تقدمك.</p>
            </div>
          </aside>
        )}
      </section>
    </>
  );
}
function LessonPlayer({lesson,courseId,preview,profile,activity,onActivity,autoRedirect}){
 const navigate=useNavigate(),{loading:authLoading}=usePlatform();
 const [resource,setResource]=useState({loading:true,data:null,error:'',status:0}),[revision,setRevision]=useState(0);
 const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const started=useRef(false);
 const next='/lessons/'+lesson._id;
 useEffect(()=>{
  if(authLoading)return;
  let live=true;
  api.get('/lessons/'+lesson._id+'/playback',{quiet:true}).then(r=>{if(live)setResource({loading:false,data:r.data.data,error:'',status:200});}).catch(e=>{
   if(!live)return;
   const status=e.response?.status;
   if(autoRedirect&&[401,403].includes(status)){navigate((status===401?'/login':'/plans')+'?next='+encodeURIComponent('/lessons/'+lesson._id),{replace:true});return;}
   setResource({loading:false,data:null,status,error:[401,403].includes(status)?'':errorMessage(e)});
  });
  return()=>{live=false;};
 },[lesson._id,profile,authLoading,autoRedirect,navigate,revision]);
 async function recordStart(){
  if(!profile||started.current)return;started.current=true;
  try{await api.patch('/student/activity',{kind:'start',id:courseId,enabled:true});}
  catch(e){started.current=false;setMessage(errorMessage(e));}
 }
 async function favorite(){
  setBusy(true);setMessage('');
  try{await api.patch('/student/activity',{kind:'favorite',id:lesson._id,enabled:!activity?.favoriteLessons.some(l=>l._id===lesson._id)});onActivity((await api.get('/student/activity')).data.data);}
  catch(e){setMessage(errorMessage(e));}finally{setBusy(false);}
 }
 const data=resource.data;
 return <ResourceState resource={{...resource,retry:()=>setRevision(v=>v+1)}}>
  {data?<><div className="video-stage"><VideoPlayer videoId={data.videoId} title={data.title} onPlay={recordStart}/></div>
   <div className="video-title"><span className="access-badge">{data.isFreePreview?'درس مجاني':'محتوى المشتركين'}</span>
    {profile?<button className="icon-button" disabled={busy} aria-label={activity?.favoriteLessons.some(l=>l._id===lesson._id)?'إزالة من المفضلة':'إضافة إلى المفضلة'} onClick={favorite}><Heart size={21} fill={activity?.favoriteLessons.some(l=>l._id===lesson._id)?'currentColor':'none'}/></button>:<Link to={'/login?next='+encodeURIComponent(next)}>سجّل الدخول لحفظ المفضلة</Link>}
   </div>
   {message&&<p role="alert" className="form-error">{message}</p>}
  </>:preview?<Empty icon={PlayCircle}>اختر درسًا مجانيًا من محتويات المادة لعرض المعاينة.</Empty>:<div className="site-empty">
    <LockKeyhole size={42}/><h3>{resource.status===401?'سجّل الدخول لمشاهدة هذا الدرس':'هذا الدرس متاح للمشتركين'}</h3>
    <p>ستعود لنفس الدرس بعد إتمام الخطوات.</p>
    <Link className="site-button" to={(resource.status===401?'/login':'/plans')+'?next='+encodeURIComponent(next)}>{resource.status===401?'تسجيل الدخول':'عرض خطط الاشتراك'}</Link>
   </div>}
 </ResourceState>;
}
