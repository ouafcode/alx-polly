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
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 4. Configure Authentication Settings

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3001` for development)
3. Add redirect URLs:
   - `http://localhost:3001/auth/callback`
   - `http://localhost:3001/login`
   - `http://localhost:3001/register`

## 5. Enable Email Confirmation (Optional)

1. Go to Authentication > Settings
2. Toggle "Enable email confirmations" if you want users to verify their email
3. Customize email templates if desired

## 6. Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema.sql` from your project
4. Run the SQL to create the necessary tables and policies

The schema includes:
- `polls` table for storing poll questions and metadata
- `poll_options` table for storing poll choices
- `votes` table for tracking user votes
- Row Level Security (RLS) policies for data protection
- Triggers for automatic vote counting and timestamp updates

## 7. Test the Setup

1. Run `npm run dev`
2. Try to register a new account
3. Check the Supabase dashboard to see if the user was created
4. Try logging in with the created account
5. Test creating a poll from the `/create` page

## 8. Database Schema Details

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

## 9. Troubleshooting

### Common Issues:
- **Authentication errors**: Make sure your environment variables are correct
- **Database permission errors**: Check that RLS policies are properly configured
- **CORS errors**: Verify your site URL and redirect URLs in Supabase settings

### Useful SQL Queries:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies;

-- View recent polls
SELECT p.*, u.email FROM polls p JOIN auth.users u ON p.user_id = u.id ORDER BY p.created_at DESC;
```
