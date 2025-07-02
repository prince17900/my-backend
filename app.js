const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const User = require('./User'); // user schema

const app = express();

// ✅ MongoDB Connection
mongoose.connect('mongodb+srv://admin:Macbook123@logincluster.kybphm5.mongodb.net/loginDB?retryWrites=true&w=majority&appName=loginCluster')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// ✅ Middleware
app.use(express.json());

// ✅ CORS Setup
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true
}));

// ✅ Session Setup
app.use(session({
  secret: 'mysecretkey', // Use a strong secret in production
  resave: false,
  saveUninitialized: false
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

// ✅ Start Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
