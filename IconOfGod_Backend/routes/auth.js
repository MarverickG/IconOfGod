// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();
const users = require('../data/users');
const sendEmail = require('../utils/sendEmail');

// Sign up
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  const existing = users.find(user => user.email === email);
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
    const newUser = { name, email, password: hashedPassword, verified: false, verificationToken };
    users.push(newUser);

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
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  try {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful', user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Error during login.' });
  }
});

// Update profile
router.post('/update-profile', (req, res) => {
  const { currentEmail, name, email } = req.body;

  const user = users.find(u => u.email === currentEmail);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  user.name = name || user.name;
  user.email = email || user.email;

  res.json({ message: 'Profile updated successfully', user: { name: user.name, email: user.email } });
});

// Change password
router.post('/change-password', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Current password is incorrect.' });
  }

  const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPassword);
if (!isStrongPassword) {
  return res.status(400).json({
    message: 'Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.'
  });
}


  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;

  res.json({ message: 'Password updated successfully' });
});

// Request password reset
router.post('/request-reset', (req, res) => {
  const { email } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'No user found with that email.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = Date.now() + 15 * 60 * 1000;

  user.resetToken = token;
  user.tokenExpiry = tokenExpiry;

  const resetLink = `http://localhost:5500/reset_password.html?token=${token}`;
  console.log(`Reset link for ${email}: ${resetLink}`);

  res.json({ message: 'Reset link sent to your email (mock)', resetLink });
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  const user = users.find(u => u.resetToken === token && Date.now() < u.tokenExpiry);
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
    delete user.resetToken;
    delete user.tokenExpiry;

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password.' });
  }
});

module.exports = router;
