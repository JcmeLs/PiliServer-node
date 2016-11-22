var express = require('express');
var router = express.Router();
var user = require('../models/user').user;
var mongoose = require("mongoose");
var Pili = require('piliv2');


//pili config
var ACCESS_KEY = '7ylDgTI4R60h1lU__GgpJwA-LKZHCWXDXB5gXmkb';
var SECRET_KEY = 'jc2fz8ox7Jti2D0StsES75RKvw7EEKs5G8DX7cKU';
var credentials = new Pili.Credentials(ACCESS_KEY, SECRET_KEY);
var HUB = 'jcme-live';

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/PiliPlay');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
router.get('/test', function (req, res, next) {
    res.send('respond with a resource test');
});
function publishURL(streamkey) {
    var pu = Pili.publishURL(credentials, 'pili-publish.jcmels.top', HUB, streamkey, 60);
    return pu;
}

//mobile login
router.post('/mobile/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var resJson = {
        resultcode: "200",
        reason: "success",
        error_code: "0"
    }
    user.findOne({'username': username}, function (err, doc) {
        if (err) {
            res.send(500);
        } else if (!doc) {
            resJson.resultcode = "404"
            resJson.reason = "用户未注册"
            resJson.error_code = "404"
            resJson.data = "用户未注册"
            res.send(JSON.stringify(resJson));

        }
        else {

            if (password != doc.password) {
                console.dir("数据库密码" + doc.password + ",我输入的密码:" + password);
                resJson.resultcode = "404"
                resJson.reason = "密码错误"
                resJson.error_code = "404"
                resJson.data = "密码错误"
                res.send(JSON.stringify(resJson));
            } else {
                var list = {
                    list: doc,
                }
                resJson.data = list;
                res.send(JSON.stringify(resJson));
            }
        }
    })

})


router.post('/mobile/register', function (req, res) {
    console.dir("welcome");
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var resJson = {
        resultcode: "200",
        reason: "success",
        error_code: "0"
    }
    console.dir(req.body.password);
    var adduser = new user({
        username: username,
        email: email,
        password: password,
    })
    user.findOne({"$or": [{"username": username}, {"email": email}]}, function (err, doc) {
        if (err) res.send(err);
        else if (doc) {
            resJson.resultcode = "500";
            resJson.error_code = "500";
            resJson.reason = "用户已存在";
            resJson.data = "注册失败请重试"
            res.send(JSON.stringify(resJson));
        }
        else {

            adduser.save(function (err) {
                if (err) {
                    resJson.resultcode = "400";
                    resJson.error_code = "400";
                    resJson.reason = "保存失败";
                    resJson.data = "注册失败请重试"
                    res.send(JSON.stringify(resJson));
                    return;
                }
                resJson.data = "注册成功";
                user.findOne({"$or": [{"username": username}]}, function (err, doc) {
                    if (err) ;
                    console.dir(doc.id);
                    user.update({"_id": doc.id}, {"streamkey": doc.id,"piliurl":publishURL(doc.id)}, function (err) {
                        if (err) ;
                        console.dir("更新成功");

                    })
                });
                res.send(JSON.stringify(resJson));
            })
        }
    })
    console.dir(username + email + password);

})
//test
router.get("/userinfo/:username", function (req, res) {
    var username = req.params.username;
    user.findOne({"$or": [{"username": username}]}, function (err, doc) {
        if (err) ;
        console.dir(doc.id);
        // user.update({"_id": doc.id}, {"streamkey": doc.id}, function (err) {
        //     if (err) ;
        //     console.dir("更新成功、");
        // })
console.dir(publishURL(doc.id));
    });
})

module.exports = router;
