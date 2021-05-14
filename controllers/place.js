const sequelize = require('sequelize'); // ! check
// const { sequelize, user, place } = require('../models');
const { user, place } = require('../models');
const { checkAccessToken } = require('../modules/tokenFunctions');

module.exports = {
  index: async (req, res) => {
    const accessTokenData = checkAccessToken(req, res);
    if (accessTokenData === 'invalid token') {
      return;
    }

    const { userId } = accessTokenData;
    const { urlAccount } = req.query;

    const urlAccountUserInfo = await user.findOne({
      where: { account: urlAccount },
      attributes: ['id'],
    });

    if (!urlAccountUserInfo) {
      res.status(202).json({ message: 'no such account' });
    } else {
      const placeInfo = await place.findAll({
        where: { userId: urlAccountUserInfo.id },
        order: [['id', 'DESC']],
        attributes: [
          'id',
          'lat',
          'lng',
          'placeName',
          'placePhoto',
          [
            sequelize.fn('date_format', sequelize.col('createdAt'), '%Y-%m-%d'),
            'createdAt',
          ],
        ],
      });
      if (urlAccountUserInfo.id !== userId) {
        res.status(200).json({ placeInfo, message: '!owner' });
      } else {
        res.status(200).json({ placeInfo, message: 'owner' });
      }
    }
  },

  placeId: async (req, res) => {
    const accessTokenData = checkAccessToken(req, res);
    if (accessTokenData === 'invalid token') {
      return;
    }

    const { userId } = accessTokenData;
    const { placeId } = req.params;
    const { urlAccount } = req.query;

    const placeInfo = await place.findOne({
      where: { id: placeId },
      attributes: [
        'userId',
        'account',
        'nickname',
        'placeName',
        'placePhoto',
        'placeDescription',
        [
          sequelize.fn('date_format', sequelize.col('createdAt'), '%Y-%m-%d'),
          'createdAt',
        ],
      ],
    });

    if (!placeInfo || placeInfo.account !== urlAccount) {
      res.status(202).json({ message: 'no such place' });
    } else if (placeInfo.userId !== userId) {
      res.status(200).json({ placeInfo, message: '!owner' });
    } else {
      res.status(200).json({ placeInfo, message: 'owner' });
    }
  },
};
