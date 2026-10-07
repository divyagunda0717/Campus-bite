import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, ArrowRight, Clock, Store } from 'lucide-react';

export default function StallCard({ stall }) {
  const isOpen = stall.is_open;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Stall Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={stall.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'}
          alt={stall.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status Pill */}
        <div className="absolute top-3 right-3">
          {isOpen ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Open Now
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600/90 text-white backdrop-blur-md shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              Currently Closed
            </span>
          )}
        </div>

        {/* Stall Name on Image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
            {stall.name}
          </h3>
        </div>
      </div>

      {/* Stall Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-3">
            {stall.description || 'Delivering quick, hygienic campus meals and refreshments.'}
          </p>

          <div className="space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="truncate">{stall.location}</span>
            </div>
            {stall.contact && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{stall.contact}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Store className="w-3.5 h-3.5" />
            <span>Campus Stall</span>
          </div>

          <Link
            to={`/stall/${stall.id}`}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              isOpen
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isOpen ? 'View Menu & Order' : 'View Menu'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
