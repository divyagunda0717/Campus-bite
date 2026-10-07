import React, { useState, useEffect } from 'react';
import { Search, Store, Clock, ShieldCheck, Sparkles, Filter, ChevronRight, Utensils } from 'lucide-react';
import { getStalls } from '../lib/dataService';
import StallCard from '../components/StallCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpenOnly, setFilterOpenOnly] = useState(false);

  useEffect(() => {
    async function fetchStalls() {
      setLoading(true);
      // Fetch only active stalls for public / student view (Requirement 4 & 5)
      const data = await getStalls({ includeInactive: false });
      setStalls(data);
      setLoading(false);
    }
    fetchStalls();

    // Listen for stall updates from admin actions
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
    <div className="space-y-12 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Zero-Queue Campus Canteen Experience
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Hungry on Campus? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              Pre-Order & Pickup Fresh.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
            Skip long canteen lines between lectures. Choose your food stall, schedule your convenient 10-minute pickup slot, pay seamlessly via Cash or UPI QR, and collect piping hot food on time.
          </p>

          {/* Search bar inside Hero */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food stalls, cuisines, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={() => setFilterOpenOnly(!filterOpenOnly)}
              className={`px-5 py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition border ${
                filterOpenOnly
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20'
              }`}
            >
              <Clock className="w-4 h-4" />
              {filterOpenOnly ? 'Showing Open Only' : 'Filter Open Stalls'}
            </button>
          </div>
        </div>
      </section>

      {/* Campus Stalls Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider">
              <Store className="w-4 h-4" />
              Dynamic Campus Food Stalls
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Available Canteen Stalls ({filteredStalls.length})
            </h2>
          </div>

          <div className="text-xs text-slate-500">
            Showing all active stalls live from database
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
            <h3 className="text-lg font-bold text-slate-800">No stalls matched your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your query or toggle off "Open Only" filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setFilterOpenOnly(false); }}
              className="px-4 py-2 text-xs font-semibold text-orange-600 bg-orange-50 rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStalls.map((stall) => (
              <StallCard key={stall.id} stall={stall} />
            ))}
          </div>
        )}
      </section>

      {/* How CampusBite Works */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xs">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Simple & Fast</span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">How Pre-Ordering Works</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Avoid crowded canteen counters and collect food right when your slot arrives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-black text-sm flex items-center justify-center mx-auto">1</div>
            <h4 className="font-bold text-sm text-slate-800">Select Canteen Stall</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Browse active campus food stalls and explore their live menus.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-black text-sm flex items-center justify-center mx-auto">2</div>
            <h4 className="font-bold text-sm text-slate-800">Add to Single-Stall Cart</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Add foods of your choice with automatic single-stall validation.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-black text-sm flex items-center justify-center mx-auto">3</div>
            <h4 className="font-bold text-sm text-slate-800">Pick 10-Min Slot & Pay</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Choose your pickup window between 9 AM - 6 PM and pay via Cash or QR.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-black text-sm flex items-center justify-center mx-auto">4</div>
            <h4 className="font-bold text-sm text-slate-800">Track & Collect Food</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Watch live order confirmation and pick up your hot food immediately.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
