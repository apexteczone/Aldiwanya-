import mongoose from 'mongoose';
import Course from '../../DB/models/Course.js';
import Module from '../../DB/models/Module.js';
import Lesson from '../../DB/models/Lesson.js';
export const visibleCourse={status:{$in:['published','active']}};
const valid=id=>{if(!mongoose.isValidObjectId(id)) throw new Error('Content not found',{cause:404});};
export async function getPublishedCourses(req,res) {
 const courses=await Course.find(visibleCourse).populate('grade','name').sort({position:1,_id:1}).lean();
 res.json({success:true,data:courses});
}
export async function getPublishedCourseById(req,res) {
 valid(req.params.id);
 const course=await Course.findOne({_id:req.params.id,...visibleCourse}).lean();
 if(!course) throw new Error('Course not found',{cause:404});
 const modules=await Module.find({courseId:course._id,status:'published'}).sort({position:1}).lean();
 const lessons=await Lesson.find({status:'published',$or:[{courseId:course._id,moduleId:null},{moduleId:{$in:modules.map(m=>m._id)}}]}).sort({position:1}).lean();
 res.json({success:true,data:{...course,lessons,modules:modules.map(m=>({...m,lessons:lessons.filter(l=>String(l.moduleId)===String(m._id))}))}});
}
export async function getPublishedLessonById(req,res) {
 valid(req.params.id);
 const lesson=await Lesson.findOne({_id:req.params.id,status:'published'}).lean();
 if(!lesson) throw new Error('Lesson not found',{cause:404});
 const module=lesson.moduleId?await Module.findOne({_id:lesson.moduleId,status:'published'}).lean():null;
 if(lesson.moduleId&&!module) throw new Error('Lesson not found',{cause:404});
 const course=await Course.findOne({_id:module?.courseId||lesson.courseId,...visibleCourse}).lean();
 if(!course) throw new Error('Course not found',{cause:404});
 res.json({success:true,data:{lesson,module,course}});
}

