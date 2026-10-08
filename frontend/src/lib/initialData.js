// CampusBite Seed Data for dynamic food stalls, food items, and pickup slots

export const SEED_STALLS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Main Canteen',
    description: 'Full campus meals, South & North Indian lunch combos, biryanis, and executive thalis.',
    location: 'Ground Floor, Block A Main Atrium',
    contact: '+91 98765 43210',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    is_open: true,
    is_active: true,
    assigned_admin_email: '',
    assigned_admin_name: '',
    created_at: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Tiffin Stall',
    description: 'Fresh hot idlis, crispy dosas, medu vadas, sambar, and authentic coconut chutneys.',
    location: 'Ground Floor, Food Court Stall 1',
    contact: '+91 98765 43211',
    image_url: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80',
    is_open: true,
    is_active: true,
    assigned_admin_email: '',
    assigned_admin_name: '',
    created_at: new Date().toISOString()
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Fast Food Stall',
    description: 'Crispy burgers, loaded fries, cheesy pizzas, hakka noodles, and wok-tossed fried rice.',
    location: 'First Floor, Food Court Stall 2',
    contact: '+91 98765 43212',
    image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80',
    is_open: true,
    is_active: true,
    assigned_admin_email: '',
    assigned_admin_name: '',
    created_at: new Date().toISOString()
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Snacks Stall',
    description: 'Crispy punjabi samosas, bread pakodas, veg puffs, grilled sandwiches & cutting masala chai.',
    location: 'Ground Floor, Near Library Lawn',
    contact: '+91 98765 43213',
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    is_open: true,
    is_active: true,
    assigned_admin_email: '',
    assigned_admin_name: '',
    created_at: new Date().toISOString()
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Juice Stall',
    description: 'Pure cold-pressed juices, tropical smoothies, thick milkshakes, and chilled iced brew.',
    location: 'Ground Floor, Sports Complex Annex',
    contact: '+91 98765 43214',
    image_url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=800&q=80',
    is_open: true,
    is_active: true,
    assigned_admin_email: '',
    assigned_admin_name: '',
    created_at: new Date().toISOString()
  }
];

export const SEED_FOOD_ITEMS = [
  // Tiffin Stall
  {
    id: 'food-tiffin-1',
    stall_id: '22222222-2222-2222-2222-222222222222',
    name: 'Masala Dosa',
    description: 'Crispy golden crepe filled with spiced potato masala, served with 2 chutneys & hot sambar',
    price: 60.00,
    category: 'Tiffins',
    image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-tiffin-2',
    stall_id: '22222222-2222-2222-2222-222222222222',
    name: 'Steamed Idli (2 Pcs)',
    description: 'Soft and fluffy steamed rice cakes with pure ghee, piping hot sambar & fresh coconut chutney',
    price: 40.00,
    category: 'Tiffins',
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-tiffin-3',
    stall_id: '22222222-2222-2222-2222-222222222222',
    name: 'Medu Vada (2 Pcs)',
    description: 'Crispy exterior, soft interior lentil fritters seasoned with peppercorns, curry leaves & ginger',
    price: 45.00,
    category: 'Tiffins',
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-tiffin-4',
    stall_id: '22222222-2222-2222-2222-222222222222',
    name: 'Poori Masala (3 Pcs)',
    description: 'Fluffy golden fried wheat breads served with fragrant spiced potato sagu',
    price: 55.00,
    category: 'Tiffins',
    image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },

  // Fast Food Stall
  {
    id: 'food-ff-1',
    stall_id: '33333333-3333-3333-3333-333333333333',
    name: 'Classic Veg Burger',
    description: 'Herb spiced vegetable patty, fresh lettuce, sliced tomatoes, creamy garlic mayo & brioche bun',
    price: 75.00,
    category: 'Fast Food',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-ff-2',
    stall_id: '33333333-3333-3333-3333-333333333333',
    name: 'Schezwan Veg Fried Rice',
    description: 'Wok-tossed basmati rice with crunchy carrots, cabbage, capsicum in fiery schezwan sauce',
    price: 90.00,
    category: 'Fast Food',
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-ff-3',
    stall_id: '33333333-3333-3333-3333-333333333333',
    name: 'Hakka Noodles',
    description: 'Stir-fried noodles tossed with scallions, bell peppers, soy sauce and roasted sesame',
    price: 85.00,
    category: 'Fast Food',
    image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-ff-4',
    stall_id: '33333333-3333-3333-3333-333333333333',
    name: 'Margherita Pizza (7-inch)',
    description: 'Stone-baked thin crust, san marzano tomato sauce, fresh mozzarella & aromatic basil',
    price: 140.00,
    category: 'Fast Food',
    image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },

  // Snacks Stall
  {
    id: 'food-snack-1',
    stall_id: '44444444-4444-4444-4444-444444444444',
    name: 'Punjabi Samosa (2 Pcs)',
    description: 'Flaky pastry filled with spiced potatoes, green peas, served with mint & sweet tamarind chutney',
    price: 30.00,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-snack-2',
    stall_id: '44444444-4444-4444-4444-444444444444',
    name: 'Grilled Cheese Sandwich',
    description: 'Double-decker bread toasted golden brown with melted cheddar, spiced veggies and mint spread',
    price: 60.00,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-snack-3',
    stall_id: '44444444-4444-4444-4444-444444444444',
    name: 'Mirchi Bonda (2 Pcs)',
    description: 'Stuffed spicy green peppers batter-fried crisp, served with freshly pounded onion chutney',
    price: 35.00,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-snack-4',
    stall_id: '44444444-4444-4444-4444-444444444444',
    name: 'Cutting Masala Chai',
    description: 'Rich, aromatic brewed milk tea infused with crushed cardamom, ginger, and cloves',
    price: 20.00,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },

  // Juice Stall
  {
    id: 'food-juice-1',
    stall_id: '55555555-5555-5555-5555-555555555555',
    name: 'Fresh Orange Juice',
    description: 'Cold-pressed 100% natural Valencia oranges without added sugar or preservatives',
    price: 50.00,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-juice-2',
    stall_id: '55555555-5555-5555-5555-555555555555',
    name: 'Mango Smoothie',
    description: 'Creamy Alphonso mango pulp blended with Greek yogurt and a gentle dash of organic honey',
    price: 65.00,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-juice-3',
    stall_id: '55555555-5555-5555-5555-555555555555',
    name: 'Iced Cold Coffee',
    description: 'Rich espresso blended chilled with whole milk, scoop of vanilla cream and dark cocoa dusting',
    price: 60.00,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },

  // Main Canteen
  {
    id: 'food-canteen-1',
    stall_id: '11111111-1111-1111-1111-111111111111',
    name: 'South Indian Special Thali',
    description: 'Steamed rice, 2 rotis, piping hot sambar, pepper rasam, veg kootu, poriyal, curd, papad & gulab jamun',
    price: 110.00,
    category: 'Lunch',
    image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-canteen-2',
    stall_id: '11111111-1111-1111-1111-111111111111',
    name: 'Dum Veg Biryani',
    description: 'Fragrant long-grain basmati cooked with mixed garden vegetables, saffron & spices with onion raita',
    price: 100.00,
    category: 'Lunch',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'food-canteen-3',
    stall_id: '11111111-1111-1111-1111-111111111111',
    name: 'Curd Rice with Pomegranate',
    description: 'Creamy tempered curd rice with mustard seeds, curry leaves, ginger, and fresh juicy pomegranate',
    price: 50.00,
    category: 'Lunch',
    image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    is_available: true,
    created_at: new Date().toISOString()
  }
];

export const SEED_STALL_QRS = {
  '11111111-1111-1111-1111-111111111111': {
    stall_id: '11111111-1111-1111-1111-111111111111',
    upi_id: 'maincanteen@campusbite',
    qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=maincanteen@campusbite%26pn=CampusBite%20Main%20Canteen%26am=0'
  },
  '22222222-2222-2222-2222-222222222222': {
    stall_id: '22222222-2222-2222-2222-222222222222',
    upi_id: 'tiffinstall@campusbite',
    qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=tiffinstall@campusbite%26pn=CampusBite%20Tiffin%20Stall%26am=0'
  },
  '33333333-3333-3333-3333-333333333333': {
    stall_id: '33333333-3333-3333-3333-333333333333',
    upi_id: 'fastfood@campusbite',
    qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=fastfood@campusbite%26pn=CampusBite%20Fast%20Food%26am=0'
  },
  '44444444-4444-4444-4444-444444444444': {
    stall_id: '44444444-4444-4444-4444-444444444444',
    upi_id: 'snacks@campusbite',
    qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=snacks@campusbite%26pn=CampusBite%20Snacks%20Stall%26am=0'
  },
  '55555555-5555-5555-5555-555555555555': {
    stall_id: '55555555-5555-5555-5555-555555555555',
    upi_id: 'juice@campusbite',
    qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=juice@campusbite%26pn=CampusBite%20Juice%20Bar%26am=0'
  }
};

// Generate 10-minute slots between 9:00 AM and 6:00 PM (18:00)
export function generateDefaultSlots(stallId) {
  const slots = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let minIdx = 0; minIdx < 6; minIdx++) {
      const startMin = minIdx * 10;
      const endMin = (minIdx + 1) * 10;
      
      const startHourStr = String(hour).padStart(2, '0');
      const startMinStr = String(startMin).padStart(2, '0');
      
      let endHourStr = String(hour).padStart(2, '0');
      let endMinStr = String(endMin).padStart(2, '0');
      if (endMin === 60) {
        endHourStr = String(hour + 1).padStart(2, '0');
        endMinStr = '00';
      }

      // Convert to 12-hour format for user friendly display
      const format12 = (h, m) => {
        const hr = parseInt(h, 10);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        const displayHr = hr % 12 === 0 ? 12 : hr % 12;
        return `${displayHr}:${m} ${ampm}`;
      };

      const label = `${format12(startHourStr, startMinStr)} - ${format12(endHourStr, endMinStr)}`;

      slots.push({
        id: `slot-${stallId}-${startHourStr}${startMinStr}`,
        stall_id: stallId,
        start_time: `${startHourStr}:${startMinStr}`,
        end_time: `${endHourStr}:${endMinStr}`,
        slot_label: label,
        capacity: 10,
        booked_count: 0
      });
    }
  }
  return slots;
}
