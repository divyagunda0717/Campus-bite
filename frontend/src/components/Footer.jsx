import React from 'react';
import { Utensils, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">CAMPUS<span className="text-orange-500">BITE</span></span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Smart campus canteen platform empowering students, faculty, and stall owners with dynamic stall management, 
              live 10-minute pickup slot scheduling, and seamless zero-queue food collection.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange-400" /> Service: 9:00 AM - 6:00 PM</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Supabase RLS Protected</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Service Hours</h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>Morning Tiffins: 9:00 AM – 11:30 AM</li>
              <li>Lunch Service: 12:00 PM – 3:00 PM</li>
              <li>Evening Snacks & Juices: 3:30 PM – 6:00 PM</li>
              <li className="text-orange-400 font-medium">Pickup Slots: 10-Min intervals</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Campus Food Stalls</h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>• Main Canteen (Thalis & Meals)</li>
              <li>• Tiffin Stall (Dosas & Idlis)</li>
              <li>• Fast Food Stall (Burgers & Rice)</li>
              <li>• Snacks Stall (Samosas & Chai)</li>
              <li>• Juice Stall (Fresh Juices)</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CampusBite Smart Canteen System. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Built for Campus Hackathon • React + Tailwind + Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
