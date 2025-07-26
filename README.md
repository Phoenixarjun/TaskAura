# TaskAura 🌟

A modern, beautiful task management application built with React, TypeScript, and Framer Motion. TaskAura helps you organize your daily and weekly tasks with an intuitive interface and powerful features.

## ✨ Features

### 📅 **Daily Task Management**
- **Daily Focus**: Plan and track tasks for each day
- **Auto Reset**: Fresh start every day with automatic data isolation
- **Progress Tracking**: Visual progress indicators and completion statistics
- **Smart Storage**: Daily tasks stored with date-based keys (`dailyTasks-YYYY-MM-DD`)

### 📊 **Weekly Planning**
- **Weekly Goals**: Set and manage weekly objectives
- **Progress Visualization**: Beautiful charts showing completion rates
- **Auto Reset**: New week starts automatically on Sunday
- **Task Categories**: Organize tasks with descriptions and priorities

### 🧠 **Learning Tracker**
- **Daily Learning**: Log what you learn each day
- **Streak Counter**: Track your learning streak with animated flame
- **Categories**: Organize learnings by Tech, Life, Finance, Mindset, or Other
- **Timeline View**: Beautiful timeline of your learning journey

### 🎨 **Modern UI/UX**
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Smooth Animations**: Framer Motion powered interactions
- **Responsive Design**: Works perfectly on desktop and mobile
- **Beautiful Charts**: Chart.js integration for data visualization
- **Confetti Celebrations**: Celebrate achievements with animated confetti

### 🔧 **Technical Features**
- **TypeScript**: Fully typed for better development experience
- **Local Storage**: Persistent data without external dependencies
- **Real-time Updates**: Instant feedback and progress tracking
- **Accessibility**: ARIA labels and keyboard navigation support

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TaskAura.git
   cd TaskAura
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
TaskAura/
├── public/
│   ├── Logo.png
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── AddTaskModal.tsx
│   │   ├── ChartCard.tsx
│   │   ├── Footer.tsx
│   │   ├── MotivationalQuote.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StreakDisplay.tsx
│   │   └── ThemeToggle.tsx
│   ├── contexts/
│   │   └── ThemeContext.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Daily.tsx
│   │   ├── Weekly.tsx
│   │   └── Learn.tsx
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── weeklyUtils.ts
│   │   └── dailyProgress.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

## 🎯 Key Components

### **Dashboard**
- Overview of all activities
- Progress trends and statistics
- Quick actions and achievements
- Motivational quotes

### **Daily Page**
- Daily task management
- Real-time progress tracking
- Beautiful progress charts
- Auto-reset functionality

### **Weekly Page**
- Weekly goal planning
- Task categorization
- Progress visualization
- Weekly reset on Sunday

### **Learn Page**
- Daily learning tracker
- Streak counter with animations
- Learning timeline
- Category organization

## 🛠️ Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Framer Motion** - Animations
- **Chart.js** - Data visualization
- **Heroicons** - Icon library
- **React Hot Toast** - Notifications
- **UUID** - Unique ID generation

## 🎨 Design System

### **Colors**
- Primary: `#10b981` (Emerald)
- Secondary: `#6366f1` (Indigo)
- Accent: `#f59e42` (Amber)
- Background: Light/Dark themes

### **Typography**
- Modern, clean fonts
- Responsive sizing
- Proper hierarchy

### **Animations**
- Smooth page transitions
- Micro-interactions
- Loading states
- Celebration effects

## 📱 Responsive Design

TaskAura is fully responsive and works beautifully on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔧 Configuration

### Environment Variables
No environment variables required - the app works entirely client-side with local storage.

### Customization
You can easily customize:
- Colors in CSS variables
- Animations in Framer Motion
- Chart configurations
- Storage keys

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Framer Motion](https://www.framer.com/motion/) for amazing animations
- [Chart.js](https://www.chartjs.org/) for beautiful data visualization
- [Heroicons](https://heroicons.com/) for the icon set
- [Vite](https://vitejs.dev/) for the fast build tool

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

---

**Made with ❤️ by [Your Name]**

*TaskAura - Transform your productivity with beautiful task management*
