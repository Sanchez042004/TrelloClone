import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TagProvider } from './context/TagContext';
import Dashboard from './pages/Dashboard';
import BoardView from './pages/BoardView';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <TagProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/board/:boardId" element={<BoardView />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </Router>
            </TagProvider>
        </AuthProvider>
    );
}

export default App;
