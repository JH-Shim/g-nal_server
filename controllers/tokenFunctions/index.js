require('dotenv').config();
// https://www.npmjs.com/package/jsonwebtoken
const { sign, verify } = require('jsonwebtoken');

module.exports = {
  generateAccessToken: (data) => {
    // asdfasdf
    return sign(data, process.env.ACCESS_SECRET, { expiresIn: '1d' });
  },

  generateRefreshToken: (data) => {
    return sign(data, process.env.REFRESH_SECRET, { expiresIn: '2d' });
  },

  sendRefreshToken: (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });
  },
  sendAccessToken: (res, accessToken, permission) => {
    res.status(200).json({
      accessToken,
      permission,
      message: 'datda login succeeded',
    });
  },

  resendAccessToken: (res, accessToken, data) => {
    res.status(200).json({
      accessToken,
      userInfo: data,
      message: 'access token resended(by refresh token)',
    });
  },

  isAuthorized: (req) => {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      return null;
    }
    // const token = authorization.split(' ')[1];
    try {
      return verify(authorization, process.env.ACCESS_SECRET);
    } catch (err) {
      // return null if invalid token
      console.log(err);
      return 'invalid token';
    }
  },

  checkRefeshToken: (refreshToken) => {
    try {
      return verify(refreshToken, process.env.REFRESH_SECRET);
    } catch (err) {
      // return null if refresh token is not valid
      return null;
    }
  },
};
