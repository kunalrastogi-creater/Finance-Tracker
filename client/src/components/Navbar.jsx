import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, TrendingUp, Receipt, UserCircle, Shield } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth(); // Get user info and logout function from context
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">FinanceTracker</span>
          </Link>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              // Show these links if the user IS logged in
              <>
                <span className="text-sm text-gray-500">
                  Hello, <span className="font-semibold text-gray-800">{user.name || user.email}</span>
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{user.role}</span>
                </span>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <Link
                  to="/transactions"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Receipt className="h-4 w-4" />
                  <span className="text-sm font-medium">Transactions</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <UserCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Profile</span>
                </Link>
                {user.role === 'ADMIN' && (
                  <>
                    <Link
                      to="/admin/users"
                      className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Users</span>
                    </Link>
                    <Link
                      to="/admin/transactions"
                      className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      <Receipt className="h-4 w-4" />
                      <span className="text-sm font-medium">All Trans.</span>
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              // Show these links if the user is NOT logged in
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
