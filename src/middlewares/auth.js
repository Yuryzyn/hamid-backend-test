const CryptoJS = require('crypto-js');

const { verifyToken } = require('../helpers/token');
// const userHamid = require('../models/login').default;

const jwtAuthenticate = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (token) {
      const decrypt = CryptoJS.AES.decrypt(
        token,
        process.env.ACCESS_KEY
      ).toString(CryptoJS.enc.Utf8);
      verifyToken(decrypt, async (err, decoded) => {
        if (err) {
          next({
            message: `Kredensial anda bermasalah. Harap login ulang!`,
            status: 403,
          });
        } else if (decoded) {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      next({ status: 403, message: 'Anda harus login terlebih dahulu' });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  jwtAuthenticate,
};