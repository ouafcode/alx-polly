# PollApp - Next.js Polling Application

A modern, full-stack polling application built with Next.js 15, TypeScript, and Tailwind CSS. Create, share, and vote on polls with an intuitive and beautiful user interface.

## 🚀 Features

- **User Authentication**: Secure login and registration system
- **Poll Creation**: Easy-to-use form for creating custom polls
- **Poll Voting**: Interactive voting interface with real-time results
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Built with Shadcn UI components and Tailwind CSS

## 🏗️ Project Structure

```
alx-polly/
├── app/                          # Next.js 15 app directory
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # Shadcn UI components
│   │   │   ├── button.tsx       # Button component
│   │   │   ├── card.tsx         # Card components
│   │   │   ├── input.tsx        # Input component
│   │   │   ├── label.tsx        # Label component
│   │   │   └── textarea.tsx     # Textarea component
│   │   ├── auth/                # Authentication components
│   │   │   ├── login-form.tsx   # Login form
│   │   │   └── register-form.tsx # Registration form
│   │   ├── polls/               # Poll-related components
│   │   │   ├── poll-card.tsx    # Individual poll display
│   │   │   ├── polls-list.tsx   # List of polls
│   │   │   └── create-poll-form.tsx # Poll creation form
│   │   └── layout/              # Layout components
│   │       ├── navigation.tsx   # Main navigation
│   │       └── footer.tsx       # Footer component
│   ├── login/                   # Login page route
│   ├── register/                # Registration page route
│   ├── polls/                   # Polls listing page route
│   ├── create/                  # Create poll page route
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── lib/                         # Utility functions
│   └── utils.ts                 # Class name utility
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React hooks (useState, useEffect)
- **Icons**: Heroicons (SVG)

## 📦 Dependencies

### Core Dependencies
- `next`: 15.5.2
- `react`: 19.1.0
- `react-dom`: 19.1.0

### UI Dependencies
- `@radix-ui/react-slot`: For component composition
- `@radix-ui/react-label`: For accessible labels
- `class-variance-authority`: For component variants
- `clsx`: For conditional class names
- `tailwind-merge`: For Tailwind class merging

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alx-polly
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Available Routes

- `/` - Home page with landing content
- `/login` - User login page
- `/register` - User registration page
- `/polls` - Browse and vote on polls
- `/create` - Create a new poll

## 🎨 Component Architecture

### UI Components
All UI components are built using Shadcn UI patterns, providing:
- Consistent design system
- Accessible components
- Customizable variants
- TypeScript support

### Feature Components
- **Authentication**: Login and registration forms
- **Polls**: Creation, display, and voting functionality
- **Layout**: Navigation and footer components

## 🔧 Development

### Adding New Components
1. Create the component in the appropriate directory
2. Follow Shadcn UI patterns for consistency
3. Export the component from an index file if needed
4. Add TypeScript interfaces for props

### Styling
- Use Tailwind CSS classes for styling
- Follow the established design system
- Use the `cn()` utility for conditional classes

### State Management
- Use React hooks for local state
- Consider context for global state as the app grows
- Implement proper error handling and loading states

## 🚧 TODO

- [ ] Implement actual authentication backend
- [ ] Add database integration for polls
- [ ] Implement real-time voting updates
- [ ] Add user dashboard
- [ ] Implement poll sharing functionality
- [ ] Add analytics and reporting
- [ ] Implement user roles and permissions
- [ ] Add poll categories and tags
- [ ] Implement search and filtering
- [ ] Add mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
