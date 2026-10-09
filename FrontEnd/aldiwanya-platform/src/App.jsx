import {useEffect,useState} from 'react';
import AppRoutes from './routes/AppRoutes';
import './App.css';
export default function App(){const [error,setError]=useState('');useEffect(()=>{const handler=e=>setError(e.detail);window.addEventListener('api-error',handler);return()=>window.removeEventListener('api-error',handler);},[]);return <>{error&&<div role="alert" className="fixed bottom-4 left-4 max-w-[calc(100vw-2rem)] z-50 p-4 bg-red-900 text-white rounded"><span>{error}</span><button aria-label="إغلاق التنبيه" onClick={()=>setError('')} className="mr-4">×</button></div>}<AppRoutes/></>;}
