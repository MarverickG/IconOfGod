const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('Missing token');
  }

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.status(200).send('✅ Email verified successfully. You can now log in!');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

module.exports = router;