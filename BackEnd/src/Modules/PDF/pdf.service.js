import mongoose from 'mongoose';
import path from 'node:path';
import {uploadRoot} from '../../middlewares/upload.middleware.js';
import PDF from '../../DB/models/PDF.js';
import Course from '../../DB/models/Course.js';
import Lesson from '../../DB/models/Lesson.js';
function checkId(id) {if(!mongoose.isValidObjectId(id)) throw new Error('Invalid ID',{cause:422});}
async function validateParents(course,lesson) {
 checkId(course);
 if(!await Course.exists({_id:course})) throw new Error('Course not found',{cause:404});
 if(lesson) {checkId(lesson);if(!await Lesson.exists({_id:lesson,courseId:course})) throw new Error('Lesson does not belong to this course',{cause:422});}
}
function uploadedPath(file) {
 const resolved=path.resolve(file.path);
 if(!resolved.startsWith(path.join(uploadRoot,'pdfs')+path.sep)) throw new Error('Invalid upload path',{cause:422});
 return resolved.replaceAll('\\','/');
}
export async function createPdf(data,file) {
 if(!file) throw new Error('PDF file is required',{cause:400});
 await validateParents(data.course,data.lesson);
 return PDF.create({...data,isFreePreview:true,lesson:data.lesson||null,pdfUrl:uploadedPath(file)});
}
export const getAllPdfsAdmin=()=>PDF.find().populate('course','title').populate('lesson','title').sort({createdAt:-1});
export async function getPdfsByCourse(courseId) {await validateParents(courseId);return PDF.find({course:courseId,status:'active'}).populate('lesson','title').sort({createdAt:-1});}
export async function getPdfById(id) {checkId(id);const pdf=await PDF.findById(id).populate('course','title').populate('lesson','title');if(!pdf) throw new Error('PDF not found',{cause:404});return pdf;}
export async function updatePdf(id,data,file) {
 checkId(id);const pdf=await PDF.findById(id);if(!pdf) throw new Error('PDF not found',{cause:404});
 await validateParents(data.course||pdf.course,data.lesson===undefined?pdf.lesson:data.lesson);
 if(data.lesson==='') data.lesson=null;
 Object.assign(pdf,data,{isFreePreview:true});
 if(file) pdf.pdfUrl=uploadedPath(file);
 // Retain replaced physical files for a separately reviewed retention/backup policy.
 await pdf.save();return pdf;
}
export async function deletePdf(id) {
 checkId(id);const pdf=await PDF.findByIdAndDelete(id);
 if(!pdf) throw new Error('PDF not found',{cause:404});
 // Remove the library entry while keeping physical files recoverable.
 return true;
}
