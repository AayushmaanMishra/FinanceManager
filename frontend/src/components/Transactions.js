import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await API.get('/transactions');
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteTransaction = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            await API.delete(`/transactions/${id}`);
            setTransactions(transactions.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Error deleting transaction');
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (filter === 'all') return true;
        return transaction.type === filter;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading transactions...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">All Transactions</h1>
                <Link 
                    to="/add-transaction" 
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                    Add New Transaction
                </Link>
            </div>

            {/* Filter Buttons */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg ${
                            filter === 'all' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('income')}
                        className={`px-4 py-2 rounded-lg ${
                            filter === 'income' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Income
                    </button>
                    <button
                        onClick={() => setFilter('expense')}
                        className={`px-4 py-2 rounded-lg ${
                            filter === 'expense' 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Expenses
                    </button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg mb-4">No transactions found</p>
                        <Link 
                            to="/add-transaction" 
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Add your first transaction
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredTransactions.map(transaction => (
                            <div 
                                key={transaction.id} 
                                className="p-6 hover:bg-gray-50 transition duration-200"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-3 h-3 rounded-full ${
                                                transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                                            }`}></div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {transaction.description}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(transaction.date)} • {transaction.category_name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4">
                                        <p className={`text-lg font-bold ${
                                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={() => deleteTransaction(transaction.id)}
                                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                                            title="Delete transaction"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary */}
            {filteredTransactions.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-gray-600">Total Transactions</p>
                            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold">
                                ${filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Filter</p>
                            <p className="text-2xl font-bold capitalize">{filter}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;