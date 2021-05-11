const { user } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshToken,
  sendAccessToken,
} = require('../modules/tokenFunctions');
const { SHA256 } = require('../modules/SHA256');

module.exports = {
  signup: async (req, res) => {
    const { account, nickname, password } = req.body;
    const saltedPassword = account + password;
    const hashedPassword = SHA256(saltedPassword);

    const findAccount = await user
      .findOne({
        where: { account },
      })
      .catch((err) => {
        console.log(err); // ! check
      });

    if (!findAccount) {
      const findNickname = await user
        .findOne({
          where: { nickname },
        })
        .catch((err) => {
          console.log(err); // ! check
        });

      if (!findNickname) {
        await user // ! check await 필요 없음
          .create({
            account,
            nickname,
            password: hashedPassword,
          })
          .then((data) => {
            res.status(201).json({
              message: 'sign up succeeded',
            });
          });
      } else {
        res.status(202).json({
          message: '존재하는 닉네임입니다.',
        });
      }
    } else {
      res.status(202).json({
        message: '존재하는 아이디입니다.',
      });
    }
  },

  signin: async (req, res) => {
    const { account, password } = req.body;
    const saltedPassword = account + password;
    const hashedPassword = SHA256(saltedPassword);

    const userInfo = await user
      .findOne({
        where: { account },
        attributes: ['id', 'account', 'password', 'nickname'],
      })
      .catch((err) => {
        console.log(err); // ! check
      });

    if (!userInfo) {
      res.status(202).json({ message: '존재하지 않는 아이디입니다.' });
    } else {
      if (userInfo.password !== hashedPassword) {
        res.status(202).json({ message: '비밀번호를 확인해 주세요.' });
      } else {
        const { id, account, nickname } = userInfo;
        const tokenData = { userId: id, account, nickname };

        const accessToken = generateAccessToken(tokenData);
        const refreshToken = generateRefreshToken(tokenData);

        sendRefreshToken(res, refreshToken); // ! check sendRefreshToken, sendAccessToken 순서
        sendAccessToken(res, accessToken);
      }
    }
  },
};
