import {Router} from 'express';
import Joi from 'joi';
import User from '../../DB/models/User.js';
import Course from '../../DB/models/Course.js';
import Lesson from '../../DB/models/Lesson.js';
import PDF from '../../DB/models/PDF.js';
import Subscription from '../../DB/models/Subscription.js';
import Payment from '../../DB/models/Payment.js';
import Video from '../../DB/models/Video.js';
import validation from '../../middlewares/validation.middleware.js';
const router=Router();
const id=Joi.string().hex().length(24);
const idParams=validation(Joi.object({id:id.required()}),'params');
router.get('/dashboard-stats',async(req,res)=>{
 const [freePdfs,totalCourses,activeSubscriptions,registeredStudents,recentStudents]=await Promise.all([
 PDF.countDocuments({isFreePreview:true}),Course.countDocuments(),Subscription.countDocuments({startsAt:{$lte:new Date()},endsAt:{$gt:new Date()}}),User.countDocuments({role:'Student'}),User.find({role:'Student'}).select('fullName createdAt').sort({createdAt:-1}).limit(5).lean()]);
 res.json({success:true,data:{stats:{freePdfs:{count:freePdfs,newCount:0},totalCourses:{count:totalCourses,newCount:0},activeSubscriptions:{count:activeSubscriptions,percent:0},registeredStudents:{count:registeredStudents,percent:0}},recentSubscriptions:[],recentStudents:recentStudents.map(u=>({id:u._id,name:u.fullName,date:u.createdAt.toISOString().slice(0,10)}))}});
});
router.get('/students',async(req,res)=>res.json({success:true,data:(await User.find({role:'Student'}).select('fullName email phoneNumber gradePreference createdAt').lean()).map(u=>({...u,id:u._id,name:u.fullName,phone:u.phoneNumber,grade:u.gradePreference||'',status:'active',joinDate:u.createdAt.toISOString().slice(0,10)}))}));
router.delete('/students/:id',idParams,async(req,res)=>{
 if(await Subscription.exists({userId:req.params.id})||await Payment.exists({user_id:req.params.id})) throw new Error('Student has financial records; deletion is not allowed',{cause:409});
 const user=await User.findOneAndDelete({_id:req.params.id,role:'Student'});
 if(!user) throw new Error('Student not found',{cause:404});
 res.json({success:true});
});
router.get('/subscriptions',async(req,res)=>{
 const rows=await Subscription.find().populate('userId','fullName email').populate('planId').lean();
 const now=Date.now();res.json({success:true,data:rows.map(s=>({id:s._id,student:s.userId?.fullName||'Deleted user',course:'جميع المناهج',planType:s.planId?.title||'',startDate:s.startsAt.toISOString().slice(0,10),endDate:s.endsAt.toISOString().slice(0,10),amount:'—',status:s.endsAt.getTime()<=now?'expired':s.startsAt.getTime()>now?'scheduled':s.endsAt.getTime()-now<7*86400000?'expiring':'active'}))});
});
router.delete('/subscriptions/:id',idParams,(req,res)=>res.status(409).json({success:false,error:{message:'Financial history is retained. Subscription cancellation requires the completed payment integration.'}}));
router.get('/payments',async(req,res)=>{
 const rows=await Payment.find().populate('user_id','fullName').populate('plan_id','title').select('-idempotency_key').lean();
 res.json({success:true,data:rows.map(p=>({id:p._id,student:p.user_id?.fullName||'Deleted user',course:p.plan_id?.title||'',amount:p.price_snapshot+' '+p.currency,amountValue:p.price_snapshot,currency:p.currency,methodType:p.provider||'unknown',method:p.provider||'—',date:p.created_at?.toISOString().slice(0,10),trx:p.provider_reference||'—',status:p.status==='succeeded'?'success':['failed','canceled'].includes(p.status)?'failed':'pending'}))});
});
router.get('/videos',async(req,res)=>{
 const videos=await Video.find().populate('lessonId','title').lean();
 res.json({success:true,data:videos.map(v=>({...v,id:v._id,lesson:v.lessonId?.title||'',duration:v.durationSeconds||0,uploadDate:v.createdAt.toISOString().slice(0,10),status:v.status==='published'?'active':'inactive',thumbnail:v.thumbnailUrl||''}))});
});
router.post('/videos',validation(Joi.object({title:Joi.string().min(2).max(200).required(),lessonId:id.required(),videoUrl:Joi.string().uri({scheme:['https']}).required(),thumbnailUrl:Joi.string().uri({scheme:['https']}).allow(''),durationSeconds:Joi.number().min(0),accessLevel:Joi.string().valid('free','paid').default('paid'),status:Joi.string().valid('draft','published').default('draft')})),async(req,res)=>{
 if(!await Lesson.exists({_id:req.body.lessonId})) throw new Error('Lesson not found',{cause:404});
 const video=await Video.create({...req.body,processingStatus:'ready'});
 res.status(201).json({success:true,data:video});
});
router.patch('/videos/:id',idParams,validation(Joi.object({title:Joi.string().min(2).max(200),status:Joi.string().valid('draft','published','archived'),accessLevel:Joi.string().valid('free','paid')})),async(req,res)=>{
 const video=await Video.findByIdAndUpdate(req.params.id,{$set:req.body},{returnDocument: 'after',runValidators:true});
 if(!video) throw new Error('Video not found',{cause:404});res.json({success:true,data:video});
});
router.delete('/videos/:id',idParams,async(req,res)=>{const v=await Video.findByIdAndDelete(req.params.id);if(!v) throw new Error('Video not found',{cause:404});res.json({success:true});});
export default router;

