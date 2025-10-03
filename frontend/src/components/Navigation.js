import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / App Name */}
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight hover:text-gray-200"
          >
            Finance Manager
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link
              to="/"
              className="hover:bg-blue-700 px-3 py-2 rounded-md transition duration-200"
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className="hover:bg-blue-700 px-3 py-2 rounded-md transition duration-200"
            >
              Transactions
            </Link>
            <Link
              to="/add-transaction"
              className="hover:bg-blue-700 px-3 py-2 rounded-md transition duration-200"
            >
              Add Transaction
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md transition duration-200"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-2xl font-bold focus:outline-none"
            >
              {isOpen ? '✖' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-700 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            className="block hover:bg-blue-600 px-3 py-2 rounded-md transition duration-200"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/transactions"
            className="block hover:bg-blue-600 px-3 py-2 rounded-md transition duration-200"
            onClick={() => setIsOpen(false)}
          >
            Transactions
          </Link>
          <Link
            to="/add-transaction"
            className="block hover:bg-blue-600 px-3 py-2 rounded-md transition duration-200"
            onClick={() => setIsOpen(false)}
          >
            Add Transaction
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="w-full text-left bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md transition duration-200"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
