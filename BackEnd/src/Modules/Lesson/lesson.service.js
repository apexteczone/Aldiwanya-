import mongoose from 'mongoose';
import Lesson from '../../DB/models/Lesson.js';
import Course from '../../DB/models/Course.js';
import Module from '../../DB/models/Module.js';
import Video from '../../DB/models/Video.js';
import PDF from '../../DB/models/PDF.js';
const check=id=>{if(!mongoose.isValidObjectId(id))throw new Error('Invalid ID',{cause:422});};
export const getLessons=()=>Lesson.find().select('+internalNotes').populate('courseId','title').populate('moduleId','title').sort({position:1});
export async function getLessonsByCourse(courseId){check(courseId);return Lesson.find({courseId}).sort({position:1});}
export async function getLessonById(id){check(id);const l=await Lesson.findById(id);if(!l)throw new Error('Lesson not found',{cause:404});return l;}
async function resolveParents(data) {
 if(data.moduleId){check(data.moduleId);const m=await Module.findById(data.moduleId);if(!m)throw new Error('Module not found',{cause:404});if(data.courseId&&String(data.courseId)!==String(m.courseId))throw new Error('Module belongs to another course',{cause:422});data.courseId=m.courseId;}
 check(data.courseId);if(!await Course.exists({_id:data.courseId}))throw new Error('Course not found',{cause:404});
}
export async function createLesson(data){await resolveParents(data);const last=await Lesson.findOne({courseId:data.courseId}).sort({position:-1});return Lesson.create({...data,status:data.status||'draft',position:data.position??(last?last.position+1:0)});}
export async function updateLesson(id,data){const l=await getLessonById(id);await resolveParents({...l.toObject(),...data});Object.assign(l,data);if(l.moduleId){const m=await Module.findById(l.moduleId);l.courseId=m.courseId;}return l.save();}
export async function deleteLesson(id){const l=await getLessonById(id);if(await Video.exists({lessonId:id})||await PDF.exists({lesson:id}))throw new Error('Remove lesson attachments first',{cause:409});await l.deleteOne();}
export const publishLesson=id=>updateLesson(id,{status:'published'});
export const hideLesson=id=>updateLesson(id,{status:'draft'});
export async function reorderLessons(courseId,ids,moduleId){const filter=moduleId?{moduleId}:{courseId};check(moduleId||courseId);const rows=await Lesson.find(filter).select('_id');if(new Set(ids).size!==ids.length||rows.length!==ids.length||rows.some(r=>!ids.includes(String(r._id))))throw new Error('Invalid lesson ordering',{cause:422});await Lesson.bulkWrite(ids.map((id,position)=>({updateOne:{filter:{_id:id,...filter},update:{$set:{position}}}})));return Lesson.find(filter).sort({position:1});}





const extractYouTubeVideoId = (youtubeUrl) => {
  let parsedUrl;

  try {
    parsedUrl = new URL(youtubeUrl);
  } catch {
    throw new Error("Invalid YouTube URL", { cause: 400 });
  }

  const host = parsedUrl.hostname
    .toLowerCase()
    .replace(/^www\./, "");

  let videoId = null;

  if (host === "youtu.be") {
    videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
  } else if (
    [
      "youtube.com",
      "m.youtube.com",
      "youtube-nocookie.com",
    ].includes(host)
  ) {
    videoId = parsedUrl.searchParams.get("v");

    if (!videoId) {
      const match = parsedUrl.pathname.match(
        /^\/(?:embed|shorts|live)\/([^/]+)/
      );

      videoId = match?.[1] || null;
    }
  }

  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    throw new Error("Invalid YouTube video URL", { cause: 400 });
  }

  return videoId;
};

export const createLessonWithVideo = async (data) => {
  const course = await Course.findById(data.courseId);

  if (!course) {
    throw new Error("Course not found", { cause: 404 });
  }

  const videoId = extractYouTubeVideoId(data.youtubeUrl);

  const lesson = await Lesson.create({
    courseId: data.courseId,
    title: data.title,
    description: data.description ?? "",
    status: data.status ?? "draft",
    position: data.position ?? 0,
    isFreePreview: data.isFreePreview ?? false,
    videoId,
  });

  return {
    _id: lesson._id,
    courseId: lesson.courseId,
    title: lesson.title,
    description: lesson.description,
    status: lesson.status,
    position: lesson.position,
    isFreePreview: lesson.isFreePreview,
    videoId: lesson.videoId,
  };
};
