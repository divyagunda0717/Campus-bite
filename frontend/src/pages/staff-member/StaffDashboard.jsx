import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getStallById,
  getStallOrders,
  toggleStallOpen,
  getFoodItemsByStall,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  toggleFoodAvailability,
  getPickupSlots,
  getStallQR,
  updateStallQR,
  deleteStallQR,
  updateOrderStatus
} from '../../lib/dataService';
import StatusBadge from '../../components/StatusBadge';
import RejectionModal from '../../components/RejectionModal';
import {
  Store,
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  PackageCheck,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit2,
  Trash2,
  QrCode,
  Upload,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  Utensils
} from 'lucide-react';

export default function StaffDashboard() {
  const { user, assignedStallId } = useAuth();
  const [stall, setStall] = useState(null);
  const [orders, setOrders] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [slots, setSlots] = useState([]);
  const [qr, setQR] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'menu', 'slots', 'qr'
  const [loading, setLoading] = useState(true);

  // Orders sub-filter
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectingOrder, setRejectingOrder] = useState(null);

  // Food Item Modal
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Tiffins',
    image_url: '',
    is_available: true
  });

  // QR Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrForm, setQrForm] = useState({ upi_id: '', qr_image_url: '' });

  const loadStallData = async () => {
    if (!assignedStallId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const s = await getStallById(assignedStallId);
    setStall(s);
    const o = await getStallOrders(assignedStallId);
    setOrders(o);
    const f = await getFoodItemsByStall(assignedStallId, { includeUnavailable: true });
    setFoodItems(f);
    const sl = await getPickupSlots(assignedStallId);
    setSlots(sl);
    const q = await getStallQR(assignedStallId);
    setQR(q);
    setLoading(false);
  };

  useEffect(() => {
    loadStallData();

    const handleUpdate = () => loadStallData();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, [assignedStallId]);

  // Guard: If not assigned to any stall
  if (!assignedStallId) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">No Food Stall Assigned</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Your Staff Member account is approved, but the Super Admin has not assigned you to a specific food stall yet.
        </p>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
          Once the Super Admin assigns you to a food stall, your stall dashboard, orders, menu items, pickup slots, and QR settings will appear automatically here.
        </div>
      </div>
    );
  }

  // Handle Stall Open / Closed toggle
  const handleToggleOpen = async () => {
    if (!stall) return;
    const newStatus = !stall.is_open;
    await toggleStallOpen(stall.id, newStatus);
    setStall({ ...stall, is_open: newStatus });
  };

  // Order status transitions
  const handleOrderStatus = async (orderId, newStatus) => {
    setActionLoadingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadStallData();
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
      setRejectingOrder(null);
      await loadStallData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Food Item Management
  const handleOpenFoodModal = (item = null) => {
    if (item) {
      setEditingFood(item);
      setFoodForm({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category,
        image_url: item.image_url || '',
        is_available: item.is_available
      });
    } else {
      setEditingFood(null);
      setFoodForm({
        name: '',
        description: '',
        price: '',
        category: 'Tiffins',
        image_url: '',
        is_available: true
      });
    }
    setFoodModalOpen(true);
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    if (editingFood) {
      await updateFoodItem(editingFood.id, foodForm);
    } else {
      await createFoodItem({ ...foodForm, stall_id: assignedStallId });
    }
    setFoodModalOpen(false);
    await loadStallData();
  };

  const handleDeleteFood = async (foodId) => {
    if (window.confirm('Delete this food item from your stall menu?')) {
      await deleteFoodItem(foodId);
      await loadStallData();
    }
  };

  const handleToggleFoodAvailable = async (item) => {
    await toggleFoodAvailability(item.id, !item.is_available);
    await loadStallData();
  };

  // QR Code Management
  const handleOpenQRModal = () => {
    setQrForm({
      upi_id: qr?.upi_id || '',
      qr_image_url: qr?.qr_image_url || ''
    });
    setQrModalOpen(true);
  };

  const handleSaveQR = async (e) => {
    e.preventDefault();
    await updateStallQR(assignedStallId, qrForm);
    setQrModalOpen(false);
    await loadStallData();
  };

  const handleDeleteQR = async () => {
    if (window.confirm('Remove payment QR code for this stall?')) {
      await deleteStallQR(assignedStallId);
      await loadStallData();
    }
  };

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'ALL') return true;
    return o.order_status === orderStatusFilter;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Top Banner: Assigned Stall info & Open/Close Toggle */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">
              Staff Member Portal
            </span>
            <span className="text-xs text-slate-400">• Strict Stall Isolation ({stall?.name})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-7 h-7 text-orange-600" />
            {stall?.name || 'Assigned Stall'}
          </h1>
          <p className="text-xs text-slate-500">
            {stall?.location} • Logged in as: <strong>{user?.name}</strong>
          </p>
        </div>

        {/* Stall Open / Closed Switch (Requirement 4) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-bold block text-slate-900">
              {stall?.is_open ? 'Stall is OPEN' : 'Stall is CLOSED'}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {stall?.is_open ? 'Accepting student orders' : 'Orders paused'}
            </span>
          </div>
          <button
            onClick={handleToggleOpen}
            className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              stall?.is_open
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-rose-600 text-white hover:bg-rose-700'
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Kitchen Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'menu'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Manage Menu ({foodItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('slots')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'slots'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pickup Slots ({slots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'qr'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Payment QR</span>
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['ALL', 'Order Placed', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Collected', 'Rejected/Cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    orderStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Orders' : st}
                </button>
              ))}
            </div>

            <button
              onClick={loadStallData}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No Orders in this category</h3>
              <p className="text-xs text-slate-500 mt-1">New incoming orders from students will appear automatically here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                        {order.order_number || order.order_id}
                      </span>
                      <StatusBadge status={order.order_status} size="sm" />
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 text-sm">{order.customer_name}</div>
                      <div className="text-[11px] text-slate-500">
                        Pickup Slot: <strong className="text-slate-800">{order.pickup_time}</strong> • Total: <strong className="text-orange-600">₹{order.total_amount}</strong> ({order.payment_method})
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                      {(order.items || []).map((it, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span>{it.quantity}x {it.food_name}</span>
                          <span className="font-semibold text-slate-900">₹{Number(it.price) * it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons based on status flow */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {order.order_status === 'Order Placed' && (
                      <>
                        <button
                          disabled={actionLoadingId === order.id}
                          onClick={() => handleOrderStatus(order.id, 'Confirmed')}
                          className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
                        >
                          Confirm Order
                        </button>
                        <button
                          disabled={actionLoadingId === order.id}
                          onClick={() => setRejectingOrder(order)}
                          className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {order.order_status === 'Confirmed' && (
                      <button
                        disabled={actionLoadingId === order.id}
                        onClick={() => handleOrderStatus(order.id, 'Preparing')}
                        className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition"
                      >
                        Start Preparing (In Kitchen)
                      </button>
                    )}

                    {order.order_status === 'Preparing' && (
                      <button
                        disabled={actionLoadingId === order.id}
                        onClick={() => handleOrderStatus(order.id, 'Ready for Pickup')}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                      >
                        Mark Ready for Pickup
                      </button>
                    )}

                    {order.order_status === 'Ready for Pickup' && (
                      <button
                        disabled={actionLoadingId === order.id}
                        onClick={() => handleOrderStatus(order.id, 'Collected')}
                        className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                      >
                        Mark as Collected by Student
                      </button>
                    )}

                    {order.order_status === 'Collected' && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Order Completed
                      </span>
                    )}

                    {order.order_status === 'Rejected/Cancelled' && (
                      <span className="text-xs text-rose-600 font-medium">
                        Rejected: {order.rejection_reason || 'Unfulfillable'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE MENU */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Stall Food Items ({foodItems.length})
            </h2>
            <button
              onClick={() => handleOpenFoodModal()}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Food Item
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {foodItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="relative h-40 bg-slate-100">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleFoodAvailable(item)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                        item.is_available
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.is_available ? 'AVAILABLE' : 'UNAVAILABLE'}
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                      <span className="text-[11px] text-slate-400">{item.category}</span>
                    </div>
                    <span className="font-black text-orange-600 text-base">₹{Number(item.price).toFixed(2)}</span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description || 'Fresh campus food item'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenFoodModal(item)}
                      className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFood(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PICKUP SLOTS */}
      {activeTab === 'slots' && (
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">10-Minute Pickup Windows</h2>
              <p className="text-xs text-slate-500">Scheduled capacity 10 orders per window (9:00 AM - 6:00 PM)</p>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              {slots.length} Windows Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
            {slots.map(sl => (
              <div
                key={sl.id || sl.start_time}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1"
              >
                <span className="font-bold text-slate-900 text-xs block">{sl.slot_label || sl.start_time}</span>
                <span className="text-[10px] text-slate-500 block">
                  Booked: {sl.booked_count || 0}/{sl.capacity || 10}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT QR */}
      {activeTab === 'qr' && (
        <div className="max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Stall Payment QR</h2>
            <button
              onClick={handleOpenQRModal}
              className="px-3 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition"
            >
              Upload / Replace QR
            </button>
          </div>

          {qr ? (
            <div className="text-center space-y-4">
              <div className="w-56 h-56 mx-auto p-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center">
                <img src={qr.qr_image_url} alt="Stall QR" className="w-full h-full object-contain" />
              </div>
              <div className="font-mono text-xs text-slate-600 font-bold">UPI ID: {qr.upi_id || 'Not specified'}</div>
              <button
                onClick={handleDeleteQR}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Delete QR Code
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No QR code configured for this stall. Click "Upload / Replace QR" to set up online payments.
            </div>
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingOrder && (
        <RejectionModal
          orderId={rejectingOrder.order_number || rejectingOrder.order_id}
          onClose={() => setRejectingOrder(null)}
          onConfirm={handleConfirmRejection}
        />
      )}

      {/* Add / Edit Food Modal */}
      {foodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">
              {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
            </h3>
            <form onSubmit={handleSaveFood} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={foodForm.price}
                  onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category *</label>
                <select
                  value={foodForm.category}
                  onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  {['Tiffins', 'Lunch', 'Snacks', 'Beverages', 'Fast Food', 'Desserts', 'Other'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  rows={2}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={foodForm.image_url}
                  onChange={(e) => setFoodForm({ ...foodForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFoodModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Edit Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Update Stall Payment QR</h3>
            <form onSubmit={handleSaveQR} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">UPI ID *</label>
                <input
                  type="text"
                  required
                  value={qrForm.upi_id}
                  onChange={(e) => setQrForm({ ...qrForm, upi_id: e.target.value })}
                  placeholder="stall@upi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">QR Code Image URL *</label>
                <input
                  type="url"
                  required
                  value={qrForm.qr_image_url}
                  onChange={(e) => setQrForm({ ...qrForm, qr_image_url: e.target.value })}
                  placeholder="https://api.qrserver.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
                >
                  Save QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
