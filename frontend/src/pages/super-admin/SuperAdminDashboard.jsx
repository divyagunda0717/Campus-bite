import React, { useState, useEffect } from 'react';
import { getStalls, getAllOrders } from '../../lib/dataService';
import { Store, Users, ShoppingBag, ShieldCheck, DollarSign, ArrowRight, Clock, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';

export default function SuperAdminDashboard() {
  const [stalls, setStalls] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const s = await getStalls({ includeInactive: true });
      setStalls(s);
      const o = await getAllOrders();
      setOrders(o);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, []);

  const activeStalls = stalls.filter(s => s.is_active);
  const inactiveStalls = stalls.filter(s => !s.is_active);
  const totalRevenue = orders
    .filter(o => o.order_status !== 'Rejected/Cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="space-y-8 pb-20">
      {/* Super Admin Hero Header */}
      <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Campus Super Administrator
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Central Canteen Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Manage dynamic campus food stalls, monitor real-time queue reduction, audit orders, and coordinate canteen stall operators.
          </p>
        </div>

        <div className="z-10 flex gap-3">
          <Link
            to="/super-admin/stalls"
            className="px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-orange-500/25 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Manage Stalls
          </Link>
        </div>
      </div>

      {/* Campus Wide Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Stalls</span>
            <Store className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stalls.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {activeStalls.length} active • {inactiveStalls.length} inactive
          </span>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{orders.length}</div>
          <span className="text-[11px] text-slate-400 block">Across all stalls</span>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Campus GMV</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">₹{totalRevenue.toFixed(0)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold block">Completed sales</span>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Canteen Admins</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{activeStalls.length}</div>
          <span className="text-[11px] text-purple-600 font-semibold block">Assigned operators</span>
        </div>
      </div>

      {/* Dynamic Stalls Quick View */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Campus Stalls Overview</h2>
            <p className="text-xs text-slate-500">Dynamic stall status, active state, and assigned canteen members.</p>
          </div>
          <Link to="/super-admin/stalls" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
            Manage All Stalls ({stalls.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stalls.map((s) => (
            <div
              key={s.id}
              className={`p-4 rounded-2xl border transition flex items-center gap-3.5 ${
                s.is_active ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'
              }`}
            >
              <img
                src={s.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=100&q=80'}
                alt={s.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{s.name}</h4>
                  {!s.is_active && (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-sm">Deactivated</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{s.location}</p>
                <p className="text-[10px] text-orange-700 font-medium truncate mt-0.5">
                  Member: {s.assigned_admin_name || s.assigned_admin_email || 'Unassigned'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders across all stalls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Campus Orders</h2>
            <p className="text-xs text-slate-500">Live order audit stream from all stalls.</p>
          </div>
          <Link to="/super-admin/orders" className="text-xs font-bold text-orange-600 hover:underline">
            View All Campus Orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No orders recorded in campus database yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-600 font-mono">{o.order_id}</span>
                    <span className="font-bold text-slate-900">{o.stall_name}</span>
                    <span className="text-slate-400">• Customer: {o.customer_name}</span>
                  </div>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">
                    Slot: <strong>{o.pickup_time}</strong> • Items: {o.items?.map(i => `${i.food_name} (x${i.quantity})`).join(', ')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={o.order_status} size="sm" />
                  <span className="font-black text-slate-900">₹{Number(o.total_amount).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
