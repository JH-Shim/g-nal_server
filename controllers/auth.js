const { user, institution } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshToken,
  sendAccessToken,
  isAuthorized,
} = require('./tokenFunctions');
const { SHA256 } = require('../modules/SHA256');

module.exports = {
  hashTest: async (req, res) => {
    const asdf = req.body.asdf;
    const zxcv = req.body.zxcv;
    const qwer = asdf + zxcv;
    const qaz = SHA256(qwer);
    res.json({ message: 'near', asdf, zxcv, qwer, qaz });
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    // ! changed ======================================
    const saltedPassword = email + password;
    const hashedPassword = SHA256(saltedPassword);
    // ! ==============================================

    const findEmail = await user
      .findOne({
        where: { email },
      })
      .catch((err) => {
        console.log(err);
      });
    if (!findEmail) {
      return res.status(201).json({ message: 'email does not exist' });
    } else {
      user
        .findOne({
          where: {
            email,
            password: hashedPassword,
          },
        })
        .then((data) => {
          if (!data) {
            return res.status(202).json({ message: 'wrong password' });
          }
          // delete data.dataValues.password;
          // delete data.dataValues.passwordChange;
          // delete data.dataValues.salt;
          // ! before change =======================================
          // const { id, email, permission, guest } = data.dataValues;
          // const userInfo = { userId: id, email, permission, guest };
          // ! after change =======================================
          const { id, permission, guest } = data.dataValues;
          const userInfo = { userId: id, permission, guest };
          // ! =====================================================

          // const accessToken = generateAccessToken(data.dataValues);
          const accessToken = generateAccessToken(userInfo);
          const refreshToken = generateRefreshToken(userInfo);

          sendRefreshToken(res, refreshToken);
          sendAccessToken(res, accessToken, permission);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  },

  logout: async (req, res) => {
    const accessTokenData = isAuthorized(req);
    if (!accessTokenData) {
      return res.status(201).json({
        message: 'datda logout failed(no token in req.headers.authorization)',
      });
    } else if (accessTokenData === 'invalid token') {
      return res.status(201).json({
        message: 'datda logout failed(invalid token)',
      });
    }
    res.status(200).json({ message: 'datda logout succeded' });

    // ! aws 쿠키 관련 이슈 코드 ===========
    // res.send({ asdf: req.cookies });
    // =================================
  },

  signup: async (req, res) => {
    const { password, permission, userName, email, mobile, role } = req.body;
    // ! changed ======================================
    const saltedPassword = email + password;
    const hashedPassword = SHA256(saltedPassword);
    // ! ==============================================
    const findEmail = await user
      .findOne({
        where: { email },
      })
      .catch((err) => {
        console.log(err);
      });
    if (!findEmail) {
      await user
        .create({
          password: hashedPassword,
          permission,
          name: userName,
          email,
          mobile,
          role,
        })
        .then((data) => {
          res.status(200).json({
            message: 'signup succeeded',
          });
        });
    } else {
      res.status(201).json({
        message: 'existing email',
      });
    }
  },

  isEmail: async (req, res) => {
    const { email } = req.body;
    const findEmail = await user
      .findOne({
        where: { email },
      })
      .catch((err) => {
        console.log(err);
      });
    if (!findEmail) {
      res.status(200).json({
        message: 'email available',
      });
    } else {
      res.status(201).json({
        message: 'existing email',
      });
    }
  },

  institution: async (req, res) => {
    const { institutionName, master, info } = req.body;
    const { password, permission, userName, email, mobile, role } = req.body;

    // ! changed ======================================
    const saltedPassword = email + password;
    const hashedPassword = SHA256(saltedPassword);
    // ! ==============================================

    institution
      .create({
        name: institutionName,
        master,
        info,
      })
      // ! 기관 등록 완료 후 institutionId를 이용하여 유저를 등록한다.
      // ! asdfasdf transactions?
      // ! < 에러 가능성 >
      // ! 실제상황에서는 그런 일이 안생기겠지만, 현재의 코드에서는 이미 가입된 이메일을 기재했을 경우, institution이 2번 등록되는 문제가 생길 수 있음.(이건 (1)institutionId로 구분하거나, (2)더 최근에 만들어진 놈을 선택하게(findOne이 원래 그러나?) 하는 등의 방법으로 문제상황을 해결할 수 있음) 물론, 이미 앞에서 유효성 검사(isEmail)로 그런 일을 애초에 차단해서 실제상황에서는 그런 일이 생길 일이 없을 듯.
      // ! asdfasdf < 해킹 > 유효성 검사 마친 후 개발자 도구에서 상태를 변경한 후 가입해버리면, 아래처럼 email existence를 double check 하지 않는 경우 DB 꼬이게 만들 수 있음ㅋ 별로 웃기지는 않는 듯.
      .then(async (data) => {
        const institutionId = data.dataValues.id;

        const findEmail = await user
          .findOne({
            where: { email },
          })
          .catch((err) => {
            console.log(err);
          });
        if (!findEmail) {
          user
            .create({
              password: hashedPassword,
              permission,
              name: userName,
              email,
              mobile,
              role,
              institutionId,
              guest: false,
            })
            .then((data) => {
              res.status(200).json({
                message: 'institution signup succeeded',
                institutionId,
                institutionName,
              });
            });
        } else {
          res.status(201).json({
            message: 'existing email',
          });
        }
      });
  },
};
