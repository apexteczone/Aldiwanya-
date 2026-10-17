import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import {createServer} from 'node:http';
try {
 const {default:bootstrap}=await import('./src/app.js');
 const app=express();
 await bootstrap(app,express);
 const {attachRealtime}=await import('./src/Modules/User/realtime.js');
 const {startNotificationWorker}=await import('./src/Modules/User/notification.service.js');
 const server=createServer(app),io=attachRealtime(server),stopWorker=startNotificationWorker();
 server.listen(Number(process.env.PORT||5000),'0.0.0.0',()=>console.log('Aldiwanya API started'));
 for(const signal of ['SIGINT','SIGTERM']) process.once(signal,()=>{stopWorker();io.close(async()=>{await mongoose.disconnect();process.exit(0);});});
} catch { console.error('Startup failed. Check database and environment configuration.'); process.exitCode=1; }
