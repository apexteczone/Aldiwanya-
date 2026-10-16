import mongoose from 'mongoose';
import Course from '../../DB/models/Course.js';
import Module from '../../DB/models/Module.js';
import Lesson from '../../DB/models/Lesson.js';
import Grade from '../../DB/models/Grade.js';
import {hasSubscription} from '../Subscription/subscription.service.js';
export const visibleCourse={status:{$in:['published','active']}};
const valid=id=>{if(!mongoose.isValidObjectId(id))throw new Error('Content not found',{cause:404});};
// Explicit allowlist also protects future private fields added to the schema.
export const toPublicLesson=l=>({
 _id:l._id,courseId:l.courseId,moduleId:l.moduleId,title:l.title,description:l.description,
 thumbnailUrl:l.thumbnailUrl,durationSeconds:l.durationSeconds,isFreePreview:l.isFreePreview,
 position:l.position,status:l.status,hasVideo:Boolean(l.videoId),createdAt:l.createdAt,
});
export async function getPublicGrades(req,res){
 const data=await Grade.find({status:'active'}).select('name description position').sort({position:1,name:1,_id:1}).lean();
 res.json({success:true,data});
}
export async function visibleLessons(){
 const courses=await Course.find(visibleCourse).select('_id').lean();
 const ids=courses.map(c=>c._id);
 const modules=await Module.find({courseId:{$in:ids},status:'published'}).select('_id courseId').lean();
 const lessons=await Lesson.find({status:'published',courseId:{$in:ids}}).select('+videoId').sort({position:1,_id:1}).lean();
 return lessons.filter(l=>!l.moduleId||modules.some(m=>String(m._id)===String(l.moduleId)&&String(m.courseId)===String(l.courseId)));
}
export async function getPublishedCourses(req,res){
 const courses=await Course.find(visibleCourse).populate('grade','name').sort({position:1,_id:1}).lean();
 const lessons=await visibleLessons();
 res.json({success:true,data:courses.map(c=>({...c,lessonsCount:lessons.filter(l=>String(l.courseId)===String(c._id)).length}))});
}
export async function getPublishedCourseById(req,res){
 valid(req.params.id);
 const course=await Course.findOne({_id:req.params.id,...visibleCourse}).populate('grade','name').lean();
 if(!course)throw new Error('Course not found',{cause:404});
 const modules=await Module.find({courseId:course._id,status:'published'}).sort({position:1,_id:1}).lean();
 const lessons=await Lesson.find({courseId:course._id,status:'published',$or:[{moduleId:null},{moduleId:{$in:modules.map(m=>m._id)}}]}).select('+videoId').sort({position:1,_id:1}).lean();
 res.json({success:true,data:{...course,lessons:lessons.map(toPublicLesson),modules:modules.map(m=>({...m,lessons:lessons.filter(l=>String(l.moduleId)===String(m._id)).map(toPublicLesson)}))}});
}
export async function publishedLesson(id){
 valid(id);
 const lesson=await Lesson.findOne({_id:id,status:'published'}).select('+videoId').lean();
 if(!lesson)throw new Error('Lesson not found',{cause:404});
 const course=await Course.findOne({_id:lesson.courseId,...visibleCourse}).populate('grade','name').lean();
 if(!course)throw new Error('Course not found',{cause:404});
 const module=lesson.moduleId?await Module.findOne({_id:lesson.moduleId,courseId:lesson.courseId,status:'published'}).lean():null;
 if(lesson.moduleId&&!module)throw new Error('Lesson not found',{cause:404});
 return {lesson,course,module};
}
export async function getPublishedLessonById(req,res){
 const {lesson,course,module}=await publishedLesson(req.params.id);
 res.json({success:true,data:{lesson:toPublicLesson(lesson),course,module}});
}
export async function assertPlaybackAccess(lesson,user){
 if(!lesson.videoId)throw new Error('لم يُضف فيديو لهذا الدرس بعد.',{cause:404});
 if(lesson.isFreePreview)return;
 if(!user)throw Object.assign(new Error('سجّل الدخول لمشاهدة الدرس.',{cause:401}),{publicCode:'LOGIN_REQUIRED'});
 if(user.role!=='Admin'&&!await hasSubscription(user._id))throw Object.assign(new Error('تحتاج اشتراكًا فعالًا لمشاهدة الدرس.',{cause:403}),{publicCode:'SUBSCRIPTION_REQUIRED'});
}
export async function getLessonPlayback(req,res){
 const {lesson}=await publishedLesson(req.params.id);
 await assertPlaybackAccess(lesson,req.user);
 res.set('Cache-Control','private, no-store');
 res.json({success:true,data:{...toPublicLesson(lesson),provider:'youtube',videoId:lesson.videoId}});
}
