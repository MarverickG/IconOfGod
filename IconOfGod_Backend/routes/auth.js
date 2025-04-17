// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');
const verifyToken = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/logout', (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out successfully' });
});

// Sign up
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use.' });
  }

  const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
  if (!isStrongPassword) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long and include a number and a special character.'
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const newUser = new User({ name, email, password: hashedPassword, verified: false, verificationToken });
    await newUser.save();

    // Send verification email
    const verifyLink = `https://iconofgod-backend.onrender.com/api/verify?token=${verificationToken}`;
    await sendEmail(email, 'Verify Your Email', `Click to verify your email: ${verifyLink}`);

    res.status(201).json({
      message: 'User created successfully. Verification email sent.',
      user: { name, email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user.' });
  }
});

// Log in
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
      },
      token // optional if you're using it client-side
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error during login.' });
  }
});

// Update profile
router.post('/update-profile', verifyToken, async (req, res) => {
  const { currentEmail, name, email } = req.body;

  try {
    const user = await User.findOne({ email: currentEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.json({ 
      message: 'Profile updated successfully', 
      user: { name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating profile.' });
  }
});

// Change password

router.post('/change-password', verifyToken, async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect.' });

    const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPassword);
    if (!isStrongPassword) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.'
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request password reset
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;

  try {
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'No user found with that email.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = Date.now() + 15 * 60 * 1000;

  user.resetToken = token;
  user.tokenExpiry = tokenExpiry;
  await user.save();

  const resetLink = `https://iconofgod-backend.onrender.com/reset_password.html?token=${token}`;
  console.log(`Reset link for ${email}: ${resetLink}`);

  res.json({ message: 'Reset link sent to your email (mock)', resetLink });
  }  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await User.findOne({ resetToken: token, tokenExpiry: { $gt: Date.now() } });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }

  const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPassword);
  if (!isStrongPassword) {
    return res.status(400).json({
      message: 'Password must include a number and a special character and be at least 8 characters long.'
    });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    
    user.resetToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password.' });
  }
});
router.get('/dashboard', verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}` });
});

module.exports = router;
