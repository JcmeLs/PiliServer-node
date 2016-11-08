'use strict';
var express = require('express');
var router = express.Router();
var Pili = require('piliv2');


//pili config
var ACCESS_KEY = '7ylDgTI4R60h1lU__GgpJwA-LKZHCWXDXB5gXmkb';
var SECRET_KEY = 'jc2fz8ox7Jti2D0StsES75RKvw7EEKs5G8DX7cKU';
var credentials = new Pili.Credentials(ACCESS_KEY, SECRET_KEY);
var HUB = 'jcme-live';


//Create Url
function CreateUrl(streamkey) {
    var pu = Pili.publishURL(credentials, 'pili-publish.jcmels.top', HUB, streamkey, 60);
    console.log(pu);
    var rtmpURL = Pili.rtmpPlayURL('pili-live-rtmp.jcmels.top', HUB, streamkey);
    console.log(rtmpURL);
    var hdlURL = Pili.hdlPlayURL('pili-live-hdl.jcmels.top', HUB, streamkey);
    console.log(hdlURL);
    var hlsURL = Pili.hlsPlayURL('pili-live-hls.jcmels.top', HUB, streamkey);
    console.log(hlsURL);
    var snapURL = Pili.snapshotPlayURL('pili-live-snapshot.jcmels.top', HUB, streamkey);
    console.log(snapURL);
}
function snapURL(streamkey) {
    var snapurl = Pili.snapshotPlayURL('pili-live-snapshot.jcmels.top', HUB, streamkey);
    return snapurl;
}
function publishURL(streamkey) {
    var pu = Pili.publishURL(credentials, 'pili-publish.jcmels.top', HUB, streamkey, 60);
    return pu;
}

var hub = new Pili.Hub(credentials, HUB);
//Create stream
function createStream(streamkey) {
    hub.createStream(streamkey, function (err, stream) {
        if (!err) {
            console.log(stream);
            CreateUrl(streamkey);
        } else { // Log error
            console.log(err, err.errorCode, err.httpCode);
        }
    });
}


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

//create stream-------------------------pili
router.post('/stream/:streamname', function (req, res) {
    var streamkey = req.params.streamname;
    createStream(streamkey);
    var stream = hub.newStream(streamkey);
    stream.enable(function (err) {
        console.log(stream.disabledTill);
    });

})

//get all stream-------------------------play
router.get('/streams', function (req, res) {
    var streamlist = new Array();
    //list stream
    var listOptions = {'liveonly': false, 'prefix': '', 'limit': 2,};
    var listCallBack = function (err, marker, streams) {
        if (!err) {
            streams.forEach(function (stream) {
                console.log(stream.key);
                streamlist.push(stream);
            });
            if (marker) {
                listOptions.marker = marker;
                hub.listStreams(listOptions, listCallBack);
            } else    res.send(JSON.stringify(streamlist));

        } else {
            console.log(err + 'error code: ' + err.errorCode + 'http code: ' + err.httpCode);
        }
    }
    hub.listStreams(listOptions, listCallBack);

})
//get live stream----------------------play
router.get('/streams/live', function (req, res) {
    var streamlist = new Array();
    //list stream
    var resJson = {
        resultcode: "200",
        reason: "success",
        error_code: "0"
    }
    var listOptions = {'liveonly': true, 'prefix': '', 'limit': 2,};
    var listCallBack = function (err, marker, streams) {
        if (!err) {
            streams.forEach(function (stream) {
                console.log(stream.key);
                console.dir("snapurl:" + snapURL(stream.key));
                stream.snapurl = snapURL(stream.key);
                console.dir(stream);
                streamlist.push(stream);
            });
            if (marker) {
                listOptions.marker = marker;
                hub.listStreams(listOptions, listCallBack);
            } else {
                if (streamlist.length > 0) {
                    resJson.data = streamlist;
                }
                else {
                    resJson.resultcode = "404";
                    resJson.reason = "当前没有直播";
                    resJson.data = null;
                    resJson.error_code = "404";
                }
                console.dir(resJson);
                res.send(JSON.stringify(resJson));
            }

        } else {
            console.log(err + 'error code: ' + err.errorCode + 'http code: ' + err.httpCode);
        }
    }
    hub.listStreams(listOptions, listCallBack);

})

//get publishURL -----------pili
router.get('/stream/:streamname/publishurl', function (req, res) {
    var streamkey = req.params.streamname;
    console.dir(publishURL(streamkey));
    CreateUrl(streamkey);
})

//get stream info---------------------------play
router.get('/stream/:streamname/info', function (req, res) {
    var streamkey = req.params.streamname;
    var stream = hub.newStream(streamkey);
    stream.loadInfo(function (err) {
        if (!err) {
            console.log(stream);
            var unixTimestamp = new Date(stream.createdAt * 1000);
            var commonTime = unixTimestamp.toLocaleString();
            console.dir(commonTime)

        } else {
            console.log(err + 'error code: ' + err.errorCode + 'http code: ' + err.httpCode);
        }
    })
})


//get stream live info-------------------play
router.get('/stream/:streamname/live/info', function (req, res) {
    var streamkey = req.params.streamname;
    console.dir(streamkey);
    var stream = hub.newStream(streamkey);
    stream.liveInfo(function (err, status) {
        if (!err) {
            console.log(status);
        } else {
            console.log(err + 'error code: ' + err.errorCode + 'http code: ' + err.httpCode);
        }
    });

})


//disable stream-------------------------------------------------------pili
router.post('/stream/:streamname/disable', function (req, res) {
    var streamkey = req.params.streamname;
    var stream = hub.newStream(streamkey);
    stream.disable(-1, function (err) {
        console.log(stream.disabledTill);
    });
})

//enable stream-------------------------------------------------------pili
router.post('/stream/:streamname/enable', function (req, res) {
    var streamkey = req.params.streamname;
    var stream = hub.newStream(streamkey);
    stream.enable(function (err) {
        console.log(stream.disabledTill);
    });
})

//Get Stream history activity
router.get('/stream/:streamname/history', function (req, res) {
    var streamkey = req.params.streamname;
    console.dir(streamkey);
    var stream = hub.newStream(streamkey);
    var publishHistoryOptions = {
        start: null,    // optional, in second, unix timestamp
        end: null,    // optional, in second, unix timestamp
    };
    stream.publishHistory(publishHistoryOptions, function (err, history) {
        if (!err) {
            console.log(history);
        } else {
            console.log(err + 'error code: ' + err.errorCode + 'http code: ' + err.httpCode);
        }
    })

})


//Save Stream live playback
router.post('/stream/:streamname/playback', function (req, res) {
    var streamkey = req.params.streamname;
    var stream = hub.newStream(streamkey);
    var savePlaybackOptions = {
        start: null,    // optional, in second, unix timestamp
        end: null,    // optional, in second, unix timestamp
    };

    stream.savePlayback(savePlaybackOptions, function (err, m3u8Name) {

        if (!err) {
            console.log(m3u8Name);
        } else {
            console.log(err + 'error code: ' + err.errorCode + 'http code: ' + err.httpCode);
        }
    });

})


module.exports = router;
