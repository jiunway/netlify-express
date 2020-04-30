const line_api = {};

line_api.replyText = (client, token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({
      type: 'text',
      text
    }))
  ).catch((error) => {
    console.log(JSON.stringify(error));
  });
};

line_api.replyMessage = (client, replyToken, messageArr) => {
  return client.replyMessage(replyToken, messageArr).catch(function (error) {
    console.log(error);
  });
};

line_api.pushMessage = (client, pushToken, messageArr) => {
  return client.pushMessage(pushToken, messageArr).catch(function (error) {
    console.log(error);
  });
};

line_api.getImageMessage = (image_url) => {
  return {
    type: 'image',
    originalContentUrl: image_url,
    previewImageUrl: image_url
  }
};

line_api.getTextMessage = (message) => {
  return {
    type: 'text',
    text: message
  }
};

line_api.getStickerMessage = (package_id, sticker_id) => {
  return {
    type: 'sticker',
    packageId: package_id,
    stickerId: sticker_id
  }
};

function getBubbleMessageForImage(image_url) {
  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "image",
          "url": image_url,
          "size": "full",
          "aspectMode": "cover",
          "aspectRatio": "5:6",
          "gravity": "top"
        }
      ],
      "paddingAll": "10px"
    }
  }
};

// function getBubbleMessageForImage(image_url) {
//   return {
//     "imageUrl": image_url,
//     "action": {
//       "type": "uri",
//       "label": "View detail",
//       "uri": image_url
//     }
//   }
// };

line_api.getFlexMessageForImage = (image_arr, title) => {
  let json_str = '{"type": "flex","altText": "' + title + '","contents": {"type": "carousel","contents": []}}';
  let jsonObj = JSON.parse(json_str);

  for (var i = 0; i < image_arr.length; i++) {
    let image_url = image_arr[i];
    jsonObj["contents"]["contents"].push(getBubbleMessageForImage(image_url));
  }

  return jsonObj;
};

// line_api.getFlexMessageForImage = (image_arr) => {
//   let json_str = '{"type": "template","altText": "beauty massage","template": {"type": "image_carousel","columns": []}}';
//   let jsonObj = JSON.parse(json_str);

//   for (var i = 0; i < image_arr.length; i++) {
//     let image_url = image_arr[i];
//     jsonObj["template"]["columns"].push(getBubbleMessageForImage(image_url));
//   }

//   return jsonObj;
// };

module.exports = line_api;
