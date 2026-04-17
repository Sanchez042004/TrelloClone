import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getBoards, createBoard, deleteBoard } from '../services/api';
import Skeleton from '../components/ui/Skeleton';
import LoadingSpinner from '../components/ui/LoadingSpinner';

import Sidebar from '../components/Sidebar';
import CreateBoardPopover from '../components/CreateBoardPopover';
import TopNav from '../components/TopNav';

interface Board {
    id: number;
    title: string;
    background?: string;
    created_at: string;
}

const BOARD_GRADIENTS = [
    'from-blue-600 to-indigo-700',
    'from-purple-600 to-pink-600',
    'from-emerald-600 to-teal-600',
    'from-orange-600 to-red-600',
];

const getBgClass = (background?: string, index: number = 0) => {
    const defaultBg = BOARD_GRADIENTS[index % BOARD_GRADIENTS.length];
    const bg = background || defaultBg;
    if (bg.startsWith('from-')) return `bg-gradient-to-br ${bg}`;
    return bg;
};

export default function Dashboard() {
    const { user, guestId, isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const [boards, setBoards] = useState<Board[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreatingBoard, setIsCreatingBoard] = useState(false);
    const [isDeletingBoard, setIsDeletingBoard] = useState(false);
    const [boardToDelete, setBoardToDelete] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Tableros | Trello Clone';
        return () => { document.title = 'Trello Clone'; };
    }, []);

    useEffect(() => {
        document.title = 'Iniciar sesión | Trello Clone';
        return () => { document.title = 'Trello Clone'; };
    }, []);

    useEffect(() => {
        if (!authLoading) {
            fetchBoards();
        }
    }, [user, guestId, authLoading]);

    const fetchBoards = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await getBoards();
            setBoards(response.data);
        } catch (error) {
            console.error('Error fetching boards:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleCreateBoard = async (title: string, background: string) => {
        try {
            setIsCreatingBoard(true);
            await createBoard(title, background);
            setIsCreating(false);
            fetchBoards(true);
        } catch (error) {
            console.error('Error creating board:', error);
        } finally {
            setIsCreatingBoard(false);
        }
    };

    const confirmDelete = async () => {
        if (!boardToDelete) return;
        try {
            setIsDeletingBoard(true);
            const id = boardToDelete;
            await deleteBoard(id);
            setBoards(boards.filter(b => b.id !== id));
            setBoardToDelete(null);
        } catch (error) {
            console.error('Error deleting board:', error);
            fetchBoards();
        } finally {
            setIsDeletingBoard(false);
        }
    };

    const filteredBoards = boards.filter(b => {
        const query = searchQuery.toLowerCase();
        return b.title.toLowerCase().split(/\s+/).some(word => word.startsWith(query));
    });

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-dark text-text-main font-sans">
            <TopNav 
                searchValue={searchQuery} 
                onSearchChange={setSearchQuery} 
                hasResults={filteredBoards.length > 0} 
                results={filteredBoards.map(b => ({ ...b, type: 'board' }))}
                placeholder="Buscar tableros"
            />
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />

                <main className="flex-1 overflow-y-auto custom-scrollbar relative px-11 pt-8 pb-20">
                    {!isAuthenticated && (
                        <div className="mb-8 bg-selection-bg border border-trello-blue/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="flex items-center gap-4 text-center sm:text-left">
                                <div className="w-10 h-10 rounded-full bg-trello-blue/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-trello-blue text-[24px]">cloud_upload</span>
                                </div>
                                <div>
                                    <p className="text-[15px] font-bold text-text-main leading-tight">
                                        Guarda tu progreso de forma gratuita
                                    </p>
                                    <p className="text-[13px] text-text-muted mt-1">
                                        Estás en modo invitado. Regístrate ahora para guardar tus tableros permanentemente en tu propia cuenta.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/register')}
                                className="whitespace-nowrap bg-[#579dff] hover:bg-[#85b8ff] text-[#172b4d] px-5 py-2.5 rounded-[8px] font-bold text-[14px] transition-all shadow-sm active:scale-95"
                            >
                                Registrarse gratis
                            </button>
                        </div>
                    )}

                    <h1 className="text-xl font-bold text-text-main mb-4">Tableros</h1>

                    {/* Boards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                        {/* Create Board Card */}
                        <div className="relative group">
                            <div
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsCreating(!isCreating);
                                }}
                                className="h-[148px] rounded-[14px] bg-[#2b2c2f] hover:bg-[#323336] flex items-center justify-center cursor-pointer transition-colors border border-[#2B2C2F] shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                            >
                                <span className="text-[14px] font-semibold text-[#CECFD2]">Crear un tablero nuevo</span>
                            </div>

                            {/* Popover */}
                            {isCreating && (
                                <div className="absolute top-0 left-full ml-2 z-50">
                                    <CreateBoardPopover
                                        onClose={() => setIsCreating(false)}
                                        loading={isCreatingBoard}
                                        onCreate={(title, background) => {
                                            handleCreateBoard(title, background);
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Board Cards */}
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-[148px] rounded-[14px]" />
                            ))
                        ) : (
                            boards.map((board, index) => (
                                <div
                                    key={board.id}
                                    className="group cursor-pointer relative"
                                    onClick={() => navigate(`/board/${board.id}`)}
                                >
                                    <div className="h-[148px] rounded-[14px] overflow-hidden relative transition-all border border-[#2B2C2F] shadow-[0_2px_4px_rgba(0,0,0,0.2)] flex flex-col bg-[#1d2125]">
                                        {/* Board Background (Top Part) */}
                                        <div className="relative flex-grow overflow-hidden">
                                            <div className={`absolute inset-0 ${getBgClass(board.background, index)} opacity-100 group-hover:opacity-90 transition-opacity`} />
                                            {/* Delete Button (Top Right) */}
                                            <div className="relative z-10 p-2 flex justify-end">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setBoardToDelete(board.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded transition-all shrink-0"
                                                    title="Eliminar tablero"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Title Footer (Bottom Part) */}
                                        <div className="bg-[#1d2125] px-3 py-2.5 border-t border-[#3e474f]/30">
                                            <span className="text-[#CECFD2] text-[14px] font-bold truncate block">{board.title}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>

            {/* Delete Modal */}
            {boardToDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card-dark w-full max-w-sm rounded-lg shadow-2xl p-6 border border-border-dark animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-text-main mb-2">¿Eliminar tablero?</h3>
                        <p className="text-text-muted text-sm mb-6">El tablero se eliminará permanentemente y no podrás recuperarlo.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setBoardToDelete(null)} className="px-4 py-2 rounded hover:bg-hover-dark text-text-main text-sm font-medium transition-colors">Cancelar</button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeletingBoard}
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 min-w-[100px]"
                            >
                                {isDeletingBoard ? (
                                    <>
                                        <LoadingSpinner size="sm" color="text-white" />
                                        <span>Eliminando...</span>
                                    </>
                                ) : (
                                    'Eliminar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
