import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStallById, getStallOrders, toggleStallOpen, getFoodItemsByStall } from '../../lib/dataService';
import { Store, ShoppingBag, Clock, CheckCircle2, ChefHat, BellRing, PackageCheck, AlertCircle, ArrowRight, ToggleLeft, ToggleRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';

export default function StallDashboard() {
  const { user, assignedStallId } = useAuth();
  const stallId = assignedStallId;

  const [stall, setStall] = useState(null);
  const [orders, setOrders] = useState([]);
  const [foodCount, setFoodCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!stallId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const s = await getStallById(stallId);
    setStall(s);
    const o = await getStallOrders(stallId);
    setOrders(o);
    const f = await getFoodItemsByStall(stallId);
    setFoodCount(f.length);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, [stallId]);

  const handleToggleOpen = async () => {
    if (!stall) return;
    const newStatus = !stall.is_open;
    await toggleStallOpen(stall.id, newStatus);
    setStall({ ...stall, is_open: newStatus });
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Loading stall dashboard...</p>
      </div>
    );
  }

  if (!stallId) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">No Food Stall Assigned</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Your account is active, but you have not yet been assigned to a food stall by the Super Admin.
        </p>
      </div>
    );
  }

  // Calculate stats
  const newOrdersCount = orders.filter(o => o.order_status === 'Order Placed').length;
  const preparingCount = orders.filter(o => o.order_status === 'Preparing').length;
  const readyCount = orders.filter(o => o.order_status === 'Ready for Pickup').length;
  const completedCount = orders.filter(o => o.order_status === 'Collected').length;
  const totalRevenue = orders
    .filter(o => o.order_status !== 'Rejected/Cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="space-y-8 pb-20">
      {/* Top Banner with Stall Name & Open/Closed Switch */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">
              Stall Admin Portal
            </span>
            <span className="text-xs text-slate-400">• Strict Stall Isolation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-7 h-7 text-orange-600" />
            {stall?.name || 'Assigned Stall'}
          </h1>
          <p className="text-xs text-slate-500">{stall?.location} • Logged in as: {user?.name}</p>
        </div>

        {/* Stall Open / Closed Toggle Switch (Requirement 24) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-bold block text-slate-900">
              {stall?.is_open ? 'Accepting Orders' : 'Stall Closed'}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {stall?.is_open ? 'Students can pre-order' : 'Pre-orders paused'}
            </span>
          </div>
          <button
            onClick={handleToggleOpen}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              stall?.is_open
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20'
            }`}
          >
            {stall?.is_open ? (
              <>
                <ToggleRight className="w-5 h-5" />
                <span>OPEN</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5" />
                <span>CLOSED</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* New Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600">
            <span>New Orders</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">{newOrdersCount}</div>
          <span className="text-[10px] text-slate-400 block">Action required</span>
        </div>

        {/* Preparing */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-600">
            <span>In Preparation</span>
            <ChefHat className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">{preparingCount}</div>
          <span className="text-[10px] text-slate-400 block">Cooking in kitchen</span>
        </div>

        {/* Ready for Pickup */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600">
            <span>Ready for Pickup</span>
            <BellRing className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">{readyCount}</div>
          <span className="text-[10px] text-slate-400 block">Waiting at counter</span>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Collected Today</span>
            <PackageCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completedCount}</div>
          <span className="text-[10px] text-slate-400 block">Fulfilled orders</span>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs font-semibold text-orange-600">
            <span>Stall Sales</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹{totalRevenue.toFixed(0)}</div>
          <span className="text-[10px] text-slate-400 block">{orders.length} total orders</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/stall-admin/orders"
          className="p-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl text-white shadow-lg shadow-orange-500/20 hover:scale-[1.01] transition space-y-4"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Manage Live Orders</h3>
            <p className="text-xs text-orange-100 mt-1">Confirm, prepare, mark ready, and collect student meals.</p>
          </div>
          <div className="text-xs font-bold flex items-center gap-1 text-white">
            Open Order Workflow <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/stall-admin/menu"
          className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs hover:border-orange-300 transition space-y-4"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Store className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Menu & Food Items</h3>
            <p className="text-xs text-slate-500 mt-1">Add new dishes, update prices, and toggle daily availability.</p>
          </div>
          <div className="text-xs font-bold text-orange-600 flex items-center gap-1">
            {foodCount} Active Dishes <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/stall-admin/qr"
          className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs hover:border-orange-300 transition space-y-4"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Payment QR & Slots</h3>
            <p className="text-xs text-slate-500 mt-1">Review your dedicated UPI QR code and 10-minute pickup slot loads.</p>
          </div>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            Configure Details <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Recent Incoming Orders for this Stall */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Stall Orders</h2>
          <Link to="/stall-admin/orders" className="text-xs font-bold text-orange-600 hover:underline">
            View All Orders ({orders.length}) →
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No orders received for this stall yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-600">{o.order_id}</span>
                    <span className="font-semibold text-slate-900">{o.customer_name}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] mt-0.5 block">
                    Slot: <strong>{o.pickup_time}</strong> • {o.items?.map(i => `${i.food_name} (x${i.quantity})`).join(', ')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={o.order_status} size="sm" />
                  <span className="font-bold text-slate-900">₹{Number(o.total_amount).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
