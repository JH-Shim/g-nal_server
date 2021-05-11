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

  place: async (req, res) => {
    const accessTokenData = checkAccessToken(req, res);
    if (accessTokenData === 'invalid token') {
      return;
    }

    const placePhoto = req.file.location;
    if (!placePhoto) {
      res.status(202).json({ message: 'image error' }); // ! check 이런 일은 없을 것 같다.
    } else {
      const { account, nickname } = accessTokenData;
      const { placeName, placeDescription, lat, lng } = req.body;

      await place
        .create({
          account,
          nickname,
          placeName,
          placeDescription,
          placePhoto,
          lat,
          lng,
        })
        .then((data) => {
          res.status(201).json({ message: 'place uploaded' });
        });
    }
  },
};
