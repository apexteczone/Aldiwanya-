import api from './api';
export const paymentMethods=planId=>api.get('/payments/methods',{params:{planId},quiet:true});
export const checkout=data=>api.post('/payments/checkout',data,{timeout:40000,quiet:true});
export const verifyPayment=(orderId,paymentId)=>api.post('/payments/orders/'+orderId+'/verify',paymentId?{paymentId}:{},{timeout:25000,quiet:true});
