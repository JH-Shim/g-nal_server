const { user, place } = require('../models');
const { checkAccessToken } = require('../modules/tokenFunctions');

module.exports = {
  multer: async (req, res) => {
    const image = req.file;
    if (!image) {
      res.status(202).json({ message: 'image not sent' });
    } else {
      const imagePath = req.file.path;
      if (imagePath === undefined) {
        return res.status(400).json({ message: '서버에 문의해주세요' });
      }
      res.status(201).json({ message: 'image uploaded', imagePath });
    }
  },

  multers3: async (req, res) => {
    const image = req.file;
    if (!image) {
      res.status(202).json({ message: 'image not sent' });
    } else {
      const imageURL = req.file.location;
      if (imageURL === undefined) {
        return res.status(400).json({ message: '서버에 문의해주세요' });
      }
      res.status(201).json({ message: 'image uploaded', imageURL });
    }
  },

  // ! /image/place로 record를 먼저 만들어준 후,
  // ! /image/placeimg로 places 테이블의 placePhoto field를 업데이트 해준다.
  // ! 위와 관련한 비효율에 관해서는 추후에 더 알아본 후 리팩토링합시다.
  place: async (req, res) => {
    const accessTokenData = checkAccessToken(req, res);
    if (!accessTokenData || accessTokenData === 'invalid token') {
      return;
    }

    const { userId, nickname } = accessTokenData;
    const { placeName, placeDescription, lat, lng } = req.body;

    const newPlace = await place.create({
      userId,
      nickname,
      placeName,
      placeDescription,
      lat,
      lng,
    });

    const newPlaceId = newPlace.id;

    res.json({ placeId: newPlaceId });
  },

  placeimg: async (req, res) => {
    // place.update();
  },
};
