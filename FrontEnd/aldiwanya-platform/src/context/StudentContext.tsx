import {createContext,useState,useEffect,type ReactNode} from 'react';
import type {StudentProfile,SubscriptionInfo,EnrolledCourse,StudentPdfDownload,PlanPricing} from '@/types/student';
import api from '@/services/api';
type PageViewMode='login'|'register'|'dashboard';
type ActiveTab='overview'|'account'|'subscriptions'|'courses'|'pdfs';
interface StudentContextType {
 student:StudentProfile;subscription:SubscriptionInfo;courses:EnrolledCourse[];pdfs:StudentPdfDownload[];plans:PlanPricing[];
 activeTab:ActiveTab;setActiveTab:(v:ActiveTab)=>void;pageView:PageViewMode;setPageView:(v:PageViewMode)=>void;
 isLoggedIn:boolean;loading:boolean;error:string|null;
 register:(v:{fullName:string;email:string;phone:string;password:string})=>Promise<void>;
 login:(v:{identifier:string;password:string;rememberMe?:boolean})=>Promise<void>;
 logout:()=>Promise<void>;updateProfile:(v:Partial<StudentProfile>)=>Promise<{success:boolean;message:string}>;
 renewSubscription:(id:string)=>Promise<void>;isRenewModalOpen:boolean;setIsRenewModalOpen:(v:boolean)=>void;
 toastMessage:string|null;showToast:(v:string)=>void;downloadPdf:(id:string)=>Promise<void>;
}
const StudentContext=createContext<StudentContextType|undefined>(undefined);
const emptyStudent:StudentProfile={id:'',fullName:'',email:'',phone:'',grade:'grade_10',joinedAt:''};
function profile(u:any):StudentProfile{return {id:u._id||u.id,fullName:u.fullName,email:u.email,phone:u.phoneNumber,grade:u.gradePreference===11?'grade_11_sci':u.gradePreference===12?'grade_12_sci':'grade_10',joinedAt:(u.createdAt||'').slice(0,10)};}
const errorText=(e:any)=>e.response?.data?.error?.message||'تعذر الاتصال بالخادم، حاول مرة أخرى.';
export function StudentProvider({children}:{children:ReactNode}){
 const [student,setStudent]=useState(emptyStudent);
 const [subscription,setSubscription]=useState<SubscriptionInfo>({status:'none',previousPeriods:[]});
 const [courses,setCourses]=useState<EnrolledCourse[]>([]),[pdfs,setPdfs]=useState<StudentPdfDownload[]>([]),[plans,setPlans]=useState<PlanPricing[]>([]);
 const [activeTab,setActiveTab]=useState<ActiveTab>('overview');
 const [pageView,setView]=useState<PageViewMode>(location.pathname.includes('register')?'register':'login');
 const [isLoggedIn,setLogged]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null);
 const [isRenewModalOpen,setIsRenewModalOpen]=useState(false),[toastMessage,setToast]=useState<string|null>(null);
 function showToast(v:string){setToast(v);}
 function setPageView(v:PageViewMode){setView(v);history.replaceState(null,'',v==='dashboard'?'/dashboard':'/'+v);}
 async function refresh(){
  const me=await api.get('/user/me');setStudent(profile(me.data.data.user));setLogged(true);setPageView('dashboard');
  if(me.data.data.user.role==='Admin'){location.assign('/admin/dashboard');return;}
  const periods=me.data.data.subscriptions||[];
  const current=periods.find((p:any)=>new Date(p.startsAt)<=new Date()&&new Date(p.endsAt)>new Date());
  const historyRows=periods.map((p:any)=>({id:p._id,planName:p.planId?.title||'',amount:(p.planId?.amountMinor||0)/(p.planId?.currency==='KWD'?1000:100),currency:p.planId?.currency||'KWD',startsAt:p.startsAt,endsAt:p.endsAt,status:new Date(p.endsAt)>new Date()?'succeeded':'expired',orderId:p.paymentOrderId,date:p.startsAt}));
  setSubscription({status:current?'active':periods.length?'expired':'none',previousPeriods:historyRows,...(current?{currentPlan:{id:current.planId?._id,name:current.planId?.title||'',durationLabel:'',durationMonths:current.planId?.durationMonths||0,price:(current.planId?.amountMinor||0)/1000,currency:current.planId?.currency||'KWD',startsAt:current.startsAt,endsAt:current.endsAt,daysRemaining:Math.ceil((+new Date(current.endsAt)-Date.now())/86400000),orderReference:current.paymentOrderId}}:{})});
  const [cr,pd,pl]=await Promise.all([api.get('/courses'),api.get('/library/pdfs'),api.get('/plan/getActivePlans')]);
  setCourses(cr.data.data.map((c:any)=>({id:c._id,title:c.title,gradeName:c.grade?.name||'',gradeCode:'grade_10',totalLessons:c.lessonsCount||0,completedLessons:0,lastLessonTitle:'عرض الدروس',lastLessonId:'',thumbnailUrl:c.coverImage||c.thumbnail||'/diwaniya-logo-colored.png',accentColor:'blue',freeVideosCount:0})));
  setPdfs(pd.data.data.map((p:any)=>({id:p._id,title:p.title,category:'مذكرات شاملة',gradeName:'',size:'PDF',downloadUrl:'/library/pdfs/'+p._id+'/download'})));
  setPlans(pl.data.data.map((p:any)=>({id:p._id,name:p.title,durationMonths:p.durationMonths,periodLabel:p.durationMonths+' شهر',price:p.amountMinor/(p.currency==='KWD'?1000:100),currency:p.currency,features:[]})));
 }
 useEffect(()=>{let live=true;(async()=>{try{if(sessionStorage.getItem('token')||localStorage.getItem('token'))await refresh();}catch(e){if(live)setError(errorText(e));}finally{if(live)setLoading(false);}})();return()=>{live=false;};},[]);
 async function login(v:{identifier:string;password:string;rememberMe?:boolean}){
  try{const r=await api.post('/auth/login',v);localStorage.removeItem('token');sessionStorage.removeItem('token');(v.rememberMe?localStorage:sessionStorage).setItem('token',r.data.data.accessToken);setError(null);await refresh();}catch(e){throw new Error(errorText(e));}
 }
 async function register(v:{fullName:string;email:string;phone:string;password:string}){
  try{await api.post('/auth/register',{fullName:v.fullName,email:v.email,phoneNumber:v.phone.replace(/\s/g,''),password:v.password,confirmPassword:v.password,termsAccepted:true});await login({identifier:v.email,password:v.password});}catch(e){throw new Error(errorText(e));}
 }
 async function logout(){try{await api.post('/auth/logout');}catch(e){showToast(errorText(e));}finally{sessionStorage.removeItem('token');localStorage.removeItem('token');setLogged(false);setStudent(emptyStudent);setCourses([]);setPdfs([]);setPageView('login');}}
 async function updateProfile(v:Partial<StudentProfile>){try{const r=await api.patch('/user/me',{fullName:v.fullName,email:v.email,phoneNumber:v.phone?.replace(/\s/g,''),gradePreference:Number(v.grade?.split('_')[1]||10)});setStudent(profile(r.data.data.user));showToast('تم حفظ البيانات');return{success:true,message:'تم حفظ البيانات'};}catch(e){throw new Error(errorText(e));}}
 async function renewSubscription(id:string){try{await api.post('/payments/checkout',{planId:id});}catch(e){showToast(errorText(e));}}
 async function downloadPdf(id:string){try{const r=await api.get('/library/pdfs/'+id+'/download',{responseType:'blob'});const url=URL.createObjectURL(r.data);const a=document.createElement('a');a.href=url;a.download='document.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){showToast(errorText(e));}}
 return <StudentContext.Provider value={{student,subscription,courses,pdfs,plans,activeTab,setActiveTab,pageView,setPageView,isLoggedIn,loading,error,register,login,logout,updateProfile,renewSubscription,isRenewModalOpen,setIsRenewModalOpen,toastMessage,showToast,downloadPdf}}>{children}</StudentContext.Provider>;
}
export {StudentContext};

