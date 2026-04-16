import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { TagProvider } from './context/TagContext';
import Dashboard from './pages/Dashboard';
import BoardView from './pages/BoardView';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

import { useContext } from 'react';
import LoadingSpinner from './components/ui/LoadingSpinner';

function AppContent() {
    const { loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background-dark text-white font-sans">
                <LoadingSpinner size="lg" color="text-trello-blue" />
                <p className="mt-4 text-text-muted animate-pulse">Cargando sesión...</p>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/board/:boardId" element={<BoardView />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <TagProvider>
                <AppContent />
            </TagProvider>
        </AuthProvider>
    );
}

export default App;
