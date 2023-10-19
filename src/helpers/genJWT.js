const jwt = require('jsonwebtoken');

const genJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}

exports.genJWT = genJWT;