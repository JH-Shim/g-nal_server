const { user } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshToken,
  sendAccessToken,
  isAuthorized,
} = require('../modules/tokenFunctions');
const { SHA256 } = require('../modules/SHA256');

module.exports = {
  signup: async (req, res) => {
    const { userId, nickname, password } = req.body;
    const saltedPassword = userId + password;
    const hashedPassword = SHA256(saltedPassword);

    const findUserId = await user
      .findOne({
        where: { userId },
      })
      .catch((err) => {
        console.log(err); // ! check
      });

    if (!findUserId) {
      await user
        .create({
          userId,
          nickname,
          password: hashedPassword,
        })
        .then((data) => {
          res.status(200).json({
            message: 'signup succeeded',
          });
        });
    } else {
      res.status(201).json({
        message: 'existing userId',
      });
    }
  },

  signin: async (req, res) => {
    const { userId, password } = req.body;
    const saltedPassword = userId + password;
    const hashedPassword = SHA256(saltedPassword);

    const findUserId = await user
      .findOne({
        where: { userId },
      })
      .catch((err) => {
        console.log(err); // ! check
      });

    if (!findUserId) {
      return res.status(201).json({ message: 'userId does not exist' });
    } else {
      user
        .findOne({
          where: {
            userId,
            password: hashedPassword,
          },
        })
        .then((data) => {
          if (!data) {
            return res.status(202).json({ message: 'wrong password' });
          }

          const { id, userId } = data.dataValues;
          const userInfo = { id, userId };

          const accessToken = generateAccessToken(userInfo);
          const refreshToken = generateRefreshToken(userInfo);

          sendAccessToken(res, accessToken);
          sendRefreshToken(res, refreshToken);
        })
        .catch((err) => {
          console.log(err); // ! check
        });
    }
  },

  logout: async (req, res) => {
    const accessTokenData = isAuthorized(req);
    if (!accessTokenData) {
      return res.status(201).json({
        message: 'logout failed(no token in req.headers.authorization)',
      });
    } else if (accessTokenData === 'invalid token') {
      return res.status(201).json({
        message: 'logout failed(invalid token)',
      });
    }
    res.status(200).json({ message: 'logout succeded' });
  },
};
