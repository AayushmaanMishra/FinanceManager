const express = require('express');
const router = express.Router();
const db = require('../models/database');
const auth = require('../middleware/auth');

// Get all categories (default + user-specific)
router.get('/', auth, (req, res) => {
    const type = req.query.type; // 'income' or 'expense'
    
    let query = `
        SELECT * FROM categories 
        WHERE (user_id = ? OR user_id IS NULL) 
        ${type ? 'AND type = ?' : ''}
        ORDER BY type, name
    `;
    
    const params = type ? [req.user.id, type] : [req.user.id];
    
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add custom category
router.post('/', auth, (req, res) => {
    const { name, type } = req.body;
    
    if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
    }

    db.run(
        'INSERT INTO categories (name, type, user_id) VALUES (?, ?, ?)',
        [name, type, req.user.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Category added successfully' });
        }
    );
});

module.exports = router;
