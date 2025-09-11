const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
	'https://apoorvagadkari.github.io',
	'https://todo-app1-backend.onrender.com',
	'http://localhost:3000'
	] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Root route - THIS LINE MIGHT BE MISSING
app.get('/', (req, res) => {
  res.json({ message: 'MERN Todo API is running!' });
});

// Routes
app.use('/api/tasks', require('./routes/tasks'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.log('❌ MongoDB connection error:', err));

module.exports = app;
