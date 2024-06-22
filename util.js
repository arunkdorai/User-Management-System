// util.js

// Function to validate email format
function validateEmail(email) {
    // console.log("emailin valiofdation "+ email)
    const re = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return re.test(String(email).toLowerCase());
}

// Function to validate password format
function validatePassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\w@-_]{8,}$/;
    return re.test(password);
}

module.exports = { validateEmail, validatePassword };