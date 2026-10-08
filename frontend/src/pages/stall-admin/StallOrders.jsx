import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStallOrders, updateOrderStatus, getStallById } from '../../lib/dataService';
import StatusBadge from '../../components/StatusBadge';
import RejectionModal from '../../components/RejectionModal';
import { ShoppingBag, Clock, CheckCircle2, ChefHat, BellRing, PackageCheck, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const TABS = [
  { key: 'ALL', label: 'All Orders' },
  { key: 'Order Placed', label: 'New Orders', badgeColor: 'bg-amber-100 text-amber-800' },
  { key: 'Confirmed', label: 'Confirmed', badgeColor: 'bg-blue-100 text-blue-800' },
  { key: 'Preparing', label: 'Preparing', badgeColor: 'bg-purple-100 text-purple-800' },
  { key: 'Ready for Pickup', label: 'Ready for Pickup', badgeColor: 'bg-emerald-100 text-emerald-800' },
  { key: 'Collected', label: 'Completed' },
  { key: 'Rejected/Cancelled', label: 'Rejected' }
];

export default function StallOrders() {
  const { user, assignedStallId } = useAuth();
  const stallId = assignedStallId;

  const [stall, setStall] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Rejection modal state
  const [rejectingOrder, setRejectingOrder] = useState(null);

  const fetchOrders = async () => {
    if (!stallId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const s = await getStallById(stallId);
    setStall(s);
    const o = await getStallOrders(stallId);
    setOrders(o);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const handleUpdate = () => fetchOrders();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, [stallId]);

  const handleStatusTransition = async (orderId, newStatus) => {
    setActionLoadingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmRejection = async (reason) => {
    if (!rejectingOrder) return;
    try {
      await updateOrderStatus(rejectingOrder.id, 'Rejected/Cancelled', reason);
      await fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    return o.order_status === activeTab;
  });

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

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Kitchen Operations</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Manage Orders — {stall?.name || 'Assigned Stall'}
          </h1>
          <p className="text-xs text-slate-500">
            Strict stall data isolation: displaying incoming and active orders exclusively for {stall?.name}.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Orders
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {TABS.map((tab) => {
          const count = tab.key === 'ALL'
            ? orders.length
            : orders.filter(o => o.order_status === tab.key).length;

          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border-b-2 ${
                isActive
                  ? 'border-orange-600 text-orange-600 bg-orange-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                isActive ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No {activeTab} Orders</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            There are currently no orders in the "{activeTab}" stage for this stall.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => {
            const isProcessing = actionLoadingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-6 space-y-5 flex flex-col justify-between"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                      {order.order_id}
                    </span>
                    <StatusBadge status={order.order_status} size="sm" />
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">{order.customer_name}</h4>
                      <span className="text-[11px] text-slate-400">
                        Placed: {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900">₹{Number(order.total_amount).toFixed(2)}</span>
                      <span className="text-[11px] text-emerald-600 font-semibold block capitalize">
                        {order.payment_method} • {order.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Pickup Slot Banner */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-900 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      Pickup Window: <strong>{order.pickup_time}</strong>
                    </span>
                  </div>

                  {/* Dishes */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Items</span>
                    <div className="space-y-1 text-xs">
                      {order.items?.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                          <span className="font-semibold text-slate-800">{it.food_name}</span>
                          <span className="font-bold text-slate-600">× {it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rejection Note */}
                  {order.rejection_reason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                      <strong>Rejection Reason:</strong> {order.rejection_reason}
                    </div>
                  )}
                </div>

                {/* Requirement 17-22: Workflow Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  {/* State 1: Order Placed -> [Confirm Order] or [Reject Order] */}
                  {order.order_status === 'Order Placed' && (
                    <>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleStatusTransition(order.id, 'Confirmed')}
                        className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm Order
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => setRejectingOrder(order)}
                        className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}

                  {/* State 2: Confirmed -> [Start Preparing] */}
                  {order.order_status === 'Confirmed' && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleStatusTransition(order.id, 'Preparing')}
                      className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-purple-500/20"
                    >
                      <ChefHat className="w-4 h-4" />
                      Start Preparing
                    </button>
                  )}

                  {/* State 3: Preparing -> [Mark Ready for Pickup] */}
                  {order.order_status === 'Preparing' && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleStatusTransition(order.id, 'Ready for Pickup')}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20 animate-pulse"
                    >
                      <BellRing className="w-4 h-4" />
                      Mark Ready for Pickup
                    </button>
                  )}

                  {/* State 4: Ready for Pickup -> [Mark as Collected] */}
                  {order.order_status === 'Ready for Pickup' && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleStatusTransition(order.id, 'Collected')}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <PackageCheck className="w-4 h-4 text-emerald-400" />
                      Mark as Collected
                    </button>
                  )}

                  {/* Completed / Rejected state */}
                  {order.order_status === 'Collected' && (
                    <div className="w-full py-2 text-center text-xs font-semibold text-slate-400 bg-slate-50 rounded-xl">
                      Order Completed & Collected
                    </div>
                  )}

                  {order.order_status === 'Rejected/Cancelled' && (
                    <div className="w-full py-2 text-center text-xs font-semibold text-rose-500 bg-rose-50 rounded-xl">
                      Order Cancelled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal (Requirement 19) */}
      <RejectionModal
        isOpen={!!rejectingOrder}
        onClose={() => setRejectingOrder(null)}
        onConfirm={handleConfirmRejection}
        orderId={rejectingOrder?.order_id}
      />
    </div>
  );
}
