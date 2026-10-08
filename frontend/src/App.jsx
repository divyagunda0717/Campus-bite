import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Navigation & Modals
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ConflictModal from './components/ConflictModal';

// Student / Faculty Pages
import Home from './pages/Home';
import FacultyDashboard from './pages/FacultyDashboard';
import StallMenu from './pages/StallMenu';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import Register from './pages/Register';

// Staff Member Pages
import StaffDashboard from './pages/staff-member/StaffDashboard';

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
  const { user, role, accountStatus } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Account status check (Requirement 8)
  if (accountStatus !== 'ACTIVE') {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const userRole = (role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());
    if (!normalizedAllowed.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
            {/* Main Campus Navigation */}
            <Navbar />

            {/* Page Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
              <Routes>
                {/* Public / Student Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/student" element={<Home />} />
                <Route path="/stall/:stallId" element={<StallMenu />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Faculty Dashboard */}
                <Route
                  path="/faculty"
                  element={
                    <ProtectedRoute allowedRoles={['FACULTY', 'SUPER_ADMIN']}>
                      <FacultyDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Staff Member Routes (Requirement 4) */}
                <Route
                  path="/staff-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF_MEMBER', 'SUPER_ADMIN']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff-dashboard/orders"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF_MEMBER', 'SUPER_ADMIN']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff-dashboard/menu"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF_MEMBER', 'SUPER_ADMIN']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff-dashboard/slots"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF_MEMBER', 'SUPER_ADMIN']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff-dashboard/qr"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF_MEMBER', 'SUPER_ADMIN']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Stall Admin Routes (Requirement 5) */}
                <Route
                  path="/stall-admin"
                  element={
                    <ProtectedRoute allowedRoles={['STALL_ADMIN', 'SUPER_ADMIN']}>
                      <StallDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stall-admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={['STALL_ADMIN', 'SUPER_ADMIN']}>
                      <StallOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stall-admin/menu"
                  element={
                    <ProtectedRoute allowedRoles={['STALL_ADMIN', 'SUPER_ADMIN']}>
                      <StallMenuManage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stall-admin/slots"
                  element={
                    <ProtectedRoute allowedRoles={['STALL_ADMIN', 'SUPER_ADMIN']}>
                      <StallSlots />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stall-admin/qr"
                  element={
                    <ProtectedRoute allowedRoles={['STALL_ADMIN', 'SUPER_ADMIN']}>
                      <StallQR />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stall-admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={['STALL_ADMIN', 'SUPER_ADMIN']}>
                      <StallSettings />
                    </ProtectedRoute>
                  }
                />

                {/* Super Admin Routes (Requirement 6) */}
                <Route
                  path="/super-admin"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin/stalls"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <StallsManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin/members"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <CanteenMembersManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <UsersManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
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
