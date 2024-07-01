const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const generateToken = require("../utils/generatToken");

// Middleware to use cookie parser
router.use(cookieParser());

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
    });

    const user = await newUser.save();

    // Generate token
    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true }).status(200).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).json({ message: "Wrong credentials!" });
    }

    const validated = await bcrypt.compare(req.body.password, user.password);
    if (!validated) {
      return res.status(400).json({ message: "Wrong credentials!" });
    }

    // Generate token
    const token = generateToken(user);
    const { password, ...others } = user._doc;
    res.cookie('token', token, { httpOnly: true }).status(200).json({ message: 'Logged in successfully', user: others });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie('token').status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
