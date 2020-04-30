const sync_request = require('sync-request');

const utils = {};

utils.getRandom = (length) => {
  return Math.floor(Math.random() * (length));
};

utils.getRandomBaseRange = (start, length) => {
  //random start ~ start+end
  return start + Math.floor(Math.random() * length);
}

utils.getShortUrl = (longurl) => {
  var url = 'https://api-ssl.bitly.com/v3/shorten?access_token=d89f0aa46489a17b3ce6935c04a9f74f534492e0&longUrl=' +
    encodeURIComponent(longurl)
  var res = sync_request('GET', url);
  var info = JSON.parse(res.getBody());
  return info.data.url;
};

utils.isNumber = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

utils.getCataTag = (sourceType) => {
  if (sourceType == "group") {
    return "group";
  } else if (sourceType == "user") {
    return "users"
  } else if (sourceType == "room") {
    return "room"
  }
};

module.exports = utils;