import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../lib/dataService';
import StatusBadge from '../components/StatusBadge';
import { CheckCircle2, Clock, Store, ArrowRight, ShieldCheck, ClipboardList, Sparkles } from 'lucide-react';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data);
      setLoading(false);
    }
    load();

    // Listen for real-time status changes
    const handleUpdate = () => load();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Fetching order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 max-w-md mx-auto p-8">
        <h2 className="text-lg font-bold text-slate-800">Order not found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">Could not locate order ID: {orderId}</p>
        <Link to="/" className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4 pb-20">
      {/* Success Hero Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Order Transmitted
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
            Order ID: <span className="text-orange-600">{order.order_id}</span>
          </h1>
        </div>

        {/* Prominent Requirement 15 banner: Waiting for stall confirmation */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl max-w-lg mx-auto text-amber-900 text-xs font-medium space-y-1 shadow-xs">
          <div className="font-bold text-sm flex items-center justify-center gap-1.5 text-amber-800">
            <Clock className="w-4 h-4 animate-spin text-amber-600" />
            Order placed successfully. Waiting for stall confirmation.
          </div>
          <p className="text-amber-700 leading-relaxed">
            Your order has been safely received by <strong>{order.stall_name}</strong>. Canteen staff will review and confirm your order shortly.
          </p>
        </div>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs text-slate-400 font-medium">Ordering Stall</div>
            <div className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
              <Store className="w-4 h-4 text-orange-600" />
              {order.stall_name}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Status</div>
            <div className="mt-1">
              <StatusBadge status={order.order_status} size="md" />
            </div>
          </div>
        </div>

        {/* Schedule & Payment Meta */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Pickup Time Window</span>
            <span className="font-bold text-slate-800 text-sm flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              {order.pickup_time}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Payment Mode & Status</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block capitalize">
              {order.payment_method} • <span className="text-emerald-700">{order.payment_status}</span>
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Items</h3>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-800">
                  {item.food_name} <span className="text-slate-400 font-normal">× {item.quantity}</span>
                </span>
                <span className="font-bold text-slate-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 text-sm font-extrabold text-slate-900">
            <span>Total Paid</span>
            <span className="text-orange-600 text-base">₹{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <Link
            to="/my-orders"
            className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-xs transition shadow-md shadow-orange-500/20 text-center flex items-center justify-center gap-1.5"
          >
            <ClipboardList className="w-4 h-4" />
            Track Order Live in "My Orders"
          </Link>
          <Link
            to="/"
            className="sm:w-1/3 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs transition text-center"
          >
            Browse More Stalls
          </Link>
        </div>
      </div>
    </div>
  );
}
