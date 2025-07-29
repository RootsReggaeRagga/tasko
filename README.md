# Tasko

A modern task management application built with React, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📦 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deployment Options:

**Netlify:**
- Connect your repository
- Build command: `pnpm build`
- Publish directory: `dist`

**Vercel:**
- Connect your repository
- Framework preset: Vite
- Build command: `pnpm build`
- Output directory: `dist`

**GitHub Pages:**
- Push to main branch (automatic deployment via GitHub Actions)
- Or manually: `pnpm build` then upload `dist/` contents

## 🛠️ Features

- ✅ Task management with time tracking
- ✅ Kanban board with drag & drop
- ✅ Project and client management
- ✅ Team collaboration
- ✅ Financial tracking (costs, revenue, profit)
- ✅ Dark/light mode
- ✅ Responsive design
- ✅ Local storage persistence

## 📊 Financial Features

- Hourly rate tracking for tasks
- Project budget and revenue management
- Cost calculation based on time spent
- Profit/loss analysis in Reports
- Financial overview dashboard

## 🔧 Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand
- **Routing:** React Router DOM
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Charts:** Recharts
- **Authentication:** Supabase (optional)

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utilities and store
├── types/         # TypeScript type definitions
└── main.tsx       # Application entry point
```

## 🎯 Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Start development server: `pnpm dev`
4. Open [http://localhost:5173](http://localhost:5173)

## 📝 License

MIT License - see LICENSE file for details.
