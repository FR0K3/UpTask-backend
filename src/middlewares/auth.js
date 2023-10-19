const debug = require('debug')('uptask:auth');
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

const checkAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decodedToken.id).select("-password -confirmed -token -createdAt -updatedAt -__v");

            return next();
        } catch (error) {
            return res.status(401).json({ msg: "Invalid token" });
        }
    }

    if (!token)
        return res.status(401).json({ msg: "No token, authorization denied" });

    next();
}

exports.checkAuth = checkAuth;