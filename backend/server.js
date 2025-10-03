const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route first
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Try to import routes with error handling
let authRoutes, transactionRoutes, categoryRoutes;

try {
    authRoutes = require('./routes/auth');
    console.log('✅ Auth routes loaded');
} catch (err) {
    console.log('❌ Error loading auth routes:', err.message);
    // Create dummy auth routes
    authRoutes = express.Router();
    authRoutes.post('/register', (req, res) => res.json({ message: 'Register - will implement' }));
    authRoutes.post('/login', (req, res) => res.json({ message: 'Login - will implement' }));
}

try {
    transactionRoutes = require('./routes/transactions');
    console.log('✅ Transaction routes loaded');
} catch (err) {
    console.log('❌ Error loading transaction routes:', err.message);
    transactionRoutes = express.Router();
}

try {
    categoryRoutes = require('./routes/categories');
    console.log('✅ Category routes loaded');
} catch (err) {
    console.log('❌ Error loading category routes:', err.message);
    categoryRoutes = express.Router();
}

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Test: http://localhost:${PORT}/api/test`);
}).on('error', (err) => {
    console.log('❌ Server error:', err);
});