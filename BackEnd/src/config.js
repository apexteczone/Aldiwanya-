export function validateConfig() {
 if(!process.env.DB_URI) throw new Error('DB_URI is required');
 if(!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET)<32) throw new Error('JWT_SECRET must have at least 32 bytes');
 if(process.env.NODE_ENV==='production'&&!process.env.FRONTEND_URL) throw new Error('FRONTEND_URL required in production');
 const rounds=Number(process.env.SALT||12);
 if(!Number.isInteger(rounds)||rounds<(process.env.NODE_ENV==='test'?4:10)||rounds>15) throw new Error('SALT must be an appropriate bcrypt work factor');
 const hops=Number(process.env.TRUST_PROXY_HOPS||0);
 if(!Number.isInteger(hops)||hops<0||hops>5) throw new Error('Invalid trusted proxy count');
 const origins=(process.env.FRONTEND_URL||'http://localhost:5173').split(',').map(s=>s.trim());
 for(const value of origins) {
  const url=new URL(value);
  if(url.origin!==value || (process.env.NODE_ENV==='production' && url.protocol!=='https:')) throw new Error('FRONTEND_URL must contain explicit origins; HTTPS is required in production');
 }
 return {origins};
}

