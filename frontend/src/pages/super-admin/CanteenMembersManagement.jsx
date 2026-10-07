import React, { useState, useEffect } from 'react';
import { getStalls, updateStall } from '../../lib/dataService';
import { Users, Shield, Store, Edit2, CheckCircle2, X, Plus } from 'lucide-react';

export default function CanteenMembersManagement() {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStall, setEditingStall] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await getStalls({ includeInactive: true });
    setStalls(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssign = (stall) => {
    setEditingStall(stall);
    setAdminName(stall.assigned_admin_name || '');
    setAdminEmail(stall.assigned_admin_email || '');
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!editingStall) return;
    await updateStall(editingStall.id, {
      assigned_admin_name: adminName,
      assigned_admin_email: adminEmail
    });
    setEditingStall(null);
    await loadData();
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Access & Ownership</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          Canteen Members & Stall Assignments
        </h1>
        <p className="text-xs text-slate-500">
          Strict 1-to-1 mapping: each Canteen Member / Stall Admin manages exactly one campus food stall.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Assigned Operators ({stalls.length} Stalls)</h2>
          <span className="text-xs text-slate-400">Strict Data Isolation Enforced</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Assigned Stall</th>
                <th className="py-3.5 px-4">Canteen Member Name</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Stall Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stalls.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <Store className="w-4 h-4 text-orange-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-[11px] text-slate-400">{s.location}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-semibold text-slate-800">
                    {s.assigned_admin_name || (
                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium">Unassigned</span>
                    )}
                  </td>

                  <td className="py-4 px-4 font-mono text-slate-600">
                    {s.assigned_admin_email || '—'}
                  </td>

                  <td className="py-4 px-4">
                    {s.is_active ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">Active Stall</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">Deactivated</span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleOpenAssign(s)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 font-semibold rounded-lg text-xs transition"
                    >
                      Assign / Change Member
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {editingStall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-7">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Assign Member to {editingStall.name}
                </h3>
                <button onClick={() => setEditingStall(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAssignment} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Canteen Member Name</label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Member Email Address</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="e.g. operator@campusbite.demo"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingStall(null)}
                    className="w-1/2 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition shadow-md shadow-orange-500/20"
                  >
                    Save Assignment
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
