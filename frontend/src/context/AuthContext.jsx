import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getStalls } from '../lib/dataService';

const AuthContext = createContext(null);

export const DEMO_PRESETS = [
  {
    roleKey: 'super_admin',
    label: 'Super Admin',
    email: 'admin@campusbite.demo',
    password: 'CampusBite@123',
    name: 'Dr. R. K. Sharma (Campus Director)',
    role: 'super_admin',
    assignedStallId: null,
    avatar: '👨‍💼',
    badgeColor: 'bg-red-100 text-red-800 border-red-200'
  },
  {
    roleKey: 'tiffin',
    label: 'Tiffin Stall Admin',
    email: 'tiffin@campusbite.demo',
    password: 'CampusBite@123',
    name: 'Ramesh Kumar',
    role: 'stall_admin',
    stallName: 'Tiffin Stall',
    assignedStallId: '22222222-2222-2222-2222-222222222222',
    avatar: '👨‍🍳',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    roleKey: 'fastfood',
    label: 'Fast Food Admin',
    email: 'fastfood@campusbite.demo',
    password: 'CampusBite@123',
    name: 'Suresh Patel',
    role: 'stall_admin',
    stallName: 'Fast Food Stall',
    assignedStallId: '33333333-3333-3333-3333-333333333333',
    avatar: '🍔',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    roleKey: 'student',
    label: 'Student',
    email: 'student@campusbite.demo',
    password: 'CampusBite@123',
    name: 'Aditya Sharma',
    role: 'student',
    assignedStallId: null,
    avatar: '🎓',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    roleKey: 'faculty',
    label: 'Faculty',
    email: 'faculty@campusbite.demo',
    password: 'CampusBite@123',
    name: 'Dr. Meenakshi Sundaram',
    role: 'faculty',
    assignedStallId: null,
    avatar: '👩‍🏫',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
];

export function AuthProvider({ children }) {
  // Default to student demo user for immediate browsing
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusbite_active_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'demo-student-id',
      email: 'student@campusbite.demo',
      name: 'Aditya Sharma',
      role: 'student',
      phone: '+91 98888 44444',
      assignedStallId: null
    };
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('campusbite_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('campusbite_active_user');
    }
  }, [user]);

  // Listen to Supabase Auth state changes if active
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const role = metadata.role || 'student';
        const name = metadata.name || session.user.email?.split('@')[0] || 'User';

        let assignedStallId = metadata.stall_id || null;
        if (role === 'stall_admin' && !assignedStallId) {
          // Find stall by email
          const stalls = await getStalls({ includeInactive: true });
          const matched = stalls.find(s => s.assigned_admin_email === session.user.email);
          if (matched) assignedStallId = matched.id;
        }

        setUser({
          id: session.user.id,
          email: session.user.email,
          name,
          role,
          phone: metadata.phone || '',
          assignedStallId
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Quick 1-click role switcher for hackathon judges & testers
  const switchDemoRole = async (roleKey) => {
    setLoading(true);
    const preset = DEMO_PRESETS.find(p => p.roleKey === roleKey);
    if (!preset) return;

    // Check if we can sign in via Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: preset.email,
        password: preset.password
      });

      if (!error && data?.user) {
        setUser({
          id: data.user.id,
          email: preset.email,
          name: preset.name,
          role: preset.role,
          assignedStallId: preset.assignedStallId
        });
        setLoading(false);
        return;
      }
    } catch (e) {
      // fallback
    }

    // Direct active user set
    setUser({
      id: `demo-${preset.roleKey}-id`,
      email: preset.email,
      name: preset.name,
      role: preset.role,
      assignedStallId: preset.assignedStallId
    });
    setLoading(false);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Check preset match first
      const preset = DEMO_PRESETS.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (preset && password === preset.password) {
        setUser({
          id: `demo-${preset.roleKey}-id`,
          email: preset.email,
          name: preset.name,
          role: preset.role,
          assignedStallId: preset.assignedStallId
        });
        setLoading(false);
        return { success: true };
      }

      // Try Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const meta = data.user.user_metadata || {};
      const role = meta.role || 'student';
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: meta.name || email.split('@')[0],
        role,
        assignedStallId: meta.stall_id || null
      });
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const register = async ({ email, password, name, role = 'student', phone = '' }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, phone }
        }
      });
      if (error) throw error;

      setUser({
        id: data.user?.id || `user-${Date.now()}`,
        email,
        name,
        role,
        phone,
        assignedStallId: null
      });
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
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
