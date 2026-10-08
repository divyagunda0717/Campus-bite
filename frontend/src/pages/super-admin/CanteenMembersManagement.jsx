import React, { useState, useEffect } from 'react';
import {
  getStalls,
  getProfiles,
  approveStaffRequest,
  rejectStaffRequest,
  reassignStaff,
  toggleStaffActive,
  removeStaffAccess
} from '../../lib/dataService';
import {
  Users,
  Shield,
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Edit2,
  RefreshCw,
  UserCheck,
  UserX,
  X,
  Plus
} from 'lucide-react';

export default function CanteenMembersManagement() {
  const [stalls, setStalls] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'active'

  // Modal states
  const [assignModal, setAssignModal] = useState({ open: false, user: null, selectedStallId: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, user: null, reason: '' });
  const [reassignModal, setReassignModal] = useState({ open: false, user: null, selectedStallId: '' });

  const loadData = async () => {
    setLoading(true);
    const s = await getStalls({ includeInactive: true });
    setStalls(s);
    const p = await getProfiles();
    setProfiles(p);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('campusbite_data_updated', handleUpdate);
    return () => window.removeEventListener('campusbite_data_updated', handleUpdate);
  }, []);

  // Filter pending staff & stall admins (Requirement 4 & 5)
  const pendingRequests = profiles.filter(p =>
    (p.role === 'STAFF_MEMBER' || p.role === 'STALL_ADMIN') &&
    (p.account_status === 'PENDING' || !p.account_status)
  );

  // Filter active staff & stall admins
  const activeMembers = profiles.filter(p =>
    (p.role === 'STAFF_MEMBER' || p.role === 'STALL_ADMIN') &&
    p.account_status === 'ACTIVE'
  );

  // Filter rejected or deactivated
  const otherMembers = profiles.filter(p =>
    (p.role === 'STAFF_MEMBER' || p.role === 'STALL_ADMIN') &&
    (p.account_status === 'REJECTED' || p.account_status === 'DEACTIVATED')
  );

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!assignModal.user || !assignModal.selectedStallId) return;

    try {
      await approveStaffRequest(assignModal.user.id, assignModal.selectedStallId);
      setAssignModal({ open: false, user: null, selectedStallId: '' });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to approve');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectModal.user) return;

    try {
      await rejectStaffRequest(rejectModal.user.id, rejectModal.reason || 'Request not approved');
      setRejectModal({ open: false, user: null, reason: '' });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to reject');
    }
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!reassignModal.user || !reassignModal.selectedStallId) return;

    try {
      await reassignStaff(reassignModal.user.id, reassignModal.selectedStallId);
      setReassignModal({ open: false, user: null, selectedStallId: '' });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to reassign');
    }
  };

  const handleToggleActive = async (user, isActive) => {
    await toggleStaffActive(user.id, isActive);
    await loadData();
  };

  const handleRemoveAccess = async (user) => {
    if (window.confirm(`Revoke stall access for ${user.full_name}?`)) {
      await removeStaffAccess(user.id);
      await loadData();
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Access & Ownership</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Staff & Stall Admin Management
          </h1>
          <p className="text-xs text-slate-500">
            Review pending registrations, approve personnel, and assign operators to specific campus food stalls.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Approvals ({pendingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Active Stall Staff ({activeMembers.length})</span>
        </button>

        {otherMembers.length > 0 && (
          <button
            onClick={() => setActiveTab('other')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'other'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>Deactivated / Rejected ({otherMembers.length})</span>
          </button>
        )}
      </div>

      {/* TAB 1: PENDING APPROVALS */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Pending Registrations Awaiting Super Admin Review
            </h2>
            <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-bold">
              {pendingRequests.length} Pending
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading pending requests...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">No Pending Staff Registrations</p>
              <p className="text-slate-400 mt-1">When users sign up as Staff Member or Stall Admin, their requests will appear here for your review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">Candidate Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Requested Role</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingRequests.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {u.full_name}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          u.role === 'STALL_ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {u.phone || '—'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setAssignModal({ open: true, user: u, selectedStallId: stalls[0]?.id || '' })}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Assign Stall</span>
                          </button>
                          <button
                            onClick={() => setRejectModal({ open: true, user: u, reason: '' })}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE STAFF & STALL ADMINS */}
      {activeTab === 'active' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Active Stall Personnel & Stall Assignments
            </h2>
            <span className="text-xs text-slate-400">Strict 1-to-1 Mapping Enforced</span>
          </div>

          {activeMembers.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              <Shield className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">No Active Stall Personnel</p>
              <p className="text-slate-400 mt-1">Approve pending staff requests to assign operators to your campus stalls.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">Staff Member</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Assigned Food Stall</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-6 text-right">Super Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeMembers.map(u => {
                    const assignedStall = stalls.find(s => s.id === u.stall_id);

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-900 block">{u.full_name}</span>
                          <span className="text-[11px] font-mono text-slate-400">{u.email}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === 'STALL_ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {assignedStall ? (
                            <div className="flex items-center gap-2">
                              <Store className="w-4 h-4 text-orange-600 shrink-0" />
                              <div>
                                <span className="font-bold text-slate-900 block">{assignedStall.name}</span>
                                <span className="text-[10px] text-slate-400">{assignedStall.location}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-md">
                              Stall Pending Assignment
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-500">
                          {u.phone || '—'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setReassignModal({ open: true, user: u, selectedStallId: u.stall_id || stalls[0]?.id || '' })}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 font-bold rounded-xl transition text-slate-700"
                            >
                              Reassign Stall
                            </button>
                            <button
                              onClick={() => handleToggleActive(u, false)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                              title="Deactivate account"
                            >
                              Deactivate
                            </button>
                            <button
                              onClick={() => handleRemoveAccess(u)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition"
                              title="Remove access completely"
                            >
                              Remove Access
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEACTIVATED / REJECTED */}
      {activeTab === 'other' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Deactivated or Rejected Accounts</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {otherMembers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{u.full_name}</td>
                    <td className="py-4 px-4 font-mono text-slate-600">{u.email}</td>
                    <td className="py-4 px-4 uppercase font-bold text-[10px] text-slate-500">{u.role}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        u.account_status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.account_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleActive(u, true)}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition"
                      >
                        Reactivate Account
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPROVE & ASSIGN MODAL */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Approve & Assign Food Stall
              </h3>
              <button onClick={() => setAssignModal({ open: false, user: null, selectedStallId: '' })}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Assign <strong>{assignModal.user?.full_name}</strong> ({assignModal.user?.role?.replace('_', ' ')}) to exactly ONE campus food stall. Their account status will become ACTIVE.
            </p>

            <form onSubmit={handleApprove} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Campus Stall *</label>
                <select
                  required
                  value={assignModal.selectedStallId}
                  onChange={(e) => setAssignModal({ ...assignModal, selectedStallId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                >
                  <option value="" disabled>Choose a stall...</option>
                  {stalls.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModal({ open: false, user: null, selectedStallId: '' })}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Approve & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REASSIGN STALL MODAL */}
      {reassignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Reassign Food Stall
              </h3>
              <button onClick={() => setReassignModal({ open: false, user: null, selectedStallId: '' })}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Reassign <strong>{reassignModal.user?.full_name}</strong> to a different campus food stall.
            </p>

            <form onSubmit={handleReassign} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Campus Stall *</label>
                <select
                  required
                  value={reassignModal.selectedStallId}
                  onChange={(e) => setReassignModal({ ...reassignModal, selectedStallId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                >
                  {stalls.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignModal({ open: false, user: null, selectedStallId: '' })}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Reject Registration</h3>
              <button onClick={() => setRejectModal({ open: false, user: null, reason: '' })}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to reject the registration request for <strong>{rejectModal.user?.full_name}</strong>?
            </p>

            <form onSubmit={handleReject} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Rejection Reason</label>
                <input
                  type="text"
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  placeholder="e.g. Identity verification failed or stall capacity full"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, user: null, reason: '' })}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
