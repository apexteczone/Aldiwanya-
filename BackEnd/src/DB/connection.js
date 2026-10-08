import mongoose from 'mongoose';
export default async function connectDB() {
 if(!process.env.DB_URI) throw new Error('DB_URI must be configured');
 await mongoose.connect(process.env.DB_URI,{serverSelectionTimeoutMS:5000,autoIndex:process.env.NODE_ENV!=='production'});
 const db=mongoose.connection.db;
 if(await db.collection('courses').findOne({$or:[{grade:{$type:'number'}},{status:{$in:['active','inactive']}}]}) || await db.collection('lessons').findOne({courseId:{$exists:false}})) throw new Error('Legacy data requires the reviewed schema migration');
}


