import React, { useState, useEffect } from 'react';
import { getProfiles, updateProfile } from '../../lib/dataService';
import { Users, User, Shield, GraduationCap, School, ChefHat, RefreshCw, AlertCircle, CheckCircle2, UserX, UserCheck } from 'lucide-react';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getProfiles();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();

    const handleUpdate = () => loadUsers();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.account_status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    await updateProfile(user.id, { account_status: newStatus });
    await loadUsers();
  };

  const filtered = users.filter((u) => {
    const roleNormalized = (u.role || '').toUpperCase();
    const matchesRole = selectedRole === 'ALL' || roleNormalized === selectedRole.toUpperCase();
    const query = search.toLowerCase();
    const matchesSearch = (u.full_name || u.name || '').toLowerCase().includes(query) ||
                          (u.email || '').toLowerCase().includes(query) ||
                          (u.phone || '').includes(query);
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
            Real registered students, faculty members, staff members, and administrators. No demo or fake accounts.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="Search registered user by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {['ALL', 'STUDENT', 'FACULTY', 'STAFF_MEMBER', 'STALL_ADMIN', 'SUPER_ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase whitespace-nowrap transition ${
                selectedRole === r
                  ? 'bg-slate-900 text-white shadow-xs'
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
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading campus directory...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">No Registered Users in this view</p>
            <p className="text-slate-400 mt-1">Users will appear here when they register through the Sign Up portal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => {
                  const roleNormalized = (u.role || '').toUpperCase();
                  const statusNormalized = (u.account_status || 'ACTIVE').toUpperCase();

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                            {(u.full_name || u.name || 'U')[0]}
                          </div>
                          <span>{u.full_name || u.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-600">{u.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          roleNormalized === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' :
                          roleNormalized === 'STALL_ADMIN' ? 'bg-amber-100 text-amber-800' :
                          roleNormalized === 'STAFF_MEMBER' ? 'bg-purple-100 text-purple-800' :
                          roleNormalized === 'FACULTY' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {roleNormalized.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          statusNormalized === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                          statusNormalized === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                          statusNormalized === 'REJECTED' ? 'bg-rose-50 text-rose-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {statusNormalized}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500">{u.phone || '—'}</td>
                      <td className="py-4 px-6 text-right">
                        {roleNormalized !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                              statusNormalized === 'ACTIVE'
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {statusNormalized === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
