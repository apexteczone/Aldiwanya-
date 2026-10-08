import 'dotenv/config';
import mongoose from 'mongoose';
import {pathToFileURL} from 'node:url';
export async function migrate({apply=false}={}) {
 const db=mongoose.connection.db;
 const courses=await db.collection('courses').find({}).toArray();
 const modules=await db.collection('modules').find({}).toArray();
 const lessons=await db.collection('lessons').find({}).toArray();
 const grades=await db.collection('grades').find({}).toArray();
 const courseIds=new Set(courses.map(c=>String(c._id)));
 const gradeIds=new Set(grades.map(g=>String(g._id)));
 const moduleById=new Map(modules.map(m=>[String(m._id),m]));
 const problems=[];
 for(const c of courses) if(typeof c.grade==='number'&&![10,11,12].includes(c.grade))problems.push('Unsupported numeric grade on course '+c._id);
 for(const l of lessons) {const m=moduleById.get(String(l.moduleId));if(!l.courseId&&!m)problems.push('Lesson has no resolvable course: '+l._id);if(l.courseId&&m&&String(l.courseId)!==String(m.courseId))problems.push('Conflicting lesson parents: '+l._id);}
 for(const c of courses) if(typeof c.grade!=='number'&&!gradeIds.has(String(c.grade)))problems.push('Course has an unresolved grade: '+c._id);
 for(const m of modules)if(!courseIds.has(String(m.courseId)))problems.push('Module has an unresolved course: '+m._id);
 for(const l of lessons)if(l.courseId&&!courseIds.has(String(l.courseId)))problems.push('Lesson has an unresolved course: '+l._id);
 for(const n of [10,11,12])if(grades.filter(g=>g.legacyNumber===n).length>1)problems.push('Duplicate legacy grade mapping: '+n);
 const changes={courses:courses.filter(c=>typeof c.grade==='number'||['active','inactive'].includes(c.status)).length,lessons:lessons.filter(l=>!l.courseId).length,problems,applied:false};
 if(problems.length||!apply)return changes;
 for(const n of [10,11,12]){
  if(!courses.some(c=>c.grade===n))continue;
  const grade=await db.collection('grades').findOneAndUpdate({legacyNumber:n},{$setOnInsert:{name:'الصف '+n,legacyNumber:n,status:'active',position:n,createdAt:new Date(),updatedAt:new Date()}},{upsert:true,returnDocument:'after'});
  await db.collection('courses').updateMany({grade:n},{$set:{grade:grade._id,legacyGradeNumber:n}});
 }
 for(const [oldStatus,status] of [['active','published'],['inactive','draft']])await db.collection('courses').updateMany({status:oldStatus},{$set:{status}});
 for(const l of lessons)if(!l.courseId)await db.collection('lessons').updateOne({_id:l._id,courseId:{$exists:false}},{$set:{courseId:moduleById.get(String(l.moduleId)).courseId}});
 return {...changes,applied:true};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{if(!process.env.DB_URI)throw Error('DB_URI required');await mongoose.connect(process.env.DB_URI,{autoIndex:false});const result=await migrate({apply:process.argv.includes('--apply')});console.log(JSON.stringify(result,null,2));if(result.problems.length)process.exitCode=1;}finally{await mongoose.disconnect();}
}

