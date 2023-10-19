const debug = require('debug')('uptask:userctrl')
const User = require('../models/User.js');
const { genID } = require('../helpers/genId.js');
const { genJWT } = require('../helpers/genJWT.js');
const { emailRegister, forgotPassword } = require('../helpers/emails.js');

exports.createUser = async (req, res) => {
    const { email } = req.body;
    const userExist = await User.findOne({ email });

    if (userExist) {
        const error = new Error("User already registered");
        return res.status(400).json({ msg: error.message })
    }

    try {
        const user = new User(req.body);
        user.token = genID();
        await user.save();

        emailRegister({
            email: user.email,
            name: user.name,
            token: user.token
        });


        res.json({ msg: 'User created successfully, check your email to confirm your account' });
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }

}

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Exists
    const user = await User.findOne({ email });
    if (!user) {
        const err = new Error("User not found");
        return res.status(400).json({ msg: err.message });
    }

    // Is confirmed
    if (!user.confirmed) {
        const err = new Error("This user is not confirmed");
        return res.status(400).json({ msg: err.message });
    }

    // Password
    if (await user.matchPassword(password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: genJWT(user._id),
        });
    } else {
        const err = new Error("Incorrect password");
        return res.status(400).json({ msg: err.message });
    }
}

exports.confirmUser = async (req, res) => {
    const { token } = req.params;

    const userConfirm = await User.findOne({ token });
    if (!userConfirm) return res.status(400).json({ msg: "Invalid token" });

    try {
        userConfirm.confirmed = true;
        userConfirm.token = "";
        await userConfirm.save();
        res.json({ msg: "User confirmed" });
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
}

exports.forgetPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error('User not found')
        return res.status(404).json({ msg: error.message });
    }

    try {
        user.token = genID();
        await user.save();

        forgotPassword({
            email: user.email,
            name: user.name,
            token: user.token
        })

        res.json({ msg: "An email has been sent with instructions" })
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
}

exports.verifyToken = async (req, res) => {
    const { token } = req.params;

    const validToken = await User.findOne({ token });

    if (!validToken) {
        const error = new Error("Invalid token");
        return res.status(400).json({ msg: error.message });
    } else
        return res.json({ msg: "Valid token" });
}

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ token });

    try {
        if (user) {
            user.password = password;
            user.token = "";
            await user.save();
            res.json({ msg: "Password changed" });
        } else {
            const error = new Error('Invalid token')
            return res.status(400).json({ msg: error.message });
        }
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
}

exports.getProfile = async (req, res) => {
    const { user } = req;
    res.json(user);
}