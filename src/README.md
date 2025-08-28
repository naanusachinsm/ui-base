# UI Base - Project Structure

This document describes the folder structure and organization of the UI Base project.

## 📁 Folder Structure

```
src/
├── api/                    # API-related utilities and configurations
├── assets/                 # Static assets (images, icons, etc.)
├── components/             # Reusable UI components
│   ├── ui/                # Base UI primitives (shadcn/ui components)
│   └── *.tsx              # Application-specific components
├── config/                 # Application configuration
│   ├── constants.ts       # App-wide constants
│   └── index.ts           # Config exports
├── constants/              # Static data and constants
│   ├── dashboard-data.json # Sample dashboard data
│   └── index.ts           # Constants exports
├── context/                # React Context providers
│   ├── AppContext.tsx     # Global app state management
│   └── index.ts           # Context exports
├── features/               # Feature-based modules
├── hooks/                  # Custom React hooks
│   └── use-mobile.ts      # Mobile detection hook
├── layouts/                # Layout components
│   ├── DashboardLayout.tsx # Main dashboard layout
│   └── index.ts           # Layout exports
├── pages/                  # Page components
│   ├── Dashboard.tsx      # Dashboard page
│   └── index.ts           # Page exports
├── providers/              # Provider components
├── services/               # API services and utilities
│   ├── api.ts             # HTTP client service
│   └── index.ts           # Service exports
├── stores/                 # State management (Zustand, Redux, etc.)
├── types/                  # TypeScript type definitions
│   └── index.ts           # Common types
├── utils/                  # Utility functions
│   ├── utils.ts           # Common utilities (cn function)
│   └── index.ts           # Utils exports
├── App.tsx                 # Main application component
├── App.css                 # Application styles
├── index.css               # Global styles
├── main.tsx                # Application entry point
└── vite-env.d.ts          # Vite type definitions
```

## 🏗️ Architecture Overview

### **Components**
- **UI Components**: Base primitives from shadcn/ui
- **App Components**: Application-specific components
- **Layout Components**: Page layouts and structure

### **State Management**
- **Context**: React Context for global state
- **Hooks**: Custom hooks for reusable logic
- **Stores**: Ready for additional state management

### **Data & Services**
- **API**: HTTP client and API utilities
- **Services**: Business logic and external integrations
- **Constants**: Static data and configuration

### **Organization**
- **Pages**: Route-level components
- **Features**: Feature-based modules (for larger apps)
- **Types**: TypeScript definitions
- **Utils**: Helper functions and utilities

## 📦 Key Files

### **Entry Points**
- `main.tsx` - Application bootstrap
- `App.tsx` - Root component
- `index.css` - Global styles

### **Configuration**
- `config/constants.ts` - App configuration
- `components.json` - shadcn/ui configuration
- `vite.config.ts` - Build configuration

### **Data**
- `constants/dashboard-data.json` - Sample data
- `types/index.ts` - Type definitions

## 🚀 Usage

### **Importing Components**
```typescript
// From pages
import { Dashboard } from "@/pages"

// From layouts
import { DashboardLayout } from "@/layouts"

// From components
import { Button } from "@/components/ui/button"

// From utilities
import { cn } from "@/utils"

// From types
import type { User, DashboardItem } from "@/types"
```

### **Adding New Features**
1. Create feature folder in `features/`
2. Add components, hooks, and types
3. Export from feature's `index.ts`
4. Import in pages or other components

### **Adding New Pages**
1. Create page component in `pages/`
2. Add to `pages/index.ts`
3. Update routing if needed

## 🎯 Best Practices

- Use barrel exports (index.ts files) for clean imports
- Keep components focused and single-purpose
- Use TypeScript for all new code
- Follow the established naming conventions
- Group related functionality in feature folders
