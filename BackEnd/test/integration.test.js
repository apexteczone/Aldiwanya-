import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import express from 'express';

// This suite never reads DB_URI from the environment or connects to production.
const dbName='aldiwanya_integration_'+crypto.randomBytes(8).toString('hex');
process.env.NODE_ENV='test';
process.env.DB_URI='mongodb://127.0.0.1:27028/'+dbName;
process.env.JWT_SECRET=crypto.randomBytes(48).toString('hex');
process.env.SALT='4';
process.env.FRONTEND_URL='http://localhost:5173';
process.env.UPLOAD_DIR=await fs.mkdtemp(path.join(os.tmpdir(),'aldiwanya-test-'));
const {default:bootstrap}=await import('../src/app.js');
const {default:User}=await import('../src/DB/models/User.js');
const {default:ResetToken}=await import('../src/DB/models/PasswordResetToken.js');
const {hash}=await import('../src/utils/hashing/hashing.js');
const {migrate}=await import('../src/DB/migrate.js');
const {createMyFatoorahClient}=await import('../src/Modules/Payment/myfatoorah.client.js');
let server,base,adminToken,studentToken,studentId,gradeId,courseId,moduleId,lessonId,freeLessonId,pdfId;
const password=crypto.randomBytes(18).toString('base64url');
async function request(method,route,body,token,headers={}){
 const h={...headers};if(token)h.Authorization='Bearer '+token;
 if(body!==undefined&&!(body instanceof FormData))h['Content-Type']='application/json';
 const response=await fetch(base+route,{method,headers:h,body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});
 const result=await response.json();return {status:response.status,...result};
}
before(async()=>{
 const app=express();await bootstrap(app,express);server=app.listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));base='http://127.0.0.1:'+server.address().port;
 await User.init();
 await User.create({fullName:'Integration Administrator',email:'admin@example.com',phoneNumber:'+96550000001',passwordHash:hash({plainText:password}),role:'Admin',termsAccepted:true});
 adminToken=(await request('POST','/api/v1/auth/login',{identifier:'admin@example.com',password})).data.accessToken;
});
after(async()=>{
 if(server)await new Promise(resolve=>server.close(resolve));
 assert.match(mongoose.connection.name,/^aldiwanya_integration_[a-f0-9]{16}$/);
 await mongoose.connection.dropDatabase();await mongoose.disconnect();
 // Only the uniquely created test directory is eligible for removal.
 assert.ok(process.env.UPLOAD_DIR.startsWith(path.join(os.tmpdir(),'aldiwanya-test-')));
 await fs.rm(process.env.UPLOAD_DIR,{recursive:true,force:true});
});
test('server readiness, registration validation and real authentication',async()=>{
 assert.equal((await request('GET','/health')).status,200);
 const user={fullName:'Integration Student',email:'student@example.com',phoneNumber:'+96550000002',password,confirmPassword:password,termsAccepted:true};
 assert.equal((await request('POST','/api/v1/auth/register',{...user,termsAccepted:false})).status,422);
 const r=await request('POST','/api/v1/auth/register',user);assert.equal(r.status,201,JSON.stringify(r));studentId=r.data.id;
 assert.equal((await request('POST','/api/v1/auth/register',user)).status,409);
 assert.equal((await request('POST','/api/v1/auth/login',{identifier:user.email,password:'wrong'})).status,401);
 const login=await request('POST','/api/v1/auth/login',{identifier:user.email,password});assert.equal(login.status,200);studentToken=login.data.accessToken;
 assert.equal((await request('GET','/api/v1/user/me',undefined,studentToken)).data.user.email,user.email);
 assert.equal((await request('PATCH','/api/v1/user/me',{role:'Admin'},studentToken)).status,422);
 assert.equal((await request('PATCH','/api/v1/user/me',{fullName:'Updated Student'},studentToken)).data.user.fullName,'Updated Student');
});
test('all admin reads reject students and anonymous callers',async()=>{
 for(const url of ['grades','courses','lessons','pdfs','modules','videos','students','payments','subscriptions','dashboard-stats']){
  assert.equal((await request('GET','/api/v1/admin/'+url)).status,401,url);
  assert.equal((await request('GET','/api/v1/admin/'+url,undefined,studentToken)).status,403,url);
 }
});
test('admin platform settings persist independently and reject unauthorized, unsafe or stale writes',async()=>{
 const {default:Settings}=await import('../src/DB/models/PlatformSettings.js');
 const path='/api/v1/admin/settings';
 assert.equal((await request('GET',path)).status,401);
 assert.equal((await request('GET',path,undefined,studentToken)).status,403);
 const original=(await request('GET',path,undefined,adminToken)).data;
 assert.equal(original.revision,0);assert.equal(original.general.platformName,'الديوانية');
 assert.equal(await Settings.countDocuments(),0); // Reading defaults never writes demo content.
 const general={...original.general,platformName:'منصة الاختبار',shortDescription:'وصف مختصر',description:'وصف كامل\nللاختبار فقط',websiteUrl:'https://example.com',contactEmail:'contact@example.com',phoneCountryCode:'+20',phoneNumber:'01012345678',address:'عنوان تجريبي'};
 assert.equal((await request('PATCH',path,{revision:0,general},studentToken)).status,403);
 const saved=await request('PATCH',path,{revision:0,general},adminToken);
 assert.equal(saved.status,200,JSON.stringify(saved));assert.equal(saved.data.revision,1);
 assert.equal((await request('GET',path,undefined,adminToken)).data.general.description,general.description);
 for(const websiteUrl of ['javascript:alert(1)','http://example.com','https://user:password@example.com']){
  assert.equal((await request('PATCH',path,{revision:1,general:{...general,websiteUrl}},adminToken)).status,422);
 }
 assert.equal((await request('PATCH',path,{revision:1,general:{...general,role:'Admin'}},adminToken)).status,422);
 assert.equal((await request('PATCH',path,{revision:1,general:{...general,contactEmail:'invalid'}},adminToken)).status,422);
 assert.equal((await request('PATCH',path,{revision:1,general:{...general,phoneNumber:'abc'}},adminToken)).status,422);
 const socialLinks={...original.socialLinks,facebook:'https://www.facebook.com/test',youtube:'https://youtube.com/@test',x:'https://x.com/test'};
 assert.equal((await request('PATCH',path,{revision:1,socialLinks:{...socialLinks,facebook:'https://facebook.com.attacker.example'}},adminToken)).status,422);
 const social=await request('PATCH',path,{revision:1,socialLinks},adminToken);
 assert.equal(social.status,200,JSON.stringify(social));assert.equal(social.data.general.platformName,general.platformName);
 assert.equal((await request('PATCH',path,{revision:1,general},adminToken)).status,409);
 const concurrent=await Promise.all(['الأولى','الثانية'].map(suffix=>request('PATCH',path,{revision:2,general:{...general,platformName:'منصة '+suffix}},adminToken)));
 assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409]);
 const latest=(await request('GET',path,undefined,adminToken)).data;
 assert.equal(latest.revision,3);assert.equal(latest.socialLinks.youtube,socialLinks.youtube);
 assert.equal((await request('PATCH',path,{revision:3,socialLinks:original.socialLinks},adminToken)).status,200);
 assert.equal((await request('GET',path,undefined,adminToken)).data.socialLinks.youtube,'');
 assert.equal(await Settings.countDocuments(),1);
 assert.equal((await request('GET','/api/v1/settings')).status,404);
});

test('grade, course, module and lesson share one canonical schema',async()=>{
 const grade=await request('POST','/api/v1/admin/grades/create',{name:'الصف الأول',status:'active'},adminToken);assert.equal(grade.status,201,JSON.stringify(grade));gradeId=grade.data?._id||grade.grade?._id;
 const course=await request('POST','/api/v1/admin/courses',{title:'Integration course',subject:'Math',grade:gradeId,status:'active'},adminToken);assert.equal(course.status,201,JSON.stringify(course));courseId=course.data._id;assert.equal(course.data.status,'published');
 const module=await request('POST','/api/v1/admin/modules/CreateModule',{title:'Module one',courseId},adminToken);assert.equal(module.status,201,JSON.stringify(module));moduleId=module.data._id;
 assert.equal((await request('PATCH','/api/v1/admin/modules/'+moduleId+'/publish',{},adminToken)).status,200);
 const lesson=await request('POST','/api/v1/admin/lessons',{youtubeUrl:'https://youtu.be/dQw4w9WgXcQ',title:'Module lesson',moduleId},adminToken);assert.equal(lesson.status,201,JSON.stringify(lesson));lessonId=lesson.data._id;assert.equal(lesson.data.courseId,courseId);
 assert.equal((await request('PATCH','/api/v1/admin/lessons/'+lessonId+'/publish',{},adminToken)).status,200);
 const detail=await request('GET','/api/v1/courses/'+courseId);assert.equal(detail.data.lessons.length,1);assert.equal(detail.data.modules[0].lessons.length,1);
 assert.equal((await request('DELETE','/api/v1/admin/courses/'+courseId,undefined,adminToken)).status,409);
 assert.equal((await request('DELETE','/api/v1/admin/modules/'+moduleId+'/delete',undefined,adminToken)).status,409);
});
test('admin creates a grade, course and direct lesson without a module',async()=>{
 const grade=await request('POST','/api/v1/admin/grades/create',{name:'Direct course grade'},adminToken);assert.equal(grade.status,201);
 const course=await request('POST','/api/v1/admin/courses',{title:'Direct course',grade:grade.data._id,status:'published'},adminToken);assert.equal(course.status,201);
 const lesson=await request('POST','/api/v1/admin/lessons',{youtubeUrl:'https://youtu.be/dQw4w9WgXcQ',title:'Direct lesson',courseId:course.data._id,status:'published'},adminToken);assert.equal(lesson.status,201);assert.equal(lesson.data.courseId,course.data._id);assert.equal(lesson.data.moduleId,undefined);
 const detail=await request('GET','/api/v1/courses/'+course.data._id);assert.ok(detail.data.lessons.some(l=>l._id===lesson.data._id));
 assert.equal((await request('POST','/api/v1/admin/lessons',{youtubeUrl:'https://youtu.be/dQw4w9WgXcQ',title:'Missing course'},adminToken)).status,422);
 assert.equal((await request('POST','/api/v1/admin/lessons',{youtubeUrl:'https://youtu.be/dQw4w9WgXcQ',title:'Unknown course',courseId:new mongoose.Types.ObjectId().toString()},adminToken)).status,404);
});
test('single lesson video access and publication are enforced on the server',async()=>{
 const free=await request('POST','/api/v1/admin/lessons',{courseId,title:'Free preview',youtubeUrl:'https://youtu.be/aqz-KE-bpKQ',isFreePreview:true,status:'published'},adminToken);
 assert.equal(free.status,201,JSON.stringify(free));freeLessonId=free.data._id;
 assert.equal(free.data.videoId,'aqz-KE-bpKQ');
 assert.equal((await request('GET','/api/v1/lessons/'+lessonId+'/playback')).status,401);
 assert.equal((await request('GET','/api/v1/lessons/'+lessonId+'/playback',undefined,studentToken)).status,403);
 const allowed=await request('GET','/api/v1/lessons/'+lessonId+'/playback',undefined,adminToken);
 assert.equal(allowed.status,200);assert.equal(allowed.data.videoId,'dQw4w9WgXcQ');
 const publicDetail=await request('GET','/api/v1/lessons/'+lessonId);
 assert.equal(publicDetail.data.lesson.videoId,undefined);assert.equal(publicDetail.data.lesson.hasVideo,true);
 const detail=await request('GET','/api/v1/courses/'+courseId);
 assert.ok(detail.data.lessons.every(l=>l.videoId===undefined&&l.internalNotes===undefined));
 assert.equal((await request('GET','/api/v1/admin/videos',undefined,adminToken)).status,404);
 await request('PATCH','/api/v1/admin/courses/'+courseId+'/hide',{},adminToken);
 assert.equal((await request('GET','/api/v1/courses/'+courseId)).status,404);
 assert.equal((await request('GET','/api/v1/lessons/'+freeLessonId+'/playback')).status,404);
 await request('PATCH','/api/v1/admin/courses/'+courseId+'/publish',{},adminToken);
});
test('public previews and student activity respect publication, identity and paid access',async()=>{
 const previews=await request('GET','/api/v1/previews');assert.equal(previews.status,200);assert.equal(previews.data.length,1);assert.equal(previews.data[0].courseId,courseId);assert.equal(previews.data[0].videoId,undefined);
 const playback=await request('GET','/api/v1/lessons/'+freeLessonId+'/playback');assert.equal(playback.status,200);assert.equal(playback.data.videoId,'aqz-KE-bpKQ');
 assert.equal((await request('GET','/api/v1/lessons/'+freeLessonId+'/playback',undefined,'invalid')).status,401);
 assert.equal((await request('PATCH','/api/v1/student/activity',{kind:'favorite',id:freeLessonId,enabled:true})).status,401);
 assert.equal((await request('PATCH','/api/v1/student/activity',{kind:'favorite',id:freeLessonId,enabled:true,userId:studentId},studentToken)).status,422);
 for(let i=0;i<2;i++)assert.equal((await request('PATCH','/api/v1/student/activity',{kind:'favorite',id:freeLessonId,enabled:true},studentToken)).status,200);
 let activity=await request('GET','/api/v1/student/activity',undefined,studentToken);
 assert.equal(activity.data.favoriteLessons.length,1);assert.equal(activity.data.favoriteLessons[0].videoId,undefined);
 assert.equal((await request('GET','/api/v1/student/activity',undefined,adminToken)).data.favoriteLessons.length,0);
 assert.equal((await request('PATCH','/api/v1/student/activity',{kind:'complete',id:lessonId,enabled:true},studentToken)).status,403);
 assert.equal((await request('PATCH','/api/v1/student/activity',{kind:'complete',id:freeLessonId,enabled:true},studentToken)).status,200);
 activity=await request('GET','/api/v1/student/activity',undefined,studentToken);assert.equal(activity.data.completedLessons.length,1);assert.ok(activity.data.startedCourses.includes(courseId));
 await request('PATCH','/api/v1/admin/lessons/'+freeLessonId+'/hide',{},adminToken);
 assert.equal((await request('GET','/api/v1/student/activity',undefined,studentToken)).data.completedLessons.length,0);
 assert.equal((await request('GET','/api/v1/previews')).data.length,0);
 assert.equal((await request('PATCH','/api/v1/student/activity',{kind:'complete',id:freeLessonId,enabled:true},studentToken)).status,404);
 await request('PATCH','/api/v1/admin/lessons/'+freeLessonId+'/publish',{},adminToken);
 await request('PATCH','/api/v1/admin/courses/'+courseId+'/hide',{},adminToken);
 assert.equal((await request('GET','/api/v1/previews')).data.length,0);
 assert.equal((await request('GET','/api/v1/student/activity',undefined,studentToken)).data.favoriteLessons.length,0);
 await request('PATCH','/api/v1/admin/courses/'+courseId+'/publish',{},adminToken);
 assert.equal((await request('PATCH','/api/v1/student/activity',{kind:'favorite',id:freeLessonId,enabled:false},studentToken)).status,200);
 assert.equal((await request('GET','/api/v1/student/activity',undefined,studentToken)).data.favoriteLessons.length,0);
 const courses=await request('GET','/api/v1/courses');assert.equal(courses.data.find(c=>c._id===courseId).lessonsCount,2);
});
test('monthly plans can be created from the dashboard without enabling checkout',async()=>{
 const monthly=await request('POST','/api/v1/plan/CreatePlan',{title:'Monthly test',durationMonths:1,amountMinor:1500,currency:'KWD'},adminToken);assert.equal(monthly.status,201,JSON.stringify(monthly));
 assert.ok((await request('GET','/api/v1/plan/getActivePlans')).data.some(p=>p.durationMonths===1));
});
test('PDF uploads are admin-only while library and static downloads are public',async()=>{
 const invalid=new FormData();invalid.set('file',new Blob(['<script>alert(1)</script>'],{type:'application/pdf'}),'bad.pdf');invalid.set('title','Bad PDF');invalid.set('course',courseId);
 assert.equal((await request('POST','/api/v1/admin/pdfs',invalid,adminToken)).status,422);
 const valid=new FormData();valid.set('file',new Blob(['%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'],{type:'application/pdf'}),'notes.pdf');valid.set('title','Free notes');valid.set('type','مذكرة');valid.set('course',courseId);valid.set('isFreePreview','true');
 const r=await request('POST','/api/v1/admin/pdfs',valid,adminToken);assert.equal(r.status,201,JSON.stringify(r));pdfId=r.data._id;
 const response=await fetch(base+'/api/v1/library/pdfs/'+pdfId+'/download',{headers:{Authorization:'Bearer '+studentToken}});assert.equal(response.status,200);assert.match(await response.text(),/^%PDF-/);
 await request('PATCH','/api/v1/admin/pdfs/'+pdfId,{isFreePreview:false},adminToken);
 const {default:PDF}=await import('../src/DB/models/PDF.js');
 await PDF.updateOne({_id:pdfId},{$set:{isFreePreview:false}}); // Older records must also remain public.
 const listing=await request('GET','/api/v1/library/pdfs');assert.equal(listing.status,200);assert.equal(listing.data.length,1);
 assert.equal(listing.data[0].isFreePreview,true);assert.match(listing.data[0].pdfUrl,/^\/uploads\/pdfs\/[^/]+\.pdf$/);
 const direct=await fetch(base+listing.data[0].pdfUrl);assert.equal(direct.status,200);assert.match(direct.headers.get('content-disposition'),/attachment/);assert.match(await direct.text(),/^%PDF-/);
 const anonymous=await fetch(base+'/api/v1/library/pdfs/'+pdfId+'/download');assert.equal(anonymous.status,200);await anonymous.arrayBuffer();
 assert.equal((await request('POST','/api/v1/admin/pdfs',{},studentToken)).status,403);
 assert.equal((await request('POST','/api/v1/admin/pdfs',{})).status,401);
 const traversal=await fetch(base+'/uploads/pdfs/%2e%2e%2fserver.js');assert.notEqual(traversal.status,200);await traversal.text();
});
test('CORS, malformed input and missing routes fail safely',async()=>{
 assert.equal((await request('GET','/api/v1/courses',undefined,undefined,{Origin:'https://untrusted.example'})).status,403);
 assert.equal((await request('POST','/api/v1/auth/login',{identifier:{$ne:null},password})).status,422);
 assert.equal((await request('GET','/api/v1/admin/courses/not-an-id',undefined,adminToken)).status,422);
 assert.equal((await request('GET','/api/v1/nonexistent')).status,404);
});
test('payments remain unavailable and never create subscriptions',async()=>{
 assert.equal((await request('GET','/api/v1/payments/capabilities')).data.checkoutEnabled,false);
 assert.equal((await request('POST','/api/v1/payments/checkout',{planId:new mongoose.Types.ObjectId().toString(),paymentMethodId:2,idempotencyKey:crypto.randomUUID()},studentToken)).status,503);
 assert.equal((await request('GET','/api/v1/library/subscriptions',undefined,studentToken)).data.length,0);
});
test('MyFatoorah adapter sends documented server requests, without making live calls',async()=>{
 const calls=[];const client=createMyFatoorahClient({apiKey:'test-only-not-a-secret',fetchImpl:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({IsSuccess:true,Data:{ok:true}})};}});
 await client.initiatePayment({amount:2.5});await client.executePayment({amount:2.5,paymentMethodId:2,reference:'test-order',callbackUrl:'https://example.com/return',errorUrl:'https://example.com/return'});await client.getPaymentStatus('test-payment');
 assert.equal(calls[0].url,'https://apitest.myfatoorah.com/v2/InitiatePayment');assert.deepEqual(JSON.parse(calls[0].options.body),{InvoiceAmount:2.5,CurrencyIso:'KWD'});assert.equal(calls[1].options.method,'POST');assert.deepEqual(JSON.parse(calls[2].options.body),{Key:'test-payment',KeyType:'PaymentId'});
 await assert.rejects(()=>createMyFatoorahClient({apiKey:''}).initiatePayment({amount:1}),/not configured/);
 assert.throws(()=>createMyFatoorahClient({baseUrl:'https://attacker.example'}),/Unsupported/);
});
test('legacy data migration defaults to read-only and is idempotent',async()=>{
 const oldCourse=new mongoose.Types.ObjectId(),oldModule=new mongoose.Types.ObjectId(),oldLesson=new mongoose.Types.ObjectId();
 await mongoose.connection.db.collection('courses').insertOne({_id:oldCourse,title:'Old course',grade:10,status:'active'});
 await mongoose.connection.db.collection('modules').insertOne({_id:oldModule,title:'Old module',courseId:oldCourse,status:'published'});
 await mongoose.connection.db.collection('lessons').insertOne({_id:oldLesson,title:'Old lesson',moduleId:oldModule,status:'published'});
 const dry=await migrate();assert.equal(dry.applied,false);assert.equal((await mongoose.connection.db.collection('courses').findOne({_id:oldCourse})).grade,10);
 const migrated=await migrate({apply:true});assert.equal(migrated.applied,true);assert.equal((await mongoose.connection.db.collection('lessons').findOne({_id:oldLesson})).courseId.toString(),oldCourse.toString());
 const again=await migrate({apply:true});assert.equal(again.courses,0);assert.equal(again.lessons,0);
 assert.equal((await request('GET','/api/v1/courses/'+oldCourse)).status,200);
});
test('existing subscription unlocks paid content and appears in the profile',async()=>{
 const {default:Plan}=await import('../src/DB/models/Plan.js');
 const {default:Payment}=await import('../src/DB/models/Payment.js');
 const {default:Subscription}=await import('../src/DB/models/Subscription.js');
 const plan=await Plan.create({title:'Test subscription',durationMonths:3,amountMinor:2500,currency:'KWD'});
 const payment=await Payment.create({user_id:studentId,plan_id:plan._id,price_snapshot:2.5,duration_snapshot:3,currency:'KWD',status:'succeeded'});
 const subscription=await Subscription.create({userId:studentId,planId:plan._id,paymentOrderId:payment._id,startsAt:new Date(Date.now()-60000),endsAt:new Date(Date.now()+60000)});
 assert.equal((await request('GET','/api/v1/user/me',undefined,studentToken)).data.subscriptions[0].planId.title,plan.title);
 assert.equal((await request('GET','/api/v1/lessons/'+lessonId+'/playback',undefined,studentToken)).status,200);
 const paidPdf=await fetch(base+'/api/v1/library/pdfs/'+pdfId+'/download',{headers:{Authorization:'Bearer '+studentToken}});
 assert.equal(paidPdf.status,200);await paidPdf.arrayBuffer();
 const payments=await request('GET','/api/v1/admin/payments',undefined,adminToken);assert.equal(payments.data[0].status,'success');assert.equal(payments.data[0].amountValue,2.5);
 const subscriptions=await request('GET','/api/v1/admin/subscriptions',undefined,adminToken);assert.equal(subscriptions.data[0].student,'Updated Student');
 await Subscription.updateOne({_id:subscription._id},{$set:{endsAt:new Date(Date.now()-1000)}});
 const stillFree=await fetch(base+'/api/v1/library/pdfs/'+pdfId+'/download');assert.equal(stillFree.status,200);await stillFree.arrayBuffer();
 assert.equal((await request('GET','/api/v1/lessons/'+lessonId+'/playback',undefined,studentToken)).status,403);
});
test('built frontend serves direct routes while unknown API routes remain JSON',async()=>{
 process.env.SERVE_FRONTEND='true';
 const app=express();await bootstrap(app,express,{connect:false});
 const site=app.listen(0,'127.0.0.1');await new Promise(resolve=>site.once('listening',resolve));
 const origin='http://127.0.0.1:'+site.address().port;
 try {
  for(const route of ['/','/dashboard','/admin/courses','/library','/courses','/login','/register','/forgot-password','/reset-password','/plans','/previews','/account','/subscriptions']) {
   const r=await fetch(origin+route,{headers:{Accept:'text/html'}});
   assert.equal(r.headers.get('referrer-policy'),'strict-origin-when-cross-origin');
   assert.equal(r.status,200);assert.match(await r.text(),/<div id="root">/);
  }
  const api=await fetch(origin+'/api/v1/not-found',{headers:{Accept:'text/html'}});
  assert.equal(api.status,404);assert.match(api.headers.get('content-type'),/application\/json/);
 } finally {await new Promise(resolve=>site.close(resolve));delete process.env.SERVE_FRONTEND;}
});
test('local admin seed is repeatable, never overwrites accounts and rejects remote demo credentials',async()=>{
 const {LOCAL_ADMIN,getAdminSeedConfig,seedAdmin}=await import('../src/DB/seed.js');
 const local={NODE_ENV:'test',DB_URI:process.env.DB_URI,ADMIN_EMAIL:'seed-admin@example.com'};
 assert.equal(getAdminSeedConfig(local).password,LOCAL_ADMIN.password);
 assert.throws(()=>getAdminSeedConfig({...local,NODE_ENV:'production'}),/Set ADMIN/);
 assert.throws(()=>getAdminSeedConfig({...local,DB_URI:'mongodb://db.example.com/aldiwanya'}),/Set ADMIN/);
 assert.throws(()=>getAdminSeedConfig({...local,NODE_ENV:'production',ADMIN_PASSWORD:LOCAL_ADMIN.password,ADMIN_PHONE:LOCAL_ADMIN.phoneNumber}),/demo password/);
 assert.equal((await seedAdmin(local)).created,true);
 const account=await User.findOne({email:local.ADMIN_EMAIL}).select('+passwordHash');assert.equal(account.role,'Admin');
 const originalHash=account.passwordHash;
 assert.equal((await seedAdmin({...local,ADMIN_PASSWORD:'ChangedSeedOnly!2026'})).created,false);
 assert.equal((await User.findById(account._id).select('+passwordHash')).passwordHash,originalHash);
 await assert.rejects(()=>seedAdmin({...local,ADMIN_EMAIL:'student@example.com'}),/another account/);
 assert.equal((await User.findById(studentId)).role,'Student');
});
test('admin password controller verifies current password, revokes sessions and reset tokens',async()=>{
 const {LOCAL_ADMIN}=await import('../src/DB/seed.js');
 const login=await request('POST','/api/v1/auth/login',{identifier:'seed-admin@example.com',password:LOCAL_ADMIN.password});assert.equal(login.status,200);
 const token=login.data.accessToken;
 const account=await User.findOne({email:'seed-admin@example.com'});
 await ResetToken.create({userId:account._id,tokenHash:crypto.randomBytes(32).toString('hex'),expiresAt:new Date(Date.now()+60000)});
 const nextPassword=crypto.randomBytes(18).toString('base64url');
 const body={currentPassword:LOCAL_ADMIN.password,newPassword:nextPassword,confirmPassword:nextPassword};
 assert.equal((await request('PATCH','/api/v1/admin/password',body)).status,401);
 assert.equal((await request('PATCH','/api/v1/admin/password',body,studentToken)).status,403);
 assert.equal((await request('PATCH','/api/v1/admin/password',{...body,userId:studentId},token)).status,422);
 assert.equal((await request('PATCH','/api/v1/admin/password',{...body,currentPassword:'incorrect'},token)).status,400);
 assert.equal((await request('PATCH','/api/v1/admin/password',{...body,newPassword:'short',confirmPassword:'short'},token)).status,422);
 assert.equal((await request('PATCH','/api/v1/admin/password',{...body,confirmPassword:'mismatched'},token)).status,422);
 assert.equal((await request('PATCH','/api/v1/admin/password',{...body,newPassword:LOCAL_ADMIN.password,confirmPassword:LOCAL_ADMIN.password},token)).status,422);
 const result=await request('PATCH','/api/v1/admin/password',body,token);assert.equal(result.status,200,JSON.stringify(result));assert.equal(JSON.stringify(result).includes(nextPassword),false);
 assert.equal(await ResetToken.countDocuments({userId:account._id}),0);
 assert.equal((await request('GET','/api/v1/user/me',undefined,token)).status,401);
 assert.equal((await request('POST','/api/v1/auth/login',{identifier:account.email,password:LOCAL_ADMIN.password})).status,401);
 assert.equal((await request('POST','/api/v1/auth/login',{identifier:account.email,password:nextPassword})).status,200);
});
test('password reset consumes the token once and revokes existing sessions',async()=>{
 const token=crypto.randomBytes(32).toString('hex'),nextPassword=crypto.randomBytes(18).toString('base64url');
 await ResetToken.create({userId:studentId,tokenHash:crypto.createHash('sha256').update(token).digest('hex'),expiresAt:new Date(Date.now()+60000)});
 const body={token,newPassword:nextPassword,confirmPassword:nextPassword};
 const reset=await request('POST','/api/v1/auth/reset-password',body);assert.equal(reset.status,200,JSON.stringify(reset));
 assert.equal((await request('POST','/api/v1/auth/reset-password',body)).status,400);
 assert.equal((await request('GET','/api/v1/user/me',undefined,studentToken)).status,401);
 const login=await request('POST','/api/v1/auth/login',{identifier:'student@example.com',password:nextPassword});assert.equal(login.status,200);studentToken=login.data.accessToken;
 assert.equal((await request('POST','/api/v1/auth/logout',{},studentToken)).status,200);
 assert.equal((await request('GET','/api/v1/user/me',undefined,studentToken)).status,401);
});

test('admin reference forms preserve private notes, ordering, uploads and plan descriptions',async()=>{
 await User.create({fullName:'Reference Student',email:'reference@example.com',phoneNumber:'+96550000088',passwordHash:hash({plainText:password}),role:'Student',termsAccepted:true});
 const referenceStudentToken=(await request('POST','/api/v1/auth/login',{identifier:'reference@example.com',password})).data.accessToken;
 const created=await request('POST','/api/v1/admin/lessons',{youtubeUrl:'https://youtu.be/dQw4w9WgXcQ',title:'Reference lesson',courseId,position:7,description:'Public description',internalNotes:'Internal staff-only note',status:'published'},adminToken);
 assert.equal(created.status,201,JSON.stringify(created));const id=created.data._id;assert.equal(created.data.position,7);
 const adminRows=await request('GET','/api/v1/admin/lessons',undefined,adminToken);assert.equal(adminRows.data.find(l=>l._id===id).internalNotes,'Internal staff-only note');
 const publicLesson=await request('GET','/api/v1/lessons/'+id);assert.equal(publicLesson.data.lesson.internalNotes,undefined);
 const publicCourse=await request('GET','/api/v1/courses/'+courseId);assert.equal(publicCourse.data.lessons.find(l=>l._id===id).internalNotes,undefined);
 assert.equal((await request('PATCH','/api/v1/admin/lessons/'+id,{position:2,internalNotes:'Updated note'},adminToken)).status,200);
 assert.equal((await request('PATCH','/api/v1/admin/lessons/'+id,{position:-1},adminToken)).status,422);
 const data=new FormData();data.set('title','Reference updated lesson');data.set('youtubeUrl','https://www.youtube.com/watch?v=aqz-KE-bpKQ');data.set('description','Video description');
 data.set('thumbnail',new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXioAAAAASUVORK5CYII=','base64')],{type:'image/png'}),'thumb.png');
 const updated=await request('PATCH','/api/v1/admin/lessons/'+id,data,adminToken);
 assert.equal(updated.status,200,JSON.stringify(updated));assert.match(updated.data.thumbnailUrl,/^\/uploads\/images\/.+\.png$/);assert.equal(updated.data.description,'Video description');assert.equal(updated.data.videoId,'aqz-KE-bpKQ');
 assert.equal((await request('GET','/api/v1/lessons/'+id+'/playback')).status,401);
 assert.equal((await request('PATCH','/api/v1/admin/lessons/'+id,{youtubeUrl:'javascript:alert(1)'},adminToken)).status,422);
 assert.equal((await request('PATCH','/api/v1/admin/lessons/'+id,{youtubeUrl:'https://youtu.be/aqz-KE-bpKQ'},referenceStudentToken)).status,403);
 const invalid=new FormData();invalid.set('title','Bad upload');invalid.set('courseId',courseId);invalid.set('youtubeUrl','https://youtu.be/aqz-KE-bpKQ');invalid.set('thumbnail',new Blob(['<svg onload="alert(1)"></svg>'],{type:'image/png'}),'fake.png');assert.equal((await request('POST','/api/v1/admin/lessons',invalid,adminToken)).status,422);
 assert.equal((await request('DELETE','/api/v1/admin/lessons/'+id,undefined,adminToken)).status,200);
 const plan=await request('POST','/api/v1/plan/CreatePlan',{title:'Six month term',durationMonths:6,amountMinor:1500,currency:'KWD',description:'Term description'},adminToken);assert.equal(plan.status,201,JSON.stringify(plan));
 assert.equal((await request('PATCH','/api/v1/plan/'+plan.data._id+'/update',{description:'Edited term'},adminToken)).data.description,'Edited term');
 assert.equal((await request('POST','/api/v1/plan/CreatePlan',{title:'Invalid duration',durationMonths:2,amountMinor:1500,currency:'KWD'},adminToken)).status,422);
});

test('video embeds use only trusted provider URLs',async()=>{
 const {videoSource}=await import('../../FrontEnd/aldiwanya-platform/src/utils/videoSource.js');
 assert.equal(videoSource('javascript:alert(1)'),null);
 assert.equal(videoSource('https://youtube.com/watch?v=invalid'),null);
 assert.equal(videoSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ').src,'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
 assert.equal(videoSource('https://youtu.be/dQw4w9WgXcQ').kind,'embed');
 assert.equal(videoSource('https://vimeo.com/123456/abc123').src,'https://player.vimeo.com/video/123456?h=abc123');
 assert.equal(videoSource('https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ').kind,'file');
});

test('Mayar URL extraction validates hosts, formats and keeps private IDs out of catalogs',async()=>{
 const {extractYouTubeVideoId}=await import('../src/Modules/Lesson/youtube.js');
 const {youtubeId}=await import('../../FrontEnd/aldiwanya-platform/src/utils/videoSource.js');
 for(const url of ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30','https://youtu.be/dQw4w9WgXcQ?si=share','https://m.youtube.com/shorts/dQw4w9WgXcQ','https://youtube.com/live/dQw4w9WgXcQ','https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ']){
  assert.equal(extractYouTubeVideoId(url),'dQw4w9WgXcQ');assert.equal(youtubeId(url),'dQw4w9WgXcQ');
 }
 for(const url of ['http://youtu.be/dQw4w9WgXcQ','https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ','https://evil.test@youtube.com/watch?v=dQw4w9WgXcQ','https://youtube.com:444/watch?v=dQw4w9WgXcQ','https://youtube.com/channel/dQw4w9WgXcQ','https://youtu.be/short','https://vimeo.com/123456']){
  assert.throws(()=>extractYouTubeVideoId(url));assert.equal(youtubeId(url),null);
 }
 assert.equal((await request('POST','/api/v1/admin/lessons',{title:'Missing video',courseId},adminToken)).status,422);
 const mayar=await request('POST','/api/v1/admin/lessons/CreateLessonWithVideo',{title:'Mayar alias',courseId,youtubeUrl:'https://youtube.com/live/dQw4w9WgXcQ'},adminToken);
 assert.equal(mayar.status,201);assert.equal(mayar.data.videoId,'dQw4w9WgXcQ');
 const bad=await request('PATCH','/api/v1/admin/lessons/'+mayar.data._id,{videoId:'aqz-KE-bpKQ'},adminToken);assert.equal(bad.status,422);
 assert.equal((await request('GET','/api/v1/lessons/'+mayar.data._id+'/playback',undefined,adminToken)).status,404);
});

test('legacy video migration preserves records and refuses ambiguous or unsupported data',async()=>{
 const {migrateLessonVideos}=await import('../src/DB/migrate-lesson-videos.js');
 const db=mongoose.connection.db,lesson=new mongoose.Types.ObjectId(),video=new mongoose.Types.ObjectId(),duplicate=new mongoose.Types.ObjectId();
 await db.collection('lessons').insertOne({_id:lesson,courseId:new mongoose.Types.ObjectId(courseId),title:'Legacy video lesson',status:'published'});
 await db.collection('videos').insertOne({_id:video,lessonId:lesson,title:'Preserved legacy title',videoUrl:'https://youtu.be/aqz-KE-bpKQ',accessLevel:'free',status:'published',processingStatus:'ready',durationSeconds:60});
 await db.collection('studentactivities').updateOne({userId:new mongoose.Types.ObjectId(studentId)},{$addToSet:{favoriteVideos:video}},{upsert:true});
 const dry=await migrateLessonVideos();assert.equal(dry.videos,1);assert.equal(dry.applied,false);assert.equal((await db.collection('lessons').findOne({_id:lesson})).videoId,undefined);
 await db.collection('videos').insertOne({_id:duplicate,lessonId:lesson,videoUrl:'https://youtu.be/dQw4w9WgXcQ'});
 assert.equal((await migrateLessonVideos({apply:true})).problems[0].reason,'multiple_videos_require_manual_review');
 assert.equal((await db.collection('lessons').findOne({_id:lesson})).videoId,undefined);
 await db.collection('videos').deleteOne({_id:duplicate}); // Only test-created duplicate.
 await db.collection('videos').updateOne({_id:video},{$set:{videoUrl:'https://vimeo.com/123456'}});
 assert.equal((await migrateLessonVideos({apply:true})).problems[0].reason,'unsupported_video_url');
 await db.collection('videos').updateOne({_id:video},{$set:{videoUrl:'https://youtu.be/aqz-KE-bpKQ'}});
 assert.equal((await migrateLessonVideos({apply:true})).applied,true);
 const result=await db.collection('lessons').findOne({_id:lesson});
 assert.equal(result.videoId,'aqz-KE-bpKQ');assert.equal(result.isFreePreview,true);assert.equal(result.title,'Legacy video lesson');
 assert.ok(await db.collection('lesson_video_migration_backups').findOne({_id:lesson}));
 assert.ok(await db.collection('videos').findOne({_id:video}));
 assert.ok((await db.collection('studentactivities').findOne({userId:new mongoose.Types.ObjectId(studentId)})).favoriteLessons.some(id=>id.equals(lesson)));
 assert.equal((await migrateLessonVideos({apply:true})).videos,0);
});

test('payment API adapter handles rejection, unknown responses and recovery without live gateway calls',async(t)=>{
 const {createPaymentService}=await import('../src/Modules/Payment/payment.service.js');
 const {paymentConfig,paymentConfigurationIssues}=await import('../src/Modules/Payment/payment.config.js');
 const {default:Payment}=await import('../src/DB/models/Payment.js');
 const {default:Subscription}=await import('../src/DB/models/Subscription.js');
 const {default:Plan}=await import('../src/DB/models/Plan.js');
 const user=await User.create({fullName:'Contract test student',email:'contract@example.com',phoneNumber:'+96550000092',passwordHash:hash({plainText:password}),role:'Student',termsAccepted:true});
 const plan=await Plan.findOne({durationMonths:1});
 const env={PAYMENTS_ENABLED:'true',MYFATOORAH_API_KEY:'contract-test-key',MYFATOORAH_WEBHOOK_SECRET:'contract-test-secret',PAYMENT_FRONTEND_URL:'https://web.example',PAYMENT_PUBLIC_API_URL:'https://api.example'};
 const config=paymentConfig(env);
 let mode='reject',invoice,executions=0,methodData;
 const client=createMyFatoorahClient({apiKey:env.MYFATOORAH_API_KEY,fetchImpl:async(url,options)=>{
   assert.equal(options.method,'POST');assert.equal(options.redirect,'error');assert.ok(options.signal);
   assert.equal(options.headers.Authorization,'Bearer '+env.MYFATOORAH_API_KEY);
   const body=JSON.parse(options.body);
   const response=(data,status=200,success=true)=>({ok:status===200,status,json:async()=>({IsSuccess:success,Data:data})});
   if(url.endsWith('/InitiatePayment')){
    assert.deepEqual(body,{InvoiceAmount:plan.amountMinor/1000,CurrencyIso:'KWD'});
    return response(methodData||{PaymentMethods:[{PaymentMethodId:2,PaymentMethodAr:'بطاقة',IsDirectPayment:false}]});
   }
   if(url.endsWith('/ExecutePayment')){
    executions++;
    assert.equal(body.InvoiceValue,plan.amountMinor/1000);assert.equal(body.PaymentMethodId,2);
    assert.equal(body.CustomerReference,body.CustomerIdentifier);assert.equal(body.UserDefinedField,body.CustomerReference);
    assert.equal(body.CustomerEmail,user.email);assert.equal(body.CustomerName,user.fullName);
    assert.equal(body.DisplayCurrencyIso,'KWD');assert.equal(body.Language,'ar');
    assert.equal(body.CallBackUrl,'https://web.example/payment/return?orderId='+body.CustomerReference);
    assert.equal(body.ErrorUrl,body.CallBackUrl);assert.equal(body.WebhookUrl,'https://api.example/api/v1/payments/webhook');
    if(mode==='reject')return response(null,400,false);
    invoice={InvoiceId:800000+executions,InvoiceStatus:'Pending',InvoiceValue:body.InvoiceValue,InvoiceDisplayValue:body.InvoiceValue.toFixed(3)+' KD',CustomerReference:body.CustomerReference,CustomerEmail:body.CustomerEmail,InvoiceTransactions:[]};
    if(mode==='timeout')throw new Error('simulated network interruption');
    if(mode==='5xx')return response(null,500,false);
    if(mode==='malformed')return {ok:true,status:200,json:async()=>{throw new SyntaxError('malformed');}};
    return response({InvoiceId:invoice.InvoiceId,PaymentURL:'https://demo.myfatoorah.com/pay/'+invoice.InvoiceId});
   }
   assert.equal(url,'https://apitest.myfatoorah.com/v2/GetPaymentStatus');
   assert.ok(['CustomerReference','InvoiceId','PaymentId'].includes(body.KeyType));
   const expected=body.KeyType==='CustomerReference'?invoice.CustomerReference:body.KeyType==='InvoiceId'?String(invoice.InvoiceId):invoice.InvoiceTransactions[0].PaymentId;
   assert.equal(body.Key,expected);
   return response(structuredClone(invoice));
 }});
 const service=createPaymentService({client,config});
 const payload=()=>({planId:String(plan._id),paymentMethodId:2,idempotencyKey:crypto.randomUUID(),returnTo:'/lessons/'+lessonId});
 async function pay(order){invoice.InvoiceStatus='Paid';invoice.InvoiceTransactions=[{PaymentId:'contract-'+invoice.InvoiceId,TransactionStatus:'Succss'}];return service.reconcile(await Payment.findById(order.id));}
 await t.test('configuration check does not enable incomplete or incompatible sandbox configuration',async()=>{
  assert.equal(config.enabled,true);assert.deepEqual(paymentConfigurationIssues(env),[]);
  assert.equal(paymentConfig({...env,MYFATOORAH_WEBHOOK_SECRET:''}).enabled,false);
  assert.equal(paymentConfig({...env,MYFATOORAH_BASE_CURRENCY:'EGP'}).enabled,false);
  assert.equal(paymentConfig({...env,MYFATOORAH_BASE_URL:'https://untrusted.example'}).enabled,false);
  assert.equal(paymentConfig({...env,PAYMENT_FRONTEND_URL:'http://localhost:5173'}).enabled,false);
  assert.deepEqual(paymentConfigurationIssues({...env,MYFATOORAH_API_KEY:'',MYFATOORAH_WEBHOOK_SECRET:''}),['MYFATOORAH_API_KEY','MYFATOORAH_WEBHOOK_SECRET']);
 });
 await t.test('definitive rejected invoice releases the open order; retries of the same key stay idempotent',async()=>{
  const input=payload(),failed=await service.checkout(user,input),count=executions;
  assert.equal(failed.status,'failed');assert.equal(failed.lastAttempt,'failed');assert.equal(await service.openOrderFor(user),null);
  assert.equal((await service.reconcile(await Payment.findById(failed.id))).status,'failed');
  assert.equal(String((await service.checkout(user,input)).id),String(failed.id));assert.equal(executions,count);
  mode='ok';const next=await service.checkout(user,payload());assert.equal(next.status,'pending');
  assert.notEqual(String(next.id),String(failed.id));assert.equal((await pay(next)).status,'succeeded');
  assert.equal(await Subscription.countDocuments({paymentOrderId:next.id}),1);
 });
 await t.test('timeouts, server errors and unreadable responses never generate a second invoice on retry',async()=>{
  for(mode of ['timeout','5xx','malformed']){
   const input=payload(),order=await service.checkout(user,input),count=executions;
   assert.equal(order.status,'created');assert.equal(order.lastAttempt,'unknown');assert.equal(order.checkoutUrl,null);
   assert.equal(String((await service.checkout(user,payload())).id),String(order.id));assert.equal(executions,count);
   assert.equal((await pay(order)).status,'succeeded');assert.equal(await Subscription.countDocuments({paymentOrderId:order.id}),1);
  }
 });
 await t.test('malformed provider status cannot activate access or overwrite a pending order',async()=>{
  mode='ok';const order=await service.checkout(user,payload()),row=await Payment.findById(order.id);
  const count=await Subscription.countDocuments({userId:user._id});
  invoice.InvoiceStatus='Unknown';await assert.rejects(()=>service.reconcile(row),{cause:502});
  invoice.InvoiceStatus='Paid';invoice.InvoiceTransactions={};await assert.rejects(()=>service.reconcile(row),{cause:502});
  invoice.InvoiceTransactions=[null];await assert.rejects(()=>service.reconcile(row),{cause:502});
  assert.equal((await Payment.findById(row._id)).status,'pending');assert.equal(await Subscription.countDocuments({userId:user._id}),count);
  assert.equal((await pay(order)).status,'succeeded');
 });
 await t.test('invalid payment methods fail safely and direct/unknown methods are never offered',async()=>{
  methodData={PaymentMethods:{}};await assert.rejects(()=>service.methods(plan._id),{cause:502});
  methodData={PaymentMethods:[null,{PaymentMethodId:-1,IsDirectPayment:false},{PaymentMethodId:3,IsDirectPayment:true},{PaymentMethodId:4},{PaymentMethodId:2,IsDirectPayment:false}]};
  assert.deepEqual((await service.methods(plan._id)).map(m=>m.id),[2]);
 });
});

test('MyFatoorah checkout, signed settlement and recovery use real database records with an isolated provider double',async(t)=>{
 const {createPaymentService,signaturePayload,addCalendarMonths}=await import('../src/Modules/Payment/payment.service.js');
 const {paymentConfig,safeReturnPath,safePaymentUrl}=await import('../src/Modules/Payment/payment.config.js');
 const {default:Payment}=await import('../src/DB/models/Payment.js');
 const {default:Subscription}=await import('../src/DB/models/Subscription.js');
 const {default:Plan}=await import('../src/DB/models/Plan.js');
 const {default:PaymentLock}=await import('../src/DB/models/PaymentLock.js');
 const {default:PaymentEvent}=await import('../src/DB/models/paymentEvent.js');
 await Promise.all([Payment.init(),Subscription.init(),PaymentLock.init(),PaymentEvent.init()]);
 const user=await User.create({fullName:'Payment test student',email:'payment@example.com',phoneNumber:'+96550000091',passwordHash:hash({plainText:password}),role:'Student',termsAccepted:true});
 const token=(await request('POST','/api/v1/auth/login',{identifier:user.email,password})).data.accessToken;
 const plan=await Plan.findOne({durationMonths:1});
 const invoices=new Map();let executions=0,statusCalls=0,timeoutNext=false;
 const secret=crypto.randomBytes(32).toString('hex');
 const config={enabled:true,configured:true,sandbox:true,currency:'KWD',frontendOrigin:'https://test.example',apiOrigin:'https://api.test.example',webhookSecret:secret};
 const client={
  initiatePayment:async()=>({PaymentMethods:[{PaymentMethodId:2,PaymentMethodAr:'بطاقة اختبار',IsDirectPayment:false},{PaymentMethodId:3,IsDirectPayment:true}]}),
  executePayment:async args=>{
   executions++;const invoiceId=String(100000+executions);
   assert.equal(args.currency,'KWD');assert.match(args.callbackUrl,/^https:\/\/test.example\/payment\/return\?orderId=[a-f0-9]{24}$/);
   assert.equal(args.webhookUrl,'https://api.test.example/api/v1/payments/webhook');
   invoices.set(args.reference,{InvoiceId:Number(invoiceId),InvoiceStatus:'Pending',CustomerReference:args.reference,InvoiceValue:args.amount,InvoiceDisplayValue:args.amount.toFixed(3)+' KD',CustomerEmail:args.customerEmail,InvoiceTransactions:[]});
   if(timeoutNext){timeoutNext=false;throw new Error('Simulated ambiguous timeout after provider created invoice');}
   return {InvoiceId:Number(invoiceId),PaymentURL:'https://demo.myfatoorah.com/pay/'+invoiceId};
  },
  getPaymentStatus:async(key,type='PaymentId')=>{
   statusCalls++;const invoice=[...invoices.values()].find(i=>type==='CustomerReference'?i.CustomerReference===String(key):type==='InvoiceId'?String(i.InvoiceId)===String(key):i.InvoiceTransactions.some(p=>p.PaymentId===String(key)));
   if(!invoice)throw new Error('Unknown provider invoice',{cause:502});
   return structuredClone(invoice);
  },
 };
 const service=createPaymentService({client,config});
 const app=express();await bootstrap(app,express,{connect:false,paymentOptions:{client,config}});
 const site=app.listen(0,'127.0.0.1');await new Promise(resolve=>site.once('listening',resolve));
 const oldBase=base;base='http://127.0.0.1:'+site.address().port;
 let order,invoice;
 function signedBody(i){
  const body={Event:{Code:1,Reference:'unsigned-reference'},Data:{Invoice:{Id:String(i.InvoiceId),Status:'PAID',ExternalIdentifier:i.CustomerReference},Transaction:{Status:'SUCCESS',PaymentId:i.InvoiceTransactions[0].PaymentId}}};
  return {body,signature:crypto.createHmac('sha256',secret).update(signaturePayload(body.Data)).digest('base64')};
 }
 function paid(i){i.InvoiceStatus='Paid';i.InvoiceTransactions=[{PaymentId:'pay-'+i.InvoiceId,TransactionStatus:'Succss'}];}
 try{
  await t.test('checkout uses server prices, rejects injected fields and creates one invoice under retries',async()=>{
   const {verifyPaymentIndexes}=await import('../src/Modules/Payment/payment.service.js');
   await verifyPaymentIndexes();
   await Payment.collection.dropIndex('open_user_id_1');
   try{await assert.rejects(()=>verifyPaymentIndexes(),/Required payment index is missing/);}
   finally{await Payment.createIndexes();}
   assert.equal(paymentConfig({PAYMENTS_ENABLED:'true',MYFATOORAH_API_KEY:'test'}).enabled,false);
   assert.equal(safeReturnPath('//evil.example'),'/dashboard');assert.equal(safePaymentUrl('https://myfatoorah.com.evil.test/pay'),null);
   assert.equal((await request('POST','/api/v1/payments/checkout',{})).status,401);
   assert.equal((await request('POST','/api/v1/payments/checkout',{planId:String(plan._id),paymentMethodId:2,idempotencyKey:crypto.randomUUID(),amount:1},token)).status,422);
   const methods=await request('GET','/api/v1/payments/methods?planId='+plan._id,undefined,token);assert.equal(methods.status,200);assert.equal(methods.data.length,1);
   const body={planId:String(plan._id),paymentMethodId:2,idempotencyKey:crypto.randomUUID(),returnTo:'/lessons/'+lessonId};
   const results=await Promise.all([request('POST','/api/v1/payments/checkout',body,token),request('POST','/api/v1/payments/checkout',body,token)]);
   results.forEach(r=>assert.equal(r.status,201,JSON.stringify(r)));assert.equal(results[0].data.id,results[1].data.id);assert.equal(executions,1);
   order=await Payment.findById(results[0].data.id);invoice=invoices.get(String(order._id));
   assert.equal(order.amount_minor,plan.amountMinor);assert.equal(invoice.InvoiceValue,plan.amountMinor/1000);
   assert.equal((await request('GET','/api/v1/payments/orders/open',undefined,token)).data.id,String(order._id));
   assert.equal((await request('GET','/api/v1/payments/orders/open',undefined,adminToken)).data,null);
   const mismatch=await request('POST','/api/v1/payments/checkout',{...body,idempotencyKey:crypto.randomUUID(),paymentMethodId:9},token);
   assert.equal(mismatch.status,409);assert.equal(mismatch.error.code,'OPEN_PAYMENT_EXISTS');assert.equal(executions,1);
   assert.equal((await request('GET','/api/v1/payments/orders/'+order._id,undefined,adminToken)).status,404);
   assert.equal((await request('POST','/api/v1/payments/orders/'+order._id+'/verify',{},token)).data.status,'pending');
   assert.equal((await request('GET','/api/v1/lessons/'+lessonId+'/playback',undefined,token)).status,403);
  });
  await t.test('forged callbacks, incorrect amount, currency, customer and order never grant access',async()=>{
   const calls=statusCalls;
   assert.equal((await request('POST','/api/v1/payments/webhook',{Event:{Code:1},Data:{}},undefined,{'myfatoorah-signature':'forged'})).status,401);assert.equal(statusCalls,calls);
   const saved=structuredClone(invoice);paid(invoice);
   for(const [key,value] of [['InvoiceValue',0.001],['InvoiceDisplayValue','1.500 USD'],['CustomerReference',new mongoose.Types.ObjectId().toString()],['CustomerEmail','other@example.com']]){
    const original=invoice[key];invoice[key]=value;
    await assert.rejects(()=>service.reconcile(order),{cause:409});invoice[key]=original;
    assert.equal(await Subscription.countDocuments({userId:user._id}),0);
   }
   Object.assign(invoice,saved);
   assert.equal((await request('GET','/api/v1/payments/callback?status=paid&orderId='+order._id,undefined,token)).status,404);
   assert.equal(await Subscription.countDocuments({userId:user._id}),0);
  });
  await t.test('a verified signed webhook activates exactly one subscription and unlocks the lesson',async()=>{
   paid(invoice);const {body,signature}=signedBody(invoice);
   const results=await Promise.all([request('POST','/api/v1/payments/webhook',body,undefined,{'myfatoorah-signature':signature}),request('POST','/api/v1/payments/webhook',body,undefined,{'myfatoorah-signature':signature})]);
   results.forEach(r=>assert.equal(r.status,200,JSON.stringify(r)));
   assert.equal(await Subscription.countDocuments({paymentOrderId:order._id}),1);
   assert.equal(await PaymentEvent.countDocuments({payment_order_id:order._id,processing_status:'processed'}),1);
   assert.equal((await request('GET','/api/v1/lessons/'+lessonId+'/playback',undefined,token)).status,200);
   assert.equal((await request('POST','/api/v1/payments/orders/'+order._id+'/verify',{paymentId:invoice.InvoiceTransactions[0].PaymentId},token)).data.status,'succeeded');
  });
  await t.test('renewal extends existing access once and survives an interrupted settlement lock',async()=>{
   const previous=await Subscription.findOne({paymentOrderId:order._id});
   const next=await service.checkout(user,{planId:String(plan._id),paymentMethodId:2,idempotencyKey:crypto.randomUUID(),returnTo:'https://evil.example'});
   assert.equal(next.returnTo,'/dashboard');
   const nextOrder=await Payment.findById(next.id),nextInvoice=invoices.get(String(next.id));paid(nextInvoice);
   await PaymentLock.create({_id:user._id,paymentId:next.id}); // Simulated prior process crash.
   await Promise.all([service.reconcile(nextOrder),service.reconcile(nextOrder)]);
   const renewed=await Subscription.findOne({paymentOrderId:next.id});
   assert.equal(renewed.startsAt.getTime(),previous.endsAt.getTime());
   assert.ok(renewed.endsAt>renewed.startsAt);assert.equal(await Subscription.countDocuments({paymentOrderId:next.id}),1);
   assert.equal(await PaymentLock.countDocuments({_id:user._id}),0);
   assert.equal(addCalendarMonths(new Date('2026-01-31T10:00:00Z'),1).toISOString(),'2026-02-28T10:00:00.000Z');
  });
  await t.test('ambiguous provider timeouts reconcile by reference and never charge a second invoice',async()=>{
   // The previous process died after marking an earlier order paid, before releasing its lock.
   await PaymentLock.create({_id:user._id,paymentId:order._id});
   timeoutNext=true;
   const payload={planId:String(plan._id),paymentMethodId:2,idempotencyKey:crypto.randomUUID(),returnTo:'/lessons/'+lessonId};
   const pending=await service.checkout(user,payload),count=executions;
   assert.equal(pending.status,'created');assert.equal(pending.checkoutUrl,null);
   const same=await service.checkout(user,payload);assert.equal(String(same.id),String(pending.id));assert.equal(executions,count);
   const ambiguous=await Payment.findById(pending.id),data=invoices.get(String(pending.id));paid(data);
   assert.equal((await service.reconcile(ambiguous)).status,'succeeded');assert.equal(executions,count);
   assert.equal(await PaymentLock.countDocuments({_id:user._id}),0);
   assert.equal(await Subscription.countDocuments({paymentOrderId:pending.id}),1);
  });
  await t.test('cancellation and failed attempts do not activate access; late success wins',async()=>{
   const pending=await service.checkout(user,{planId:String(plan._id),paymentMethodId:2,idempotencyKey:crypto.randomUUID()});
   const row=await Payment.findById(pending.id),data=invoices.get(String(pending.id));
   const count=await Subscription.countDocuments({userId:user._id});
   data.InvoiceTransactions=[{PaymentId:'failure-'+data.InvoiceId,TransactionStatus:'Failed'}];
   assert.equal((await service.reconcile(row)).status,'pending');
   assert.equal(await Subscription.countDocuments({userId:user._id}),count);
   data.InvoiceStatus='Canceled';assert.equal((await service.reconcile(row)).status,'canceled');
   assert.equal(await Subscription.countDocuments({userId:user._id}),count);
   paid(data);assert.equal((await service.reconcile(await Payment.findById(row._id))).status,'succeeded');
   assert.equal(await Subscription.countDocuments({paymentOrderId:row._id}),1);
  });
 }finally{base=oldBase;await new Promise(resolve=>site.close(resolve));}
});
