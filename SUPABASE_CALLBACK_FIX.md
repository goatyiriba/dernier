# 🔧 Fixing Supabase Callback Domain Error

## 🚨 Error: "Callback domain is not valid"

This error occurs when Supabase authentication tries to redirect to a domain that's not configured in your Supabase project settings.

## 🔍 **Root Cause**

The error happens because:
1. Supabase is trying to redirect to a domain for authentication
2. That domain is not listed in your Supabase project's allowed redirect URLs
3. This commonly occurs during development with localhost URLs

## ✅ **Solution Steps**

### **Step 1: Configure Supabase Authentication Settings**

1. **Go to your Supabase Dashboard**:
   - Visit [supabase.com](https://supabase.com)
   - Select your project

2. **Navigate to Authentication Settings**:
   - Go to "Authentication" → "URL Configuration"
   - Or go to "Settings" → "Auth" → "URL Configuration"

3. **Add Your Development URLs**:
   Add these URLs to the **"Redirect URLs"** section:
   ```
   http://localhost:5173/auth/callback
   http://localhost:5174/auth/callback
   http://localhost:5175/auth/callback
   http://localhost:5176/auth/callback
   http://localhost:5177/auth/callback
   http://localhost:5178/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   ```

4. **Add Your Production URLs** (when ready):
   ```
   https://yourdomain.com/auth/callback
   https://www.yourdomain.com/auth/callback
   ```

5. **Save the Configuration**:
   - Click "Save" to apply the changes

### **Step 2: Update Site URL**

1. **Set the Site URL**:
   - In the same Authentication settings
   - Set "Site URL" to your main domain:
   ```
   http://localhost:5173
   ```
   (or whatever port your app is running on)

### **Step 3: Configure Additional Redirect URLs**

If you're using other authentication methods, also add:

1. **For Email Confirmations**:
   ```
   http://localhost:5173/auth/confirm
   http://localhost:5173/confirm
   ```

2. **For Password Reset**:
   ```
   http://localhost:5173/auth/reset-password
   http://localhost:5173/reset-password
   ```

3. **For Magic Link**:
   ```
   http://localhost:5173/auth/magic-link
   http://localhost:5173/magic-link
   ```

### **Step 4: Test the Configuration**

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test authentication**:
   - Try signing in or signing up
   - Check if the callback error is resolved

## 🔧 **Alternative Solutions**

### **Option 1: Disable Authentication (Development Only)**

If you don't need authentication for development, you can disable it:

```javascript
// In src/api/supabaseClient.js
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});
```

### **Option 2: Use Custom Auth Handler**

Create a custom authentication handler that doesn't rely on redirects:

```javascript
// Custom auth without redirects
export const signInWithoutRedirect = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
```

### **Option 3: Use Service Role Key for Development**

For development, you can use the service role key to bypass authentication:

```javascript
// Use admin client for development
export const supabaseDev = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

## 🛡️ **Security Best Practices**

1. **Never expose service role key** in production
2. **Use environment variables** for all sensitive data
3. **Limit redirect URLs** to only necessary domains
4. **Use HTTPS** in production
5. **Regularly review** your authentication settings

## 🆘 **Troubleshooting**

### **Still Getting the Error?**

1. **Check your current port**:
   - Look at your terminal where `npm run dev` is running
   - Note the port number (e.g., `http://localhost:5178/`)
   - Add that specific port to your redirect URLs

2. **Clear browser cache**:
   - Clear cookies and local storage
   - Try in an incognito/private window

3. **Check Supabase logs**:
   - Go to Supabase Dashboard → Logs
   - Look for authentication errors

4. **Verify environment variables**:
   ```bash
   # Check if your .env file is loaded
   echo $VITE_SUPABASE_URL
   ```

### **Common Issues**

1. **Wrong port number**: Make sure you're using the correct localhost port
2. **Missing protocol**: Always include `http://` or `https://`
3. **Trailing slashes**: Be consistent with trailing slashes
4. **Case sensitivity**: URLs are case-sensitive

## 📞 **Getting Help**

If you're still having issues:

1. **Check Supabase Documentation**: https://supabase.com/docs/guides/auth
2. **Supabase Community**: https://github.com/supabase/supabase/discussions
3. **Supabase Discord**: https://discord.supabase.com

## 🎉 **Success Indicators**

You'll know it's working when:
- ✅ No more "Callback domain is not valid" errors
- ✅ Authentication flows work smoothly
- ✅ Users can sign in/sign up without issues
- ✅ Redirects work properly

---

**Remember**: Always test your authentication flow thoroughly before deploying to production! 