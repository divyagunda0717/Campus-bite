import { supabase } from './supabase';
import { SEED_STALLS, SEED_FOOD_ITEMS, SEED_STALL_QRS, generateDefaultSlots } from './initialData';

// Local storage keys for persistent client storage & offline fallback
const STORAGE_KEYS = {
  STALLS: 'campusbite_stalls_v1',
  FOOD_ITEMS: 'campusbite_food_items_v1',
  ORDERS: 'campusbite_orders_v1',
  SLOTS: 'campusbite_slots_v1',
  QRS: 'campusbite_qrs_v1'
};

// Initialize local cache if empty
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
    // Dispatch event to notify other components/tabs
    window.dispatchEvent(new CustomEvent('campusbite_data_updated', { detail: { key } }));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

// Ensure seed data is initialized in local state
export function initLocalData() {
  getLocal(STORAGE_KEYS.STALLS, SEED_STALLS);
  getLocal(STORAGE_KEYS.FOOD_ITEMS, SEED_FOOD_ITEMS);
  getLocal(STORAGE_KEYS.ORDERS, []);
  getLocal(STORAGE_KEYS.QRS, SEED_STALL_QRS);
}

initLocalData();

// ============================================================================
// STALL SERVICES
// ============================================================================

export async function getStalls({ includeInactive = false } = {}) {
  // Try Supabase first
  try {
    let query = supabase.from('stalls').select('*');
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('name');
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    // fallback
  }

  // Fallback to local storage
  const allStalls = getLocal(STORAGE_KEYS.STALLS, SEED_STALLS);
  if (includeInactive) {
    return allStalls;
  }
  return allStalls.filter(s => s.is_active === true);
}

export async function getStallById(stallId) {
  try {
    const { data, error } = await supabase.from('stalls').select('*').eq('id', stallId).single();
    if (!error && data) return data;
  } catch (err) {
    // fallback
  }
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

// Requirement 4: Soft-delete / Deactivate Stall
export async function deactivateStall(stallId) {
  return await updateStall(stallId, { is_active: false, is_open: false });
}

// Requirement 4: Reactivate Stall
export async function reactivateStall(stallId) {
  return await updateStall(stallId, { is_active: true, is_open: true });
}

// Requirement 24: Stall Open/Closed toggle by Canteen Member
export async function toggleStallOpen(stallId, isOpen) {
  return await updateStall(stallId, { is_open: isOpen });
}

export async function assignStallAdmin(stallId, adminEmail, adminName) {
  return await updateStall(stallId, {
    assigned_admin_email: adminEmail,
    assigned_admin_name: adminName
  });
}

// ============================================================================
// FOOD ITEM SERVICES
// ============================================================================

export async function getFoodItemsByStall(stallId, { includeUnavailable = true } = {}) {
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
  try {
    const { data, error } = await supabase.from('stall_qr').select('*').eq('stall_id', stallId).single();
    if (!error && data) return data;
  } catch (err) {}

  const qrs = getLocal(STORAGE_KEYS.QRS, SEED_STALL_QRS);
  return qrs[stallId] || {
    stall_id: stallId,
    upi_id: 'campusbite@upi',
    qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=campusbite@upi'
  };
}

export async function updateStallQR(stallId, qrData) {
  const updated = {
    stall_id: stallId,
    upi_id: qrData.upi_id,
    qr_image_url: qrData.qr_image_url
  };

  try {
    await supabase.from('stall_qr').upsert(updated);
  } catch (err) {}

  const qrs = getLocal(STORAGE_KEYS.QRS, SEED_STALL_QRS);
  qrs[stallId] = updated;
  setLocal(STORAGE_KEYS.QRS, qrs);
  return updated;
}

// ============================================================================
// ORDER MANAGEMENT & WORKFLOW SERVICES
// ============================================================================

// Status workflow valid transitions:
// Order Placed -> Confirmed -> Preparing -> Ready for Pickup -> Collected
// Order Placed -> Rejected/Cancelled
const VALID_NEXT_STATUSES = {
  'Order Placed': ['Confirmed', 'Rejected/Cancelled'],
  'Confirmed': ['Preparing'],
  'Preparing': ['Ready for Pickup'],
  'Ready for Pickup': ['Collected'],
  'Collected': [],
  'Rejected/Cancelled': []
};

export async function createOrder(orderPayload) {
  const shortNum = Math.floor(1000 + Math.random() * 9000);
  const orderId = `CB-${shortNum}`;

  const newOrder = {
    id: crypto.randomUUID(),
    order_id: orderId,
    user_id: orderPayload.userId,
    customer_name: orderPayload.customerName || 'Campus Student',
    customer_email: orderPayload.customerEmail || '',
    stall_id: orderPayload.stallId,
    stall_name: orderPayload.stallName,
    pickup_slot_id: orderPayload.pickupSlotId,
    pickup_time: orderPayload.pickupTime,
    total_amount: Number(orderPayload.totalAmount.toFixed(2)),
    payment_method: orderPayload.paymentMethod, // 'cash' or 'online'
    payment_status: orderPayload.paymentMethod === 'cash' ? 'Cash on Pickup' : 'Completed (Simulated)',
    order_status: 'Order Placed', // Initial status
    rejection_reason: null,
    items: orderPayload.items.map(item => ({
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

  // Try Supabase insert
  try {
    await supabase.from('orders').insert([newOrder]);
  } catch (err) {}

  // Save to persistent orders store
  const orders = getLocal(STORAGE_KEYS.ORDERS, []);
  orders.unshift(newOrder); // newest first
  setLocal(STORAGE_KEYS.ORDERS, orders);

  // Increment slot booking
  if (orderPayload.stallId && orderPayload.pickupSlotId) {
    await bookSlot(orderPayload.stallId, orderPayload.pickupSlotId);
  }

  return newOrder;
}

export async function getOrderById(orderId) {
  const orders = getLocal(STORAGE_KEYS.ORDERS, []);
  return orders.find(o => o.id === orderId || o.order_id === orderId) || null;
}

// Student / Faculty: View own orders
export async function getUserOrders(userId) {
  try {
    const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (err) {}

  const orders = getLocal(STORAGE_KEYS.ORDERS, []);
  return orders.filter(o => o.user_id === userId);
}

// Canteen Member: STRICT STALL DATA ISOLATION (Only assigned stall)
export async function getStallOrders(stallId) {
  try {
    const { data, error } = await supabase.from('orders').select('*').eq('stall_id', stallId).order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (err) {}

  const orders = getLocal(STORAGE_KEYS.ORDERS, []);
  return orders.filter(o => o.stall_id === stallId);
}

// Super Admin: View all campus orders
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
  const idx = orders.findIndex(o => o.id === orderId || o.order_id === orderId);
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
