import axios from 'axios';
export const API_BASE_URL=(import.meta.env.VITE_API_BASE_URL||'/api/v1').replace(/\/$/,'');
export const ASSET_BASE_URL=API_BASE_URL.replace(/\/api\/v1$/,'');
const api=axios.create({baseURL:API_BASE_URL,timeout:15000});
api.interceptors.request.use(config=>{
 const token=sessionStorage.getItem('token')||localStorage.getItem('token');
 if(token)config.headers.Authorization='Bearer '+token;else delete config.headers.Authorization;
 if(config.data instanceof FormData)delete config.headers['Content-Type'];
 return config;
});
api.interceptors.response.use(r=>r,error=>{
 if(error.response?.status===401){sessionStorage.removeItem('token');localStorage.removeItem('token');window.dispatchEvent(new Event('session-expired'));}
 window.dispatchEvent(new CustomEvent('api-error',{detail:error.response?.data?.error?.message||'تعذر الاتصال بالخادم. حاول مرة أخرى.'}));
 return Promise.reject(error);
});
export default api;
