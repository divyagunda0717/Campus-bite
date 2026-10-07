import React, { useState } from 'react';
import { DEMO_PRESETS } from '../../context/AuthContext';
import { Users, User, Shield, GraduationCap, School } from 'lucide-react';

const INITIAL_USERS = [
  ...DEMO_PRESETS.map((p, idx) => ({
    id: `user-${idx + 1}`,
    name: p.name,
    email: p.email,
    role: p.role,
    phone: '+91 98888 ' + (idx + 1).toString().repeat(5),
    created_at: new Date(Date.now() - idx * 86400000).toLocaleDateString()
  })),
  {
    id: 'user-6',
    name: 'Rohit Verma (ECE)',
    email: 'rohit.v@campus.edu',
    role: 'student',
    phone: '+91 98888 66666',
    created_at: new Date(Date.now() - 3 * 86400000).toLocaleDateString()
  },
  {
    id: 'user-7',
    name: 'Sneha Roy (MBA)',
    email: 'sneha.r@campus.edu',
    role: 'student',
    phone: '+91 98888 77777',
    created_at: new Date(Date.now() - 4 * 86400000).toLocaleDateString()
  },
  {
    id: 'user-8',
    name: 'Prof. Ananthakrishnan (Mech)',
    email: 'prof.ananth@campus.edu',
    role: 'faculty',
    phone: '+91 98888 88888',
    created_at: new Date(Date.now() - 5 * 86400000).toLocaleDateString()
  }
];

export default function UsersManagement() {
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = INITIAL_USERS.filter((u) => {
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Identity Directory</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Campus Users
          </h1>
          <p className="text-xs text-slate-500">
            Overview of registered students, faculty members, canteen staff, and administrators.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'student', 'faculty', 'stall_admin', 'super_admin'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase whitespace-nowrap transition ${
                selectedRole === r
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-6 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {u.name[0]}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-600">{u.email}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                      u.role === 'stall_admin' ? 'bg-amber-100 text-amber-800' :
                      u.role === 'faculty' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500">{u.phone}</td>
                  <td className="py-4 px-6 text-right text-slate-400 font-medium">{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
