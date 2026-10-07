const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wfaxdtfoyrokfjddhivw.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmYXhkdGZveXJva2ZqZGRoaXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTM3MjU5MSwiZXhwIjoyMTA2OTQ4NTkxfQ.-5jymejlrEud07OGq-a6r9gAt4PQW0Fui58BddNcyhE';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEMO_USERS = [
  {
    email: 'admin@campusbite.demo',
    password: 'CampusBite@123',
    role: 'super_admin',
    name: 'Super Admin (Campus Director)',
    phone: '+91 98888 11111'
  },
  {
    email: 'tiffin@campusbite.demo',
    password: 'CampusBite@123',
    role: 'stall_admin',
    name: 'Ramesh Kumar (Tiffin Stall In-Charge)',
    phone: '+91 98888 22222',
    stall_id: '22222222-2222-2222-2222-222222222222'
  },
  {
    email: 'fastfood@campusbite.demo',
    password: 'CampusBite@123',
    role: 'stall_admin',
    name: 'Suresh Patel (Fast Food In-Charge)',
    phone: '+91 98888 33333',
    stall_id: '33333333-3333-3333-3333-333333333333'
  },
  {
    email: 'student@campusbite.demo',
    password: 'CampusBite@123',
    role: 'student',
    name: 'Aditya Sharma (CSE - 3rd Year)',
    phone: '+91 98888 44444'
  },
  {
    email: 'faculty@campusbite.demo',
    password: 'CampusBite@123',
    role: 'faculty',
    name: 'Dr. Meenakshi Sundaram (HOD - ECE)',
    phone: '+91 98888 55555'
  }
];

async function seedUsers() {
  console.log('====================================================');
  console.log(' SEEDING DEMO ACCOUNTS VIA SUPABASE ADMIN API');
  console.log('====================================================');

  for (const user of DEMO_USERS) {
    try {
      console.log(`Checking account: ${user.email} (${user.role})...`);
      // Check if user already exists
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find(u => u.email === user.email);

      let userId;
      if (existing) {
        console.log(`  -> Account exists. Updating password & metadata...`);
        userId = existing.id;
        await supabase.auth.admin.updateUserById(userId, {
          password: user.password,
          user_metadata: { name: user.name, role: user.role, phone: user.phone },
          email_confirm: true
        });
      } else {
        console.log(`  -> Creating new user in Supabase Auth...`);
        const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { name: user.name, role: user.role, phone: user.phone }
        });
        if (createErr) {
          console.error(`  ❌ Error creating ${user.email}:`, createErr.message);
          continue;
        }
        userId = createData.user.id;
        console.log(`  ✅ Created user id: ${userId}`);
      }

      // Try inserting into profiles table if table exists
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      });

      if (!profileErr) {
        console.log(`  ✅ Profile synced.`);
        if (user.stall_id) {
          await supabase.from('stall_admins').upsert({
            user_id: userId,
            stall_id: user.stall_id
          }, { onConflict: 'user_id' });
          console.log(`  ✅ Assigned to stall: ${user.stall_id}`);
        }
      }
    } catch (err) {
      console.error(`  ❌ Failed for ${user.email}:`, err.message);
    }
  }

  console.log('====================================================');
  console.log('🎉 DEMO ACCOUNTS INITIALIZED!');
  console.log('Credentials:');
  DEMO_USERS.forEach(u => console.log(`  [${u.role.toUpperCase()}] ${u.email} / ${u.password}`));
  console.log('====================================================');
}

seedUsers();
