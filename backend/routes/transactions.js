const express = require('express');
const router = express.Router();
const db = require('../models/database');
const auth = require('../middleware/auth');

// Get all transactions for user
router.get('/', auth, (req, res) => {
    const query = `
        SELECT t.*, c.name as category_name 
        FROM transactions t 
        LEFT JOIN categories c ON t.category_id = c.id 
        WHERE t.user_id = ? 
        ORDER BY t.date DESC, t.created_at DESC
    `;
    
    db.all(query, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add new transaction
router.post('/', auth, (req, res) => {
    const { amount, description, category_id, date, type } = req.body;
    
    if (!amount || !description || !category_id || !date || !type) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
        INSERT INTO transactions (amount, description, category_id, date, type, user_id) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [amount, description, category_id, date, type, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Get the newly created transaction with category name
        db.get(`
            SELECT t.*, c.name as category_name 
            FROM transactions t 
            LEFT JOIN categories c ON t.category_id = c.id 
            WHERE t.id = ?
        `, [this.lastID], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ transaction: row, message: 'Transaction added successfully' });
        });
    });
});

// Delete transaction
router.delete('/:id', auth, (req, res) => {
    db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', 
        [req.params.id, req.user.id], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
            res.json({ message: 'Transaction deleted successfully' });
        }
    );
});

// Get financial summary
router.get('/summary', auth, (req, res) => {
    const month = req.query.month || new Date().toISOString().slice(0, 7); // YYYY-MM

    const queries = {
        totalIncome: `
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM transactions 
            WHERE user_id = ? AND type = 'income' AND strftime('%Y-%m', date) = ?
        `,
        totalExpenses: `
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM transactions 
            WHERE user_id = ? AND type = 'expense' AND strftime('%Y-%m', date) = ?
        `,
        recentTransactions: `
            SELECT t.*, c.name as category_name 
            FROM transactions t 
            LEFT JOIN categories c ON t.category_id = c.id 
            WHERE t.user_id = ? 
            ORDER BY t.date DESC, t.created_at DESC 
            LIMIT 5
        `
    };

    db.get(queries.totalIncome, [req.user.id, month], (err, incomeRow) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get(queries.totalExpenses, [req.user.id, month], (err, expenseRow) => {
            if (err) return res.status(500).json({ error: err.message });
            
            db.all(queries.recentTransactions, [req.user.id], (err, transactions) => {
                if (err) return res.status(500).json({ error: err.message });
                
                const balance = incomeRow.total - expenseRow.total;
                
                res.json({
                    totalIncome: parseFloat(incomeRow.total),
                    totalExpenses: parseFloat(expenseRow.total),
                    balance: parseFloat(balance),
                    recentTransactions: transactions
                });
            });
        });
    });
});

module.exports = router;
