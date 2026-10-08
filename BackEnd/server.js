import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import bootstrap from './src/app.js';
try {
 const app=express();
 await bootstrap(app,express);
 const server=app.listen(Number(process.env.PORT||5000),'0.0.0.0',()=>console.log('Aldiwanya API started'));
 for(const signal of ['SIGINT','SIGTERM']) process.once(signal,()=>server.close(async()=>{await mongoose.disconnect();process.exit(0);}));
} catch { console.error('Startup failed. Check database and environment configuration.'); process.exitCode=1; }

