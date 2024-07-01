const jwt = require('jsonwebtoken')
const User = require("../models/User");
const dotenv = require("dotenv");
dotenv.config()
const JWT_SECRET = process.env.JWT

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Access Denied Please login' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = verifyToken;