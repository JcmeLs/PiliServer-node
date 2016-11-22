/**
 * Created by LIBA on 11/22/2016.
 */
var mongoose = require("mongoose");
var streamSchema = mongoose.Schema({
    streamkey:String,
    pilier:String,
    piliheaderimgurl:String,
    rtmpurl:String,
    snapurl:String
});
exports.stream=mongoose.model('stream',streamSchema);