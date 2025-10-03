import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import AddTransaction from './components/AddTransaction';
import Login from './components/Login';
import Register from './components/Register';
import Navigation from './components/Navigation';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                setIsAuthenticated(true);
                setUser(JSON.parse(userData));
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                {isAuthenticated && <Navigation setIsAuthenticated={setIsAuthenticated} />}
                <Routes>
                    <Route 
                        path="/login" 
                        element={
                            !isAuthenticated ? 
                            <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} /> : 
                            <Navigate to="/" />
                        } 
                    />
                    <Route 
                        path="/register" 
                        element={
                            !isAuthenticated ? 
                            <Register setIsAuthenticated={setIsAuthenticated} setUser={setUser} /> : 
                            <Navigate to="/" />
                        } 
                    />
                    <Route 
                        path="/" 
                        element={
                            isAuthenticated ? 
                            <Dashboard user={user} /> : 
                            <Navigate to="/login" />
                        } 
                    />
                    <Route 
                        path="/transactions" 
                        element={
                            isAuthenticated ? 
                            <Transactions /> : 
                            <Navigate to="/login" />
                        } 
                    />
                    <Route 
                        path="/add-transaction" 
                        element={
                            isAuthenticated ? 
                            <AddTransaction /> : 
                            <Navigate to="/login" />
                        } 
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;