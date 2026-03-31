# Trello Clone - Junior Portfolio Project

A fullstack Trello-like Kanban application built with React, Express, and PostgreSQL. Features a unique **Guest Mode** that allows users to start organizing immediately without signup, with optional account creation that preserves their data.

## 🚀 Features

- **Guest Mode**: Start using the app immediately without registration
- **User Authentication**: Optional login/register with JWT
- **Data Migration**: Guest data automatically transfers to user account upon registration
- **Kanban Boards**: Create multiple boards with lists and cards
- **Drag & Drop**: Move cards between lists seamlessly
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- React Router
- @hello-pangea/dnd (drag and drop)
- Axios

### Backend
- Node.js
- Express
- PostgreSQL
- JWT Authentication
- bcryptjs

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL (running in Docker or locally)

### Database Setup

1. Create a PostgreSQL database named `trello`:
```bash
docker exec -it <postgres-container> psql -U postgres -c "CREATE DATABASE trello;"
```

2. Initialize the database schema:
```bash
cd server
node initDb.js
```

### Backend Setup

```bash
cd server
npm install
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The client will run on `http://localhost:5173`

## 🔑 Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/trello
JWT_SECRET=supersecretkey_change_me_in_prod
```

## 📖 Usage

1. Open `http://localhost:5173` in your browser
2. Start creating boards as a guest
3. Optionally register to save your progress
4. All your guest boards will be automatically migrated to your account

## 🏗️ Project Structure

```
trello/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Dashboard, BoardView, Login, Register
│   │   └── services/      # API service layer
│   └── ...
├── server/                # Backend Express app
│   ├── controllers/       # Auth, Board, List, Card controllers
│   ├── middleware/        # Auth middleware
│   ├── routes/            # API routes
│   ├── utils/             # JWT generator
│   ├── db.js              # Database connection
│   ├── schema.sql         # Database schema
│   └── index.js           # Server entry point
└── README.md
```

## 🎯 Key Features Explained

### Guest Mode
- Generates a unique `guestId` stored in localStorage
- All boards created are associated with this `guestId`
- No authentication required to use the app

### Data Migration
- When a guest registers, the backend receives the `guestId`
- All boards with that `guestId` are updated to the new `userId`
- The `guestId` is cleared from those boards
- User can now access their boards from any device

## 📝 API Endpoints

### Auth
- `POST /auth/register` - Create account (with optional guestId)
- `POST /auth/login` - Login
- `GET /auth/is-verify` - Verify token

### Boards
- `GET /boards` - Get all boards (user or guest)
- `POST /boards` - Create board
- `DELETE /boards/:id` - Delete board

### Lists
- `GET /lists/board/:boardId` - Get lists for a board
- `POST /lists` - Create list
- `DELETE /lists/:id` - Delete list

### Cards
- `GET /cards/list/:listId` - Get cards for a list
- `POST /cards` - Create card
- `PUT /cards/:id` - Update card (for drag & drop)
- `DELETE /cards/:id` - Delete card

## 🎨 Design Decisions

- **TypeScript**: Used in frontend for type safety
- **Tailwind CSS**: For rapid UI development
- **@hello-pangea/dnd**: Maintained fork of react-beautiful-dnd for React 18
- **JWT**: Simple authentication without sessions
- **Optional Auth Middleware**: Supports both authenticated and guest users

## 📄 License

MIT

---

Built with ❤️ as a Junior Fullstack Portfolio Project
