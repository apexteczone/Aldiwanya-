import mongoose from 'mongoose';
// A durable per-user settlement lock. A crashed operation is recovered by retrying
// the same payment (webhook, status endpoint, or payments:reconcile), never by TTL.
const schema=new mongoose.Schema({
 _id:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
 paymentId:{type:mongoose.Schema.Types.ObjectId,ref:'Payment',required:true},
},{timestamps:true});
export default mongoose.model('PaymentLock',schema);
