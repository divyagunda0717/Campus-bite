import React, { useState, useEffect } from 'react';
import { Clock, Check, AlertCircle } from 'lucide-react';
import { getPickupSlots } from '../lib/dataService';

export default function SlotPicker({ stallId, selectedSlot, onSelectSlot }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!stallId) return;
      setLoading(true);
      const data = await getPickupSlots(stallId);
      setSlots(data);
      setLoading(false);
    }
    load();
  }, [stallId]);

  // Determine if a slot is in the past for today's date
  const isPastSlot = (startTime) => {
    const now = new Date();
    const [slotHour, slotMin] = startTime.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    // If current time is after slot start time
    if (currentHour > slotHour) return true;
    if (currentHour === slotHour && currentMin >= slotMin) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center animate-pulse">
        <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading 10-minute pickup slots...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-orange-600" />
          Select 10-Minute Pickup Window (9:00 AM - 6:00 PM)
        </label>
        <span className="text-[11px] text-slate-400 font-medium">Capacity: 10 orders/slot</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-1 pr-2 border border-slate-200/80 rounded-2xl bg-slate-50/50">
        {slots.map((slot) => {
          const isFull = slot.booked_count >= slot.capacity;
          const isPast = isPastSlot(slot.start_time);
          const isDisabled = isFull || isPast;
          const isSelected = selectedSlot?.id === slot.id || selectedSlot?.slot_label === slot.slot_label;

          return (
            <button
              key={slot.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectSlot(slot)}
              className={`p-2.5 rounded-xl text-left border transition relative flex flex-col justify-between ${
                isDisabled
                  ? 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  : isSelected
                  ? 'bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {slot.slot_label}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
              </div>

              <div className="mt-1 flex items-center justify-between text-[10px]">
                {isPast ? (
                  <span className="text-slate-400 font-medium">Past Slot</span>
                ) : isFull ? (
                  <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-sm">10/10 FULL</span>
                ) : (
                  <span className={isSelected ? 'text-orange-100 font-medium' : 'text-emerald-700 font-medium'}>
                    {slot.booked_count}/{slot.capacity} booked
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedSlot && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Selected Window: <strong>{selectedSlot.slot_label}</strong></span>
          </div>
          <span className="text-emerald-700 font-medium">Guaranteed slot</span>
        </div>
      )}
    </div>
  );
}
