const express = require("express");
const adminRoute = express.Router();
const nocache = require('nocache');
const session = require("express-session");
const { validateEmail, validatePassword } = require('../util');
const config = require("../config/config");
const auth = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");

adminRoute.use(nocache());
adminRoute.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

adminRoute.get('/', auth.isLogout, adminController.loadLogin);

adminRoute.post('/', async (req, res) => {
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
        return res.redirect('/admin');
    }

    await adminController.verifyLogin(req, res);
});

adminRoute.get('/home', auth.isLogin, adminController.loadDashboard);
adminRoute.get('/logout', auth.isLogin, adminController.logout);
adminRoute.get('/dashboard', auth.isLogin, adminController.adminDashboard);
adminRoute.get('/newuser', auth.isLogin, adminController.newUserLoad);
adminRoute.post('/newuser', auth.isLogin, adminController.addUser);
adminRoute.get('/edituser', auth.isLogin, adminController.editUserLoad);
adminRoute.post('/edituser', auth.isLogin, adminController.updateUsers);
adminRoute.get('/deleteuser', auth.isLogin, adminController.deleteUser);

module.exports = adminRoute;
