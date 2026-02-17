import mongoose from "mongoose";
const{Schema}= mongoose;

const UserSchema=new Schema({
    firstName:{type:String,required:true,minLength:2,maxLength:20},
    lastName:{type:String,required:true,minLength:3,maxLength:20},
    emailId:{type:String,required:true,unique:true, trim:true,lowercase:true,immutable:true},
    age:{type:Number},
    role:{type:String,enum:['user','admin'],default:'user'},
    mobile:{type:String,unique:true,required:true},
    password:{type:String, required:true},
    image:{  url: String,publicId: String}
},{timestamps:true});

const User=mongoose.model("user",UserSchema);
export default User;