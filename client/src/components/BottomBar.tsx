import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomBar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 shrink-0 z-50 pointer-events-none">
            <div className="bg-[#101204]/90 backdrop-blur-md rounded-full px-2 py-1.5 flex items-center gap-1 shadow-2xl border border-white/10 pointer-events-auto">
                <button className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full transition-all text-xs font-semibold">
                    <span className="material-symbols-outlined text-lg">inbox</span>
                    <span>Bandeja de entrada</span>
                </button>
                <button className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full transition-all text-xs font-semibold">
                    <span className="material-symbols-outlined text-lg">event_note</span>
                    <span>Planificador</span>
                </button>
                <button
                    onClick={() => navigate('/')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-semibold ${isActive('/') ? 'bg-white/10 text-white border-b-2 border-primary' : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                >
                    <span className="material-symbols-outlined text-lg">view_kanban</span>
                    <span>Tablero</span>
                </button>
                <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                <button className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full transition-all text-xs font-semibold border border-purple-500/30">
                    <span className="material-symbols-outlined text-lg">dashboard</span>
                    <span>Cambiar de tablero</span>
                </button>
            </div>
        </div>
    );
}
