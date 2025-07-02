const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const User = require('./User'); // Your Mongoose User schema

const app = express();

// ✅ Environment Variables
require('dotenv').config(); // Ensure you have a .env file locally

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Middleware
app.use(express.json());

// ✅ CORS (Allow frontend domains)
app.use(cors({
  origin: ['https://compressfast.in', 'https://compressfast.netlify.app'],
  credentials: true
}));

app.options('*', cors()); // Preflight support

// ✅ Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// ✅ Signup Route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed', error });
  }
});

// ✅ Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    req.session.userId = user._id;
    res.json({ message: 'Login successful', user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error });
  }
});

// ✅ CORS Test Route
app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working 🎉' });
});

// ✅ Root Health Check
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
