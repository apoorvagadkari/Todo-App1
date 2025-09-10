const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
	'https://vercel.com/apoorvas-projects-dddbcb90/mern-todo-frontend',
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
