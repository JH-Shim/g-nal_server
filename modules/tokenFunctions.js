require('dotenv').config();
// https://www.npmjs.com/package/jsonwebtoken
const { sign, verify } = require('jsonwebtoken'); // ! check details about JWT

module.exports = {
  generateAccessToken: (data) => {
    return sign(data, process.env.ACCESS_SECRET, { expiresIn: '1d' }); // ! check expiresIn
  },

  generateRefreshToken: (data) => {
    return sign(data, process.env.REFRESH_SECRET, { expiresIn: '2d' });
  },

  sendAccessToken: (res, accessToken) => {
    res.status(200).json({
      accessToken,
      message: 'sign in succeeded',
    });
  },

  sendRefreshToken: (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });
  },

  checkAccessToken: (req, res) => {
    const authorization = req.headers['authorization'];
    // if (!authorization) {
    //   return null; // ! check 왜 이 조건으로는 안빠지지?
    // }
    try {
      return verify(authorization, process.env.ACCESS_SECRET);
    } catch (err) {
      console.log(err);
      res.status(202).json({
        message: 'invalid token',
      });
      return 'invalid token';
    }
    // ! check refactoring?
    // const accessTokenData = checkAccessToken(req, res);
    // if (accessTokenData === 'invalid token') {
    //   return;
    // }
  },

  checkRefeshToken: (refreshToken) => {
    try {
      return verify(refreshToken, process.env.REFRESH_SECRET);
    } catch (err) {
      // return null if refresh token is not valid
      return null;
    }
  },

  resendAccessToken: (res, accessToken, data) => {
    res.status(200).json({
      accessToken,
      userInfo: data,
      message: 'access token resended(by refresh token)',
    });
  },
};
