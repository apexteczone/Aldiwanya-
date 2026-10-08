export default function globalErrorHandler(error,req,res,next) {
 if(res.headersSent) return next(error);
 const expected=Number.isInteger(error.cause)&&error.cause>=400&&error.cause<600;
 const status=error.code===11000?409:error.name==='ValidationError'||error.name==='CastError'?422:
   error.code==='LIMIT_FILE_SIZE'?413:error.name==='MulterError'?400:expected?error.cause:500;
 const message=status===500?'Internal server error':error.code===11000?'A record with these details already exists':error.message;
 if(status>=500) console.error('Request failed',{method:req.method,path:req.path,status});
 res.status(status).json({success:false,error:{code:status===503?'SERVICE_UNAVAILABLE':status===422?'VALIDATION_ERROR':'REQUEST_FAILED',message}});
}

