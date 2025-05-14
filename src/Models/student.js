const { default: mongoose } = require("mongoose");


 const StudentModel = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    country:String,
    age:Number,
    cnic:String,
    phone:String
});

export const Students = mongoose.models.Students || mongoose.model("student",StudentModel);