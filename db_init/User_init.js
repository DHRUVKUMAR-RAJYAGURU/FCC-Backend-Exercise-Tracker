const mongoose=require('mongoose');
const userDB=new mongoose.Schema({
    username:String
});
module.exports=mongoose.model('Users',userDB);