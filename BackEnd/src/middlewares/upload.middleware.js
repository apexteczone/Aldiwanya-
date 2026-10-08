import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
export const uploadRoot=path.resolve(process.env.UPLOAD_DIR||'uploads');
const parser=multer({storage:multer.memoryStorage(),limits:{fileSize:20*1024*1024,files:1,fields:15}});
function uploader(kind) {return {single(field) {return (req,res,next)=>parser.single(field)(req,res,async error=>{
 if(error) return next(error);
 if(!req.file) return next();
 try {
  const b=req.file.buffer;
  let ext;
  if(kind==='pdf' && b.subarray(0,5).toString()==='%PDF-') ext='.pdf';
  if(kind==='images' && b.length<=5*1024*1024) {
   if(b.subarray(0,3).equals(Buffer.from([255,216,255]))) ext='.jpg';
   if(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) ext='.png';
   if(b.subarray(0,4).toString()==='RIFF' && b.subarray(8,12).toString()==='WEBP') ext='.webp';
  }
  if(!ext) throw new Error('Unsupported or invalid file content',{cause:422});
  const dir=path.join(uploadRoot,kind==='pdf'?'pdfs':'images');
  await fs.mkdir(dir,{recursive:true});
  const filename=crypto.randomUUID()+ext;
  const filePath=path.join(dir,filename);
  await fs.writeFile(filePath,b,{flag:'wx'});
  Object.assign(req.file,{filename,path:filePath});
  delete req.file.buffer;
  res.once('finish',()=>{if(res.statusCode>=400) fs.unlink(filePath).catch(()=>{});});
  next();
 } catch(err){next(err);}
 });}};}
export const uploadImage=uploader('images');
export const uploadPdf=uploader('pdf');

