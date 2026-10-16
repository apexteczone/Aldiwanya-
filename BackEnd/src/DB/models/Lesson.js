import mongoose from 'mongoose';
const schema=new mongoose.Schema({
  courseId:{type:mongoose.Schema.Types.ObjectId,ref:'Course',required:true,index:true},
  moduleId:{type:mongoose.Schema.Types.ObjectId,ref:'Module',index:true},
  title:{type:String,required:true,trim:true,minlength:2,maxlength:150},
  description:{type:String,trim:true,maxlength:2000,default:''},
  internalNotes:{type:String,trim:true,maxlength:2000,default:'',select:false},
  videoId:{type:String,trim:true,default:null,match:/^[A-Za-z0-9_-]{11}$/,select:false},
  thumbnailUrl:{type:String,default:''},
  durationSeconds:{type:Number,min:0,max:86400,default:0},
  isFreePreview:{type:Boolean,default:false,index:true},
  position:{type:Number,required:true,default:0,min:0,index:true},
  status:{type:String,enum:['draft','published'],default:'draft',index:true},
  legacyVideoId:{type:mongoose.Schema.Types.ObjectId,select:false},
},{timestamps:true});
schema.index({courseId:1,position:1});
export default mongoose.model('Lesson',schema);
