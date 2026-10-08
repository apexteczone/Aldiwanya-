import {useEffect,useState} from 'react';
import {useParams,Link} from 'react-router-dom';
import api from '../../services/api';
export default function CourseDetailsPage(){const {id}=useParams();const [course,setCourse]=useState(null),[videos,setVideos]=useState([]),[message,setMessage]=useState('جاري التحميل…');
 useEffect(()=>{api.get('/courses/'+id).then(r=>{setCourse(r.data.data);setMessage('');}).catch(e=>setMessage(e.response?.data?.error?.message||'تعذر تحميل الكورس'));},[id]);
 async function open(lesson){setMessage('جاري تحميل الفيديوهات…');try{const r=await api.get('/library/lessons/'+lesson._id+'/videos');setVideos(r.data.data);setMessage(r.data.data.length?'':'لا توجد فيديوهات متاحة لحسابك لهذا الدرس.');}catch(e){setMessage(e.response?.data?.error?.message||'تعذر تحميل الفيديوهات');}}
 return <main dir="rtl" className="max-w-4xl mx-auto p-8 space-y-5"><Link to="/dashboard">لوحة الطالب</Link><h1 className="text-2xl">{course?.title}</h1><p>{course?.description}</p><p role="status">{message}</p>{course?.lessons?.map(l=><button className="block p-3 border rounded" key={l._id} onClick={()=>open(l)}>{l.title}</button>)}{videos.map(v=><section key={v._id}><h2>{v.title}</h2>{v.videoUrl&&<a href={v.videoUrl} target="_blank" rel="noopener noreferrer">مشاهدة الفيديو</a>}</section>)}</main>;}

