
import mongoose from 'mongoose';


const usersModel = new mongoose.Schema({
    first_name:{
        type:String,
        required:[true,"Please Provide a first name"],
        unique:true
    },
    last_name:{
        type:String,
        required:[true,"Please Provide a last_name"],
        unique:true
    },
    email:{
        type:String,
        required:[true,"Please Provide a email"],
        unique:true
    },
    contact:{
        type:String,
        required:[true,"Please Provide a contact"],
        unique:true,
        MaxKey:12
    },
    password:{
        type:String,
        required:[true,"Please Provide a password"]
    },
    status: {
        type: String,
        enum: ['Active','Inactive'],
        default: ''
    },
    user_type: {
        type: String,
        enum: ['Admin','User'],
        default: ''
    },
    created_on: {
        type: Date,
        default: Date.now,
        immutable: true
    },
});

 export default mongoose.models.Users || mongoose.model('Users',usersModel);