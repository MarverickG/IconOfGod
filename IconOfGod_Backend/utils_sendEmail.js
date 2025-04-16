const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  // create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,       // Your email (from .env)
      pass: process.env.EMAIL_PASS       // Your email password or app password
    }
  });

  // email options
  const mailOptions = {
    from: `ICON OF GOD <hello@iconofgod.com>`,
    to,
    subject,
    html
  };

  // send it
  await transporter.sendMail(mailOptions);
  
};

module.exports = sendEmail;