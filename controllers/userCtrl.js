const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userCtrl = {
    register: async (req, res) => {
        try {
            const {name, email, password} = req.body;

            const user = await Users.findOne({email});
            if(user) return res.status(400).json({msg: "The email alrady exists."});

            if(password.length < 8) res.status(400).json({msg: "Password is at least 8 characters long."});

            //Password Encryption
            const passwordHash = await bcrypt.hash(password, 10);
            const newUser = new Users({
                name, email, password: passwordHash
            })

            //Save mongodb
            await newUser.save();

            //Then create jsonwebtoken to authentication
            const accessToken = createAccessToken({id: newUser._id})
            const refreshToken = createRefreshToken({id: newUser._id})

            res.json({accessToken});
            // res.json({msg: "Register Success!"});
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    }
};

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRRET, {expiresIn: '1d'})
}

const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}

module.exports = userCtrl;