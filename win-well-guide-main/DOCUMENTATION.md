# DropShip Pro - Complete Application Documentation

## Overview

DropShip Pro is a comprehensive dropshipping toolkit built with React, TypeScript, and Lovable Cloud (Supabase). It provides AI-powered product analysis, store auditing, supplier management, and competitive intelligence tools.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Lovable Cloud (Supabase) |
| Database | PostgreSQL |
| Authentication | Supabase Auth (Email/Password) |
| AI Integration | Lovable AI Gateway (Gemini 2.5 Flash) |
| State Management | TanStack React Query |
| Routing | React Router v6 |

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Main app layout with navigation
│   │   │   └── BottomNav.tsx      # Mobile bottom navigation
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/
│   │   ├── useAuth.tsx            # Authentication hook & context
│   │   ├── use-mobile.tsx         # Mobile detection hook
│   │   └── use-toast.ts           # Toast notifications hook
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts          # Supabase client (auto-generated)
│   │       └── types.ts           # Database types (auto-generated)
│   ├── pages/
│   │   ├── Index.tsx              # Home/Dashboard
│   │   ├── Auth.tsx               # Login/Signup page
│   │   ├── Account.tsx            # User account settings
│   │   ├── Dashboard.tsx          # Main dashboard
│   │   ├── ProductIntel.tsx       # AI product analysis
│   │   ├── SpyTools.tsx           # Competitor research
│   │   ├── StoreAudit.tsx         # Store CRO auditing
│   │   ├── CROAuditor.tsx         # Conversion rate optimization
│   │   ├── SupplierIndex.tsx      # Supplier management
│   │   └── Install.tsx            # PWA installation
│   ├── App.tsx                    # Main app with routing
│   ├── main.tsx                   # App entry point
│   └── index.css                  # Global styles & design tokens
├── supabase/
│   ├── functions/
│   │   ├── analyze-product/       # AI product analysis endpoint
│   │   ├── audit-store/           # Store audit endpoint
│   │   └── chat/                  # AI chat assistant endpoint
│   ├── migrations/                # Database migrations
│   └── config.toml                # Supabase configuration
├── public/
│   ├── pwa-192x192.png           # PWA icons
│   ├── pwa-512x512.png
│   └── robots.txt
└── Configuration files
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## Database Schema

### Tables

#### 1. `profiles`
Stores user profile information linked to auth.users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| full_name | TEXT | User's display name |
| email | TEXT | User's email |
| avatar_url | TEXT | Profile picture URL |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### 2. `tracked_products`
Products being monitored for dropshipping potential.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner's user ID |
| product_name | TEXT | Product name |
| product_url | TEXT | Source URL |
| source_platform | TEXT | Platform (AliExpress, etc.) |
| price | NUMERIC | Product price |
| image_url | TEXT | Product image |
| trend_score | INTEGER | AI-calculated trend score (1-100) |
| competition_level | TEXT | low/medium/high |
| analysis_data | JSONB | Full AI analysis |
| notes | TEXT | User notes |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

#### 3. `store_audits`
Store audit results and recommendations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner's user ID |
| store_url | TEXT | Audited store URL |
| store_name | TEXT | Store name |
| overall_score | INTEGER | Audit score (1-100) |
| audit_data | JSONB | Detailed audit results |
| recommendations | JSONB | AI recommendations |
| created_at | TIMESTAMPTZ | Audit timestamp |

#### 4. `saved_suppliers`
Curated supplier database.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner's user ID |
| supplier_name | TEXT | Supplier name |
| supplier_url | TEXT | Supplier website |
| platform | TEXT | Platform name |
| rating | INTEGER | User rating (1-5) |
| shipping_times | TEXT | Shipping duration |
| product_categories | TEXT[] | Product categories |
| notes | TEXT | User notes |
| created_at | TIMESTAMPTZ | Creation timestamp |

---

## Row Level Security (RLS) Policies

All tables have RLS enabled with the following policies:

- **SELECT**: Users can only view their own records (`auth.uid() = user_id`)
- **INSERT**: Users can only insert records with their own user_id
- **UPDATE**: Users can only update their own records
- **DELETE**: Users can only delete their own records

---

## Edge Functions (Backend APIs)

### 1. `analyze-product`
**Purpose**: AI-powered product analysis for dropshipping potential.

**Endpoint**: `POST /functions/v1/analyze-product`

**Request Body**:
```json
{
  "productName": "string",
  "productUrl": "string (optional)",
  "productDescription": "string (optional)"
}
```

**Response**:
```json
{
  "analysis": "Markdown formatted analysis including:
    - Trend Score (1-100)
    - Competition Level
    - Profit Potential
    - Target Audience
    - Marketing Angles
    - Potential Risks
    - Recommended Selling Price
    - Verdict (RECOMMENDED/CONSIDER/AVOID)"
}
```

### 2. `audit-store`
**Purpose**: CRO audit for e-commerce stores.

**Endpoint**: `POST /functions/v1/audit-store`

**Request Body**:
```json
{
  "storeUrl": "string",
  "storeName": "string (optional)"
}
```

**Response**:
```json
{
  "audit": "Comprehensive CRO analysis including:
    - Trust Signals
    - Navigation & UX
    - Product Page Optimization
    - Checkout Flow
    - Mobile Responsiveness
    - Loading Speed
    - SEO Basics
    - Overall Score with Recommendations"
}
```

### 3. `chat`
**Purpose**: AI dropshipping assistant for real-time advice.

**Endpoint**: `POST /functions/v1/chat`

**Request Body**:
```json
{
  "message": "string",
  "history": [
    { "role": "user|assistant", "content": "string" }
  ]
}
```

**Response**:
```json
{
  "reply": "AI assistant response"
}
```

---

## Authentication Flow

1. **Signup**: Email/password registration with auto-confirm enabled
2. **Login**: Email/password authentication
3. **Session**: JWT-based session management via Supabase Auth
4. **Protected Routes**: All routes except `/auth` require authentication
5. **Auto-redirect**: Unauthenticated users redirected to `/auth`

---

## Key Features

### 🔍 Product Intelligence
- AI-powered product analysis
- Trend scoring algorithm
- Competition assessment
- Profit margin estimation
- Marketing angle suggestions

### 🏪 Store Auditor
- CRO (Conversion Rate Optimization) analysis
- Trust signal evaluation
- UX/UI assessment
- Mobile responsiveness check
- Actionable recommendations

### 🔎 Spy Tools
- Competitor research capabilities
- Market analysis tools
- Trend identification

### 📦 Supplier Index
- Supplier database management
- Rating and review system
- Shipping time tracking
- Category organization

### 💬 AI Chat Assistant
- Real-time dropshipping advice
- Product recommendations
- Strategy suggestions

---

## Environment Variables

The following environment variables are auto-configured:

| Variable | Description |
|----------|-------------|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_PUBLISHABLE_KEY | Supabase anon key |
| VITE_SUPABASE_PROJECT_ID | Supabase project ID |
| LOVABLE_API_KEY | Lovable AI Gateway key (Edge Functions) |

---

## Design System

### Color Tokens (HSL)
- `--background`: App background
- `--foreground`: Primary text
- `--primary`: Brand color
- `--secondary`: Secondary surfaces
- `--muted`: Muted backgrounds
- `--accent`: Accent highlights
- `--destructive`: Error/danger states

### Typography
- Font family defined in `tailwind.config.ts`
- Responsive text scaling

### Components
All UI components from shadcn/ui library, customized in `src/components/ui/`

---

## PWA Support

The app is configured as a Progressive Web App with:
- Service worker for offline support
- App manifest for installation
- Icons for home screen

---

## Getting Started (Local Development)

```bash
# Clone the repository
git clone <your-github-repo-url>

# Navigate to project
cd <project-name>

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Deployment

The app can be deployed via:
1. **Lovable**: Click "Publish" in the editor
2. **Custom hosting**: Build with `npm run build` and deploy the `dist/` folder

---

## API Rate Limits

- AI endpoints have built-in rate limiting (429 responses)
- Credit exhaustion returns 402 status
- Implement retry logic in frontend for production use

---

*Generated for DropShip Pro - Built with Lovable*
