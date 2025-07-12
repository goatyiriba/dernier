# 🗄️ Supabase Database Setup Guide

This guide will help you connect your HR application to Supabase for database storage and management.

## 📋 Prerequisites

- A Supabase account (free tier available)
- Node.js and npm installed
- Your HR application running locally

## 🚀 Step 1: Create a Supabase Project

1. **Go to [Supabase](https://supabase.com)** and sign up/login
2. **Create a new project**:
   - Click "New Project"
   - Choose your organization
   - Enter project name (e.g., "hr-app-database")
   - Enter a secure database password
   - Choose a region close to your users
   - Click "Create new project"

## 🔑 Step 2: Get Your Supabase Credentials

1. **Go to Project Settings**:
   - In your Supabase dashboard, click on your project
   - Go to "Settings" → "API"

2. **Copy the credentials**:
   - **Project URL**: Copy the "Project URL" (looks like `https://your-project.supabase.co`)
   - **Anon Key**: Copy the "anon public" key
   - **Service Role Key**: Copy the "service_role" key (keep this secret!)

## ⚙️ Step 3: Configure Environment Variables

1. **Create a `.env` file** in your project root (if it doesn't exist):
   ```bash
   touch .env
   ```

2. **Add your Supabase credentials** to the `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

## 🗂️ Step 4: Set Up Database Schema

1. **Go to Supabase SQL Editor**:
   - In your Supabase dashboard, click "SQL Editor"
   - Click "New Query"

2. **Run the schema creation script**:
   - Copy the SQL from `src/api/supabaseClient.js` (CREATE_TABLES_SQL)
   - Paste it in the SQL Editor
   - Click "Run" to create all tables

## 🔧 Step 5: Configure Row Level Security (RLS)

1. **Enable RLS on tables**:
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
   ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
   ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
   ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
   ALTER TABLE employee_points ENABLE ROW LEVEL SECURITY;
   ```

2. **Create policies** (example for employees table):
   ```sql
   -- Allow users to read their own employee data
   CREATE POLICY "Users can view own employee data" ON employees
   FOR SELECT USING (id IN (
     SELECT employee_id FROM users WHERE email = auth.jwt() ->> 'email'
   ));

   -- Allow admins to read all employee data
   CREATE POLICY "Admins can view all employees" ON employees
   FOR SELECT USING (
     EXISTS (
       SELECT 1 FROM users 
       WHERE email = auth.jwt() ->> 'email' 
       AND role = 'admin'
     )
   );
   ```

## 🧪 Step 6: Test the Connection

1. **Use the built-in Supabase Manager**:
   - Go to your HR app
   - Navigate to "Admin" → "System Monitoring" → "Supabase" tab
   - Click "Test Connection" to verify everything is working

2. **Or test manually**:
   ```javascript
   import { supabase } from '@/api/supabaseClient';
   
   // Test connection
   const { data, error } = await supabase
     .from('employees')
     .select('*')
     .limit(1);
   
   if (error) {
     console.error('Connection failed:', error);
   } else {
     console.log('Connection successful!');
   }
   ```

## 🔄 Step 7: Sync Data (Optional)

If you have existing data in Base44, you can sync it to Supabase:

1. **Use the Supabase Manager**:
   - Go to "Admin" → "System Monitoring" → "Supabase"
   - Click "Synchronisation vers Supabase" to backup your data
   - Or click "Synchronisation depuis Supabase" to restore data

## 🔒 Step 8: Security Best Practices

1. **Never expose your service role key** in client-side code
2. **Use environment variables** for all sensitive data
3. **Enable Row Level Security (RLS)** on all tables
4. **Create appropriate policies** for data access
5. **Regularly backup your data**
6. **Monitor your usage** in the Supabase dashboard

## 📊 Step 9: Monitor Your Database

1. **Check the Supabase Dashboard**:
   - Go to "Table Editor" to view your data
   - Check "Logs" for any errors
   - Monitor "Usage" for API calls and storage

2. **Set up alerts** (optional):
   - Go to "Settings" → "Alerts"
   - Configure notifications for important events

## 🆘 Troubleshooting

### Common Issues:

1. **"Configuration Supabase incomplète"**:
   - Check that all environment variables are set correctly
   - Restart your development server
   - Verify the keys in your Supabase dashboard

2. **"Connection failed"**:
   - Check your internet connection
   - Verify the Supabase URL is correct
   - Ensure your project is active in Supabase

3. **"Permission denied"**:
   - Check your RLS policies
   - Verify your API keys have the correct permissions
   - Make sure you're using the right key for the operation

### Getting Help:

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Community**: https://github.com/supabase/supabase/discussions
- **Check the logs** in your Supabase dashboard

## 🎉 Congratulations!

Your HR application is now connected to Supabase! You can:

- ✅ Store and retrieve data from Supabase
- ✅ Use real-time subscriptions
- ✅ Leverage Supabase's built-in authentication
- ✅ Scale your database as needed
- ✅ Use Supabase's powerful SQL features

## 📈 Next Steps

1. **Set up authentication** with Supabase Auth
2. **Configure real-time subscriptions** for live updates
3. **Set up automated backups**
4. **Monitor performance** and optimize queries
5. **Consider using Supabase Edge Functions** for serverless operations

---

**Need help?** Check the Supabase documentation or reach out to the community! 