export function safeNext(value,fallback='/dashboard'){
 if(typeof value!=='string'||!/^\/(?:lessons|courses)\/[a-f\d]{24}(?:\?lesson=[a-f\d]{24})?$/i.test(value))return fallback;
 return value;
}
export function safeAuthNext(value){
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value)||/^\/(login|register|auth)(\/|\?|$)/.test(value))return '/dashboard';
 try{const url=new URL(value,window.location.origin);return url.origin===window.location.origin?url.pathname+url.search:'/dashboard';}catch{return '/dashboard';}
}
