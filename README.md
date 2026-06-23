# DevTracker — Frontend

A modern, feature-rich developer productivity dashboard built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. Track your coding progress, manage goals, organize study notes, and monitor your career roadmap — all in one sleek interface.

---

## 🚀 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | 18.3.x | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.5.x | Type safety |
| [Vite](https://vitejs.dev/) | 7.x | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.x | Utility-first CSS styling |
| [Framer Motion](https://www.framer.com/motion/) | 12.x | Animations & page transitions |
| [Axios](https://axios-http.com/) | 1.7.x | HTTP client for API calls |
| [Lucide React](https://lucide.dev/) | 0.344.x | Icon library |

---

## 📁 Project Structure

```
frontend/
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── tsconfig.json               # TypeScript base config
├── tsconfig.app.json           # TypeScript app-specific config
├── tsconfig.node.json          # TypeScript node config
├── .env                        # Environment variables (not committed)
└── src/
    ├── main.tsx                # Application entry point
    ├── App.tsx                 # Root component with AuthProvider
    ├── index.css               # Global styles
    ├── vite-env.d.ts           # Vite type declarations
    ├── components/             # Feature components
    │   ├── Auth.tsx            # Login & Register forms
    │   ├── Dashboard.tsx       # Main layout & navigation
    │   ├── DailyGoals.tsx      # Daily goal management
    │   ├── CodingTracker.tsx   # LeetCode problem tracker
    │   ├── LeetCodeStats.tsx   # LeetCode statistics & charts
    │   ├── WebDevTracker.tsx   # Web project tracker
    │   ├── StudyNotes.tsx      # Notes management
    │   ├── Shortcuts.tsx       # Quick reference shortcuts
    │   ├── CareerRoadmap.tsx   # Career progress roadmap
    │   ├── ProfileDashboard.tsx # User profile management
    │   └── PerformanceHeatmap.tsx # Activity heatmap
    ├── contexts/
    │   └── AuthContext.tsx     # Global authentication state
    ├── data/                   # Static reference data
    ├── lib/                    # Utility libraries (e.g., axios instance)
    ├── types/                  # TypeScript type definitions
    └── utils/                  # Helper functions
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A running instance of the [DevTracker Backend](../backend/README.md)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `frontend/` directory (copy from `.env.example` if available):

```env
VITE_API_URL=http://localhost:5000/api
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL for the backend API | `http://localhost:5000/api` |

> **Note:** All Vite environment variables must be prefixed with `VITE_` to be accessible in the browser.

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173** with Hot Module Replacement (HMR) enabled.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with HMR |
| `npm run build` | Build the optimized production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check for code issues |
| `npm run typecheck` | Run TypeScript type checking without emitting files |

---

## 🧩 Key Features & Components

### 🔐 Authentication (`Auth.tsx`)
- JWT-based login and registration
- Animated form transitions using Framer Motion
- Token stored and managed via `AuthContext`

### 📊 Dashboard (`Dashboard.tsx`)
- Sidebar navigation with animated tab switching
- Responsive layout for all feature panels
- Persistent active tab state

### ✅ Daily Goals (`DailyGoals.tsx`)
- Create, complete, and delete daily goals
- Filter by status (all / pending / completed)
- Daily score tracking

### 💻 Coding Tracker (`CodingTracker.tsx`)
- Log solved LeetCode problems (Easy / Medium / Hard)
- Track problem name, topic tags, and notes
- View problem history with filters

### 📈 LeetCode Stats (`LeetCodeStats.tsx`)
- Visual breakdown by difficulty
- Topic distribution charts
- Streak and streak analytics

### 🌐 Web Dev Tracker (`WebDevTracker.tsx`)
- Track personal web projects
- Record tech stack and project links
- Upload and store project thumbnails via Cloudinary

### 📝 Study Notes (`StudyNotes.tsx`)
- Rich markdown-style notes per topic
- Search and filter notes
- CRUD operations synced with the backend

### ⌨️ Shortcuts (`Shortcuts.tsx`)
- Store and organize keyboard shortcuts or quick references
- Categorized view for fast lookup

### 🗺️ Career Roadmap (`CareerRoadmap.tsx`)
- Visual milestone-based career progress tracker
- Mark goals as in-progress or completed

### 👤 Profile Dashboard (`ProfileDashboard.tsx`)
- Update avatar (via Cloudinary upload)
- Edit bio, skills, social links
- Account settings

### 🔥 Performance Heatmap (`PerformanceHeatmap.tsx`)
- GitHub-style contribution heatmap
- Daily activity visualization over months

---

## 🎨 Styling

- Uses **Tailwind CSS** for utility-first styling
- Dark-themed UI (`bg-black`, `bg-gray-900`) with **cyan accent colors** (`text-cyan-400`)
- Smooth page/component transitions with **Framer Motion**
- Custom global styles defined in `src/index.css`

---

## 🔗 API Integration

All API calls are made to the backend REST API. The Axios base instance is configured in `src/lib/` and automatically attaches the JWT token from `localStorage` to every request header:

```
Authorization: Bearer <token>
```

API base URL is configured via the `VITE_API_URL` environment variable.

---

## 🏗️ Building for Production

```bash
npm run build
```

The production-ready static files will be output to the `dist/` directory. You can then serve them with any static file host (e.g., Vercel, Netlify, Nginx).

---

## △ Deploying to Vercel

Vercel is the recommended platform for hosting the React/Vite frontend.

### Prerequisites
- Your project is pushed to a **GitHub** (or GitLab) repository
- You have a [Vercel account](https://vercel.com) (free Hobby tier is sufficient)
- Your backend is already deployed on Render (you’ll need its URL)

### Step 1 — Create a `vercel.json` (SPA Routing Fix)

Create a `vercel.json` file in the `frontend/` directory to ensure client-side routing works correctly:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Commit and push this file before deploying.

### Step 2 — Import Your Repository on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and click **"Add New Project"**
2. Click **"Import"** next to your DevTracker repository
3. Configure the project:

| Setting | Value |
|---|---|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` *(auto-detected)* |
| **Output Directory** | `dist` *(auto-detected)* |
| **Install Command** | `npm install` *(auto-detected)* |

### Step 3 — Add Environment Variables

Before clicking Deploy, expand **"Environment Variables"** and add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://devtracker-backend.onrender.com/api` |

> Replace `devtracker-backend` with the actual name of your Render service.

### Step 4 — Deploy

1. Click **"Deploy"** — Vercel will install dependencies, build the app, and publish it
2. In ~1-2 minutes your app will be live at:
   ```
   https://devtracker-frontend.vercel.app
   ```
   (Vercel generates a unique URL — you can add a custom domain later)

### Step 5 — Update CORS on the Backend

Now that the frontend URL is known, go back to your **Render** dashboard:

1. Open your backend service → **Environment** tab
2. Update the `CLIENT_URL` variable:
   ```
   CLIENT_URL=https://devtracker-frontend.vercel.app
   ```
3. Click **"Save Changes"** — Render will auto-redeploy the backend

### Step 6 — Verify End-to-End

1. Open your Vercel URL in the browser
2. Try **registering** a new account — it should call the Render backend and store data in MongoDB Atlas
3. **Log in** and navigate between all dashboard tabs

### Post-Deploy Notes

- **Auto-Deploy:** Vercel automatically redeploys on every push to your configured branch (default: `main`)
- **Preview Deployments:** Every Pull Request gets its own preview URL automatically
- **Custom Domain:** Add a custom domain in Vercel under **Settings → Domains**
- **Env Vars per Environment:** You can set different `VITE_API_URL` values for Production, Preview, and Development environments in the Vercel dashboard

---

## 🚦 Full Deployment Checklist

```
[ ] MongoDB Atlas cluster created & connection string copied
[ ] Cloudinary account set up & credentials copied
[ ] Code pushed to GitHub
[ ] vercel.json added to frontend/
[ ] Backend deployed on Render with all env vars set
[ ] MongoDB Atlas Network Access allows 0.0.0.0/0
[ ] Backend health check responds: /api/health → { status: 'ok' }
[ ] Frontend deployed on Vercel with VITE_API_URL set to Render URL
[ ] CLIENT_URL on Render updated to the Vercel frontend URL
[ ] End-to-end login/register tested
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is for personal/educational use. See the root [LICENSE](../LICENSE) file for details.
