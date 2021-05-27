const sequelize = require('sequelize'); // ! check
// const { sequelize, user, place } = require('../models');
const { user, place, comment } = require('../models');
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
            sequelize.fn(
              'date_format',
              sequelize.col('createdAt'),
              '%Y년 %c월 %e일',
            ),
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
          sequelize.fn(
            'date_format',
            sequelize.col('place.createdAt'),
            '%Y년 %c월 %e일 %H:%m',
          ),
          'createdAt',
        ],
      ],
      order: [[comment, 'id', 'DESC']],
      include: [
        {
          model: comment,
          attributes: [
            ['id', 'commentId'],
            'comment',
            'userId',
            'nickname',
            [
              sequelize.fn(
                'date_format',
                sequelize.col('comments.createdAt'),
                '%Y/%c/%e',
              ),
              'createdAt',
            ],
          ],
        },
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

  comment: async (req, res) => {
    const accessTokenData = checkAccessToken(req, res);
    if (accessTokenData === 'invalid token') {
      return;
    }

    const { userId, nickname } = accessTokenData;
    const { placeId } = req.params;

    comment
      .create({
        placeId,
        comment: req.body.newComment,
        userId,
        nickname,
      })
      .then((data) => {
        res.status(202).json({ message: 'comment added' });
      });
    // .catch() // ! check
  },
};
