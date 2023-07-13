const jwt = require('jsonwebtoken');
const crypto = require('crypto-js');

function generateTokenWithExp(payload) {
  let jwtCRYPT = jwt.sign(payload, process.env.SECRET, { expiresIn: '2 days' });
  return crypto.AES.encrypt(jwtCRYPT, process.env.ACCESS_KEY).toString();
}
function generateTokenWOExp(payload) {
  let jwtCRYPT = jwt.sign(payload, process.env.SECRET);
  return crypto.AES.encrypt(jwtCRYPT, process.env.ACCESS_KEY).toString();
}

function verifyToken(token, cb) {
  return jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, decoded);
    }
  });
}

module.exports = {
  generateTokenWOExp,
  generateTokenWithExp,
  verifyToken,
};