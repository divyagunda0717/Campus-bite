import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, getAllOrders } from '../lib/dataService';
import StatusBadge from '../components/StatusBadge';
import { Clock, Store, AlertCircle, CheckCircle, ChefHat, BellRing, PackageCheck, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const PIPELINE_STEPS = [
  { key: 'Order Placed', label: 'Order Placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'Preparing', label: 'Preparing', icon: ChefHat },
  { key: 'Ready for Pickup', label: 'Ready for Pickup', icon: BellRing },
  { key: 'Collected', label: 'Collected', icon: PackageCheck }
];

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    let data = [];
    if (user?.id) {
      data = await getUserOrders(user.id);
    }
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const handleUpdate = () => fetchOrders();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, [user]);

  const getStepIndex = (status) => {
    return PIPELINE_STEPS.findIndex(s => s.key === status);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Live Campus Tracker</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            My Orders & Food Tracking
          </h1>
          <p className="text-xs text-slate-500">
            Real-time status updates synced with canteen kitchen stations.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Orders Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            You haven't placed any food orders yet. Browse our campus stalls and pick something delicious!
          </p>
          <Link to="/" className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-sm">
            Browse Campus Food Stalls
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isRejected = order.order_status === 'Rejected/Cancelled';
            const currentStepIdx = getStepIndex(order.order_status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition overflow-hidden p-6 sm:p-7 space-y-6"
              >
                {/* Header: Order ID & Stall */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                        {order.order_id}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-slate-500" />
                        {order.stall_name}
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Placed on {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Pickup: <strong>{order.pickup_time}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.order_status} size="md" />
                    <span className="font-black text-slate-900 text-base">₹{Number(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Requirement 23: Interactive Visual Timeline / Pipeline */}
                {isRejected ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-rose-900">Order Rejected by Stall</div>
                      <p className="mt-1 leading-relaxed">
                        Reason: <strong className="font-semibold text-rose-950">{order.rejection_reason || 'Food item unavailable or kitchen prep overload'}</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="grid grid-cols-5 gap-1 relative">
                      {PIPELINE_STEPS.map((step, idx) => {
                        const isDone = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                isCurrent
                                  ? 'bg-orange-600 text-white ring-4 ring-orange-200 shadow-md'
                                  : isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-[11px] font-semibold leading-tight ${
                                isCurrent
                                  ? 'text-orange-600 font-bold'
                                  : isDone
                                  ? 'text-slate-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items & Payment Info */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium block">Ordered Dishes</span>
                    <div className="text-slate-800 font-semibold space-y-0.5">
                      {order.items?.map((item, idx) => (
                        <div key={idx}>
                          • {item.food_name} <span className="text-slate-500 font-normal">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="sm:text-right space-y-1 shrink-0">
                    <span className="text-slate-400 font-medium block">Payment Status</span>
                    <span className="font-bold text-slate-800 block capitalize">
                      {order.payment_method} • <span className="text-emerald-700">{order.payment_status}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Target Window: {order.pickup_time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
