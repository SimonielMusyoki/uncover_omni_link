# Vite Migration Prompt: Omni-Link Supply Chain Management System

## Project Overview
Create a React + TypeScript + Vite application that recreates the Omni-Link Supply Chain Management System. This is an enterprise-grade supply chain management dashboard for Uncover Skincare with multi-region support (Kenya & Nigeria), integrating with Shopify, Odoo ERP, QuickBooks, and delivery platforms (Leta AI, Renda WMS).

## Initial Setup

### 1. Create Vite Project
```bash
npm create vite@latest uncover-omni-link -- --template react-ts
cd uncover-omni-link
```

### 2. Install Dependencies
```bash
# Core dependencies
npm install react-router-dom date-fns lucide-react

# Development dependencies
npm install -D tailwindcss@4 postcss autoprefixer @types/node
npm install -D @tailwindcss/postcss eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 3. Initialize Tailwind CSS v4
```bash
npx tailwindcss init -p
```

## Project Structure
```
uncover-omni-link/
├── public/
│   └── icons/              # Platform icons (shopify.png, odoo.png, qbo.png, leta.png, renda.png)
├── src/
│   ├── main.tsx           # Entry point (replaces Next.js _app)
│   ├── App.tsx            # Root component with router
│   ├── index.css          # Global styles
│   ├── routes/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Orders.tsx
│   │   ├── OrderDetail.tsx
│   │   ├── Requests.tsx
│   │   ├── RequestDetail.tsx
│   │   ├── Inventory.tsx
│   │   ├── Warehouse.tsx
│   │   ├── Shipments.tsx
│   │   ├── Users.tsx
│   │   ├── Settings.tsx
│   │   ├── Transfers.tsx
│   │   ├── Mappings.tsx
│   │   └── Sales.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── ui/
│   │       ├── Badges.tsx
│   │       ├── Toast.tsx
│   │       ├── ProductForm.tsx
│   │       ├── ProductDetailModal.tsx
│   │       ├── UserInviteForm.tsx
│   │       ├── WarehouseForm.tsx
│   │       ├── TransferInventoryModal.tsx
│   │       ├── SyncStep.tsx
│   │       └── SidebarItem.tsx
│   └── lib/
│       ├── constants/
│       │   └── config.ts
│       ├── utils/
│       │   ├── time.ts
│       │   ├── avatar.ts
│       │   └── currency.ts
│       ├── types.ts
│       ├── data.ts
│       └── context.tsx
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

## Configuration Files

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tsconfig.node.json
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        foreground: '#0f172a',
        'deep-navy': '#0f172a',
        primary: '#6366f1',
        'action-blue': '#3b82f6',
        'bg-light': '#f1f5f9',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### src/index.css
```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');

:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --deep-navy: #0f172a;
  --primary: #6366f1;
  --action-blue: #3b82f6;
  --bg-light: #f1f5f9;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
}

body {
  margin: 0;
  padding: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
}

/* Custom scrollbar styles */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

### package.json (scripts section)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

## Main Application Files

### src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### src/App.tsx
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/lib/context';
import { AppShell } from '@/components/layout/AppShell';
import Dashboard from '@/routes/Dashboard';
import Orders from '@/routes/Orders';
import OrderDetail from '@/routes/OrderDetail';
import Requests from '@/routes/Requests';
import RequestDetail from '@/routes/RequestDetail';
import Inventory from '@/routes/Inventory';
import Warehouse from '@/routes/Warehouse';
import Shipments from '@/routes/Shipments';
import Users from '@/routes/Users';
import Settings from '@/routes/Settings';
import Transfers from '@/routes/Transfers';
import Mappings from '@/routes/Mappings';
import Sales from '@/routes/Sales';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="requests" element={<Requests />} />
            <Route path="requests/:id" element={<RequestDetail />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="warehouse" element={<Warehouse />} />
            <Route path="shipments" element={<Shipments />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="mappings" element={<Mappings />} />
            <Route path="sales" element={<Sales />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
```

### src/components/layout/AppShell.tsx
```typescript
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toast } from '@/components/ui/Toast';

export function AppShell() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
      <Toast />
    </div>
  );
}
```

## Key Implementation Notes

### 1. Routing Changes
- **Next.js App Router** → **React Router v6**
- File-based routing (`app/(dashboard)/page.tsx`) → Component-based routing (`<Route path="/" element={<Dashboard />} />`)
- Dynamic routes: `app/orders/[id]/page.tsx` → `<Route path="orders/:id" element={<OrderDetail />} />`
- Use `useParams()` hook to access route parameters: `const { id } = useParams();`
- Use `useNavigate()` for programmatic navigation: `const navigate = useNavigate(); navigate('/orders');`
- Replace `<Link href="/orders">` with `<Link to="/orders">`

### 2. Metadata & Head Management
- **Next.js**: `export const metadata = { title: '...' }`
- **Vite**: Use `react-helmet-async` or manually update document.title in useEffect
```typescript
import { useEffect } from 'react';

function Dashboard() {
  useEffect(() => {
    document.title = 'Dashboard | Omni-Link';
  }, []);
  
  return (/* ... */);
}
```

### 3. Font Loading
- **Next.js**: `import { Montserrat } from "next/font/google"`
- **Vite**: Load via Google Fonts CDN in index.css (as shown above)

### 4. Image Handling
- **Next.js**: `<Image src="/icons/shopify.png" />`
- **Vite**: `<img src="/icons/shopify.png" />` (public folder)
- Place all static assets in `public/` folder

### 5. Path Aliases
- Both use `@/*` alias but configured differently
- Vite: Configure in `vite.config.ts` (see above)
- Import statements remain the same: `import { useApp } from '@/lib/context'`

### 6. Environment Variables
- **Next.js**: `process.env.NEXT_PUBLIC_*`
- **Vite**: `import.meta.env.VITE_*`
- Create `.env` file with `VITE_` prefix for public variables

## Core Library Files (Copy As-Is)

These files can be copied directly from the Next.js version with minimal or no changes:

### 1. State Management & Data
- ✅ `src/lib/context.tsx` - React Context provider (no changes needed)
- ✅ `src/lib/types.ts` - TypeScript type definitions (no changes needed)
- ✅ `src/lib/data.ts` - Mock data and initial state (no changes needed)

### 2. Constants & Utilities
- ✅ `src/lib/constants/config.ts` - Application constants (no changes needed)
- ✅ `src/lib/utils/time.ts` - Time formatting utilities (no changes needed)
- ✅ `src/lib/utils/avatar.ts` - Avatar generation utilities (no changes needed)
- ✅ `src/lib/utils/currency.ts` - Currency conversion utilities (no changes needed)

### 3. UI Components
All component files in `components/ui/` and `components/layout/` can be copied as-is:
- ✅ `Badges.tsx` - Status badge components
- ✅ `Toast.tsx` - Toast notification component
- ✅ `ProductForm.tsx` - Product form modal
- ✅ `ProductDetailModal.tsx` - Product details modal
- ✅ `UserInviteForm.tsx` - User invitation form
- ✅ `WarehouseForm.tsx` - Warehouse form
- ✅ `TransferInventoryModal.tsx` - Inventory transfer modal
- ✅ `SyncStep.tsx` - Sync status indicator
- ✅ `SidebarItem.tsx` - Sidebar navigation item
- ✅ `Header.tsx` - Page header component

## Page Components Migration

All page components in `app/(dashboard)/` need to be migrated to `src/routes/`. Key changes:

### Update Imports
```typescript
// Next.js
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Vite/React Router
import { useNavigate, useParams, Link } from 'react-router-dom';
```

### Update Navigation
```typescript
// Next.js
const router = useRouter();
router.push('/orders');

// Vite/React Router
const navigate = useNavigate();
navigate('/orders');
```

### Update Links
```typescript
// Next.js
<Link href="/orders">Orders</Link>

// Vite/React Router
<Link to="/orders">Orders</Link>
```

### Remove 'use client' Directive
- Next.js requires `"use client"` at the top of client components
- Vite/React doesn't need this - remove it from all files

### Update Dynamic Routes
```typescript
// Next.js (app/orders/[id]/page.tsx)
export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = params.id;
  // ...
}

// Vite (src/routes/OrderDetail.tsx)
import { useParams } from 'react-router-dom';

export default function OrderDetail() {
  const { id: orderId } = useParams<{ id: string }>();
  // ...
}
```

## Application Features

### Core Functionality
1. **Dashboard** - KPI cards, recent orders, activity feed, integration status
2. **Orders** - Order management with Shopify integration, sync to Odoo/QuickBooks/delivery platforms
3. **Requests** - Product request workflow (request → approve → ready → collect)
4. **Inventory** - Product catalog, stock levels, categories, warehouse assignments
5. **Warehouse** - Multi-warehouse management (Kenya/Nigeria regions)
6. **Shipments** - Inbound shipment tracking, receiving, inventory updates
7. **Users** - Team management, roles, permissions, preferences
8. **Settings** - User preferences, notifications, timezone
9. **Transfers** - Inter-warehouse inventory transfers
10. **Mappings** - Product ID mappings across platforms (Shopify, Odoo, QuickBooks, delivery platforms)
11. **Sales** - Sales analytics with date range filtering, revenue tracking

### Data Models
Key entities (defined in `types.ts`):
- Order (with sync status to Odoo, QuickBooks, delivery platforms)
- Product (multi-currency pricing: USD, KES, NGN)
- ProductRequest (approval workflow)
- Warehouse (regional: Kenya/Nigeria)
- Shipment (inbound inventory tracking)
- User (role-based access)
- ProductMapping (cross-platform ID mapping)
- Integration (platform connection status)

### State Management
- React Context API (`AppProvider` in `lib/context.tsx`)
- Mock data for development (`lib/data.ts`)
- Toast notifications for user feedback
- Simulated async operations with setTimeout

### Integrations
- **Shopify Kenya** - E-commerce platform (B2C orders)
- **Shopify Nigeria** - E-commerce platform (B2C orders)
- **Odoo ERP** - Sales orders and invoicing
- **QuickBooks** - Financial accounting
- **Leta AI** - Kenya delivery platform
- **Renda WMS** - Nigeria warehouse/delivery platform

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```
Access at `http://localhost:5173` (Vite default port)

### 2. Build for Production
```bash
npm run build
```
Output in `dist/` folder

### 3. Preview Production Build
```bash
npm run preview
```

## Migration Checklist

- [ ] Create Vite project with TypeScript template
- [ ] Install all dependencies
- [ ] Configure Tailwind CSS v4
- [ ] Set up path aliases in vite.config.ts
- [ ] Copy and adapt global styles (index.css)
- [ ] Copy lib files (context, types, data, constants, utils) - no changes needed
- [ ] Copy UI components - no changes needed
- [ ] Update Sidebar component to use React Router Link
- [ ] Create AppShell component with Outlet for nested routes
- [ ] Migrate all page components from app/(dashboard)/ to src/routes/
- [ ] Update all navigation (useRouter → useNavigate, href → to)
- [ ] Update dynamic routes to use useParams
- [ ] Remove all "use client" directives
- [ ] Add document.title updates in page components
- [ ] Test all routes and navigation
- [ ] Test all CRUD operations
- [ ] Test all modals and forms
- [ ] Verify toast notifications work
- [ ] Test responsive design
- [ ] Build and preview production version

## Additional Considerations

### Docker Support (Optional)
If you want Docker support like the original:

**Dockerfile**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Performance Optimizations
- All Badge components use `React.memo()` for optimal re-render prevention
- Context provider value is memoized with `useMemo()`
- Utility functions extracted to module scope
- Lazy load routes with `React.lazy()` for code splitting (optional)

### TypeScript Strict Mode
The project uses TypeScript strict mode for maximum type safety. Ensure all props are properly typed.

## Summary

This migration guide provides everything needed to recreate the Omni-Link Supply Chain Management System using Vite instead of Next.js. The key differences are:

1. **Routing**: Next.js App Router → React Router v6
2. **Build Tool**: Next.js → Vite
3. **Entry Point**: Next.js automatic → explicit main.tsx
4. **Metadata**: Next.js metadata API → manual document.title updates
5. **Fonts**: Next.js font optimization → Google Fonts CDN

All business logic, components, styling, and state management remain identical. The core application code (lib/, components/) requires minimal to no changes.
