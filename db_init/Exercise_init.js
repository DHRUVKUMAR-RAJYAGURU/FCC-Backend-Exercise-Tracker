const mongoose=require('mongoose');
const exerciseDB=new mongoose.Schema({
    username:String,
    description:String,
    duration:Number,
    date:Date
});
module.exports=mongoose.model('Exercises',exerciseDB);