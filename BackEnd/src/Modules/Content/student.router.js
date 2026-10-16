import {Router} from 'express';
import {rateLimit} from 'express-rate-limit';
import Joi from 'joi';
import Course from '../../DB/models/Course.js';
import StudentActivity from '../../DB/models/StudentActivity.js';
import authentication from '../../middlewares/authMiddleware.js';
import validation from '../../middlewares/validation.middleware.js';
import {visibleCourse,visibleLessons,toPublicLesson,assertPlaybackAccess} from './content.service.js';
const router=Router();
router.get('/previews',async(req,res)=>{
 const lessons=await visibleLessons();
 res.json({success:true,data:lessons.filter(l=>l.isFreePreview&&l.videoId).map(toPublicLesson)});
});
router.use('/student',authentication());
router.get('/student/activity',async(req,res)=>{
 const activity=await StudentActivity.findOne({userId:req.user._id}).lean();
 const lessons=await visibleLessons();
 const completed=new Set((activity?.completedLessons||[]).map(String));
 const favorites=new Set((activity?.favoriteLessons||[]).map(String));
 res.json({success:true,data:{startedCourses:activity?.startedCourses||[],completedLessons:lessons.filter(l=>completed.has(String(l._id))).map(toPublicLesson),favoriteLessons:lessons.filter(l=>favorites.has(String(l._id))).map(toPublicLesson)}});
});
const bodySchema=Joi.object({kind:Joi.string().valid('favorite','complete','start').required(),id:Joi.string().hex().length(24).required(),enabled:Joi.boolean().required()});
router.patch('/student/activity',rateLimit({windowMs:60000,limit:90,standardHeaders:'draft-8',legacyHeaders:false}),validation(bodySchema),async(req,res)=>{
 const {kind,id,enabled}=req.body;
 let courseId,field;
 if(kind==='start'){
   if(!await Course.exists({_id:id,...visibleCourse}))throw new Error('Course not found',{cause:404});
   field='startedCourses';courseId=id;
 }else{
   const lessons=await visibleLessons();
   const lesson=lessons.find(l=>String(l._id)===id);
   if(!lesson)throw new Error('Content not found',{cause:404});
   if(kind==='complete'&&enabled)await assertPlaybackAccess(lesson,req.user);
   courseId=lesson.courseId;field=kind==='favorite'?'favoriteLessons':'completedLessons';
 }
 await StudentActivity.updateOne({userId:req.user._id},{$setOnInsert:{userId:req.user._id}},{upsert:true});
 await StudentActivity.updateOne({userId:req.user._id},{[enabled?'$addToSet':'$pull']:{[field]:id}});
 if(enabled&&kind!=='favorite')await StudentActivity.updateOne({userId:req.user._id},{$addToSet:{startedCourses:courseId}});
 res.json({success:true});
});
export default router;
