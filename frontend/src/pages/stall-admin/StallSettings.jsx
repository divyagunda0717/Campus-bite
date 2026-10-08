import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStallById, updateStall } from '../../lib/dataService';
import { Settings, Save, CheckCircle2, Store, ToggleLeft, ToggleRight, MapPin, Phone } from 'lucide-react';

export default function StallSettings() {
  const { user, assignedStallId } = useAuth();
  const stallId = assignedStallId;

  const [stall, setStall] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      if (!stallId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const s = await getStallById(stallId);
      if (s) {
        setStall(s);
        setName(s.name);
        setDescription(s.description || '');
        setLocation(s.location || '');
        setContact(s.contact || '');
        setImageUrl(s.image_url || '');
        setIsOpen(s.is_open);
      }
      setLoading(false);
    }
    load();
  }, [stallId]);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateStall(stallId, {
      name,
      description,
      location,
      contact,
      image_url: imageUrl,
      is_open: isOpen
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading settings...</p>
      </div>
    );
  }

  if (!stallId) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <Settings className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">No Food Stall Assigned</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Please contact the Super Admin to assign you to a stall before modifying settings.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Stall Administration</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          Stall Settings — {stall?.name}
        </h1>
        <p className="text-xs text-slate-500">
          Manage stall profile details, location, and operational opening status.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Stall settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        {/* Open / Closed Switch */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900 text-xs block">Operational Status</span>
            <span className="text-[11px] text-slate-500 block">
              {isOpen ? 'Open for students to pre-order food' : 'Closed — students cannot place orders'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isOpen
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
            }`}
          >
            {isOpen ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {isOpen ? 'STALL OPEN' : 'STALL CLOSED'}
          </button>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Stall Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Campus Location *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Stall Cover Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden text-xs"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Stall Settings
        </button>
      </form>
    </div>
  );
}
