# Trello Clone 🗂️

A fullstack Kanban-style task manager inspired by Trello. Built as a portfolio project to practice fullstack development with React and Node.js.

## ✨ Features

- **Guest Mode** — Use the app instantly, no account needed
- **Authentication** — Optional sign up / login
- **Data Migration** — Your guest boards are saved when you create an account
- **Boards, Lists & Cards** — Full Kanban workflow
- **Drag & Drop** — Reorder cards between lists
- **Responsive** — Works on desktop and mobile

## 🛠️ Tech Stack

| Frontend | Backend |
|----------|---------|
| React + TypeScript | Node.js + Express |
| Vite | PostgreSQL |
| Tailwind CSS | JWT Auth |
| React Router | Docker |

## 🚀 Getting Started

### Requirements

- [Node.js](https://nodejs.org/) v16+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the database)

### Run the project

1. Make sure **Docker Desktop is running**
2. Double-click `start_dev.bat`

That's it! The script will start the database, server, and client automatically.

- Frontend → `http://localhost:5173`
- Backend → `http://localhost:5000`

### Environment Variables

Create a `.env` file inside the `server/` folder:

```env
PORT=5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/trello
JWT_SECRET=your_secret_key_here
```

## 🔮 Future Improvements

- [ ] Card due dates and labels
- [ ] Board sharing between users
- [ ] Real-time updates with WebSockets
- [ ] Dark mode

---
