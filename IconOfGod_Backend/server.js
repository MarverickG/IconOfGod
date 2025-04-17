require('dotenv').config();
const connectDB = require('./db');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors({
  origin: 'http://localhost:5500', // frontend origin
  credentials: true // allow cookies
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/verify', require('./routes/verify'));
app.use('/api/auth', authRoutes);

connectDB();

// ✅ Add this route to prevent "Cannot GET /"
app.get('/', (req, res) => {
  res.send('API is live and working.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});