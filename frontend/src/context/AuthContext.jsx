import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getProfileById, saveProfile, getStalls } from '../lib/dataService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campusbite_active_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Sync session with Supabase Auth
  const syncSessionUser = async (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      localStorage.removeItem('campusbite_active_user');
      setLoading(false);
      return;
    }

    const meta = sessionUser.user_metadata || {};
    let profile = await getProfileById(sessionUser.id);

    // Bootstrap Super Admin for project owner divyagunda0717@gmail.com if needed
    const isSuperAdminEmail = sessionUser.email === 'divyagunda0717@gmail.com';
    let role = (profile?.role || meta.role || (isSuperAdminEmail ? 'SUPER_ADMIN' : 'STUDENT')).toUpperCase();
    let accountStatus = (profile?.account_status || meta.account_status || (role === 'STAFF_MEMBER' || role === 'STALL_ADMIN' ? 'PENDING' : 'ACTIVE')).toUpperCase();

    if (isSuperAdminEmail) {
      role = 'SUPER_ADMIN';
      accountStatus = 'ACTIVE';
    }

    let stallId = profile?.stall_id || meta.stall_id || null;

    const userData = {
      id: sessionUser.id,
      email: sessionUser.email,
      name: profile?.full_name || meta.name || meta.full_name || sessionUser.email.split('@')[0],
      role,
      account_status: accountStatus,
      phone: profile?.phone || meta.phone || '',
      assignedStallId: stallId
    };

    // If account is not active, don't store in active session
    if (accountStatus !== 'ACTIVE') {
      setUser({ ...userData, isRestricted: true });
    } else {
      setUser(userData);
      localStorage.setItem('campusbite_active_user', JSON.stringify(userData));
    }

    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            await syncSessionUser(session.user);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (session?.user) {
          await syncSessionUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('campusbite_active_user');
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      const authUser = data.user;
      const meta = authUser.user_metadata || {};
      let profile = await getProfileById(authUser.id);

      const isSuperAdminEmail = cleanEmail === 'divyagunda0717@gmail.com';
      let role = (profile?.role || meta.role || (isSuperAdminEmail ? 'SUPER_ADMIN' : 'STUDENT')).toUpperCase();
      let accountStatus = (profile?.account_status || meta.account_status || (role === 'STAFF_MEMBER' || role === 'STALL_ADMIN' ? 'PENDING' : 'ACTIVE')).toUpperCase();

      if (isSuperAdminEmail) {
        role = 'SUPER_ADMIN';
        accountStatus = 'ACTIVE';
      }

      // Check account status strictly (Requirement 8)
      if (accountStatus === 'PENDING') {
        setLoading(false);
        await supabase.auth.signOut();
        return {
          success: false,
          status: 'PENDING',
          error: 'Your account is awaiting Super Admin approval.'
        };
      }

      if (accountStatus === 'REJECTED') {
        setLoading(false);
        await supabase.auth.signOut();
        return {
          success: false,
          status: 'REJECTED',
          error: 'Your registration request was not approved.'
        };
      }

      if (accountStatus === 'DEACTIVATED') {
        setLoading(false);
        await supabase.auth.signOut();
        return {
          success: false,
          status: 'DEACTIVATED',
          error: 'Your account has been deactivated. Please contact the administrator.'
        };
      }

      const stallId = profile?.stall_id || meta.stall_id || null;

      const userData = {
        id: authUser.id,
        email: authUser.email,
        name: profile?.full_name || meta.name || meta.full_name || authUser.email.split('@')[0],
        role,
        account_status: 'ACTIVE',
        phone: profile?.phone || meta.phone || '',
        assignedStallId: stallId
      };

      setUser(userData);
      localStorage.setItem('campusbite_active_user', JSON.stringify(userData));
      setLoading(false);

      return {
        success: true,
        role,
        stallId,
        status: 'ACTIVE'
      };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Login failed.' };
    }
  };

  const register = async ({ email, password, name, role = 'STUDENT', phone = '' }) => {
    setLoading(true);
    try {
      const normalizedRole = role.toUpperCase();
      const cleanEmail = email.trim().toLowerCase();

      // Super Admin CANNOT be registered publicly (Requirement 1 & 6)
      if (normalizedRole === 'SUPER_ADMIN') {
        setLoading(false);
        return {
          success: false,
          error: 'Super Admin accounts cannot be created via public registration.'
        };
      }

      if (!['STUDENT', 'FACULTY', 'STAFF_MEMBER', 'STALL_ADMIN'].includes(normalizedRole)) {
        setLoading(false);
        return {
          success: false,
          error: 'Please select a valid role.'
        };
      }

      // Student, Faculty and Stall Admin: ACTIVE immediately
      // Only Staff Member: PENDING until Super Admin approval
      const initialStatus = normalizedRole === 'STAFF_MEMBER'
        ? 'PENDING'
        : 'ACTIVE';

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name,
            full_name: name,
            role: normalizedRole,
            account_status: initialStatus,
            phone,
            stall_id: null
          }
        }
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      const userId = data.user?.id || crypto.randomUUID();

      // Persist profile
      await saveProfile({
        id: userId,
        full_name: name,
        email: cleanEmail,
        role: normalizedRole,
        account_status: initialStatus,
        phone,
        stall_id: null
      });

      setLoading(false);

      if (initialStatus === 'PENDING') {
        // Sign out right away so pending user is not considered logged in
        await supabase.auth.signOut();
        setUser(null);
        return {
          success: true,
          status: 'PENDING',
          role: normalizedRole,
          message: 'Your registration has been submitted and is awaiting Super Admin approval.'
        };
      }

      // For Student and Faculty: Log them in
      const userData = {
        id: userId,
        email: cleanEmail,
        name,
        role: normalizedRole,
        account_status: 'ACTIVE',
        phone,
        assignedStallId: null
      };

      setUser(userData);
      localStorage.setItem('campusbite_active_user', JSON.stringify(userData));

      return {
        success: true,
        status: 'ACTIVE',
        role: normalizedRole
      };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem('campusbite_active_user');
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    const profile = await getProfileById(user.id);
    if (profile) {
      const updated = {
        ...user,
        role: profile.role,
        account_status: profile.account_status,
        assignedStallId: profile.stall_id
      };
      setUser(updated);
      localStorage.setItem('campusbite_active_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'GUEST',
        accountStatus: user?.account_status || 'GUEST',
        isAuthenticated: !!user && user.account_status === 'ACTIVE',
        loading,
        login,
        register,
        logout,
        refreshUser,
        assignedStallId: user?.assignedStallId || null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
