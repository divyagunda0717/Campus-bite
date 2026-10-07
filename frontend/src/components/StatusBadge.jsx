import React from 'react';
import { Clock, CheckCircle2, ChefHat, BellRing, PackageCheck, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2.5 py-0.5' 
    : size === 'lg' 
    ? 'text-sm px-4 py-1.5' 
    : 'text-xs px-3 py-1';

  switch (status) {
    case 'Order Placed':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Order Placed
        </span>
      );
    case 'Confirmed':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          Confirmed
        </span>
      );
    case 'Preparing':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          <ChefHat className="w-3.5 h-3.5 text-purple-600 animate-bounce" />
          Preparing
        </span>
      );
    case 'Ready for Pickup':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 ring-2 ring-emerald-400/20 shadow-sm ${sizeClasses}`}>
          <BellRing className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          Ready for Pickup
        </span>
      );
    case 'Collected':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <PackageCheck className="w-3.5 h-3.5 text-slate-600" />
          Collected
        </span>
      );
    case 'Rejected/Cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected / Cancelled
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-gray-100 text-gray-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}
