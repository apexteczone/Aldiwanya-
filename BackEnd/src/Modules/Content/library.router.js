import {Router} from 'express';
import path from 'node:path';
import mongoose from 'mongoose';
import PDF from '../../DB/models/PDF.js';
import Course from '../../DB/models/Course.js';
import Lesson from '../../DB/models/Lesson.js';
import Module from '../../DB/models/Module.js';
import Video from '../../DB/models/Video.js';
import authentication from '../../middlewares/authMiddleware.js';
import {hasSubscription,getSubscriptions} from '../Subscription/subscription.service.js';
import {visibleCourse} from './content.service.js';
import {uploadRoot} from '../../middlewares/upload.middleware.js';
const router=Router();
router.use(authentication());
router.get('/subscriptions',async(req,res)=>res.json({success:true,data:await getSubscriptions(req.user._id)}));
router.get('/pdfs',async(req,res)=>{
 const courses=await Course.find(visibleCourse).select('_id');
 const filter={course:{$in:courses.map(c=>c._id)},status:'active'};
 if(req.user.role!=='Admin'&&!await hasSubscription(req.user._id)) filter.isFreePreview=true;
 const rows=await PDF.find(filter).select('-pdfUrl').lean();
 res.json({success:true,data:rows});
});
router.get('/pdfs/:id/download',async(req,res,next)=>{
 if(!mongoose.isValidObjectId(req.params.id)) throw new Error('Not found',{cause:404});
 const pdf=await PDF.findOne({_id:req.params.id,status:'active'});
 if(!pdf || !await Course.exists({_id:pdf.course,...visibleCourse})) throw new Error('Not found',{cause:404});
 if(!pdf.isFreePreview&&req.user.role!=='Admin'&&!await hasSubscription(req.user._id)) throw new Error('Subscription required',{cause:403});
 const file=path.resolve(pdf.pdfUrl);
 if(!file.startsWith(path.join(uploadRoot,'pdfs')+path.sep)) throw new Error('File is unavailable',{cause:404});
 res.download(file,'document.pdf',err=>{if(err) next(new Error('File is unavailable',{cause:404}));});
});
router.get('/lessons/:id/videos',async(req,res)=>{
 if(!mongoose.isValidObjectId(req.params.id)) throw new Error('Not found',{cause:404});
 const lesson=await Lesson.findOne({_id:req.params.id,status:'published'});
 if(!lesson) throw new Error('Not found',{cause:404});
 const module=lesson.moduleId?await Module.findOne({_id:lesson.moduleId,status:'published'}):null;
 if(lesson.moduleId&&!module) throw new Error('Not found',{cause:404});
 if(!await Course.exists({_id:module?.courseId||lesson.courseId,...visibleCourse})) throw new Error('Not found',{cause:404});
 const filter={lessonId:lesson._id,status:'published',processingStatus:'ready'};
 if(req.user.role!=='Admin'&&!await hasSubscription(req.user._id)) filter.accessLevel='free';
 res.json({success:true,data:await Video.find(filter).select('title videoUrl durationSeconds accessLevel').lean()});
});
export default router;

