# Fairmart Admin Panel

An admin-only web application for managing the Fairmart e-commerce platform.

## Features

### 🏪 Store Management
- View, create, edit, and delete stores
- Manage store owners (users with store role)
- View store products and statistics
- Assign products to stores

### 📦 Catalog Management
- **Products**: Full CRUD operations for products
- **Categories**: Hierarchical category management
- **Brands**: Brand management with logos
- **Attributes**: Product attributes and values
- **Media Library**: Upload and organize media assets

### 👥 User Management
- View all users (admin and store owners)
- Create new users
- Edit user details
- Delete users

### ⚙️ Settings
- Profile management
- Password change
- Activity log

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (Django)

### Installation

1. **Clone and navigate:**
   ```bash
   cd admin-webapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create `.env` file in the `admin/` folder (optional - defaults to window.location.origin):
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_PHOTOS_PAGE_SIZE=24
   ```
   - `VITE_PHOTOS_PAGE_SIZE` – number of photos per page on the Photos page (default: 24).

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
admin-webapp/
├── src/
│   ├── components/      # Reusable UI components
│   ├── config/          # Configuration files
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── catalog/     # Catalog management pages
│   │   ├── home/        # Dashboard
│   │   ├── profile/     # User profile pages
│   │   ├── settings/    # Settings pages
│   │   ├── stores/      # Store management pages
│   │   └── users/       # User management pages
│   ├── routes/          # Routing configuration
│   ├── services/        # API services (RTK Query)
│   ├── store/           # Redux store
│   ├── utils/           # Utility functions
│   └── main.tsx         # Application entry point
├── public/              # Static assets
└── package.json
```

## API Endpoints

The application expects the following backend endpoints:

### Authentication
- `POST /api/auth/login/admin/` - Admin login
- `POST /api/public/forgot-password/admin/` - Password reset request
- `POST /api/public/reset-password/admin/` - Password reset confirmation

### Admin Endpoints (require authentication)
- `/api/admin/users/` - User management
- `/api/admin/stores/` - Store management
- `/api/admin/categories/` - Category management
- `/api/admin/brands/` - Brand management
- `/api/admin/units/` - Unit management
- `/api/admin/products/` - Product management
- `/api/admin/media-assets/` - Media management
- `/api/admin/attributes/` - Attribute management
- `/api/admin/attribute-values/` - Attribute value management

## Authentication

- Only users with `role='admin'` can access this application
- JWT-based authentication with access and refresh tokens
- Automatic token refresh on expiration
- Protected routes redirect to login if not authenticated

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Component-based architecture

## Configuration

### API Base URL
The application uses a smart API URL detection:
1. Checks `VITE_API_URL` environment variable
2. Falls back to `VITE_API_BASE_URL` for backward compatibility
3. Uses `window.location.origin` in production
4. Defaults to `http://127.0.0.1:8000` as last resort

### Environment Variables
```env
# Optional - API base URL (defaults to window.location.origin)
VITE_API_URL=http://localhost:8000

# Alternative (backward compatibility)
VITE_API_BASE_URL=http://localhost:8000
```

## Recent Changes

### v1.0.0 - Admin-Only Transformation
- ✅ Removed all vendor-specific code and features
- ✅ Replaced `vendorCatalogApi` with `adminApi`
- ✅ Updated all pages to use admin endpoints
- ✅ Renamed "vendor" terminology to "store owner"
- ✅ Removed multi-tenant architecture
- ✅ Removed PWA, social media, and URL configuration features
- ✅ Simplified navigation to admin-only features
- ✅ Fixed icon naming conflicts
- ✅ Created `useStoreCurrency` hook for currency formatting

## Known Limitations

1. **Product Options**: Advanced product options (variants) are commented out pending backend implementation
2. **Product Assignment**: Bulk product assignment to stores is commented out
3. **Analytics**: Analytics features have been removed
4. **Customer Management**: Customer-facing features have been removed

## Support

For issues or questions, please refer to:
- `ADMIN_PANEL_SETUP.md` - Detailed setup and migration guide
- Backend API documentation
- Project issue tracker

## License

Proprietary - All rights reserved
