import asyncHandler from '../utils/errorHandling/asyncHandler.js';
import {verifyToken} from '../utils/token/token.js';
import User from '../DB/models/User.js';
function authenticate(optional=false) {
  return asyncHandler(async(req,res,next)=>{
    const value=req.headers.authorization;
    if(!value&&optional)return next();
    const parts=value?.split(' ');
    if(parts?.length!==2||parts[0]!=='Bearer'||!parts[1])throw new Error('Authorization required',{cause:401});
    let decoded;
    try{decoded=verifyToken({token:parts[1]});}catch{throw new Error('Invalid or expired token',{cause:401});}
    const user=await User.findById(decoded.id);
    if(!user||decoded.tokenVersion!==user.tokenVersion)throw new Error('Token has been revoked',{cause:401});
    req.user=user;next();
  });
}
export default function authentication(){return authenticate();}
export const optionalAuthentication=()=>authenticate(true);
export const allowTo=(roles=[])=>asyncHandler(async(req,res,next)=>{
  if(!roles.includes(req.user?.role))throw new Error('Forbidden',{cause:403});next();
});
