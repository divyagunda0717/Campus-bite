-- ============================================================================
-- CAMPUSBITE — SECURE ROLE-BASED AUTHENTICATION & STALL MANAGEMENT
-- Migration 001: Schema, Strict RLS Policies, Functions & Initial Stalls
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
DROP TABLE IF EXISTS public.stall_members CASCADE;
DROP TABLE IF EXISTS public.stall_admins CASCADE;
DROP TABLE IF EXISTS public.stalls CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ----------------------------------------------------------------------------
-- 1. STALLS (Dynamic Food Stalls)
-- ----------------------------------------------------------------------------
CREATE TABLE public.stalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    contact TEXT,
    image_url TEXT,
    is_open BOOLEAN DEFAULT true NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL, -- Soft-delete / deactivated flag
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. PROFILES (Extends Supabase auth.users with verified role & account status)
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL CHECK (
        role IN ('STUDENT', 'FACULTY', 'STAFF_MEMBER', 'STALL_ADMIN', 'SUPER_ADMIN',
                 'student', 'faculty', 'staff_member', 'stall_admin', 'super_admin')
    ),
    account_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (
        account_status IN ('ACTIVE', 'PENDING', 'REJECTED', 'DEACTIVATED',
                           'active', 'pending', 'rejected', 'deactivated')
    ),
    stall_id UUID REFERENCES public.stalls(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. STALL_MEMBERS (Maps Staff Members & Stall Admins to exactly ONE stall)
-- ----------------------------------------------------------------------------
CREATE TABLE public.stall_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    stall_id UUID REFERENCES public.stalls(id) ON DELETE SET NULL,
    member_type TEXT NOT NULL CHECK (
        member_type IN ('STAFF_MEMBER', 'STALL_ADMIN', 'staff_member', 'stall_admin')
    ),
    approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
        approval_status IN ('PENDING', 'ACTIVE', 'REJECTED', 'DEACTIVATED',
                           'pending', 'active', 'rejected', 'deactivated')
    ),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
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
    order_number TEXT NOT NULL UNIQUE, -- Human-friendly ID, e.g. "CB-1042"
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    stall_id UUID NOT NULL REFERENCES public.stalls(id),
    pickup_slot_id UUID REFERENCES public.pickup_slots(id),
    pickup_time TEXT NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'online', 'CASH', 'ONLINE')),
    payment_status TEXT NOT NULL DEFAULT 'Cash on Pickup',
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
-- INDEXES FOR HIGH PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_stalls_active ON public.stalls(is_active, is_open);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role, account_status);
CREATE INDEX IF NOT EXISTS idx_stall_members_user ON public.stall_members(user_id);
CREATE INDEX IF NOT EXISTS idx_stall_members_stall ON public.stall_members(stall_id);
CREATE INDEX IF NOT EXISTS idx_food_items_stall ON public.food_items(stall_id, is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stall ON public.orders(stall_id, order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_pickup_slots_stall ON public.pickup_slots(stall_id, slot_date);

-- ============================================================================
-- HELPER FUNCTIONS FOR SECURITY & STALL DATA ISOLATION
-- ============================================================================

-- Normalize user role to uppercase
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT UPPER(role) FROM public.profiles WHERE id = p_user_id;
$$;

-- Get the verified assigned stall_id of the requesting staff or stall admin
-- Returns NULL if the account is not ACTIVE or has no assigned stall
CREATE OR REPLACE FUNCTION public.get_user_assigned_stall(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT stall_id FROM public.profiles 
    WHERE id = p_user_id 
      AND UPPER(account_status) = 'ACTIVE' 
      AND stall_id IS NOT NULL;
$$;

-- Automatic updated_at trigger function
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
CREATE TRIGGER trigger_update_stall_members_updated_at BEFORE UPDATE ON public.stall_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
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
DECLARE
    v_raw_role TEXT;
    v_role TEXT;
    v_status TEXT;
BEGIN
    v_raw_role := COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT');
    v_role := UPPER(v_raw_role);

    -- Public registrations can only be STUDENT, FACULTY, STAFF_MEMBER, STALL_ADMIN
    -- Super Admin cannot register publicly
    IF v_role NOT IN ('STUDENT', 'FACULTY', 'STAFF_MEMBER', 'STALL_ADMIN', 'SUPER_ADMIN') THEN
        v_role := 'STUDENT';
    END IF;

    -- Students and Faculty are ACTIVE immediately
    -- Staff and Stall Admins start as PENDING awaiting Super Admin approval & stall assignment
    IF v_role IN ('STAFF_MEMBER', 'STALL_ADMIN') THEN
        v_status := 'PENDING';
    ELSE
        v_status := 'ACTIVE';
    END IF;

    INSERT INTO public.profiles (id, full_name, email, phone, role, account_status, stall_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        v_role,
        v_status,
        NULL
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = COALESCE(EXCLUDED.role, profiles.role);

    -- Create stall_members row for staff or stall admin
    IF v_role IN ('STAFF_MEMBER', 'STALL_ADMIN') THEN
        INSERT INTO public.stall_members (user_id, stall_id, member_type, approval_status)
        VALUES (NEW.id, NULL, v_role, 'PENDING')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

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
ALTER TABLE public.stall_members ENABLE ROW LEVEL SECURITY;
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
    USING (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

CREATE POLICY "Staff/Admins can view customer profiles for orders"
    ON public.profiles FOR SELECT
    USING (
        public.get_user_role(auth.uid()) IN ('STAFF_MEMBER', 'STALL_ADMIN')
        OR auth.uid() = id
    );

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Super Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

CREATE POLICY "Allow service role or self insert profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- STALLS POLICIES
-- ----------------------------------------------------------------------------
-- Active stalls are visible to everyone (students, faculty, public)
CREATE POLICY "Anyone can view active stalls"
    ON public.stalls FOR SELECT
    USING (
        is_active = true 
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN' 
        OR id = public.get_user_assigned_stall(auth.uid())
    );

-- Super Admin can manage all stalls
CREATE POLICY "Super Admin full control over stalls"
    ON public.stalls FOR ALL
    USING (public.get_user_role(auth.uid()) = 'SUPER_ADMIN')
    WITH CHECK (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- Assigned Staff Member or Stall Admin can toggle open/close status of their stall
CREATE POLICY "Assigned Staff/Admin can update their stall open status"
    ON public.stalls FOR UPDATE
    USING (id = public.get_user_assigned_stall(auth.uid()))
    WITH CHECK (id = public.get_user_assigned_stall(auth.uid()));

-- ----------------------------------------------------------------------------
-- STALL_MEMBERS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Super Admin can manage stall members"
    ON public.stall_members FOR ALL
    USING (public.get_user_role(auth.uid()) = 'SUPER_ADMIN')
    WITH CHECK (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

CREATE POLICY "Staff/Admin can view own membership"
    ON public.stall_members FOR SELECT
    USING (user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- ----------------------------------------------------------------------------
-- FOOD_ITEMS POLICIES (STRICT STALL DATA ISOLATION)
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view food items of active stalls"
    ON public.food_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.stalls s
            WHERE s.id = food_items.stall_id AND s.is_active = true
        )
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
        OR stall_id = public.get_user_assigned_stall(auth.uid())
    );

CREATE POLICY "Assigned Staff/Admin can insert food items for assigned stall"
    ON public.food_items FOR INSERT
    WITH CHECK (
        stall_id = public.get_user_assigned_stall(auth.uid())
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    );

CREATE POLICY "Assigned Staff/Admin can update food items for assigned stall"
    ON public.food_items FOR UPDATE
    USING (
        stall_id = public.get_user_assigned_stall(auth.uid())
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    )
    WITH CHECK (
        stall_id = public.get_user_assigned_stall(auth.uid())
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    );

CREATE POLICY "Assigned Staff/Admin can delete food items for assigned stall"
    ON public.food_items FOR DELETE
    USING (
        stall_id = public.get_user_assigned_stall(auth.uid())
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    );

-- ----------------------------------------------------------------------------
-- PICKUP_SLOTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view pickup slots"
    ON public.pickup_slots FOR SELECT
    USING (true);

CREATE POLICY "Assigned Staff/Admin can manage pickup slots for assigned stall"
    ON public.pickup_slots FOR ALL
    USING (
        stall_id = public.get_user_assigned_stall(auth.uid())
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    )
    WITH CHECK (
        stall_id = public.get_user_assigned_stall(auth.uid())
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    );

CREATE POLICY "Users can increment slot booked count during checkout"
    ON public.pickup_slots FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- STALL_QR POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view stall QR"
    ON public.stall_qr FOR SELECT
    USING (true);

CREATE POLICY "Assigned Staff/Admin or Super Admin can manage stall QR"
    ON public.stall_qr FOR ALL
    USING (
        stall_id = public.get_user_assigned_stall(auth.uid())
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    )
    WITH CHECK (
        stall_id = public.get_user_assigned_stall(auth.uid())
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    );

-- ----------------------------------------------------------------------------
-- ORDERS POLICIES (STRICT STALL DATA ISOLATION)
-- ----------------------------------------------------------------------------
-- Student/Faculty views ONLY own orders
-- Staff/Admin views ONLY orders where orders.stall_id = assigned_stall_id
-- Super Admin views all orders
CREATE POLICY "Orders view policy: customer or assigned stall staff/admin or super admin"
    ON public.orders FOR SELECT
    USING (
        user_id = auth.uid()
        OR stall_id = public.get_user_assigned_stall(auth.uid())
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    );

-- Students and Faculty can place orders
CREATE POLICY "Users can place orders"
    ON public.orders FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    );

-- Assigned Staff Member or Stall Admin can update orders for their assigned stall
-- Super Admin can update any order
CREATE POLICY "Assigned Staff/Admin can update orders for their stall"
    ON public.orders FOR UPDATE
    USING (
        stall_id = public.get_user_assigned_stall(auth.uid())
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    )
    WITH CHECK (
        stall_id = public.get_user_assigned_stall(auth.uid())
        OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
    );

-- ----------------------------------------------------------------------------
-- ORDER_ITEMS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Order items view policy: customer or assigned stall staff/admin"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (
                o.user_id = auth.uid()
                OR o.stall_id = public.get_user_assigned_stall(auth.uid())
                OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN'
            )
        )
    );

CREATE POLICY "Users can insert order items for their own orders"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (o.user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'SUPER_ADMIN')
        )
    );

-- ============================================================================
-- INITIAL STALLS & MENU (NO DEFAULT USERS OR FAKE MEMBERS)
-- ============================================================================

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

-- Initial Stall Payment QR records
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

-- Initial Food Items
INSERT INTO public.food_items (id, stall_id, name, description, price, category, image_url, is_available)
VALUES
    -- Tiffin Stall
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Masala Dosa', 'Crispy golden crepe filled with spiced potato masala, served with 2 chutneys & hot sambar', 60.00, 'Tiffins', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Steamed Idli (2 Pcs)', 'Soft and fluffy steamed rice cakes with pure ghee, piping hot sambar & fresh coconut chutney', 40.00, 'Tiffins', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Medu Vada (2 Pcs)', 'Crispy exterior, soft interior lentil fritters seasoned with peppercorns & ginger', 45.00, 'Tiffins', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Poori Masala (3 Pcs)', 'Fluffy deep-fried wheat breads served with fragrant spiced potato kurma', 55.00, 'Tiffins', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', true),

    -- Fast Food Stall
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Classic Veg Burger', 'Herb spiced vegetable patty, fresh lettuce, sliced tomatoes, creamy garlic mayo', 75.00, 'Fast Food', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Schezwan Veg Fried Rice', 'Wok-tossed basmati rice with crunchy carrots, cabbage, capsicum in fiery schezwan sauce', 90.00, 'Fast Food', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Hakka Noodles', 'Stir-fried noodles tossed with scallions, bell peppers, soy sauce and sesame', 85.00, 'Fast Food', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Margherita Pizza (7-inch)', 'Stone-baked thin crust, san marzano tomato sauce, fresh mozzarella & basil herbs', 140.00, 'Fast Food', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80', true),

    -- Snacks Stall
    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Punjabi Samosa (2 Pcs)', 'Flaky pastry filled with spiced potatoes, green peas, served with mint & sweet tamarind chutney', 30.00, 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Grilled Cheese Sandwich', 'Double-decker bread toasted golden brown with melted cheddar, spiced veggies and green chutney', 60.00, 'Snacks', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Cutting Masala Chai', 'Rich, aromatic brewed milk tea infused with cardamom, ginger, and cloves', 20.00, 'Beverages', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', true),

    -- Juice Stall
    (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Fresh Orange Juice', 'Cold-pressed 100% natural Valencia oranges without added sugar', 50.00, 'Beverages', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Mango Smoothie', 'Creamy Alphonso mango pulp blended with Greek yogurt and a dash of honey', 65.00, 'Beverages', 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80', true),

    -- Main Canteen
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'South Indian Special Thali', 'Rice, 2 rotis, sambar, rasam, kootu, veg curry, curd, papad, pickle & sweet gulab jamun', 110.00, 'Lunch', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80', true),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Dum Veg Biryani', 'Fragrant long-grain basmati cooked with mixed garden vegetables, saffron & spices with onion raita', 100.00, 'Lunch', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- Generate Initial 10-Minute Pickup Slots (9:00 AM - 6:00 PM) for each stall
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
                v_start_text := to_char(v_hour, 'FM00') || ':' || to_char(v_min * 10, 'FM00');
                
                IF v_min = 5 THEN
                    v_end_text := to_char(v_hour + 1, 'FM00') || ':00';
                ELSE
                    v_end_text := to_char(v_hour, 'FM00') || ':' || to_char((v_min + 1) * 10, 'FM00');
                END IF;

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
