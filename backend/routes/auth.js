const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) return res.status(400).json({ error: 'User already exists' });

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert user
            db.run(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });

                    // Create token
                    const token = jwt.sign(
                        { id: this.lastID, email, name },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );

                    res.status(201).json({
                        message: 'User created successfully',
                        token,
                        user: { id: this.lastID, name, email }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(400).json({ error: 'Invalid credentials' });

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

            // Create token
            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Get current user
router.get('/me', (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ user: decoded });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
