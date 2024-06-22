const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { validateEmail, validatePassword } = require('../util');

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

const loadRegister = async (req, res) => {
  try {
      const errors = req.session.errors || {};
      const message = req.session.message || '';
      req.session.errors = {}; // Clear errors after displaying them
      req.session.message = ''; // Clear message after displaying it
      res.render('users/registration', { formData: {}, errors: {} });
  } catch (error) {
      console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
      const { name, email, mobile, password, confirmPassword } = req.body;
      const errors = {};

      // Validate name
      if (!nameRegex.test(name)) {
          errors.name = 'Invalid name format';
      }

      // Validate mobile
      if (!phoneRegex.test(mobile)) {
          errors.mobile = 'Invalid mobile number format';
      }

      // Validate email
      if (!validateEmail(email)) {
          errors.email = 'Invalid email address';
      }

      // Validate password
      if (!validatePassword(password)) {
          errors.password = 'Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one digit, and can contain special character (@, -, _).';
      }

      // Validate password confirmation
      if (password !== confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(errors).length > 0) {
          return res.render('users/registration', {
              errors,
              formData: { name, email, mobile }
          });
      }

      const spassword = await securePassword(password);

      const user = new User({
          name: name,
          email: email,
          mobile: mobile,
          password: spassword,
          is_admin: false,
      });

      const userData = await user.save();

      if (userData) {
          res.render('users/registration', { 
              message: "Your registration is successful.",
              errors: {},
              formData: {} // Clear form data after successful registration
          });
      } else {
          res.render('users/registration', { 
              message: "Your registration failed.",
              errors: {},
              formData: { name, email, mobile } // Pass form data back to the view
          });
      }
  } catch (error) {
      if (error.code === 11000) { // Duplicate key error code
          res.render('users/registration', { 
              message: "Email already exists. Please use a different email.",
              errors: {},
              formData: { name, email, mobile } // Pass form data back to the view
          });
      } else {
          console.log(error.message);
          res.render('users/registration', { 
              message: "An error occurred during registration.",
              errors: {},
              formData: { name, email, mobile } // Pass form data back to the view
          });
      }
  }
};




const loginLoad = async (req, res) => {
  try {
      const errors = req.session.errors || {};
      const message = req.session.message || '';
      req.session.errors = {}; // Clear errors after displaying them
      req.session.message = ''; // Clear message after displaying it
      res.render('users/login', { errors, message });
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
          return res.redirect('/login');
      }

      const userData = await User.findOne({ email: email });

      if (userData) {
          const passwordMatch = await bcrypt.compare(password, userData.password);
          if (passwordMatch) {
              req.session.userId = userData._id;
              res.redirect('/home');
          } else {
              req.session.errors = { message: "Email and password is incorrect" };
              res.redirect('/login');
          }
      } else {
          req.session.errors = { message: "Email and password is incorrect" };
          res.redirect('/login');
      }
  } catch (error) {
      console.log(error.message);
      req.session.errors = { message: "An error occurred during login" };
      res.redirect('/login');
  }
};

const loadHome = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.userId });
        res.render('users/home', { user: userData });
    } catch (error) {
        console.log(error.message);
    }
};

const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout
};
