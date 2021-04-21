const { isAuthorized } = require('../controllers/tokenFunctions');

exports.checkAccessToken = (req, res) => {
  // ! asdfasdf 리팩토링 해야하나?
  // const accessTokenData = checkAccessToken(req, res);
  // if (!accessTokenData || accessTokenData === 'invalid token') {
  //   return;
  // }

  const accessTokenData = isAuthorized(req);
  if (!accessTokenData) {
    res.status(201).json({
      message: 'no token in request headers',
    });
  } else if (accessTokenData === 'invalid token') {
    res.status(201).json({
      message: 'invalid token',
    });
  }
  return accessTokenData;
};
