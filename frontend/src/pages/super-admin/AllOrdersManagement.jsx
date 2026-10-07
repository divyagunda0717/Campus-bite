import React, { useState, useEffect } from 'react';
import { getAllOrders, getStalls } from '../../lib/dataService';
import StatusBadge from '../../components/StatusBadge';
import { ShoppingBag, Search, Filter, Store, Clock, RefreshCw } from 'lucide-react';

export default function AllOrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const o = await getAllOrders();
    setOrders(o);
    const s = await getStalls({ includeInactive: true });
    setStalls(s);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, []);

  const filtered = orders.filter((o) => {
    const matchesStall = selectedStall === 'ALL' || o.stall_id === selectedStall;
    const matchesStatus = selectedStatus === 'ALL' || o.order_status === selectedStatus;
    const matchesSearch = o.order_id.toLowerCase().includes(search.toLowerCase()) ||
                          o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                          o.stall_name.toLowerCase().includes(search.toLowerCase());
    return matchesStall && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Master Audit Stream</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            All Campus Orders
          </h1>
          <p className="text-xs text-slate-500">
            Real-time audit log of pre-orders placed across all campus canteens and stalls.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Orders
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order ID, customer, stall..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Stall Filter */}
          <select
            value={selectedStall}
            onChange={(e) => setSelectedStall(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          >
            <option value="ALL">All Stalls ({stalls.length})</option>
            {stalls.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="Collected">Collected</option>
            <option value="Rejected/Cancelled">Rejected/Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No matching orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try resetting your stall or status filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-4">Stall Name</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Pickup Window</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-mono font-bold text-orange-600">
                      {o.order_id}
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-900">
                      {o.stall_name}
                    </td>

                    <td className="py-4 px-4 text-slate-700">
                      <span className="font-semibold block">{o.customer_name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {o.pickup_time}
                    </td>

                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      ₹{Number(o.total_amount).toFixed(2)}
                    </td>

                    <td className="py-4 px-4">
                      <span className="capitalize font-semibold text-slate-800 block">{o.payment_method}</span>
                      <span className="text-[10px] text-emerald-600 font-medium">{o.payment_status}</span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <StatusBadge status={o.order_status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
