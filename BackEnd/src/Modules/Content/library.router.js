import {Router} from 'express';
import path from 'node:path';
import mongoose from 'mongoose';
import PDF from '../../DB/models/PDF.js';
import authentication from '../../middlewares/authMiddleware.js';
import {getSubscriptions} from '../Subscription/subscription.service.js';
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
export default router;
