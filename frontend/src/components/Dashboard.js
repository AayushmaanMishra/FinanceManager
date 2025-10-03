import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import API from '../utils/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ user }) => {
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        recentTransactions: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const response = await API.get('/transactions/summary');
            setSummary(response.data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        } finally {
            setLoading(false);
        }
    };

    const expenseData = {
        labels: ['Needs', 'Wants', 'Savings'],
        datasets: [
            {
                data: [50, 30, 20],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }
        ]
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600 mb-8">Here's your financial overview</p>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <h3 className="text-lg font-semibold text-gray-600">Total Balance</h3>
                    <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${summary.balance.toFixed(2)}
                    </p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <h3 className="text-lg font-semibold text-gray-600">Total Income</h3>
                    <p className="text-2xl font-bold text-green-600">${summary.totalIncome.toFixed(2)}</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                    <h3 className="text-lg font-semibold text-gray-600">Total Expenses</h3>
                    <p className="text-2xl font-bold text-red-600">${summary.totalExpenses.toFixed(2)}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="flex space-x-4">
                    <Link 
                        to="/add-transaction" 
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        Add Transaction
                    </Link>
                    <Link 
                        to="/transactions" 
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-200"
                    >
                        View All Transactions
                    </Link>
                </div>
            </div>

            {/* Charts and Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Expense Distribution</h3>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut 
                            data={expenseData} 
                            options={{ 
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom'
                                    }
                                }
                            }} 
                        />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
                    <div className="space-y-4">
                        {summary.recentTransactions.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No transactions yet</p>
                        ) : (
                            summary.recentTransactions.map(transaction => (
                                <div 
                                    key={transaction.id} 
                                    className={`p-4 rounded-lg border-l-4 ${
                                        transaction.type === 'income' 
                                            ? 'transaction-income bg-green-50' 
                                            : 'transaction-expense bg-red-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{transaction.description}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(transaction.date).toLocaleDateString()} • 
                                                {transaction.category_name}
                                            </p>
                                        </div>
                                        <p className={`font-bold text-lg ${
                                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {summary.recentTransactions.length > 0 && (
                        <div className="mt-4 text-center">
                            <Link 
                                to="/transactions" 
                                className="text-blue-600 hover:text-blue-800"
                            >
                                View all transactions →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;