-- ============================================================================
-- CAMPUSBITE — SMART CAMPUS CANTEEN
-- Migration 001: Initial Schema, RLS Policies, Triggers & Seed Data
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up existing tables if resetting (in proper dependency order)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.pickup_slots CASCADE;
DROP TABLE IF EXISTS public.stall_qr CASCADE;
DROP TABLE IF EXISTS public.food_items CASCADE;
DROP TABLE IF EXISTS public.stall_admins CASCADE;
DROP TABLE IF EXISTS public.stalls CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ----------------------------------------------------------------------------
-- 1. PROFILES (Extends Supabase auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'stall_admin', 'super_admin')),
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. STALLS (Dynamic Food Stalls)
-- ----------------------------------------------------------------------------
CREATE TABLE public.stalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    contact TEXT,
    image_url TEXT,
    is_open BOOLEAN DEFAULT true NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL, -- Soft-delete: false when deactivated
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. STALL_ADMINS (Assigns Canteen Member to exactly ONE Stall)
-- ----------------------------------------------------------------------------
CREATE TABLE public.stall_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    stall_id UUID NOT NULL REFERENCES public.stalls(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. FOOD_ITEMS (Dynamic Food Items for each Stall)
-- ----------------------------------------------------------------------------
CREATE TABLE public.food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stall_id UUID NOT NULL REFERENCES public.stalls(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL CHECK (category IN ('Tiffins', 'Lunch', 'Snacks', 'Beverages', 'Fast Food', 'Desserts', 'Other')),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 5. PICKUP_SLOTS (9:00 AM to 6:00 PM, 10-Minute Intervals, Capacity 10)
-- ----------------------------------------------------------------------------
CREATE TABLE public.pickup_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stall_id UUID NOT NULL REFERENCES public.stalls(id) ON DELETE CASCADE,
    slot_date DATE DEFAULT CURRENT_DATE NOT NULL,
    start_time TEXT NOT NULL, -- e.g. "09:00"
    end_time TEXT NOT NULL,   -- e.g. "09:10"
    slot_label TEXT NOT NULL, -- e.g. "09:00 AM - 09:10 AM"
    capacity INT DEFAULT 10 NOT NULL CHECK (capacity >= 0),
    booked_count INT DEFAULT 0 NOT NULL CHECK (booked_count >= 0),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(stall_id, slot_date, start_time)
);

-- ----------------------------------------------------------------------------
-- 6. STALL_QR (Dedicated Payment QR for each Stall)
-- ----------------------------------------------------------------------------
CREATE TABLE public.stall_qr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stall_id UUID NOT NULL REFERENCES public.stalls(id) ON DELETE CASCADE UNIQUE,
    qr_image_url TEXT NOT NULL,
    upi_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 7. ORDERS (Order Lifecycle & Tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL UNIQUE, -- Human-friendly ID, e.g. "CB-1042"
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    stall_id UUID NOT NULL REFERENCES public.stalls(id),
    pickup_slot_id UUID REFERENCES public.pickup_slots(id),
    pickup_time TEXT NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'online')),
    payment_status TEXT NOT NULL DEFAULT 'Cash on Pickup', -- 'Cash on Pickup' or 'Completed'
    order_status TEXT NOT NULL DEFAULT 'Order Placed' CHECK (
        order_status IN ('Order Placed', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Collected', 'Rejected/Cancelled')
    ),
    rejection_reason TEXT,
    confirmed_at TIMESTAMPTZ,
    preparing_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 8. ORDER_ITEMS (Items within an Order)
-- ----------------------------------------------------------------------------
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES public.food_items(id) ON DELETE SET NULL,
    food_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_stalls_active ON public.stalls(is_active, is_open);
CREATE INDEX IF NOT EXISTS idx_food_items_stall ON public.food_items(stall_id, is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stall ON public.orders(stall_id, order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_pickup_slots_stall ON public.pickup_slots(stall_id, slot_date);

-- ============================================================================
-- HELPER FUNCTIONS FOR SECURITY & ISOLATION
-- ============================================================================

-- Get the role of the requesting user
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = p_user_id;
$$;

-- Get the assigned stall_id of the requesting canteen member
CREATE OR REPLACE FUNCTION public.get_admin_stall_id(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT stall_id FROM public.stall_admins WHERE user_id = p_user_id;
$$;

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_update_stalls_updated_at BEFORE UPDATE ON public.stalls FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_update_food_items_updated_at BEFORE UPDATE ON public.food_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trigger_update_stall_qr_updated_at BEFORE UPDATE ON public.stall_qr FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Automatically sync Supabase Auth users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = COALESCE(EXCLUDED.role, profiles.role);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stall_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stall_qr ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Super Admins can read all profiles"
    ON public.profiles FOR SELECT
    USING (public.get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Stall Admins can view customer profiles for orders"
    ON public.profiles FOR SELECT
    USING (
        public.get_user_role(auth.uid()) = 'stall_admin'
        OR auth.uid() = id
    );

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Super Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Allow public insert of profile during registration"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- STALLS POLICIES
-- ----------------------------------------------------------------------------
-- Active stalls are visible to everyone (students, faculty, public)
CREATE POLICY "Anyone can view active stalls"
    ON public.stalls FOR SELECT
    USING (is_active = true OR public.get_user_role(auth.uid()) = 'super_admin' OR id = public.get_admin_stall_id(auth.uid()));

-- Super Admin can create, update, deactivate, reactivate stalls
CREATE POLICY "Super Admin full control over stalls"
    ON public.stalls FOR ALL
    USING (public.get_user_role(auth.uid()) = 'super_admin')
    WITH CHECK (public.get_user_role(auth.uid()) = 'super_admin');

-- Stall Admin can update open/close status of their assigned stall
CREATE POLICY "Stall Admin can update their stall open/close"
    ON public.stalls FOR UPDATE
    USING (id = public.get_admin_stall_id(auth.uid()))
    WITH CHECK (id = public.get_admin_stall_id(auth.uid()));

-- ----------------------------------------------------------------------------
-- STALL_ADMINS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Super Admin can manage stall admins"
    ON public.stall_admins FOR ALL
    USING (public.get_user_role(auth.uid()) = 'super_admin')
    WITH CHECK (public.get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Stall Admin can view own assignment"
    ON public.stall_admins FOR SELECT
    USING (user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'super_admin');

-- ----------------------------------------------------------------------------
-- FOOD_ITEMS POLICIES (STRICT DATA ISOLATION)
-- ----------------------------------------------------------------------------
-- Everyone can view available food items belonging to active stalls
CREATE POLICY "Anyone can view active food items"
    ON public.food_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.stalls s
            WHERE s.id = food_items.stall_id AND s.is_active = true
        )
        OR public.get_user_role(auth.uid()) = 'super_admin'
        OR stall_id = public.get_admin_stall_id(auth.uid())
    );

-- Stall Admin can insert food items ONLY for their assigned stall
CREATE POLICY "Stall Admin can insert food items for assigned stall"
    ON public.food_items FOR INSERT
    WITH CHECK (
        stall_id = public.get_admin_stall_id(auth.uid())
        OR public.get_user_role(auth.uid()) = 'super_admin'
    );

-- Stall Admin can update food items ONLY for their assigned stall
CREATE POLICY "Stall Admin can update food items for assigned stall"
    ON public.food_items FOR UPDATE
    USING (
        stall_id = public.get_admin_stall_id(auth.uid())
        OR public.get_user_role(auth.uid()) = 'super_admin'
    )
    WITH CHECK (
        stall_id = public.get_admin_stall_id(auth.uid())
        OR public.get_user_role(auth.uid()) = 'super_admin'
    );

-- Stall Admin can delete food items ONLY for their assigned stall
CREATE POLICY "Stall Admin can delete food items for assigned stall"
    ON public.food_items FOR DELETE
    USING (
        stall_id = public.get_admin_stall_id(auth.uid())
        OR public.get_user_role(auth.uid()) = 'super_admin'
    );

-- ----------------------------------------------------------------------------
-- PICKUP_SLOTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view pickup slots"
    ON public.pickup_slots FOR SELECT
    USING (true);

CREATE POLICY "Stall Admin can manage their pickup slots"
    ON public.pickup_slots FOR ALL
    USING (
        stall_id = public.get_admin_stall_id(auth.uid())
        OR public.get_user_role(auth.uid()) = 'super_admin'
    )
    WITH CHECK (
        stall_id = public.get_admin_stall_id(auth.uid())
        OR public.get_user_role(auth.uid()) = 'super_admin'
    );

-- Allow students to increment booked_count during order placement
CREATE POLICY "Users can increment slot booked count on order"
    ON public.pickup_slots FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- STALL_QR POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view stall QR"
    ON public.stall_qr FOR SELECT
    USING (true);

CREATE POLICY "Stall Admin can manage QR for their stall"
    ON public.stall_qr FOR ALL
    USING (
        stall_id = public.get_admin_stall_id(auth.uid())
        OR public.get_user_role(auth.uid()) = 'super_admin'
    )
    WITH CHECK (
        stall_id = public.get_admin_stall_id(auth.uid())
        OR public.get_user_role(auth.uid()) = 'super_admin'
    );

-- ----------------------------------------------------------------------------
-- ORDERS POLICIES (STRICT DATA ISOLATION)
-- ----------------------------------------------------------------------------
-- Student/Faculty can view only their own orders
-- Stall Admin can view ONLY orders for their assigned stall
-- Super Admin can view all orders
CREATE POLICY "Users view own orders or Stall Admin views assigned stall orders"
    ON public.orders FOR SELECT
    USING (
        user_id = auth.uid()
        OR stall_id = public.get_admin_stall_id(auth.uid())
        OR public.get_user_role(auth.uid()) = 'super_admin'
    );

-- Students/Faculty can create orders for themselves
CREATE POLICY "Users can place orders"
    ON public.orders FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR public.get_user_role(auth.uid()) = 'super_admin'
    );

-- Stall Admin can update order status ONLY for their assigned stall
-- Super Admin can update any order
CREATE POLICY "Stall Admin can update assigned stall orders"
    ON public.orders FOR UPDATE
    USING (
        stall_id = public.get_admin_stall_id(auth.uid())
        OR public.get_user_role(auth.uid()) = 'super_admin'
    )
    WITH CHECK (
        stall_id = public.get_admin_stall_id(auth.uid())
        OR public.get_user_role(auth.uid()) = 'super_admin'
    );

-- ----------------------------------------------------------------------------
-- ORDER_ITEMS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users view own order items or Stall Admin views assigned stall items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (
                o.user_id = auth.uid()
                OR o.stall_id = public.get_admin_stall_id(auth.uid())
                OR public.get_user_role(auth.uid()) = 'super_admin'
            )
        )
    );

CREATE POLICY "Users can insert order items for their own orders"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (o.user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'super_admin')
        )
    );

-- ============================================================================
-- SEED DATA (INITIAL DEMO DATA)
-- ============================================================================

-- Insert Initial Dynamic Stalls
INSERT INTO public.stalls (id, name, description, location, contact, image_url, is_open, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Main Canteen', 'Full meals, South & North Indian lunch combos, biryanis, and thalis', 'Ground Floor, Block A', '+91 98765 43210', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', true, true),
    ('22222222-2222-2222-2222-222222222222', 'Tiffin Stall', 'Fresh hot idlis, crispy dosas, vadas, sambar, and authentic chutneys', 'Ground Floor, Food Court Stall 1', '+91 98765 43211', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80', true, true),
    ('33333333-3333-3333-3333-333333333333', 'Fast Food Stall', 'Burgers, loaded cheese fries, pizzas, noodles, and fried rice', 'First Floor, Food Court Stall 2', '+91 98765 43212', 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80', true, true),
    ('44444444-4444-4444-4444-444444444444', 'Snacks Stall', 'Crispy samosas, bread pakodas, puff pastries, tea & snacks', 'Ground Floor, Near Library Lawn', '+91 98765 43213', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', true, true),
    ('55555555-5555-5555-5555-555555555555', 'Juice Stall', 'Fresh pressed fruit juices, milkshakes, smoothies, and cold coffee', 'Ground Floor, Sports Complex Annex', '+91 98765 43214', 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=800&q=80', true, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    image_url = EXCLUDED.image_url;

-- Insert Initial Food Items
INSERT INTO public.food_items (id, stall_id, name, description, price, category, image_url, is_available)
VALUES
    -- Tiffin Stall items
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Masala Dosa', 'Crispy golden crepe filled with spiced potato masala, served with 2 chutneys & hot sambar', 60.00, 'Tiffins', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Steamed Idli (2 Pcs)', 'Soft and fluffy steamed rice cakes with pure ghee, piping hot sambar & fresh coconut chutney', 40.00, 'Tiffins', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Medu Vada (2 Pcs)', 'Crispy exterior, soft interior lentil fritters seasoned with peppercorns & ginger', 45.00, 'Tiffins', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Poori Masala (3 Pcs)', 'Fluffy deep-fried wheat breads served with fragrant spiced potato kurma', 55.00, 'Tiffins', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', true),

    -- Fast Food Stall items
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Classic Veg Burger', 'Herb spiced vegetable patty, fresh lettuce, sliced tomatoes, creamy garlic mayo', 75.00, 'Fast Food', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Schezwan Veg Fried Rice', 'Wok-tossed basmati rice with crunchy carrots, cabbage, capsicum in fiery schezwan sauce', 90.00, 'Fast Food', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Hakka Noodles', 'Stir-fried noodles tossed with scallions, bell peppers, soy sauce and sesame', 85.00, 'Fast Food', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Margherita Pizza (7-inch)', 'Stone-baked thin crust, san marzano tomato sauce, fresh mozzarella & basil herbs', 140.00, 'Fast Food', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80', true),

    -- Snacks Stall items
    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Punjabi Samosa (2 Pcs)', 'Flaky pastry filled with spiced potatoes, green peas, served with mint & sweet tamarind chutney', 30.00, 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Grilled Cheese Sandwich', 'Double-decker bread toasted golden brown with melted cheddar, spiced veggies and green chutney', 60.00, 'Snacks', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Mirchi Bonda (2 Pcs)', 'Stuffed green peppers batter-fried crisp, served with roasted onion chutney', 35.00, 'Snacks', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Cutting Masala Chai', 'Rich, aromatic brewed milk tea infused with cardamom, ginger, and cloves', 20.00, 'Beverages', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', true),

    -- Juice Stall items
    (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Fresh Orange Juice', 'Cold-pressed 100% natural Valencia oranges without added sugar', 50.00, 'Beverages', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Mango Smoothie', 'Creamy Alphonso mango pulp blended with Greek yogurt and a dash of honey', 65.00, 'Beverages', 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Iced Cold Coffee', 'Rich espresso blended chilled with whole milk, vanilla cream and cocoa drizzle', 60.00, 'Beverages', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Chilled Watermelon Cooler', 'Refreshing crushed seedless watermelon with fresh mint sprigs and black salt', 40.00, 'Beverages', 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80', true),

    -- Main Canteen items
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'South Indian Special Thali', 'Rice, 2 rotis, sambar, rasam, kootu, veg curry, curd, papad, pickle & sweet gulab jamun', 110.00, 'Lunch', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Dum Veg Biryani', 'Fragrant long-grain basmati cooked with mixed garden vegetables, saffron & spices with onion raita', 100.00, 'Lunch', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Curd Rice with Pomegranate', 'Creamy tempered curd rice with mustard seeds, curry leaves, ginger, and fresh pomegranate', 50.00, 'Lunch', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- Insert Stall Payment QR records
INSERT INTO public.stall_qr (stall_id, qr_image_url, upi_id)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=maincanteen@campusbite&pn=CampusBite%20Main%20Canteen&am=0', 'maincanteen@campusbite'),
    ('22222222-2222-2222-2222-222222222222', 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=tiffinstall@campusbite&pn=CampusBite%20Tiffin%20Stall&am=0', 'tiffinstall@campusbite'),
    ('33333333-3333-3333-3333-333333333333', 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=fastfood@campusbite&pn=CampusBite%20Fast%20Food&am=0', 'fastfood@campusbite'),
    ('44444444-4444-4444-4444-444444444444', 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=snacks@campusbite&pn=CampusBite%20Snacks%20Stall&am=0', 'snacks@campusbite'),
    ('55555555-5555-5555-5555-555555555555', 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=juice@campusbite&pn=CampusBite%20Juice%20Bar&am=0', 'juice@campusbite')
ON CONFLICT (stall_id) DO UPDATE SET
    qr_image_url = EXCLUDED.qr_image_url,
    upi_id = EXCLUDED.upi_id;

-- ----------------------------------------------------------------------------
-- GENERATE INITIAL 10-MINUTE PICKUP SLOTS (9:00 AM to 6:00 PM) FOR EACH STALL
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_stall RECORD;
    v_hour INT;
    v_min INT;
    v_start_text TEXT;
    v_end_text TEXT;
    v_start_label TEXT;
    v_end_label TEXT;
    v_slot_label TEXT;
BEGIN
    FOR v_stall IN SELECT id FROM public.stalls LOOP
        FOR v_hour IN 9..17 LOOP
            FOR v_min IN 0..5 LOOP
                -- Format start time
                v_start_text := to_char(v_hour, 'FM00') || ':' || to_char(v_min * 10, 'FM00');
                
                -- Format end time
                IF v_min = 5 THEN
                    v_end_text := to_char(v_hour + 1, 'FM00') || ':00';
                ELSE
                    v_end_text := to_char(v_hour, 'FM00') || ':' || to_char((v_min + 1) * 10, 'FM00');
                END IF;

                -- Human readable 12-hour labels
                v_start_label := to_char(to_timestamp(v_start_text, 'HH24:MI'), 'HH12:MI AM');
                v_end_label := to_char(to_timestamp(v_end_text, 'HH24:MI'), 'HH12:MI AM');
                v_slot_label := v_start_label || ' - ' || v_end_label;

                INSERT INTO public.pickup_slots (stall_id, slot_date, start_time, end_time, slot_label, capacity, booked_count)
                VALUES (v_stall.id, CURRENT_DATE, v_start_text, v_end_text, v_slot_label, 10, 0)
                ON CONFLICT (stall_id, slot_date, start_time) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
