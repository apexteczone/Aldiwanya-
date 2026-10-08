import {useState,useEffect} from 'react';
import {Navigate} from 'react-router-dom';
import api from '../../services/api';
export default function AdminGuard({children}){
 const [state,setState]=useState('loading');
 useEffect(()=>{let live=true;api.get('/user/me').then(r=>{if(live)setState(r.data.data.user.role==='Admin'?'allowed':'forbidden');}).catch(()=>{if(live)setState('login');});return()=>{live=false;};},[]);
 if(state==='loading')return <p role="status" className="p-8">جاري التحقق من الحساب…</p>;
 if(state==='login')return <Navigate to="/login" replace/>;
 if(state==='forbidden')return <p role="alert" className="p-8">ليس لديك صلاحية الدخول إلى لوحة الإدارة.</p>;
 return children;
}

