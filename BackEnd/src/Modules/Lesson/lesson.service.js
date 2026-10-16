import mongoose from 'mongoose';
import Lesson from '../../DB/models/Lesson.js';
import Course from '../../DB/models/Course.js';
import Module from '../../DB/models/Module.js';
import PDF from '../../DB/models/PDF.js';
import StudentActivity from '../../DB/models/StudentActivity.js';
import {extractYouTubeVideoId} from './youtube.js';
const check=id=>{if(!mongoose.isValidObjectId(id)) throw new Error('Invalid ID',{cause:422});};
const privateFields = '+internalNotes +videoId';
export const getLessons=()=>Lesson.find().select(privateFields).populate('courseId','title').populate('moduleId','title').sort({position:1,_id:1});
export async function getLessonsByCourse(courseId){check(courseId);return Lesson.find({courseId}).select(privateFields).sort({position:1,_id:1});}
export async function getLessonById(id){check(id);const lesson=await Lesson.findById(id).select(privateFields);if(!lesson)throw new Error('Lesson not found',{cause:404});return lesson;}
async function resolveParents(data) {
  if(data.moduleId){check(data.moduleId);const module=await Module.findById(data.moduleId);if(!module)throw new Error('Module not found',{cause:404});if(data.courseId&&String(data.courseId)!==String(module.courseId))throw new Error('Module belongs to another course',{cause:422});data.courseId=module.courseId;}
  check(data.courseId);if(!await Course.exists({_id:data.courseId}))throw new Error('Course not found',{cause:404});
}
function withVideo(data) {
  const {youtubeUrl,...fields}=data;
  if(youtubeUrl !== undefined) fields.videoId=extractYouTubeVideoId(youtubeUrl);
  return fields;
}
export async function createLesson(data){
  const fields=withVideo(data);await resolveParents(fields);
  if(!fields.videoId)throw new Error('رابط الفيديو مطلوب.',{cause:422});
  const last=await Lesson.findOne({courseId:fields.courseId}).sort({position:-1});
  return Lesson.create({...fields,position:fields.position??(last?last.position+1:0)});
}
export async function updateLesson(id,data){
  const lesson=await getLessonById(id);
  const fields={...lesson.toObject(),...withVideo(data)};
  await resolveParents(fields);
  if(fields.status==='published'&&!fields.videoId)throw new Error('أضف رابط الفيديو قبل نشر الدرس.',{cause:422});
  Object.assign(lesson,fields);return lesson.save();
}
export async function deleteLesson(id){
  const lesson=await getLessonById(id);
  if(await PDF.exists({lesson:id}))throw new Error('انقل المذكرات المرتبطة بالدرس قبل حذفه.',{cause:409});
  await lesson.deleteOne();
  await StudentActivity.updateMany({},{$pull:{favoriteLessons:lesson._id,completedLessons:lesson._id}});
}
export const publishLesson=id=>updateLesson(id,{status:'published'});
export const hideLesson=id=>updateLesson(id,{status:'draft'});
export async function reorderLessons(courseId,ids,moduleId){
  const filter=moduleId?{moduleId}:{courseId};check(moduleId||courseId);
  const rows=await Lesson.find(filter).select('_id');
  if(new Set(ids).size!==ids.length||rows.length!==ids.length||rows.some(r=>!ids.includes(String(r._id))))throw new Error('Invalid lesson ordering',{cause:422});
  await Lesson.bulkWrite(ids.map((id,position)=>({updateOne:{filter:{_id:id,...filter},update:{$set:{position}}}})));
  return Lesson.find(filter).select(privateFields).sort({position:1});
}
export const createLessonWithVideo=createLesson;
