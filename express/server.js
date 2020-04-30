'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');

const line = require('@line/bot-sdk');
const line_api = require('./line_api.js');

const config = {
  channelAccessToken: "PRt8Txg9wGTbGYc3CLCmOFVRfhFZje8XX3i54mcYkqkbdugc381oMpb5WoHpf3wkEBFSXthoSULCVAhdyR9vyyBKncVMQe62FNGEJhFy9IsfNz6p2M7Q+FUGrT2W2bBAo1+43HONg+i05bld93f72AdB04t89/1O/w1cDnyilFU=",
  channelSecret: "c9b4359a229ca375989d58690d490372",
};

const KKBOX_SONG_TYPE = {
  SEARCH: 1,
  POPULAR_CHINESE: 2,
  POPULAR_WESTERN: 3,
  POPULAR_KOREAN: 4,
  POPULAR_JAPANESE: 5
};

const client = new line.Client(config);

const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});

router.get('/getip', (req, res) => {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  return res.send("show_ip('" + ip + "');");
});

router.get('/push', (req, res) => {
  client.pushMessage("Uc1cf0b16a4cfa6d9b099cc918064536d", {
    type: 'text',
    text: "test"
  }).catch(function(error) {
    console.log(error);
  });
});

router.post('/callback', line.middleware(config), (req, res) => {
  console.log("callback");
  Promise.all(req.body.events.map(handleEvent))
    .then(() => {
      //
    })
    .catch((err) => {
      console.error(err);
    });
});

function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
      }

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken, source) {
  console.log("User id:" + source.userId)
  console.log("User replyToken:" + replyToken)
  console.log("message:" + message.text);

  message.text = message.text.trim();

  if (message.text.startsWith('雲')) {
    handleSatellite(client, replyToken);
  } else if (message.text.startsWith('歌')) {
    handleHotKKBox(client, replyToken, "RZ3F5iXhFMAz1dqkHv6K1w==", KKBOX_SONG_TYPE.POPULAR_CHINESE);
  }
}

function handleSatellite(client, replyToken) {
  console.log("handleSatellite");

  var options = {
    url: "https://www.cwb.gov.tw/Data/js/obs_img/Observe_sat.js",
    method: 'GET'
  };
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var first = body.indexOf("\'LCC_IR1_CR_2750");
      var next = body.indexOf('\'', first + 1);
      var satellite_url = "https://www.cwb.gov.tw/Data/satellite/" + body.substring(first + 1, next);

      console.log("satellite_url:" + satellite_url);

      var options = {
        url: "https://www.cwb.gov.tw/Data/js/obs_img/Observe_radar.js",
        method: 'GET'
      };
      request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var first = body.indexOf("\'CV1_TW_3600");
          var next = body.indexOf('\'', first + 1);
          var rader_url = "https://www.cwb.gov.tw/Data/radar/" + body.substring(first + 1, next);

          console.log("rader_url:" + rader_url);

          let sateImageMessage = line_api.getImageMessage(satellite_url);
          let raderImageMessage = line_api.getImageMessage(rader_url);

          let pushMsgArr = [];
          pushMsgArr.push(sateImageMessage);
          pushMsgArr.push(raderImageMessage);

          line_api.replyMessage(client, replyToken, pushMsgArr);
        }
      });
    }
  });
}

function handleHotKKBox(client, replyToken, access_token, song_type) {
  var type_title = "華語單曲日榜";
  if (song_type == KKBOX_SONG_TYPE.POPULAR_CHINESE) {
    type_title = "華語單曲日榜";
  } else if (song_type == KKBOX_SONG_TYPE.POPULAR_WESTERN) {
    type_title = "西洋單曲日榜";
  } else if (song_type == KKBOX_SONG_TYPE.POPULAR_KOREAN) {
    type_title = "韓語單曲日榜";
  } else if (song_type == KKBOX_SONG_TYPE.POPULAR_JAPANESE) {
    type_title = "日語單曲日榜";
  }

  var options = {
    url: "https://api.kkbox.com/v1.1/charts",
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  };
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);

      for (var i = 0; i < info.data.length; i++) {
        if (info.data[i].title.indexOf(type_title) !== -1) {

          var options_1 = {
            url: 'https://api.kkbox.com/v1.1/shared-playlists/' + info.data[i].id,
            headers: {
              'Authorization': 'Bearer ' + access_token
            }
          };

          request(options_1, async function(error, response, body) {
            if (!error && response.statusCode == 200) {
              var info = JSON.parse(body);
              var songIndex = utils.getRandom(info.tracks.data.length);
              var song_id = info.tracks.data[songIndex].id
              var song_name = info.tracks.data[songIndex].name
              var song_duration = info.tracks.data[songIndex].duration
              var album_name = info.tracks.data[songIndex].album.name
              var album_image_url = info.tracks.data[songIndex].album.images[1].url
              var artist_name = ""
              var artist_image_url = ""
              if (info.tracks.data[songIndex].album.artist !== undefined) {
                artist_name = info.tracks.data[songIndex].album.artist.name
                artist_image_url = info.tracks.data[songIndex].album.artist.images[1].url
              }

              console.log("song_name:" + song_name);
              console.log("song_id:" + song_id);

              var options_2 = {
                url: "https://api.kkbox.com/v1.1/tickets",
                headers: {
                  'Authorization': 'Bearer ' + access_token,
                  'content-type': 'application/json'
                },
                json: {
                  'track_id': song_id
                },
                method: 'POST'
              };
              request(options_2, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                  var info = JSON.stringify(body)
                  var obj = JSON.parse(info);
                  console.log("obj.url:" + obj.url);

                  let ticket = obj.url;
                  console.log("ticket:" + ticket);

                  let message = artist_name + '-' + album_name + '-' + song_name + "\n";
                  message += ticket;
                  console.log("message:" + message);

                  let albumImageMessage = line_api.getImageMessage(album_image_url);
                  let textMessage = line_api.getTextMessage(message);

                  let pushMsgArr = [];
                  pushMsgArr.push(albumImageMessage);
                  pushMsgArr.push(textMessage);

                  line_api.replyMessage(client, replyToken, pushMsgArr);
                }
              });
            }
          });
        }
      }
    }
  });
}

app.use('/.netlify/functions/server', router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
