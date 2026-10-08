import mongoose from 'mongoose';
// Preserve both developer schemas without rewriting existing records.
const schema = new mongoose.Schema({
 title: {type:String,required:true,trim:true,minlength:2,maxlength:150},
 description: {type:String,default:'',maxlength:2000},
 price:{type:Number,min:0,default:0}, durationHours:{type:Number,min:0,default:0},
 subject: {type:String,default:'',maxlength:100},
 grade: {type:mongoose.Schema.Types.ObjectId,ref:'Grade',required:true,index:true},
 track: {type:String,default:null}, term: {type:String,default:null}, academicYear:{type:String,default:null},
 thumbnail:{type:String,default:null}, coverImage:{type:String,default:''},
 position:{type:Number,default:0,min:0}, lessonsCount:{type:Number,default:0},
 videosCount:{type:Number,default:0}, enrolledCount:{type:Number,default:0},
 status:{type:String,enum:['draft','published'],default:'draft',index:true}
},{timestamps:true});
schema.index({grade:1,position:1});
export default mongoose.model('Course',schema);


