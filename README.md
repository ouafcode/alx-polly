# ALX Polly - Modern Polling Application

A full-stack polling application built with Next.js 15, TypeScript, and Supabase. Create, share, and vote on polls with an intuitive and beautiful user interface. Features user authentication, real-time voting, and comprehensive poll management.

## 🚀 Features

- **🔐 User Authentication**: Secure login and registration with Supabase Auth
- **📊 Poll Creation**: Easy-to-use form for creating custom polls with multiple options
- **🗳️ Interactive Voting**: Real-time voting interface with percentage-based results
- **👤 User Dashboard**: Personal dashboard showing poll statistics and management
- **📱 Responsive Design**: Mobile-first design that works seamlessly on all devices
- **🎨 Modern UI**: Built with Shadcn UI components and Tailwind CSS
- **🔒 Protected Routes**: Authentication-based route protection
- **⚡ Real-time Updates**: Live vote count updates and poll management

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **State Management**: React Context API + React Hooks

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js Server Actions
- **Real-time**: Supabase Realtime (for future enhancements)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Code Formatting**: Prettier

## 📦 Key Dependencies

### Core Dependencies
```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.0.0"
}
```

### UI & Styling
```json
{
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-dialog": "^1.0.5",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "lucide-react": "^0.400.0"
}
```

### Backend & Database
```json
{
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/ssr": "^0.1.0"
}
```

## 🛠️ Setup Steps

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd alx-polly
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Supabase Configuration

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Create a new project
3. Wait for the project to be set up

#### Get Your Project Credentials
1. Go to your project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

#### Set Up Database Schema
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

### 4. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 5. Configure Authentication Settings

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/login`
   - `http://localhost:3000/register`

### 6. Enable Email Confirmation (Optional)

1. Go to Authentication > Settings
2. Toggle "Enable email confirmations" if you want users to verify their email
3. Customize email templates if desired

## 🚀 How to Run and Test the App Locally

### Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

### Testing the Application

#### 1. Test User Registration
1. Navigate to `/register`
2. Fill out the registration form
3. Check your email for verification (if enabled)
4. Verify the user appears in Supabase Auth dashboard

#### 2. Test User Login
1. Navigate to `/login`
2. Use your registered credentials
3. Verify successful redirect to dashboard

#### 3. Test Poll Creation
1. Login to your account
2. Navigate to `/create` or use the "Create New Poll" button
3. Fill out the poll form:
   - Enter a question
   - Add multiple options (minimum 2)
   - Optionally add a description
4. Submit the form
5. Verify the poll appears in your dashboard

#### 4. Test Poll Voting
1. Navigate to `/polls`
2. Find a poll you created
3. Select an option and vote
4. Verify the vote count updates
5. Try changing your vote (should replace the previous vote)

#### 5. Test Poll Management
1. Go to your dashboard (`/dashboard`)
2. View your poll statistics
3. Edit a poll using the edit button
4. Delete a poll using the delete button (with confirmation)

## 📱 Available Routes

- `/` - Home page with landing content
- `/login` - User login page
- `/register` - User registration page
- `/dashboard` - User dashboard with poll statistics and management
- `/polls` - Browse and vote on all polls
- `/create` - Create a new poll (protected route)
- `/edit/[id]` - Edit an existing poll (protected route)

## 🎯 Usage Examples

### Creating a Poll

```typescript
// Example poll creation data structure
const pollData = {
  question: "What's your favorite programming language?",
  description: "Help us understand the community's preferences",
  options: [
    { text: "JavaScript" },
    { text: "Python" },
    { text: "TypeScript" },
    { text: "Go" }
  ]
}
```

### Voting on a Poll

```typescript
// Vote submission
const result = await submitVote(pollId, optionId);
if (result.success) {
  // Vote recorded successfully
  console.log("Vote submitted!");
} else {
  // Handle error
  console.error(result.error);
}
```

### Authentication Flow

```typescript
// Using the auth context
const { user, signIn, signOut } = useAuth();

// Sign in
const { error } = await signIn(email, password);

// Sign out
await signOut();
```

## 🏗️ Project Structure

```
alx-polly/
├── app/                          # Next.js 15 app directory
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # Shadcn UI components
│   │   ├── auth/                # Authentication components
│   │   │   ├── login-form.tsx   # Login form
│   │   │   ├── register-form.tsx # Registration form
│   │   │   └── protected-route.tsx # Route protection
│   │   ├── polls/               # Poll-related components
│   │   │   ├── poll-card.tsx    # Individual poll display
│   │   │   ├── polls-list.tsx   # List of polls
│   │   │   ├── create-poll-form.tsx # Poll creation form
│   │   │   ├── user-poll-card.tsx # User's poll management
│   │   │   └── user-polls-list.tsx # User's polls list
│   │   └── layout/              # Layout components
│   │       └── navigation.tsx   # Main navigation
│   ├── contexts/                # React contexts
│   │   └── auth-context.tsx     # Authentication context
│   ├── dashboard/               # Dashboard page
│   ├── login/                   # Login page route
│   ├── register/                # Registration page route
│   ├── polls/                   # Polls listing page route
│   ├── create/                  # Create poll page route
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── lib/                         # Utility functions and server actions
│   ├── actions.ts               # Server actions for polls and voting
│   ├── supabase.ts              # Supabase client configuration
│   └── utils.ts                 # Utility functions
├── database-schema.sql          # Database schema
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🔧 Development

### Adding New Components
1. Create the component in the appropriate directory
2. Follow Shadcn UI patterns for consistency
3. Add comprehensive TypeScript interfaces
4. Include proper error handling and loading states

### Server Actions
All data mutations use Next.js Server Actions:
- Poll creation, updates, and deletion
- Vote submission
- User authentication operations

### Database Operations
- All database operations go through Supabase
- Row Level Security (RLS) policies protect user data
- Automatic vote counting via database triggers

### Styling Guidelines
- Use Tailwind CSS classes for styling
- Follow the established design system
- Use the `cn()` utility for conditional classes
- Maintain responsive design principles

## 🚧 Future Enhancements

- [ ] Real-time vote updates using Supabase Realtime
- [ ] Poll sharing with unique URLs and QR codes
- [ ] Poll categories and tags
- [ ] Advanced search and filtering
- [ ] Poll analytics and reporting
- [ ] User roles and permissions
- [ ] Poll expiration dates
- [ ] Anonymous voting options
- [ ] Poll templates
- [ ] Export poll results

## 🐛 Troubleshooting

### Common Issues

#### Authentication Issues
- Verify your Supabase URL and keys are correct
- Check that email confirmation is properly configured
- Ensure redirect URLs are set in Supabase settings

#### Database Issues
- Verify the database schema has been applied
- Check RLS policies are enabled
- Ensure triggers are created for vote counting

#### Build Issues
- Clear `.next` folder and rebuild
- Check for TypeScript errors
- Verify all environment variables are set

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for the beautiful icons

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about your problem

---

**Happy Polling! 🗳️**