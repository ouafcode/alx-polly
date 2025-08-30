# Supabase Authentication Setup

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Create a new project
3. Wait for the project to be set up

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## 3. Set Environment Variables

Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Configure Authentication Settings

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/login`
   - `http://localhost:3000/register`

## 5. Enable Email Confirmation (Optional)

1. Go to Authentication > Settings
2. Toggle "Enable email confirmations" if you want users to verify their email
3. Customize email templates if desired

## 6. Test the Setup

1. Run `npm run dev`
2. Try to register a new account
3. Check the Supabase dashboard to see if the user was created
4. Try logging in with the created account

## 7. Database Schema (Optional)

If you want to store additional user data, you can create a `profiles` table:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

## 8. CORS and Network Issues

If you encounter CORS errors or "Cross origin request detected" warnings:

### Solution 1: Use Localhost Only
- Access your app only via `http://localhost:3000` instead of `http://192.168.56.1:3000`

### Solution 2: Update Development Script
The package.json has been updated to handle network access:
```bash
npm run dev
```

### Solution 3: Clear Browser Cache
- Clear your browser cache and cookies
- Try in an incognito/private window

### Solution 4: Check Firewall/Antivirus
- Ensure your firewall isn't blocking local network access
- Temporarily disable antivirus to test

## Troubleshooting

- **"Invalid API key" error**: Double-check your environment variables
- **"Email not confirmed" error**: Check if email confirmation is enabled in Supabase
- **CORS errors**: Ensure your redirect URLs are properly configured
- **"User not found" error**: Check if the user was created in the Supabase dashboard
- **Cross origin warnings**: Use localhost instead of IP address, or clear browser cache
