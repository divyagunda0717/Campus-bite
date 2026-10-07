import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Phone, Clock, ShoppingBag, Store, AlertTriangle } from 'lucide-react';
import { getStallById, getFoodItemsByStall } from '../lib/dataService';
import FoodCard from '../components/FoodCard';
import { useCart } from '../context/CartContext';

const CATEGORIES = ['All', 'Tiffins', 'Lunch', 'Snacks', 'Beverages', 'Fast Food', 'Desserts', 'Other'];

export default function StallMenu() {
  const { stallId } = useParams();
  const { totalCount, totalAmount, setIsDrawerOpen, cartStall } = useCart();

  const [stall, setStall] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const s = await getStallById(stallId);
      setStall(s);
      const f = await getFoodItemsByStall(stallId, { includeUnavailable: true });
      setFoods(f);
      setLoading(false);
    }
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, [stallId]);

  const filteredFoods = foods.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAvailable = filterAvailableOnly ? item.is_available : true;
    return matchesCategory && matchesSearch && matchesAvailable;
  });

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading stall menu...</p>
      </div>
    );
  }

  if (!stall) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto p-8">
        <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Stall not found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">This stall may have been deactivated or removed.</p>
        <Link to="/" className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-semibold">
          Return to All Stalls
        </Link>
      </div>
    );
  }

  const isCurrentCartFromThisStall = cartStall?.id === stall.id;

  return (
    <div className="space-y-8 pb-24">
      {/* Back Button */}
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to All Stalls
        </Link>
      </div>

      {/* Stall Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="h-56 sm:h-72 w-full relative">
          <img
            src={stall.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'}
            alt={stall.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

          {/* Open / Closed Badge */}
          <div className="absolute top-4 right-4">
            {stall.is_open ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md flex items-center gap-1.5 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Open for Pre-Orders
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md flex items-center gap-1.5 backdrop-blur-xs">
                <Clock className="w-3.5 h-3.5" />
                Currently Closed
              </span>
            )}
          </div>

          {/* Details Overlay */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">Campus Food Stall</span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{stall.name}</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">{stall.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-400" /> {stall.location}</span>
              {stall.contact && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> {stall.contact}</span>}
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-400" /> 10-Min Pickup Window: 9:00 AM - 6:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Closed Warning Banner */}
      {!stall.is_open && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-medium">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <strong>Notice:</strong> This stall is currently closed and not accepting new orders right now. You can browse their menu items for upcoming service.
          </div>
        </div>
      )}

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search dishes in ${stall.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => setFilterAvailableOnly(!filterAvailableOnly)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              filterAvailableOnly
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {filterAvailableOnly ? 'Showing Available Only' : 'Filter Available Only'}
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Menu Items ({filteredFoods.length})
          </h2>
          <span className="text-xs text-slate-400">
            {selectedCategory !== 'All' ? `Filtered by ${selectedCategory}` : 'All Categories'}
          </span>
        </div>

        {filteredFoods.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No food items found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              Try switching category or clearing the search query.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setFilterAvailableOnly(false); }}
              className="px-4 py-2 text-xs font-semibold text-orange-600 bg-orange-50 rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} stall={stall} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar (if items exist in cart) */}
      {totalCount > 0 && isCurrentCartFromThisStall && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">{totalCount} item{totalCount > 1 ? 's' : ''} in cart</div>
              <div className="text-base font-bold text-white">₹{totalAmount.toFixed(2)}</div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-500/30"
            >
              <ShoppingBag className="w-4 h-4" />
              View Cart & Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
