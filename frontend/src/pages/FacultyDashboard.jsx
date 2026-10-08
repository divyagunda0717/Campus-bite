import React, { useState, useEffect } from 'react';
import { Search, Store, Clock, Sparkles, School, ClipboardList } from 'lucide-react';
import { getStalls } from '../lib/dataService';
import StallCard from '../components/StallCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpenOnly, setFilterOpenOnly] = useState(false);

  useEffect(() => {
    async function fetchStalls() {
      setLoading(true);
      const data = await getStalls({ includeInactive: false });
      setStalls(data);
      setLoading(false);
    }
    fetchStalls();

    const handleUpdate = () => fetchStalls();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, []);

  const filteredStalls = stalls.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOpen = filterOpenOnly ? s.is_open : true;
    return matchesSearch && matchesOpen;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* Faculty Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-8 sm:p-10 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <School className="w-3.5 h-3.5" />
            <span>Faculty Dining Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Welcome, {user?.name || 'Faculty Member'}! <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-amber-200">
              Pre-Order Meals Between Classes
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-light">
            Skip queues during short lecture breaks. Select your preferred stall, schedule your 10-minute pickup slot, pay via Cash or UPI QR, and collect freshly prepared food.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/my-orders"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Track My Active Orders</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stalls Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <Store className="w-4 h-4" />
              Active Campus Food Stalls
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Select a Stall to Order ({filteredStalls.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food stalls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <button
              onClick={() => setFilterOpenOnly(!filterOpenOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                filterOpenOnly
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{filterOpenOnly ? 'Open Only' : 'All'}</span>
            </button>
          </div>
        </div>

        {/* Stalls Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredStalls.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No stalls matched</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStalls.map((stall) => (
              <StallCard key={stall.id} stall={stall} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
