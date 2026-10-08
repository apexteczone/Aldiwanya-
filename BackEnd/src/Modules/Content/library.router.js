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

router.get('/subscriptions',authentication(),async(req,res)=>res.json({success:true,data:await getSubscriptions(req.user._id)}));
router.get('/pdfs',async(req,res)=>{
 const rows=await PDF.find({status:'active'}).populate('course','title grade').lean();
 res.json({success:true,data:rows.map(({pdfUrl,...pdf})=>({...pdf,isFreePreview:true,pdfUrl:'/uploads/pdfs/'+path.basename(pdfUrl.replaceAll('\\','/'))}))});
});
router.get('/pdfs/:id/download',async(req,res,next)=>{
 if(!mongoose.isValidObjectId(req.params.id)) throw new Error('Not found',{cause:404});
 const pdf=await PDF.findOne({_id:req.params.id,status:'active'});
 if(!pdf) throw new Error('Not found',{cause:404});

 const file=path.resolve(pdf.pdfUrl);
 if(!file.startsWith(path.join(uploadRoot,'pdfs')+path.sep)) throw new Error('File is unavailable',{cause:404});
 res.download(file,'document.pdf',err=>{if(err) next(new Error('File is unavailable',{cause:404}));});
});
router.get('/lessons/:id/videos',authentication(),async(req,res)=>{
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
