const { user, place } = require('../models');
const { checkAccessToken } = require('../modules/tokenFunctions');

module.exports = {
  index: async (req, res) => {
    const accessTokenData = checkAccessToken(req, res);
    if (accessTokenData === 'invalid token') {
      return;
    }

    const { account } = accessTokenData;
    const { urlAccount } = req.body;

    const urlAccountUserInfo = await user.findOne({
      where: { account: urlAccount },
      attributes: ['id'],
    });

    if (!urlAccountUserInfo) {
      res.status(202).json({ message: 'no such account' });
    } else {
      const placeInfo = await place.findAll({
        where: { userId: urlAccountUserInfo.id },
        attributes: ['id', 'lat', 'lng'],
      });
      if (account !== urlAccount) {
        res.status(200).json({ placeInfo, message: '!owner' });
      } else {
        res.status(200).json({ placeInfo, message: 'owner' });
      }
    }
  },
};
