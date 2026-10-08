export default (schema, source='body') => (req,res,next) => {
 const {error,value}=schema.validate(req[source],{abortEarly:false,allowUnknown:false});
 if(error) return next(new Error(error.details.map(d=>d.message).join(', '),{cause:422}));
 // Express 5 query is a getter; body and params are writable.
 if(source==='query') Object.defineProperty(req,'query',{value,configurable:true});
 else req[source]=value;
 next();
};

