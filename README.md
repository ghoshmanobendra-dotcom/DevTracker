# DevTracker 🚀

**The ultimate productivity & career growth platform for developers.**  
Track goals, visualize roadmaps, sync LeetCode stats, and master your coding journey with a futuristic, gamified dashboard.

![DevTracker Badge](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=react)
![Tech Stack](https://img.shields.io/badge/Tech-React_Typescript_Supabase-blue?style=for-the-badge)

## ✨ Features

### 🖥️ **Command Center Dashboard**
A "Dark Cyber" aesthetic UI designed for focus and motivation. Features glassmorphism, glowing accents, and smooth Framer Motion animations.

### 🗺️ **Interactive Career Roadmaps**
Comprehensive, step-by-step guides for multiple career paths. Track your progress phase-by-phase:
- **Web Developer** (HTML, CSS, React, Next.js, DevOps)
- **Data Scientist** (Python, Math, ML, Deep Learning)
- **Software Developer** (CS Foundations, Languages, System Design)

### 💻 **LeetCode Integration**
Connect your LeetCode account to visualize:
- **Live Stats**: Solved count, easy/medium/hard breakdown, and acceptance rate.
- **Streak Tracking**: Keep your daily coding streak alive.
- **Quick Actions**: Sync instantly or jump straight to your profile.

### 🎯 **Productivity Tools**
- **Daily Goals**: Set and check off daily tasks with satisfying micro-interactions.
- **Efficiency Heatmap**: Github-style contribution graph to visualize your consistency over time.
- **Learning Shortcuts**: Quick-access links to your most used documentation and resources.
- **Study Notes**: A built-in knowledge base with tagging and file attachments.
- **Coding Problem Tracker**: Maintain a custom database of DSA problems you've attempted, complete with difficulty filters and notes.

---

## 🛠️ Tech Stack

- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Backend / Database:** [Supabase](https://supabase.com/) (PostgreSQL & Auth)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/daily-goals.git
   cd daily-goals
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to `http://localhost:5173` to see the app in action.

---

## 🗄️ Database Schema (Supabase)

This project uses Supabase. Ensure your database has the following tables:
- `profiles`: Stores user stats (score, streak, social links).
- `daily_goals`: Tracks individual daily tasks.
- `daily_scores`: Historical record of daily scores for the heatmap.
- `coding_problems`: Custom tracking for DSA problems.
- `study_notes`: User's study notes and attachments.
- `shortcuts`: Quick links and file shortcuts.
- `career_progress`: Many-to-many relationship tracking completed roadmap topics.

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new roadmaps or dashboard widgets:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
