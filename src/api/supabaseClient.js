import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client for public operations (with anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable automatic session detection to avoid callback issues
    flowType: 'pkce' // Use PKCE flow for better security
  },
  global: {
    headers: {
      'X-Client-Info': 'hr-app'
    }
  }
});

// Create Supabase client for admin operations (with service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'hr-app-admin'
    }
  }
});

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && (supabaseAnonKey || supabaseServiceKey));
};

// Helper function to get configuration status
export const getSupabaseConfigStatus = () => {
  return {
    url_present: !!supabaseUrl,
    anon_key_present: !!supabaseAnonKey,
    service_key_present: !!supabaseServiceKey,
    fully_configured: isSupabaseConfigured()
  };
};

// Helper function to handle authentication without callback issues
export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
};

// Helper function to sign up without callback issues
export const signUpWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error };
  }
};

// Helper function to sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    console.error('Get user error:', error);
    return { user: null, error };
  }
};

// Database schema for Supabase
export const SUPABASE_SCHEMA = {
  employees: {
    table: 'employees',
    columns: {
      id: 'uuid primary key default gen_random_uuid()',
      employee_id: 'text unique',
      first_name: 'text not null',
      last_name: 'text not null',
      email: 'text unique not null',
      phone: 'text',
      department: 'text',
      position: 'text',
      hire_date: 'date',
      salary: 'numeric',
      is_active: 'boolean default true',
      created_at: 'timestamp with time zone default now()',
      updated_at: 'timestamp with time zone default now()'
    }
  },
  users: {
    table: 'users',
    columns: {
      id: 'uuid primary key default gen_random_uuid()',
      email: 'text unique not null',
      role: 'text default "employee"',
      is_active: 'boolean default true',
      employee_id: 'uuid references employees(id)',
      last_login: 'timestamp with time zone',
      created_at: 'timestamp with time zone default now()',
      updated_at: 'timestamp with time zone default now()'
    }
  },
  time_entries: {
    table: 'time_entries',
    columns: {
      id: 'uuid primary key default gen_random_uuid()',
      employee_id: 'uuid references employees(id) not null',
      check_in: 'timestamp with time zone',
      check_out: 'timestamp with time zone',
      location: 'jsonb',
      notes: 'text',
      created_at: 'timestamp with time zone default now()'
    }
  },
  leave_requests: {
    table: 'leave_requests',
    columns: {
      id: 'uuid primary key default gen_random_uuid()',
      employee_id: 'uuid references employees(id) not null',
      start_date: 'date not null',
      end_date: 'date not null',
      leave_type: 'text not null',
      status: 'text default "pending"',
      reason: 'text',
      approved_by: 'uuid references users(id)',
      created_at: 'timestamp with time zone default now()',
      updated_at: 'timestamp with time zone default now()'
    }
  },
  announcements: {
    table: 'announcements',
    columns: {
      id: 'uuid primary key default gen_random_uuid()',
      title: 'text not null',
      content: 'text not null',
      author_id: 'uuid references users(id)',
      priority: 'text default "normal"',
      is_active: 'boolean default true',
      created_at: 'timestamp with time zone default now()',
      updated_at: 'timestamp with time zone default now()'
    }
  },
  notifications: {
    table: 'notifications',
    columns: {
      id: 'uuid primary key default gen_random_uuid()',
      user_id: 'uuid references users(id) not null',
      title: 'text not null',
      message: 'text not null',
      type: 'text default "info"',
      is_read: 'boolean default false',
      created_at: 'timestamp with time zone default now()'
    }
  },
  badges: {
    table: 'badges',
    columns: {
      id: 'uuid primary key default gen_random_uuid()',
      employee_id: 'uuid references employees(id) not null',
      badge_id: 'text not null',
      name: 'text not null',
      description: 'text',
      icon: 'text',
      tier: 'text default "bronze"',
      category: 'text',
      is_active: 'boolean default true',
      awarded_at: 'timestamp with time zone default now()'
    }
  },
  employee_points: {
    table: 'employee_points',
    columns: {
      id: 'uuid primary key default gen_random_uuid()',
      employee_id: 'uuid references employees(id) not null',
      total_points: 'integer default 0',
      level: 'integer default 1',
      created_at: 'timestamp with time zone default now()',
      updated_at: 'timestamp with time zone default now()'
    }
  }
};

// SQL to create tables
export const CREATE_TABLES_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT,
  position TEXT,
  hire_date DATE,
  salary NUMERIC,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'employee',
  is_active BOOLEAN DEFAULT TRUE,
  employee_id UUID REFERENCES employees(id),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  location JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reason TEXT,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  priority TEXT DEFAULT 'normal',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) NOT NULL,
  badge_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  tier TEXT DEFAULT 'bronze',
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_points table
CREATE TABLE IF NOT EXISTS employee_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) NOT NULL,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_check_in ON time_entries(check_in);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_badges_employee_id ON badges(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_points_employee_id ON employee_points(employee_id);
`;

export default supabase; 