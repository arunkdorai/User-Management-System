const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { validateEmail, validatePassword } = require('../util');
const randomstring = require('randomstring');

// Regex for validating name
const nameRegex = /^[a-zA-Z\s]+$/;

// Regex for validating phone number
const phoneRegex = /^\d{10}$/;

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

const loadLogin = async (req, res) => {
    try {
        const errors = req.session.errors || {};
        const message = req.session.message || '';
        req.session.errors = {}; // Clear errors after displaying them
        req.session.message = ''; // Clear message after displaying it
        res.render('admin/login', { errors, message });
    } catch (error) {
        console.log(error.message);
    }
};

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const errors = {};

        if (!validateEmail(email)) {
            errors.email = 'Invalid email address';
        }

        if (!validatePassword(password)) {
            errors.password = 'Invalid Password';
        }

        if (Object.keys(errors).length > 0) {
            req.session.errors = errors;
            return res.redirect(req.originalUrl.includes('/admin') ? '/admin' : '/login');
        }

        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === 0 && req.originalUrl.includes('/admin')) {
                    req.session.errors = { message: "Email and password is incorrect" };
                    return res.redirect('/admin');
                } else {
                    req.session.userId = userData._id;
                    return res.redirect(req.originalUrl.includes('/admin') ? '/admin/home' : '/home');
                }
            } else {
                req.session.errors = { message: "Email and password is incorrect" };
                return res.redirect(req.originalUrl.includes('/admin') ? '/admin' : '/login');
            }
        } else {
            req.session.errors = { message: "Email and password is incorrect" };
            return res.redirect(req.originalUrl.includes('/admin') ? '/admin' : '/login');
        }
    } catch (error) {
        console.log(error.message);
        req.session.errors = { message: "An error occurred during login" };
        res.redirect(req.originalUrl.includes('/admin') ? '/admin' : '/login');
    }
};

const loadDashboard = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/admin'); // Redirect if no userId is found in the session
        }

        const user = await User.findById(userId);
        if (user) {
            res.render('admin/home', { user: user });
        } else {
            res.redirect('/admin'); // Only redirect if the user is not found
        }
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin'); // Redirect in case of error as well
    }
};

const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
};

const adminDashboard = async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const regex = new RegExp(searchQuery, 'i');
        const usersData = await User.find({
            $or: [
                { name: { $regex: regex } },
                { email: { $regex: regex } },
                { mobile: { $regex: regex } },
            ],
            is_admin: false
        });
        res.render('admin/dashboard', { users: usersData, searchQuery });
    } catch (error) {
        console.log(error.message);
    }
};

// Add new user from admin page

const newUserLoad = async (req, res) => {
    try {
        res.render('admin/newuser', { errors: {}, formData: {} });
    } catch (error) {
        console.log(error.message);
    }
};

const addUser = async (req, res) => {
    try {
        const { name, email, mno } = req.body;
        const passkey = randomstring.generate(6);
        const password = passkey + 123;
        const errors = {};

        console.log("Password generated is:" + password);

        // Validate name
        if (!nameRegex.test(name)) {
            errors.name = 'Invalid name format';
        }

        // Validate mobile
        if (!phoneRegex.test(mno)) {
            errors.mobile = 'Invalid mobile number format';
        }

        // Validate email
        if (!validateEmail(email)) {
            errors.email = 'Invalid email format';
        }

        if (Object.keys(errors).length > 0) {
            return res.render('admin/newuser', { errors, formData: { name, email, mno } });
        }

        const spassword = await securePassword(password, 10);

        const user = new User({
            name: name,
            email: email,
            mobile: mno,
            password: spassword,
            is_admin: false
        });

        const userData = await user.save();

        if (userData) {
            res.redirect('/admin/dashboard');
        } else {
            res.render('admin/newuser', { message: 'Something is wrong', errors: {}, formData: { name, email, mno } });
        }

    } catch (error) {
        console.log(error.message);
    }
};

// Edit user functionality

const editUserLoad = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        if (userData) {
            res.render('admin/edituser', { user: userData, errors: {} });
        } else {
            res.redirect('/admin/dashboard');
        }
    } catch (error) {
        console.log(error.message);
    }
};

const updateUsers = async (req, res) => {
    try {
        const { id, name, email, mno } = req.body;

        const errors = {};

        // Validate name
        if (!nameRegex.test(name)) {
            errors.name = 'Invalid name format';
        }

        // Validate mobile
        if (!phoneRegex.test(mno)) {
            errors.mobile = 'Invalid mobile number format';
        }

        // Validate email
        if (!validateEmail(email)) {
            errors.email = 'Invalid email format';
        }

        if (Object.keys(errors).length > 0) {
            const userData = await User.findById(id); // Fetch user data to display in form
            return res.render('admin/edituser', { errors, user: userData });
        }

        // Update the user's information in the database
        await User.findByIdAndUpdate(id, { name, email, mobile: mno });

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
        req.session.errors = { message: "An error occurred while updating the user" };
        res.redirect('/admin/dashboard');
    }
};


// delete users

const deleteUser = async (req, res) => {
    try {
        const id = req.query.id;
        await User.deleteOne({ _id: id });
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUsers,
    deleteUser
};
