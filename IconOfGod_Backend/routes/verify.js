const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');

router.post('/send-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const verificationLink = `https://iconofgod-backend.onrender.com/api/verify`; // You can make this a real token later

    await sendEmail(
      email,
      'Verify your email',
      `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
    );

    res.status(200).json({ message: 'Verification email sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

module.exports = router;