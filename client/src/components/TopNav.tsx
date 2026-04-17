import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
    id: number;
    title: string;
    subtitle?: string;
    type: 'board' | 'card';
    background?: string;
    boardId?: number;
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

interface TopNavProps {
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    hasResults?: boolean;
    results?: SearchResult[];
    placeholder?: string;
}

export default function TopNav({ searchValue = '', onSearchChange, hasResults = true, results = [], placeholder = 'Buscar' }: TopNavProps) {
    const { user, logout, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (menuRef.current && !menuRef.current.contains(target)) {
                setIsMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(target)) {
                setIsSearchOpen(false);
                // Clear query only if we are actually clicking "outside" of the search area
                if (searchValue.trim() !== '') {
                    onSearchChange?.('');
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onSearchChange, searchValue]); // Added searchValue to track current query state

    return (
        <nav className="bg-[#1F1F21] border-b border-white/10 px-3 h-12 flex items-center justify-between text-white shrink-0 z-50">
            <div className="flex items-center gap-4">
                <div 
                    onClick={() => navigate('/')} 
                    className="flex items-center gap-2 cursor-pointer group hover:bg-white/10 transition-colors rounded-[3px] px-1.5 py-1 ml-0"
                >
                    <img 
                        src="/Logo Trello Clone.png" 
                        alt="Trello Clone Logo" 
                        className="h-[20px] w-auto object-contain select-none"
                        draggable="false"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative group" ref={searchRef}>
                    <span className="material-symbols-outlined absolute left-2 top-1.5 text-[#9facbd] group-focus-within:text-[#579dff] text-[18px] transition-colors">search</span>
                    <input
                        className="bg-[#22272b] border border-white/20 rounded-[3px] h-8 pl-8 pr-4 text-sm w-48 focus:w-64 focus:bg-[#2c333a] focus:text-white focus:border-[#579dff] transition-all placeholder:text-[#9facbd] outline-none"
                        placeholder={placeholder}
                        value={searchValue}
                        onFocus={() => setIsSearchOpen(true)}
                        onChange={(e) => {
                            onSearchChange?.(e.target.value);
                            setIsSearchOpen(true);
                        }}
                    />

                    {isSearchOpen && searchValue.trim() !== '' && !hasResults && (
                        <div className="absolute right-0 top-10 w-[320px] bg-[#22272b] border border-white/10 shadow-2xl rounded-md py-8 z-50 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col items-center justify-center text-center">
                            <div className="mb-4 text-white/10">
                                <span className="material-symbols-outlined text-6xl font-extralight select-none">search</span>
                            </div>
                            <h3 className="text-sm font-bold text-white/90 mb-2 px-6">
                                No hemos encontrado nada que coincida con tu búsqueda.
                            </h3>
                            <p className="text-[12px] text-white/50 px-8 leading-relaxed">
                                Inténtalo de nuevo con un término diferente.
                            </p>
                        </div>
                    )}

                    {isSearchOpen && searchValue.trim() !== '' && hasResults && (
                        <div className="absolute right-0 top-10 w-[550px] bg-[#22272b] border border-white/10 shadow-2xl rounded-md py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-2 border-b border-white/5 mb-2">
                                <p className="text-[11px] font-bold text-[#9facbd] uppercase tracking-wider">
                                    {results[0]?.type === 'card' ? 'Tarjetas' : 'Tableros'}
                                </p>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar px-2">
                                {results.map((item, index) => (
                                    <div
                                        key={`${item.type}-${item.id}`}
                                        onClick={() => {
                                            setIsSearchOpen(false);
                                            if (onSearchChange) onSearchChange('');
                                            if (item.type === 'board') {
                                                navigate(`/board/${item.id}`);
                                            } else {
                                                navigate(`/board/${item.boardId}?cardId=${item.id}`); 
                                            }
                                        }}
                                        className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md cursor-pointer group transition-colors"
                                    >
                                        {item.type === 'board' ? (
                                            <div className={`w-8 h-8 rounded-[4px] shrink-0 ${getBgClass(item.background, index)}`}></div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-[4px] shrink-0 bg-white/5 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[#9facbd] text-[20px]">credit_card</span>
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-white/90 truncate">{item.title}</p>
                                            <p className="text-[11px] text-[#9facbd] truncate">
                                                {item.subtitle || 'Espacio de trabajo de Trello'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-3 border-t border-white/5 mt-2">
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="text-[13px] text-[#579dff] hover:underline transition-all font-medium"
                                >
                                    Ver todos los resultados
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {isAuthenticated ? (
                    <div className="relative" ref={menuRef}>
                        <div
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-bold text-xs cursor-pointer border border-white/20 hover:opacity-80 transition-opacity select-none"
                            title="Cuenta"
                        >
                            {user?.email?.substring(0, 2).toUpperCase() || 'AA'}
                        </div>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-10 w-64 bg-[#282e33] border border-white/10 shadow-xl rounded-md py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-white/10">
                                    <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3">Cuenta</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold text-sm shrink-0 border border-white/20">
                                            {user?.email?.substring(0, 2).toUpperCase() || 'AA'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium text-white/90 truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-2 pt-2">
                                    <button
                                        onClick={async () => {
                                            setIsMenuOpen(false);
                                            await logout();
                                            navigate('/');
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-md transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-icons-outlined text-[18px]">logout</span>
                                        Cerrar sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold text-xs cursor-pointer border border-white/20 hover:bg-gray-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">login</span>
                    </button>
                )}
            </div>
        </nav>
    );
}
