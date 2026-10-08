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
let server,base,adminToken,studentToken,studentId,gradeId,courseId,moduleId,lessonId,pdfId;
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
test('grade, course, module and lesson share one canonical schema',async()=>{
 const grade=await request('POST','/api/v1/admin/grades/create',{name:'الصف الأول',status:'active'},adminToken);assert.equal(grade.status,201,JSON.stringify(grade));gradeId=grade.data?._id||grade.grade?._id;
 const course=await request('POST','/api/v1/admin/courses',{title:'Integration course',subject:'Math',grade:gradeId,status:'active'},adminToken);assert.equal(course.status,201,JSON.stringify(course));courseId=course.data._id;assert.equal(course.data.status,'published');
 const module=await request('POST','/api/v1/admin/modules/CreateModule',{title:'Module one',courseId},adminToken);assert.equal(module.status,201,JSON.stringify(module));moduleId=module.data._id;
 assert.equal((await request('PATCH','/api/v1/admin/modules/'+moduleId+'/publish',{},adminToken)).status,200);
 const lesson=await request('POST','/api/v1/admin/lessons',{title:'Module lesson',moduleId},adminToken);assert.equal(lesson.status,201,JSON.stringify(lesson));lessonId=lesson.data._id;assert.equal(lesson.data.courseId,courseId);
 assert.equal((await request('PATCH','/api/v1/admin/lessons/'+lessonId+'/publish',{},adminToken)).status,200);
 const detail=await request('GET','/api/v1/courses/'+courseId);assert.equal(detail.data.lessons.length,1);assert.equal(detail.data.modules[0].lessons.length,1);
 assert.equal((await request('DELETE','/api/v1/admin/courses/'+courseId,undefined,adminToken)).status,409);
 assert.equal((await request('DELETE','/api/v1/admin/modules/'+moduleId+'/delete',undefined,adminToken)).status,409);
});
test('admin creates a grade, course and direct lesson without a module',async()=>{
 const grade=await request('POST','/api/v1/admin/grades/create',{name:'Direct course grade'},adminToken);assert.equal(grade.status,201);
 const course=await request('POST','/api/v1/admin/courses',{title:'Direct course',grade:grade.data._id,status:'published'},adminToken);assert.equal(course.status,201);
 const lesson=await request('POST','/api/v1/admin/lessons',{title:'Direct lesson',courseId:course.data._id,status:'published'},adminToken);assert.equal(lesson.status,201);assert.equal(lesson.data.courseId,course.data._id);assert.equal(lesson.data.moduleId,undefined);
 const detail=await request('GET','/api/v1/courses/'+course.data._id);assert.ok(detail.data.lessons.some(l=>l._id===lesson.data._id));
 assert.equal((await request('POST','/api/v1/admin/lessons',{title:'Missing course'},adminToken)).status,422);
 assert.equal((await request('POST','/api/v1/admin/lessons',{title:'Unknown course',courseId:new mongoose.Types.ObjectId().toString()},adminToken)).status,404);
});
test('video access and publication are enforced on the server',async()=>{
 for(const accessLevel of ['free','paid']){const r=await request('POST','/api/v1/admin/videos',{title:accessLevel+' video',lessonId,videoUrl:'https://example.com/video.mp4',accessLevel,status:'published'},adminToken);assert.equal(r.status,201,JSON.stringify(r));}
 const videos=await request('GET','/api/v1/library/lessons/'+lessonId+'/videos',undefined,studentToken);assert.equal(videos.data.length,1);assert.equal(videos.data[0].accessLevel,'free');
 await request('PATCH','/api/v1/admin/courses/'+courseId+'/hide',{},adminToken);
 assert.equal((await request('GET','/api/v1/courses/'+courseId)).status,404);
 assert.equal((await request('GET','/api/v1/library/lessons/'+lessonId+'/videos',undefined,studentToken)).status,404);
 await request('PATCH','/api/v1/admin/courses/'+courseId+'/publish',{},adminToken);
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
 assert.equal((await request('POST','/api/v1/payments/checkout',{planId:'fake',paid:true},studentToken)).status,503);
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
 assert.equal((await request('GET','/api/v1/library/lessons/'+lessonId+'/videos',undefined,studentToken)).data.length,2);
 const paidPdf=await fetch(base+'/api/v1/library/pdfs/'+pdfId+'/download',{headers:{Authorization:'Bearer '+studentToken}});
 assert.equal(paidPdf.status,200);await paidPdf.arrayBuffer();
 const payments=await request('GET','/api/v1/admin/payments',undefined,adminToken);assert.equal(payments.data[0].status,'success');assert.equal(payments.data[0].amountValue,2.5);
 const subscriptions=await request('GET','/api/v1/admin/subscriptions',undefined,adminToken);assert.equal(subscriptions.data[0].student,'Updated Student');
 await Subscription.updateOne({_id:subscription._id},{$set:{endsAt:new Date(Date.now()-1000)}});
 const stillFree=await fetch(base+'/api/v1/library/pdfs/'+pdfId+'/download');assert.equal(stillFree.status,200);await stillFree.arrayBuffer();
 assert.equal((await request('GET','/api/v1/library/lessons/'+lessonId+'/videos',undefined,studentToken)).data.length,1);
});
test('built frontend serves direct routes while unknown API routes remain JSON',async()=>{
 process.env.SERVE_FRONTEND='true';
 const app=express();await bootstrap(app,express,{connect:false});
 const site=app.listen(0,'127.0.0.1');await new Promise(resolve=>site.once('listening',resolve));
 const origin='http://127.0.0.1:'+site.address().port;
 try {
  for(const route of ['/','/dashboard','/admin/courses','/library']) {
   const r=await fetch(origin+route,{headers:{Accept:'text/html'}});
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
