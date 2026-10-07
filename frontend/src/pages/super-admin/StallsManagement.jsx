import React, { useState, useEffect } from 'react';
import { getStalls, createStall, updateStall, deactivateStall, reactivateStall, assignStallAdmin, getFoodItemsByStall } from '../../lib/dataService';
import { Store, Plus, Edit2, AlertTriangle, CheckCircle2, X, MapPin, Phone, Users, ShieldAlert, ArrowRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StallsManagement() {
  const [stalls, setStalls] = useState([]);
  const [foodCounts, setFoodCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStall, setEditingStall] = useState(null);

  // Deactivation confirmation modal state (Requirement 4)
  const [deactivatingStall, setDeactivatingStall] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contact: '',
    image_url: '',
    assigned_admin_name: '',
    assigned_admin_email: '',
    is_open: true,
    is_active: true
  });

  const loadStalls = async () => {
    setLoading(true);
    const data = await getStalls({ includeInactive: true });
    setStalls(data);

    // Load food counts for each stall
    const counts = {};
    for (const s of data) {
      const items = await getFoodItemsByStall(s.id, { includeUnavailable: true });
      counts[s.id] = items.length;
    }
    setFoodCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    loadStalls();

    const handleUpdate = () => loadStalls();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, []);

  const handleOpenAddModal = () => {
    setEditingStall(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      contact: '',
      image_url: '',
      assigned_admin_name: '',
      assigned_admin_email: '',
      is_open: true,
      is_active: true
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (stall) => {
    setEditingStall(stall);
    setFormData({
      name: stall.name,
      description: stall.description || '',
      location: stall.location || '',
      contact: stall.contact || '',
      image_url: stall.image_url || '',
      assigned_admin_name: stall.assigned_admin_name || '',
      assigned_admin_email: stall.assigned_admin_email || '',
      is_open: stall.is_open,
      is_active: stall.is_active
    });
    setModalOpen(true);
  };

  const handleSaveStall = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) return;

    if (editingStall) {
      await updateStall(editingStall.id, formData);
    } else {
      await createStall(formData);
    }

    setModalOpen(false);
    await loadStalls();
  };

  // Requirement 4: Confirm Deactivate Stall
  const handleConfirmDeactivate = async () => {
    if (!deactivatingStall) return;
    await deactivateStall(deactivatingStall.id);
    setDeactivatingStall(null);
    await loadStalls();
  };

  // Requirement 4: Reactivate Stall
  const handleReactivate = async (stallId) => {
    await reactivateStall(stallId);
    await loadStalls();
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Dynamic Multi-Stall Architecture</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Manage Campus Stalls
          </h1>
          <p className="text-xs text-slate-500">
            Add any number of food stalls, assign canteen members, or deactivate stalls while preserving order histories.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          + Add New Stall
        </button>
      </div>

      {/* Stalls Table (Requirement 5) */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading stalls...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Stall Details</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Assigned Canteen Member</th>
                  <th className="py-3.5 px-4">Food Items</th>
                  <th className="py-3.5 px-4">Open / Closed</th>
                  <th className="py-3.5 px-4">Active Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stalls.map((s) => (
                  <tr key={s.id} className={`hover:bg-slate-50/70 transition ${!s.is_active ? 'bg-slate-50/40 opacity-70' : ''}`}>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80'}
                          alt={s.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            {s.name}
                            {!s.is_active && (
                              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-sm">
                                Deactivated
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{s.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {s.location}
                    </td>

                    <td className="py-4 px-4">
                      {s.assigned_admin_name || s.assigned_admin_email ? (
                        <div>
                          <span className="font-bold text-slate-800 block">{s.assigned_admin_name || 'Assigned'}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{s.assigned_admin_email}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-800">
                      {foodCounts[s.id] ?? 0} dishes
                    </td>

                    <td className="py-4 px-4">
                      {s.is_open ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Open
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Closed
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {s.is_active ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Deactivated
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/stall/${s.id}`}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="View Stall Menu"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Stall"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Requirement 4: Activate / Deactivate Action */}
                        {s.is_active ? (
                          <button
                            onClick={() => setDeactivatingStall(s)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(s.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Stall Modal (Requirement 3) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingStall ? 'Edit Stall' : '+ Add New Stall'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStall} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Stall Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Healthy Food Stall, Ice Cream Stall, Biryani Corner"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe cuisines, specialty dishes, ingredients..."
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Block C Ground Floor, Near Gym"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="+91 98765 00000"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Stall Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden text-xs"
                  />
                </div>

                {/* Assigned Canteen Member */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">Assigned Canteen Member / Stall Admin</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Member Name</label>
                      <input
                        type="text"
                        value={formData.assigned_admin_name}
                        onChange={(e) => setFormData({ ...formData, assigned_admin_name: e.target.value })}
                        placeholder="e.g. Anand Verma"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-0.5">Member Email</label>
                      <input
                        type="email"
                        value={formData.assigned_admin_email}
                        onChange={(e) => setFormData({ ...formData, assigned_admin_email: e.target.value })}
                        placeholder="operator@campusbite.demo"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-2 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_open}
                      onChange={(e) => setFormData({ ...formData, is_open: e.target.checked })}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>Open for Pre-Orders</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>Active in Stall Directory</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/2 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition shadow-md shadow-orange-500/20"
                  >
                    {editingStall ? 'Save Stall Changes' : 'Create Stall'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Requirement 4: Stall Deactivation Confirmation Modal */}
      {deactivatingStall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Deactivate {deactivatingStall.name}?
                </h3>
                {/* Specific prompt required text */}
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Are you sure you want to deactivate this stall? <br />
                  This will prevent new orders, but existing order history will be preserved.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div>• Stall will not accept new student orders.</div>
                <div>• Disappears from active student stall browsing list.</div>
                <div>• Preserves all dishes and historical orders in database.</div>
                <div>• Super Admin can reactivate this stall anytime.</div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeactivatingStall(null)}
                  className="w-1/2 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeactivate}
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-md shadow-rose-500/20"
                >
                  Deactivate Stall
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
