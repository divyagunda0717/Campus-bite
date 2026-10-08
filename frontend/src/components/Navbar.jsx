import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Utensils,
  ShoppingBag,
  Store,
  User,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Shield,
  Clock,
  QrCode,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { totalCount, setIsDrawerOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const normalizedRole = (role || 'GUEST').toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  CAMPUS<span className="text-orange-600">BITE</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-sm">
                  SMART CANTEEN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Pre-Order • Skip Queues • Easy Pickup
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Student & Faculty Links (Requirement 2, 3, 16) */}
            {(normalizedRole === 'STUDENT' || normalizedRole === 'FACULTY' || normalizedRole === 'GUEST') && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Food Stalls
                </Link>
                {user && (
                  <Link
                    to="/my-orders"
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/my-orders') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    My Orders
                  </Link>
                )}
              </>
            )}

            {/* Staff Member Navigation (Requirement 4) */}
            {normalizedRole === 'STAFF_MEMBER' && (
              <>
                <Link
                  to="/staff-dashboard"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/staff-dashboard') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Stall Dashboard
                </Link>
                <Link
                  to="/staff-dashboard/orders"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/staff-dashboard/orders') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Incoming Orders
                </Link>
                <Link
                  to="/staff-dashboard/menu"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/staff-dashboard/menu') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  Manage Food
                </Link>
                <Link
                  to="/staff-dashboard/slots"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/staff-dashboard/slots') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Pickup Slots
                </Link>
                <Link
                  to="/staff-dashboard/qr"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/staff-dashboard/qr') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Payment QR
                </Link>
              </>
            )}

            {/* Stall Admin Navigation (Requirement 5) */}
            {normalizedRole === 'STALL_ADMIN' && (
              <>
                <Link
                  to="/stall-admin"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/stall-admin') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </Link>
                <Link
                  to="/stall-admin/orders"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/stall-admin/orders') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Orders
                </Link>
                <Link
                  to="/stall-admin/menu"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/stall-admin/menu') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  Menu Items
                </Link>
                <Link
                  to="/stall-admin/slots"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/stall-admin/slots') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Pickup Slots
                </Link>
                <Link
                  to="/stall-admin/qr"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/stall-admin/qr') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Payment QR
                </Link>
                <Link
                  to="/stall-admin/settings"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/stall-admin/settings') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </>
            )}

            {/* Super Admin Navigation (Requirement 6) */}
            {normalizedRole === 'SUPER_ADMIN' && (
              <>
                <Link
                  to="/super-admin"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/super-admin') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Overview
                </Link>
                <Link
                  to="/super-admin/stalls"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/super-admin/stalls') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Manage Stalls
                </Link>
                <Link
                  to="/super-admin/members"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/super-admin/members') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Staff & Admins
                </Link>
                <Link
                  to="/super-admin/users"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/super-admin/users') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Campus Users
                </Link>
                <Link
                  to="/super-admin/orders"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/super-admin/orders') ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  All Orders
                </Link>
              </>
            )}
          </div>

          {/* Right Actions: Cart & User Account */}
          <div className="flex items-center gap-3">
            {/* Cart Drawer Trigger for students / faculty */}
            {(normalizedRole === 'STUDENT' || normalizedRole === 'FACULTY' || normalizedRole === 'GUEST') && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2.5 text-slate-700 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition flex items-center gap-2 border border-slate-200"
                title="View Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline text-xs font-semibold">Cart</span>
                {totalCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {totalCount}
                  </span>
                )}
              </button>
            )}

            {/* User Info / Logout */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                    {normalizedRole.replace('_', ' ')}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {(normalizedRole === 'STUDENT' || normalizedRole === 'FACULTY' || normalizedRole === 'GUEST') && (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Food Stalls
              </Link>
              {user && (
                <Link
                  to="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  My Orders
                </Link>
              )}
            </>
          )}

          {normalizedRole === 'STAFF_MEMBER' && (
            <>
              <Link to="/staff-dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Stall Dashboard</Link>
              <Link to="/staff-dashboard/orders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Incoming Orders</Link>
              <Link to="/staff-dashboard/menu" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Manage Food</Link>
              <Link to="/staff-dashboard/slots" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Pickup Slots</Link>
              <Link to="/staff-dashboard/qr" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Payment QR</Link>
            </>
          )}

          {normalizedRole === 'STALL_ADMIN' && (
            <>
              <Link to="/stall-admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Admin Dashboard</Link>
              <Link to="/stall-admin/orders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Orders</Link>
              <Link to="/stall-admin/menu" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Menu Items</Link>
              <Link to="/stall-admin/slots" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Pickup Slots</Link>
              <Link to="/stall-admin/qr" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Payment QR</Link>
              <Link to="/stall-admin/settings" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Settings</Link>
            </>
          )}

          {normalizedRole === 'SUPER_ADMIN' && (
            <>
              <Link to="/super-admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Dashboard</Link>
              <Link to="/super-admin/stalls" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Manage Stalls</Link>
              <Link to="/super-admin/members" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Staff & Admins</Link>
              <Link to="/super-admin/users" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Campus Users</Link>
              <Link to="/super-admin/orders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">All Orders</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
