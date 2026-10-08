import {Router} from 'express';
import authentication from '../../middlewares/authMiddleware.js';
const router=Router();
router.get('/capabilities',(req,res)=>res.json({success:true,data:{provider:'myfatoorah',checkoutEnabled:false}}));
router.post('/checkout',authentication(),(req,res)=>res.status(503).json({success:false,error:{code:'PAYMENTS_NOT_ENABLED',message:'الدفع الإلكتروني غير متاح حاليًا؛ جارٍ استكمال الربط مع ماي فاتورة.'}}));
// No callback/webhook grants access in this initial release.
export default router;

