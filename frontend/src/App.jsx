import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Navigation & Modals
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ConflictModal from './components/ConflictModal';
import QuickRoleBar from './components/QuickRoleBar';

// Student / Faculty Pages
import Home from './pages/Home';
import StallMenu from './pages/StallMenu';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import Register from './pages/Register';

// Stall Admin Pages
import StallDashboard from './pages/stall-admin/StallDashboard';
import StallOrders from './pages/stall-admin/StallOrders';
import StallMenuManage from './pages/stall-admin/StallMenuManage';
import StallSlots from './pages/stall-admin/StallSlots';
import StallQR from './pages/stall-admin/StallQR';
import StallSettings from './pages/stall-admin/StallSettings';

// Super Admin Pages
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import StallsManagement from './pages/super-admin/StallsManagement';
import CanteenMembersManagement from './pages/super-admin/CanteenMembersManagement';
import UsersManagement from './pages/super-admin/UsersManagement';
import AllOrdersManagement from './pages/super-admin/AllOrdersManagement';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, role } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
            {/* Hackathon Demo Quick Role Switcher Bar */}
            <QuickRoleBar />

            {/* Main Campus Navigation */}
            <Navbar />

            {/* Page Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
              <Routes>
                {/* Student / Faculty Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/stall/:stallId" element={<StallMenu />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Stall Admin Routes (Strict Isolation: Role Guarded) */}
                <Route
                  path="/stall-admin"
                  element={
                    <ProtectedRoute allowedRoles={['stall_admin', 'super_admin']}>
                      <StallDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stall-admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={['stall_admin', 'super_admin']}>
                      <StallOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stall-admin/menu"
                  element={
                    <ProtectedRoute allowedRoles={['stall_admin', 'super_admin']}>
                      <StallMenuManage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stall-admin/slots"
                  element={
                    <ProtectedRoute allowedRoles={['stall_admin', 'super_admin']}>
                      <StallSlots />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stall-admin/qr"
                  element={
                    <ProtectedRoute allowedRoles={['stall_admin', 'super_admin']}>
                      <StallQR />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stall-admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={['stall_admin', 'super_admin']}>
                      <StallSettings />
                    </ProtectedRoute>
                  }
                />

                {/* Super Admin Routes */}
                <Route
                  path="/super-admin"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin/stalls"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <StallsManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin/members"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <CanteenMembersManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <UsersManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <AllOrdersManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Slide-Out Cart Drawer */}
            <CartDrawer />

            {/* Single-Stall Conflict Warning Modal */}
            <ConflictModal />

            {/* Campus Canteen Footer */}
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
