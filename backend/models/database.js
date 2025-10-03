const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'finance.db');
const db = new sqlite3.Database(dbPath);

// Initialize tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Default categories
    const defaultCategories = [
        // Expense categories
        { name: 'Food & Dining', type: 'expense' },
        { name: 'Transportation', type: 'expense' },
        { name: 'Shopping', type: 'expense' },
        { name: 'Entertainment', type: 'expense' },
        { name: 'Bills & Utilities', type: 'expense' },
        { name: 'Healthcare', type: 'expense' },
        
        // Income categories
        { name: 'Salary', type: 'income' },
        { name: 'Freelance', type: 'income' },
        { name: 'Investments', type: 'income' },
        { name: 'Gifts', type: 'income' }
    ];

    // Categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        user_id INTEGER DEFAULT NULL,
        is_default BOOLEAN DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Insert default categories if they don't exist
    const checkCategories = `SELECT COUNT(*) as count FROM categories`;
    db.get(checkCategories, (err, row) => {
        if (err) console.error('Error checking categories:', err);
        
        if (row && row.count === 0) {
            const insertCategory = `INSERT INTO categories (name, type, is_default) VALUES (?, ?, 1)`;
            defaultCategories.forEach(category => {
                db.run(insertCategory, [category.name, category.type]);
            });
            console.log('Default categories inserted');
        }
    });

    // Transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        category_id INTEGER,
        date DATE NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

console.log('Database initialized successfully');

module.exports = db;
