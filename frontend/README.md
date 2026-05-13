# Invoice App - Frontend

A modern, responsive web application for managing invoices, clients, and payments. Built with React, TypeScript, and Tailwind CSS.

## 🎨 Features

- ✅ **Modern UI** - Beautiful, responsive design with Shadcn UI components
- ✅ **User Authentication** - Google OAuth 2.0 & Email/Password login
- ✅ **Dashboard** - Overview of invoices, payments, and clients
- ✅ **Invoice Management** - Create, edit, view, and send invoices
- ✅ **Client Management** - Manage client details and communications
- ✅ **Payment Tracking** - Record and track payments
- ✅ **PDF Download** - Download invoices as PDF
- ✅ **Reports** - Analytics and financial reports
- ✅ **Settings** - User profile and account settings
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Dark Mode** - Theme switching support
- ✅ **Form Validation** - Zod for runtime type checking
- ✅ **Data Fetching** - React Query for efficient API calls
- ✅ **Routing** - TanStack Router for navigation
- ✅ **Error Handling** - Comprehensive error pages and messages

## 📋 Tech Stack

| Technology               | Version   | Purpose                 |
| ------------------------ | --------- | ----------------------- |
| **React**                | ^19.2.0   | UI framework            |
| **TypeScript**           | ^5.8.3    | Type safety             |
| **TanStack Router**      | ^1.168.25 | Routing                 |
| **TanStack React Query** | ^5.83.0   | Data fetching & caching |
| **Tailwind CSS**         | ^4.2.1    | Styling                 |
| **Shadcn UI**            | Latest    | Component library       |
| **React Hook Form**      | ^7.71.2   | Form handling           |
| **Zod**                  | ^3.24.2   | Schema validation       |
| **Vite**                 | ^7.3.1    | Build tool              |
| **React OAuth**          | ^0.13.5   | Google authentication   |
| **jsPDF**                | ^4.2.1    | PDF generation          |
| **Recharts**             | ^2.15.4   | Charts & graphs         |
| **Framer Motion**        | ^12.38.0  | Animations              |
| **Sonner**               | ^2.0.7    | Toast notifications     |

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://github.com/arun-chaudhary3116/Invoice-)
- **Backend API** - Running at `http://localhost:5000` (see backend README)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <https://github.com/arun-chaudhary3116/Invoice->
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the frontend root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# App Configuration
VITE_APP_NAME=Invoice App
VITE_APP_VERSION=1.0.0
```

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized JavaScript origins:
   - `http://localhost:8080` (development)
   - Your Cloudflare production domain
4. Copy Client ID to `.env` as `VITE_GOOGLE_CLIENT_ID`

## 🏃 Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── start.tsx             # Vite start configuration
│   ├── server.ts             # Server-side rendering setup
│   ├── router.tsx            # Route definitions
│   ├── routeTree.gen.ts      # Auto-generated route tree
│   ├── config.ts             # App configuration
│   │
│   ├── components/           # React components
│   │   ├── auth/
│   │   │   ├── AuthShell.tsx
│   │   │   └── GoogleButton.tsx
│   │   ├── landing/          # Landing page components
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── FAQ.tsx
│   │   │   └── ...
│   │   └── ui/               # Shadcn UI components
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       └── ...
│   │
│   ├── hooks/                # Custom React hooks
│   │   └── use-mobile.tsx
│   │
│   ├── lib/                  # Utility functions
│   │   ├── api.ts            # API client
│   │   ├── auth.tsx          # Auth utilities
│   │   ├── utils.ts          # Helper functions
│   │   └── error-page.ts
│   │
│   ├── routes/               # Page components
│   │   ├── __root.tsx        # Root layout
│   │   ├── index.tsx         # Home page
│   │   ├── signin.tsx        # Sign in page
│   │   ├── signup.tsx        # Sign up page
│   │   ├── dashboard.tsx     # Dashboard layout
│   │   ├── dashboard.index.tsx
│   │   ├── dashboard.clients.index.tsx
│   │   ├── dashboard.invoices.index.tsx
│   │   ├── dashboard.invoices.create.tsx
│   │   ├── dashboard.invoices.edit.$id.tsx
│   │   ├── dashboard.payments.tsx
│   │   ├── dashboard.reports.tsx
│   │   ├── dashboard.settings.tsx
│   │   └── pay.$invoiceId.tsx
│   │
│   ├── styles.css            # Global styles
│   └── ...
│
├── public/                   # Static assets
├── .env                      # Environment variables
├── .env.example              # Example env file
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind configuration
├── eslint.config.js          # ESLint configuration
├── components.json           # Shadcn UI configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🔌 API Integration

### Base URL

The frontend makes requests to the backend at the URL specified in `VITE_API_URL`:

```typescript
// src/lib/api.ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

### Authentication

1. **Login**: User gets JWT token from backend
2. **Storage**: Token is stored (localStorage/sessionStorage)
3. **Usage**: Token is sent with every request in Authorization header:
   ```
   Authorization: Bearer <token>
   ```

### Example API Call

```typescript
// GET /api/clients
const response = await fetch(`${BASE_URL}/api/clients`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

## 📄 Pages Overview

### Public Pages

- **Home (/)** - Landing page with features, pricing, testimonials
- **Sign In (/signin)** - Email/password or Google OAuth login
- **Sign Up (/signup)** - Email/password registration
- **Public Invoice (/pay/:invoiceId)** - Public payment page

### Protected Pages (Dashboard)

- **Dashboard (/)** - Overview and stats
- **Clients** - Manage all clients
- **Invoices** - View and manage invoices
- **Create Invoice** - Create new invoice
- **Edit Invoice** - Modify existing invoice
- **Payments** - Track payments
- **Reports** - Financial analytics
- **Settings** - User profile & preferences

## 🎯 Key Components

### Authentication Shell (`AuthShell.tsx`)

Wraps protected routes and handles authentication state.

### Google Button (`GoogleButton.tsx`)

Implements Google OAuth 2.0 sign-in using `@react-oauth/google`.

### UI Components

All components from Shadcn UI are available in `src/components/ui/`:

- Button, Dialog, Form, Input, Card, Table, Select, etc.

### Custom Hooks

```typescript
// Check if device is mobile
import { useMobile } from '@/hooks/use-mobile';

function MyComponent() {
  const isMobile = useMobile();
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

## 🔐 Protected Routes

Protected routes require authentication. If user is not logged in, they're redirected to `/signin`.

```typescript
// src/routes/dashboard.tsx
export const Dashboard = () => {
  // Only accessible when authenticated
};
```

## 📊 Data Fetching with React Query

```typescript
import { useQuery } from '@tanstack/react-query';

function ClientsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      return response.json();
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading clients</div>;

  return <div>{/* render data */}</div>;
}
```

## 🎨 Styling

### Tailwind CSS

All styling uses Tailwind CSS classes. Configuration in `tailwind.config.js`.

### Dark Mode

App supports dark mode. Toggle with theme switcher in settings.

### Component Variants

Use Shadcn UI components with predefined variants:

```typescript
<Button variant="outline" size="sm">Click me</Button>
```

## 📝 Form Handling

Using React Hook Form + Zod for type-safe forms:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
}
```

## 🚀 Deployment

### Deploy to Cloudflare Pages

1. Push code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Navigate to Pages and create a new project
4. Connect your GitHub repository
5. Set build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Set environment variables:
   ```
   VITE_API_URL=https://your-backend.com
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
7. Deploy

Your app will be available at the Cloudflare Pages URL (or your custom domain if configured).

### Deploy to Static Hosting (GitHub Pages)

```bash
npm run build
# Upload dist/ folder to GitHub Pages
```

## 🧪 Testing

### Run Linter

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

### Manual Testing Checklist

- [ ] User can sign up with email
- [ ] User can sign in with Google OAuth
- [ ] User can create a new invoice
- [ ] User can edit an invoice
- [ ] User can view invoice PDF
- [ ] User can record a payment
- [ ] User can view clients
- [ ] User can view reports
- [ ] Responsive design works on mobile
- [ ] Dark mode toggle works

## 🐛 Troubleshooting

### API Connection Error

```
Error: Failed to fetch from backend
```

**Solution:** Ensure backend is running and `VITE_API_URL` is correct:

```bash
# Check if backend is running
curl http://localhost:5000/
```

### Google OAuth Error

```
Error: [gsi_google_signin]: Credential is undefined
```

**Solution:** Verify `VITE_GOOGLE_CLIENT_ID` is correct and domain is whitelisted.

### CORS Error

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:** This is handled by backend. Ensure `FRONTEND_URL` is set in backend `.env`.

### Hot Module Reload Not Working

```
Failed to update module
```

**Solution:** Restart dev server:

```bash
npm run dev
```

### Build Size Too Large

```
Warning: Asset is 500kB, max recommended is 244kB
```

**Solution:** Code splitting is automatic. Check for large dependencies.

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [TanStack Router](https://tanstack.com/router/latest)
- [TanStack React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Hook Form](https://react-hook-form.com/)

## 🔗 Related Files

- Backend README: `../backend/README.md`
- SQL Schema: `../backend/RestAPI-SQL.sql`
- Environment Example: `.env.example`

## 📄 License

ISC

## 👨‍💻 Support

For issues or questions, create an issue in the repository or contact the development team.

---

**Happy Coding!** 🎉
