import mongoose from 'mongoose';
import Course from '../../DB/models/Course.js';
import Grade from '../../DB/models/Grade.js';
import Module from '../../DB/models/Module.js';
import Lesson from '../../DB/models/Lesson.js';
import PDF from '../../DB/models/PDF.js';
const check=id=>{if(!mongoose.isValidObjectId(id)) throw new Error('Invalid ID',{cause:422});};
const published=value=>value==='active'?'published':value==='inactive'?'draft':value;
export async function resolveGrade(value) {
 if(typeof value==='number') {
  const grade=await Grade.findOne({legacyNumber:value});
  if(!grade) throw new Error('Legacy grade must be mapped by the schema migration',{cause:422});
  return grade._id;
 }
 check(value);
 if(!await Grade.exists({_id:value})) throw new Error('Grade not found',{cause:404});
 return value;
}
export const getCourses=()=>Course.find().populate('grade','name').sort({position:1,createdAt:-1});
export async function getCourseById(id) {check(id);const c=await Course.findById(id).populate('grade','name');if(!c)throw new Error('Course not found',{cause:404});return c;}
export async function createCourse(data,file) {
 const grade=await resolveGrade(data.grade);
 const last=await Course.findOne({grade}).sort({position:-1});
 return Course.create({...data,grade,status:published(data.status)||'draft',position:last?last.position+1:0,coverImage:file?'/uploads/images/'+file.filename:''});
}
export async function updateCourse(id,data,file) {
 check(id);const c=await Course.findById(id);if(!c)throw new Error('Course not found',{cause:404});
 if(data.grade!==undefined)data.grade=await resolveGrade(data.grade);
 if(data.status)data.status=published(data.status);
 if(file)data.coverImage='/uploads/images/'+file.filename;
 Object.assign(c,data);return c.save();
}
export async function deleteCourse(id) {
 check(id);
 const dependent=await Promise.all([Module.exists({courseId:id}),Lesson.exists({courseId:id}),PDF.exists({course:id})]);
 if(dependent.some(Boolean))throw new Error('Remove or reassign course content before deleting it',{cause:409});
 if(!await Course.findByIdAndDelete(id))throw new Error('Course not found',{cause:404});
}
export const publishCourse=id=>updateCourse(id,{status:'published'});
export const hideCourse=id=>updateCourse(id,{status:'draft'});
export async function reorderCourses(gradeValue,ids) {
 const grade=await resolveGrade(gradeValue);
 const rows=await Course.find({grade}).select('_id');
 if(new Set(ids).size!==ids.length||rows.length!==ids.length||rows.some(r=>!ids.includes(String(r._id))))throw new Error('Provide each course in this grade exactly once',{cause:422});
 await Course.bulkWrite(ids.map((id,position)=>({updateOne:{filter:{_id:id,grade},update:{$set:{position}}}})));
 return Course.find({grade}).sort({position:1});
}

