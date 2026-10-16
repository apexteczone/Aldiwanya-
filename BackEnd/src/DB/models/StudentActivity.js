import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,unique:true},
 favoriteLessons:[{type:mongoose.Schema.Types.ObjectId,ref:'Lesson'}],
 startedCourses:[{type:mongoose.Schema.Types.ObjectId,ref:'Course'}],
 completedLessons:[{type:mongoose.Schema.Types.ObjectId,ref:'Lesson'}],
},{timestamps:true});
export default mongoose.model('StudentActivity',schema);
