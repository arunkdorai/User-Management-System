// userRoute.js

const express = require("express");
const userRoute = express.Router();
const session = require("express-session");
const nocache = require('nocache');
const { validateEmail, validatePassword } = require('../util'); // Correct path to util.js
const userController = require("../controllers/userController");
const config = require("../config/config");
const auth = require("../middleware/auth");

userRoute.use(nocache());
userRoute.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

userRoute.get('/register', auth.isLogout, userController.loadRegister);
userRoute.post('/register', userController.insertUser);

userRoute.get('/', auth.isLogout, userController.loginLoad);
userRoute.get('/login', auth.isLogout, userController.loginLoad);

userRoute.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const errors = {};

    if (!validateEmail(email)) {
        errors.email = 'Invalid email address';
    }

    if (!validatePassword(password)) {
        errors.password = 'Invalid Password';
    }

    if (Object.keys(errors).length > 0) {
        req.session.errors = errors;
        return res.redirect('/login');
    }

    await userController.verifyLogin(req, res);
});

userRoute.get('/home', auth.isLogin, userController.loadHome);
userRoute.get('/logout', auth.isLogin, userController.userLogout);

module.exports = userRoute;
