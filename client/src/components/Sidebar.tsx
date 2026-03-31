import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
    const navigate = useNavigate();

    return (
        <aside className="w-[297px] border-r border-border-dark bg-sidebar-dark flex-shrink-0 flex flex-col overflow-y-auto custom-scrollbar h-full">
            <div className="px-3 pt-[48px] pb-3 flex-grow">
                <div>
                    <h3 className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Espacio de trabajo</h3>
                    <div className="flex items-center gap-2 px-3 py-2 mb-1">
                        <div className="w-6 h-6 rounded bg-pink-600 text-white flex items-center justify-center text-[10px] font-bold">E</div>
                        <span className="text-[14px] font-medium text-text-main">Espacio de trabajo</span>
                    </div>
                    <nav className="space-y-0.5">
                        <a onClick={() => navigate('/')} className="flex items-center gap-2 px-3 py-2 rounded bg-selection-bg text-trello-blue cursor-pointer">
                            <span className="material-symbols-outlined text-[18px]">dashboard</span>
                            <span className="text-[14px] font-medium">Tableros</span>
                        </a>
                    </nav>
                </div>
            </div>
        </aside>
    );
}
