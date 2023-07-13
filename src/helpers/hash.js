const bcrypt = require('bcryptjs');

function hashPass(plainPass) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(plainPass, salt);
    return hash
}

function checkPass(plainPass, hashPassword) {
    return bcrypt.compareSync(plainPass, hashPassword);
}   

module.exports = {
    hashPass,
    checkPass
}