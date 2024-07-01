// utils/token.js
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config()

const JWT_SECRET = process.env.JWT; // Replace with your own secret

const generateToken = (user) => {
  return jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1h' });
};

module.exports = generateToken;
