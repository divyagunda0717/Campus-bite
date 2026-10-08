import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPickupSlots, getStallById } from '../../lib/dataService';
import { Clock, Users, Check, AlertCircle, RefreshCw } from 'lucide-react';

export default function StallSlots() {
  const { assignedStallId } = useAuth();
  const stallId = assignedStallId;

  const [stall, setStall] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSlots = async () => {
    if (!stallId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const s = await getStallById(stallId);
    setStall(s);
    const data = await getPickupSlots(stallId);
    setSlots(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSlots();
  }, [stallId]);

  if (!stallId) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">No Food Stall Assigned</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Please contact the Super Admin to assign you to a stall before managing pickup slots.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Capacity Management</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Pickup Slots — {stall?.name || 'Assigned Stall'}
          </h1>
          <p className="text-xs text-slate-500">
            10-minute scheduled pickup windows between 9:00 AM and 6:00 PM. Default capacity is 10 orders per window.
          </p>
        </div>

        <button
          onClick={loadSlots}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Capacity
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading slots...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {slots.map((slot) => {
            const isFull = slot.booked_count >= slot.capacity;
            const pct = Math.round((slot.booked_count / slot.capacity) * 100);

            return (
              <div
                key={slot.id}
                className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between space-y-2.5 transition ${
                  isFull
                    ? 'bg-rose-50/70 border-rose-300'
                    : slot.booked_count > 0
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.slot_label}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-500">Bookings:</span>
                    <span className={isFull ? 'text-rose-700 font-bold' : 'text-slate-900'}>
                      {slot.booked_count} / {slot.capacity}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-rose-600' : slot.booked_count > 5 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-right font-semibold">
                  {isFull ? (
                    <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">FULL</span>
                  ) : slot.booked_count > 0 ? (
                    <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">{10 - slot.booked_count} open</span>
                  ) : (
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
