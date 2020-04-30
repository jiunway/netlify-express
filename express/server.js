'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const line = require('@line/bot-sdk');
const lineNotify = require('express-line-notify');

var config_line_notify_netlify = {
  clientId: "PV01I9aQ6xoTTipJXXdR8a",
  clientSecret: "VCB2nROGXky7MaO8dJXnpVClCo9PyGCq6nvnjEIRelK"
}

const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});

app.get('/getip', (req, res) => {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  return res.send("show_ip('" + ip + "');");
});

router.use('/line_notify_netlify',
  lineNotify(config_line_notify_netlify),
  function(req, res) {
    const token = req['line-notify-access-token'];
    console.log("token:" + token);
  }
);

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
