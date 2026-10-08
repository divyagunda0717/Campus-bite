import { supabase } from './supabase';
import { SEED_STALLS, SEED_FOOD_ITEMS, SEED_STALL_QRS, generateDefaultSlots } from './initialData';

// Local storage keys for persistent client storage & offline fallback
const STORAGE_KEYS = {
  STALLS: 'campusbite_stalls_v2',
  FOOD_ITEMS: 'campusbite_food_items_v2',
  ORDERS: 'campusbite_orders_v2',
  SLOTS: 'campusbite_slots_v2',
  QRS: 'campusbite_qrs_v2',
  PROFILES: 'campusbite_profiles_v2',
  STALL_MEMBERS: 'campusbite_members_v2'
};

function getLocal(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent('campusbite_data_updated', { detail: { key } }));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

// Clean initialization: ZERO fake demo accounts
export function initLocalData() {
  getLocal(STORAGE_KEYS.STALLS, SEED_STALLS);
  getLocal(STORAGE_KEYS.FOOD_ITEMS, SEED_FOOD_ITEMS);
  getLocal(STORAGE_KEYS.ORDERS, []);
  getLocal(STORAGE_KEYS.QRS, SEED_STALL_QRS);
  getLocal(STORAGE_KEYS.PROFILES, []);
  getLocal(STORAGE_KEYS.STALL_MEMBERS, []);
}

initLocalData();

// ============================================================================
// USER PROFILES & ACCOUNTS SERVICE
// ============================================================================

export async function getProfiles() {
  try {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEYS.PROFILES, data);
      return data;
    }
  } catch (err) {}

  return getLocal(STORAGE_KEYS.PROFILES, []);
}

export async function getProfileById(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error && data) return data;
  } catch (err) {}

  const profiles = getLocal(STORAGE_KEYS.PROFILES, []);
  return profiles.find(p => p.id === userId) || null;
}

export async function saveProfile(profileData) {
  const normalized = {
    id: profileData.id,
    full_name: profileData.full_name || profileData.name || 'User',
    email: profileData.email,
    phone: profileData.phone || '',
    role: (profileData.role || 'STUDENT').toUpperCase(),
    account_status: (profileData.account_status || 'ACTIVE').toUpperCase(),
    stall_id: profileData.stall_id || null,
    created_at: profileData.created_at || new Date().toISOString()
  };

  try {
    await supabase.from('profiles').upsert(normalized);
  } catch (err) {}

  const profiles = getLocal(STORAGE_KEYS.PROFILES, []);
  const idx = profiles.findIndex(p => p.id === normalized.id || p.email === normalized.email);
  if (idx !== -1) {
    profiles[idx] = { ...profiles[idx], ...normalized };
  } else {
    profiles.push(normalized);
  }
  setLocal(STORAGE_KEYS.PROFILES, profiles);
  return normalized;
}

export async function updateProfile(userId, updateData) {
  try {
    await supabase.from('profiles').update(updateData).eq('id', userId);
  } catch (err) {}

  const profiles = getLocal(STORAGE_KEYS.PROFILES, []);
  const idx = profiles.findIndex(p => p.id === userId);
  if (idx !== -1) {
    profiles[idx] = { ...profiles[idx], ...updateData };
    setLocal(STORAGE_KEYS.PROFILES, profiles);
    return profiles[idx];
  }
  return null;
}

// ============================================================================
// STALL MEMBERS & APPROVAL MANAGEMENT (REQUIREMENT 4, 5, 6)
// ============================================================================

export async function getStallMembers() {
  try {
    const { data, error } = await supabase.from('stall_members').select('*');
    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEYS.STALL_MEMBERS, data);
      return data;
    }
  } catch (err) {}

  return getLocal(STORAGE_KEYS.STALL_MEMBERS, []);
}

export async function getPendingStaffRequests() {
  const profiles = await getProfiles();
  return profiles.filter(p =>
    (p.role === 'STAFF_MEMBER' || p.role === 'STALL_ADMIN') &&
    (p.account_status === 'PENDING' || !p.account_status)
  );
}

export async function approveStaffRequest(userId, stallId) {
  if (!stallId) throw new Error('Stall ID must be provided for approval');

  const stall = await getStallById(stallId);
  const stallName = stall ? stall.name : 'Assigned Stall';

  // 1. Update Profile: status ACTIVE, stall_id assigned
  const updatedProfile = await updateProfile(userId, {
    account_status: 'ACTIVE',
    stall_id: stallId
  });

  // 2. Update / Upsert stall_members record
  try {
    await supabase.from('stall_members').upsert({
      user_id: userId,
      stall_id: stallId,
      approval_status: 'ACTIVE',
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch (err) {}

  const members = getLocal(STORAGE_KEYS.STALL_MEMBERS, []);
  const mIdx = members.findIndex(m => m.user_id === userId);
  if (mIdx !== -1) {
    members[mIdx] = { ...members[mIdx], stall_id: stallId, approval_status: 'ACTIVE' };
  } else {
    members.push({
      id: crypto.randomUUID(),
      user_id: userId,
      stall_id: stallId,
      approval_status: 'ACTIVE',
      created_at: new Date().toISOString()
    });
  }
  setLocal(STORAGE_KEYS.STALL_MEMBERS, members);

  // 3. Update stall admin info
  if (updatedProfile) {
    await updateStall(stallId, {
      assigned_admin_name: updatedProfile.full_name,
      assigned_admin_email: updatedProfile.email
    });
  }

  return updatedProfile;
}

export async function rejectStaffRequest(userId, reason = 'Request not approved by administrator') {
  const updatedProfile = await updateProfile(userId, {
    account_status: 'REJECTED',
    stall_id: null,
    rejection_reason: reason
  });

  try {
    await supabase.from('stall_members').update({
      approval_status: 'REJECTED',
      stall_id: null
    }).eq('user_id', userId);
  } catch (err) {}

  const members = getLocal(STORAGE_KEYS.STALL_MEMBERS, []);
  const mIdx = members.findIndex(m => m.user_id === userId);
  if (mIdx !== -1) {
    members[mIdx] = { ...members[mIdx], approval_status: 'REJECTED', stall_id: null };
    setLocal(STORAGE_KEYS.STALL_MEMBERS, members);
  }

  return updatedProfile;
}

export async function reassignStaff(userId, newStallId) {
  const oldProfile = await getProfileById(userId);
  if (oldProfile && oldProfile.stall_id) {
    // Clear old stall assigned admin
    await updateStall(oldProfile.stall_id, {
      assigned_admin_name: '',
      assigned_admin_email: ''
    });
  }

  return await approveStaffRequest(userId, newStallId);
}

export async function toggleStaffActive(userId, isActive) {
  const status = isActive ? 'ACTIVE' : 'DEACTIVATED';
  const updatedProfile = await updateProfile(userId, {
    account_status: status
  });

  try {
    await supabase.from('stall_members').update({
      approval_status: status
    }).eq('user_id', userId);
  } catch (err) {}

  const members = getLocal(STORAGE_KEYS.STALL_MEMBERS, []);
  const mIdx = members.findIndex(m => m.user_id === userId);
  if (mIdx !== -1) {
    members[mIdx] = { ...members[mIdx], approval_status: status };
    setLocal(STORAGE_KEYS.STALL_MEMBERS, members);
  }

  return updatedProfile;
}

export async function removeStaffAccess(userId) {
  const profile = await getProfileById(userId);
  if (profile && profile.stall_id) {
    await updateStall(profile.stall_id, {
      assigned_admin_name: '',
      assigned_admin_email: ''
    });
  }

  const updatedProfile = await updateProfile(userId, {
    account_status: 'DEACTIVATED',
    stall_id: null
  });

  try {
    await supabase.from('stall_members').delete().eq('user_id', userId);
  } catch (err) {}

  const members = getLocal(STORAGE_KEYS.STALL_MEMBERS, []);
  const filtered = members.filter(m => m.user_id !== userId);
  setLocal(STORAGE_KEYS.STALL_MEMBERS, filtered);

  return updatedProfile;
}

// ============================================================================
// STALL SERVICES
// ============================================================================

export async function getStalls({ includeInactive = false } = {}) {
  try {
    let query = supabase.from('stalls').select('*');
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('name');
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {}

  const allStalls = getLocal(STORAGE_KEYS.STALLS, SEED_STALLS);
  if (includeInactive) return allStalls;
  return allStalls.filter(s => s.is_active === true);
}

export async function getStallById(stallId) {
  if (!stallId) return null;
  try {
    const { data, error } = await supabase.from('stalls').select('*').eq('id', stallId).single();
    if (!error && data) return data;
  } catch (err) {}

  const allStalls = getLocal(STORAGE_KEYS.STALLS, SEED_STALLS);
  return allStalls.find(s => s.id === stallId) || null;
}

export async function createStall(stallData) {
  const newStall = {
    id: stallData.id || crypto.randomUUID(),
    name: stallData.name,
    description: stallData.description || '',
    location: stallData.location || 'Campus Food Court',
    contact: stallData.contact || '+91 90000 00000',
    image_url: stallData.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    is_open: stallData.is_open ?? true,
    is_active: true,
    assigned_admin_email: stallData.assigned_admin_email || '',
    assigned_admin_name: stallData.assigned_admin_name || '',
    created_at: new Date().toISOString()
  };

  try {
    await supabase.from('stalls').insert([newStall]);
  } catch (err) {}

  const stalls = getLocal(STORAGE_KEYS.STALLS, SEED_STALLS);
  stalls.push(newStall);
  setLocal(STORAGE_KEYS.STALLS, stalls);
  return newStall;
}

export async function updateStall(stallId, updateData) {
  try {
    await supabase.from('stalls').update(updateData).eq('id', stallId);
  } catch (err) {}

  const stalls = getLocal(STORAGE_KEYS.STALLS, SEED_STALLS);
  const idx = stalls.findIndex(s => s.id === stallId);
  if (idx !== -1) {
    stalls[idx] = { ...stalls[idx], ...updateData };
    setLocal(STORAGE_KEYS.STALLS, stalls);
    return stalls[idx];
  }
  return null;
}

export async function deactivateStall(stallId) {
  return await updateStall(stallId, { is_active: false, is_open: false });
}

export async function reactivateStall(stallId) {
  return await updateStall(stallId, { is_active: true, is_open: true });
}

export async function toggleStallOpen(stallId, isOpen) {
  return await updateStall(stallId, { is_open: isOpen });
}

// ============================================================================
// FOOD ITEM SERVICES
// ============================================================================

export async function getFoodItemsByStall(stallId, { includeUnavailable = true } = {}) {
  if (!stallId) return [];
  try {
    let query = supabase.from('food_items').select('*').eq('stall_id', stallId);
    if (!includeUnavailable) {
      query = query.eq('is_available', true);
    }
    const { data, error } = await query.order('name');
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {}

  const allFood = getLocal(STORAGE_KEYS.FOOD_ITEMS, SEED_FOOD_ITEMS);
  let stallFood = allFood.filter(f => f.stall_id === stallId);
  if (!includeUnavailable) {
    stallFood = stallFood.filter(f => f.is_available === true);
  }
  return stallFood;
}

export async function createFoodItem(foodData) {
  const newFood = {
    id: foodData.id || `food-${Date.now()}`,
    stall_id: foodData.stall_id,
    name: foodData.name,
    description: foodData.description || '',
    price: parseFloat(foodData.price) || 0,
    category: foodData.category || 'Other',
    image_url: foodData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    is_available: foodData.is_available ?? true,
    created_at: new Date().toISOString()
  };

  try {
    await supabase.from('food_items').insert([newFood]);
  } catch (err) {}

  const allFood = getLocal(STORAGE_KEYS.FOOD_ITEMS, SEED_FOOD_ITEMS);
  allFood.push(newFood);
  setLocal(STORAGE_KEYS.FOOD_ITEMS, allFood);
  return newFood;
}

export async function updateFoodItem(foodId, updateData) {
  try {
    await supabase.from('food_items').update(updateData).eq('id', foodId);
  } catch (err) {}

  const allFood = getLocal(STORAGE_KEYS.FOOD_ITEMS, SEED_FOOD_ITEMS);
  const idx = allFood.findIndex(f => f.id === foodId);
  if (idx !== -1) {
    allFood[idx] = { ...allFood[idx], ...updateData };
    setLocal(STORAGE_KEYS.FOOD_ITEMS, allFood);
    return allFood[idx];
  }
  return null;
}

export async function deleteFoodItem(foodId) {
  try {
    await supabase.from('food_items').delete().eq('id', foodId);
  } catch (err) {}

  const allFood = getLocal(STORAGE_KEYS.FOOD_ITEMS, SEED_FOOD_ITEMS);
  const filtered = allFood.filter(f => f.id !== foodId);
  setLocal(STORAGE_KEYS.FOOD_ITEMS, filtered);
  return true;
}

export async function toggleFoodAvailability(foodId, isAvailable) {
  return await updateFoodItem(foodId, { is_available: isAvailable });
}

// ============================================================================
// PICKUP SLOTS SERVICES (9:00 AM - 6:00 PM, 10-Minute Intervals, Capacity 10)
// ============================================================================

export async function getPickupSlots(stallId) {
  if (!stallId) return [];
  try {
    const { data, error } = await supabase.from('pickup_slots').select('*').eq('stall_id', stallId).order('start_time');
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {}

  const allSlotsMap = getLocal(STORAGE_KEYS.SLOTS, {});
  if (!allSlotsMap[stallId]) {
    allSlotsMap[stallId] = generateDefaultSlots(stallId);
    setLocal(STORAGE_KEYS.SLOTS, allSlotsMap);
  }
  return allSlotsMap[stallId];
}

export async function bookSlot(stallId, slotId) {
  const allSlotsMap = getLocal(STORAGE_KEYS.SLOTS, {});
  if (allSlotsMap[stallId]) {
    const slot = allSlotsMap[stallId].find(s => s.id === slotId || s.slot_label === slotId);
    if (slot && slot.booked_count < slot.capacity) {
      slot.booked_count += 1;
      setLocal(STORAGE_KEYS.SLOTS, allSlotsMap);
      return slot;
    }
  }
  return null;
}

// ============================================================================
// STALL PAYMENT QR SERVICES
// ============================================================================

export async function getStallQR(stallId) {
  if (!stallId) return null;
  try {
    const { data, error } = await supabase.from('stall_qr').select('*').eq('stall_id', stallId).single();
    if (!error && data) return data;
  } catch (err) {}

  const qrs = getLocal(STORAGE_KEYS.QRS, SEED_STALL_QRS);
  return qrs[stallId] || {
    stall_id: stallId,
    upi_id: `stall-${stallId.slice(0, 4)}@campusbite`,
    qr_image_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=stall-${stallId.slice(0, 4)}@campusbite`
  };
}

export async function updateStallQR(stallId, qrData) {
  const updated = {
    stall_id: stallId,
    upi_id: qrData.upi_id,
    qr_image_url: qrData.qr_image_url
  };

  try {
    await supabase.from('stall_qr').upsert(updated, { onConflict: 'stall_id' });
  } catch (err) {}

  const qrs = getLocal(STORAGE_KEYS.QRS, SEED_STALL_QRS);
  qrs[stallId] = updated;
  setLocal(STORAGE_KEYS.QRS, qrs);
  return updated;
}

export async function deleteStallQR(stallId) {
  try {
    await supabase.from('stall_qr').delete().eq('stall_id', stallId);
  } catch (err) {}

  const qrs = getLocal(STORAGE_KEYS.QRS, SEED_STALL_QRS);
  delete qrs[stallId];
  setLocal(STORAGE_KEYS.QRS, qrs);
  return true;
}

// ============================================================================
// ORDER SERVICES & STRICT STALL DATA ISOLATION (REQUIREMENT 1, 2, 3, 9)
// ============================================================================

const VALID_NEXT_STATUSES = {
  'Order Placed': ['Confirmed', 'Rejected/Cancelled'],
  'Confirmed': ['Preparing'],
  'Preparing': ['Ready for Pickup'],
  'Ready for Pickup': ['Collected'],
  'Collected': [],
  'Rejected/Cancelled': []
};

export async function createOrder(orderPayload) {
  if (!orderPayload.stallId) {
    throw new Error('A valid stall must be selected for the order');
  }

  const shortNum = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `CB-${shortNum}`;

  const newOrder = {
    id: crypto.randomUUID(),
    order_number: orderNumber,
    order_id: orderNumber, // compatible with UI
    user_id: orderPayload.userId,
    customer_name: orderPayload.customerName || 'Campus Student',
    customer_email: orderPayload.customerEmail || '',
    stall_id: orderPayload.stallId, // CRITICAL: ORDER.stall_id = SELECTED_STALL.id
    stall_name: orderPayload.stallName || 'Food Stall',
    pickup_slot_id: orderPayload.pickupSlotId || null,
    pickup_time: orderPayload.pickupTime || 'Immediate',
    total_amount: Number(orderPayload.totalAmount.toFixed(2)),
    payment_method: orderPayload.paymentMethod, // 'cash' or 'online'
    payment_status: orderPayload.paymentMethod === 'cash' ? 'Cash on Pickup' : 'Completed (Simulated)',
    order_status: 'Order Placed',
    rejection_reason: null,
    items: (orderPayload.items || []).map(item => ({
      id: item.food.id,
      food_name: item.food.name,
      quantity: item.quantity,
      price: item.food.price
    })),
    confirmed_at: null,
    preparing_at: null,
    ready_at: null,
    collected_at: null,
    created_at: new Date().toISOString()
  };

  try {
    await supabase.from('orders').insert([{
      id: newOrder.id,
      order_number: newOrder.order_number,
      user_id: newOrder.user_id,
      stall_id: newOrder.stall_id,
      pickup_slot_id: newOrder.pickup_slot_id,
      pickup_time: newOrder.pickup_time,
      total_amount: newOrder.total_amount,
      payment_method: newOrder.payment_method,
      payment_status: newOrder.payment_status,
      order_status: newOrder.order_status,
      created_at: newOrder.created_at
    }]);
  } catch (err) {}

  const orders = getLocal(STORAGE_KEYS.ORDERS, []);
  orders.unshift(newOrder);
  setLocal(STORAGE_KEYS.ORDERS, orders);

  if (orderPayload.stallId && orderPayload.pickupSlotId) {
    await bookSlot(orderPayload.stallId, orderPayload.pickupSlotId);
  }

  return newOrder;
}

export async function getOrderById(orderId) {
  const orders = getLocal(STORAGE_KEYS.ORDERS, []);
  return orders.find(o => o.id === orderId || o.order_number === orderId || o.order_id === orderId) || null;
}

// Student / Faculty: View ONLY their own orders
export async function getUserOrders(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (err) {}

  const orders = getLocal(STORAGE_KEYS.ORDERS, []);
  return orders.filter(o => o.user_id === userId);
}

// Staff Member / Stall Admin: STRICT STALL DATA ISOLATION (Only assigned stall)
export async function getStallOrders(stallId) {
  if (!stallId) return [];
  try {
    const { data, error } = await supabase.from('orders').select('*').eq('stall_id', stallId).order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (err) {}

  const orders = getLocal(STORAGE_KEYS.ORDERS, []);
  return orders.filter(o => o.stall_id === stallId);
}

// Super Admin: View all orders across all stalls
export async function getAllOrders() {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (err) {}

  return getLocal(STORAGE_KEYS.ORDERS, []);
}

// Order Status Workflow Engine
export async function updateOrderStatus(orderId, newStatus, rejectionReason = '') {
  const orders = getLocal(STORAGE_KEYS.ORDERS, []);
  const idx = orders.findIndex(o => o.id === orderId || o.order_number === orderId || o.order_id === orderId);
  if (idx === -1) {
    throw new Error('Order not found');
  }

  const currentOrder = orders[idx];
  const allowed = VALID_NEXT_STATUSES[currentOrder.order_status] || [];

  if (!allowed.includes(newStatus)) {
    throw new Error(`Invalid status transition from "${currentOrder.order_status}" to "${newStatus}"`);
  }

  const now = new Date().toISOString();
  const updates = {
    order_status: newStatus,
    updated_at: now
  };

  if (newStatus === 'Confirmed') {
    updates.confirmed_at = now;
  } else if (newStatus === 'Preparing') {
    updates.preparing_at = now;
  } else if (newStatus === 'Ready for Pickup') {
    updates.ready_at = now;
  } else if (newStatus === 'Collected') {
    updates.collected_at = now;
  } else if (newStatus === 'Rejected/Cancelled') {
    updates.rejection_reason = rejectionReason || 'Order could not be fulfilled at this time';
  }

  orders[idx] = { ...currentOrder, ...updates };
  setLocal(STORAGE_KEYS.ORDERS, orders);

  try {
    await supabase.from('orders').update(updates).eq('id', currentOrder.id);
  } catch (err) {}

  return orders[idx];
}
