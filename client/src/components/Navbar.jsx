import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, LayoutDashboard, Package, Clock, Shield, LogOut, RefreshCw, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, demoLogin, switchRole } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const handleToggleDemoRole = async () => {
    if (isSwitching) return;
    setIsSwitching(true);
    const nextRole = user?.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    try {
      if (user?.email === 'admin@college.edu' || user?.email === 'aarav@college.edu') {
        await demoLogin(nextRole);
      } else {
        await switchRole(nextRole);
      }
      setIsMobileMenuOpen(false);
      navigate('/');
    } catch (err) {
      console.warn('First role toggle failed, attempting fallback switch:', err);
      try {
        await switchRole(nextRole);
        setIsMobileMenuOpen(false);
        navigate('/');
      } catch (fallbackErr) {
        console.error('All role toggle methods failed:', fallbackErr);
        alert(`Could not switch role: ${fallbackErr.message || 'Error occurred'}`);
      }
    } finally {
      setIsSwitching(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 min-w-0">
            <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="shrink-0">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white block leading-tight whitespace-nowrap">
                AV Desk <span className="text-sky-400 font-normal">Campus</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:block whitespace-nowrap leading-tight mt-0.5">
                Equipment Lending System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  isActive('/') ? 'bg-sky-500/10 text-sky-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                to="/equipment"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  isActive('/equipment') ? 'bg-sky-500/10 text-sky-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Package className="w-4 h-4" />
                Catalog & Availability
              </Link>

              <Link
                to="/my-borrowings"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  isActive('/my-borrowings') ? 'bg-sky-500/10 text-sky-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Clock className="w-4 h-4" />
                My Borrowings
              </Link>

              {user.role === 'ADMIN' && (
                <>
                  <div className="h-4 w-px bg-slate-700 mx-1"></div>
                  <Link
                    to="/admin/equipment"
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                      isActive('/admin/equipment') ? 'bg-purple-500/10 text-purple-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-purple-400" />
                    Manage Inventory
                  </Link>
                  <Link
                    to="/admin/borrowings"
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                      isActive('/admin/borrowings') ? 'bg-purple-500/10 text-purple-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    All Loans & Returns
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User Profile & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {/* Role Switcher Button */}
                <button
                  type="button"
                  onClick={handleToggleDemoRole}
                  disabled={isSwitching}
                  title={`Quick switch to ${user.role === 'ADMIN' ? 'Student' : 'Admin'} mode`}
                  className={`flex items-center gap-1 text-xs px-2 sm:px-2.5 py-1.5 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 hover:text-sky-300 transition-all active:scale-95 shrink-0 ${
                    isSwitching ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSwitching ? 'animate-spin text-sky-400' : ''}`} />
                  <span className="whitespace-nowrap font-medium">
                    {isSwitching ? (
                      'Switching...'
                    ) : (
                      <>
                        <span className="hidden sm:inline">Switch to </span>
                        {user.role === 'ADMIN' ? 'Student' : 'Admin'}
                      </>
                    )}
                  </span>
                </button>

                {/* User Info Capsule */}
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 bg-slate-900/70 border border-slate-700 rounded-xl shrink-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-semibold text-white block leading-none max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                      user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <span className={`sm:hidden text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {user.role}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Mobile Menu Hamburger Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-1.5 text-slate-400 hover:text-white md:hidden rounded-lg hover:bg-slate-700/50 transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-lg shadow-sky-600/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu for Logged In Users */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-700/60 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/') ? 'bg-sky-500/10 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/equipment"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/equipment') ? 'bg-sky-500/10 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <Package className="w-4 h-4" />
              Catalog & Availability
            </Link>

            <Link
              to="/my-borrowings"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/my-borrowings') ? 'bg-sky-500/10 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              My Borrowings
            </Link>

            {user.role === 'ADMIN' && (
              <>
                <div className="h-px bg-slate-700 my-1"></div>
                <Link
                  to="/admin/equipment"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive('/admin/equipment') ? 'bg-purple-500/10 text-purple-400 font-semibold' : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  Manage Inventory
                </Link>
                <Link
                  to="/admin/borrowings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive('/admin/borrowings') ? 'bg-purple-500/10 text-purple-400 font-semibold' : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  All Loans & Returns
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
