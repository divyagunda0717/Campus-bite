import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFoodItemsByStall, createFoodItem, updateFoodItem, deleteFoodItem, toggleFoodAvailability, getStallById } from '../../lib/dataService';
import { Plus, Edit2, Trash2, Check, X, Utensils, Ban, CheckCircle2, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = ['Tiffins', 'Lunch', 'Snacks', 'Beverages', 'Fast Food', 'Desserts', 'Other'];

export default function StallMenuManage() {
  const { assignedStallId } = useAuth();
  const stallId = assignedStallId;

  const [stall, setStall] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Tiffins',
    image_url: '',
    is_available: true
  });

  const loadData = async () => {
    if (!stallId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const s = await getStallById(stallId);
    setStall(s);
    const f = await getFoodItemsByStall(stallId, { includeUnavailable: true });
    setFoods(f);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, [stallId]);

  if (!stallId) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <Utensils className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">No Food Stall Assigned</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Please contact the Super Admin to assign you to a stall before managing menu items.
        </p>
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setEditingFood(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Tiffins',
      image_url: '',
      is_available: true
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description || '',
      price: food.price,
      category: food.category || 'Other',
      image_url: food.image_url || '',
      is_available: food.is_available
    });
    setModalOpen(true);
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    if (editingFood) {
      await updateFoodItem(editingFood.id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        is_available: formData.is_available
      });
    } else {
      // Automatically assign logged-in member's stall_id (Requirement 9)
      await createFoodItem({
        stall_id: stallId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        is_available: formData.is_available
      });
    }

    setModalOpen(false);
    await loadData();
  };

  const handleDelete = async (foodId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      await deleteFoodItem(foodId);
      await loadData();
    }
  };

  const handleToggleAvailability = async (food) => {
    await toggleFoodAvailability(food.id, !food.is_available);
    await loadData();
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Dynamic Menu Engine</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Manage Menu — {stall?.name || 'Assigned Stall'}
          </h1>
          <p className="text-xs text-slate-500">
            Add new food items, update pricing, and toggle live stock availability anytime.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          + Add New Food Item
        </button>
      </div>

      {/* Food Items Table / Cards */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading menu...</p>
        </div>
      ) : foods.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No food items added yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Click "+ Add New Food Item" above to add your first dish to the menu.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Dish</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {foods.map((food) => (
                  <tr key={food.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                          alt={food.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{food.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{food.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {food.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      ₹{Number(food.price).toFixed(2)}
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleAvailability(food)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                          food.is_available
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle availability"
                      >
                        {food.is_available ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Available
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5 text-rose-600" />
                            Unavailable
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(food)}
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Food Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(food.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Food Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Food Modal (Requirement 9) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFood} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Food Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Masala Dosa, Paneer Wrap, Cold Coffee"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 60"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe preparation, ingredients, accompaniments..."
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>Mark as Available for Ordering immediately</span>
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
                    {editingFood ? 'Save Changes' : 'Create Food Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
