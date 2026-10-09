import {Router} from 'express';
import {rateLimit} from 'express-rate-limit';
import mongoose from 'mongoose';
import Joi from 'joi';
import Course from '../../DB/models/Course.js';
import Lesson from '../../DB/models/Lesson.js';
import Module from '../../DB/models/Module.js';
import Video from '../../DB/models/Video.js';
import StudentActivity from '../../DB/models/StudentActivity.js';
import authentication from '../../middlewares/authMiddleware.js';
import validation from '../../middlewares/validation.middleware.js';
import {hasSubscription} from '../Subscription/subscription.service.js';
import {visibleCourse} from './content.service.js';
const router = Router();
export async function visibleLessons() {
  const courses = await Course.find(visibleCourse).select('_id').lean();
  const ids = courses.map(c => c._id);
  const modules = await Module.find({courseId: {$in: ids}, status: 'published'}).select('_id').lean();
  return Lesson.find({status: 'published', courseId: {$in: ids}, $or: [{moduleId: null}, {moduleId: {$in: modules.map(m => m._id)}}]}).select('_id courseId title').lean();
}
async function publicVideos() {
  const lessons = await visibleLessons();
  const videos = await Video.find({lessonId: {$in: lessons.map(l => l._id)}, status: 'published', processingStatus: 'ready', accessLevel: 'free'}).select('title lessonId thumbnailUrl durationSeconds').sort({createdAt:-1}).lean();
  const courses = new Map(lessons.map(l => [String(l._id), l.courseId]));
  return videos.map(v => ({...v,courseId:courses.get(String(v.lessonId))}));
}
router.get('/previews', async (req,res) => res.json({success:true,data:await publicVideos()}));
router.use('/student', authentication());
router.get('/student/activity', async (req,res) => {
  const activity = await StudentActivity.findOne({userId:req.user._id}).lean();
  const lessons = await visibleLessons();
  const visibleIds = new Set(lessons.map(l => String(l._id)));
  const completed = new Set((activity?.completedLessons || []).map(String));
  const favorites = await Video.find({_id:{$in:activity?.favoriteVideos || []},lessonId:{$in:lessons.map(l => l._id)},status:'published',processingStatus:'ready'}).select('title lessonId thumbnailUrl durationSeconds').lean();
  res.json({success:true,data:{startedCourses:activity?.startedCourses || [],completedLessons:lessons.filter(l => visibleIds.has(String(l._id)) && completed.has(String(l._id))),favoriteVideos:favorites.map(v => ({...v,courseId:lessons.find(l => String(l._id) === String(v.lessonId)).courseId}))}});
});
const bodySchema = Joi.object({kind:Joi.string().valid('favorite','complete','start').required(),id:Joi.string().hex().length(24).required(),enabled:Joi.boolean().required()});
router.patch('/student/activity', rateLimit({windowMs:60000,limit:90,standardHeaders:'draft-8',legacyHeaders:false}), validation(bodySchema), async (req,res) => {
  const {kind,id,enabled} = req.body;
  let courseId, field;
  const lessons = await visibleLessons();
  if (kind === 'start') {
    if (!await Course.exists({_id:id,...visibleCourse})) throw new Error('Course not found',{cause:404});
    field = 'startedCourses'; courseId = id;
  } else {
    const video = kind === 'favorite' ? await Video.findOne({_id:id,status:'published',processingStatus:'ready'}).lean() : null;
    const lesson = lessons.find(l => String(l._id) === String(kind === 'favorite' ? video?.lessonId : id));
    if (!lesson) throw new Error('Content not found',{cause:404});
    if (kind === 'complete' && enabled && req.user.role !== 'Admin' && !await hasSubscription(req.user._id)) {
      const rows = await Video.find({lessonId:id,status:'published',processingStatus:'ready'}).select('accessLevel').lean();
      if (!rows.length || rows.some(v => v.accessLevel !== 'free')) throw new Error('Subscription required to complete this lesson',{cause:403});
    }
    courseId = lesson.courseId; field = kind === 'favorite' ? 'favoriteVideos' : 'completedLessons';
  }
  await StudentActivity.updateOne({userId:req.user._id},{$setOnInsert:{userId:req.user._id}},{upsert:true});
  await StudentActivity.updateOne({userId:req.user._id},{[enabled?'$addToSet':'$pull']:{[field]:new mongoose.Types.ObjectId(id)}});
  if (enabled && kind !== 'favorite') await StudentActivity.updateOne({userId:req.user._id},{$addToSet:{startedCourses:courseId}});
  res.json({success:true});
});
export default router;
