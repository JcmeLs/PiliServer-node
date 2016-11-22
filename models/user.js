var mongoose = require("mongoose");
var userSchema = mongoose.Schema({
    username: String,
    email:String,
    password:String,
    streamkey:String,
    piliurl:String
});
exports.user=mongoose.model('user',userSchema);