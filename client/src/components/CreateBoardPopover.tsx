import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

interface CreateBoardPopoverProps {
    onClose: () => void;
    onCreate: (title: string, background: string) => void;
    loading?: boolean;
}

const BACKGROUNDS = [
    { type: 'image', value: 'from-blue-600 to-indigo-700', label: 'Montaña' },
    { type: 'image', value: 'from-purple-600 to-pink-600', label: 'Atardecer' },
    { type: 'image', value: 'from-emerald-600 to-teal-600', label: 'Naturaleza' },
    { type: 'image', value: 'from-orange-600 to-red-600', label: 'Desierto' },
    { type: 'color', value: 'bg-blue-600', label: 'Azul' },
    { type: 'color', value: 'bg-indigo-500', label: 'Índigo' },
    { type: 'color', value: 'bg-sky-500', label: 'Celeste' },
    { type: 'color', value: 'bg-pink-500', label: 'Rosa' },
    { type: 'color', value: 'bg-green-500', label: 'Verde' },
];

export default function CreateBoardPopover({ onClose, onCreate, loading }: CreateBoardPopoverProps) {
    const [title, setTitle] = useState('');
    const [selectedBackground, setSelectedBackground] = useState(BACKGROUNDS[0]);
    const [isDirty, setIsDirty] = useState(false);
    const [visibility, setVisibility] = useState<'privado' | 'espacio'>('privado');
    const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsDirty(true);
        if (!title.trim() || loading) return;
        onCreate(title.trim(), selectedBackground.value);
    };

    const hasError = isDirty && !title.trim();

    return (
        <div
            ref={popoverRef}
            className="absolute top-0 left-0 sm:left-full sm:ml-2 mt-2 sm:mt-0 w-[304px] bg-[#2b2c2f] border border-[#2B2C2F] rounded-[14px] shadow-2xl z-50 text-text-main animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="flex items-center justify-between px-4 py-2 mb-2">
                <div className="flex-1 text-center">
                    <h2 className="text-sm font-semibold text-text-muted">Crear tablero</h2>
                </div>
                <button onClick={onClose} className="text-text-muted hover:text-text-main p-1 rounded hover:bg-hover-dark">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
            </div>

            <div className="px-4 pb-4">
                <div className="flex justify-center mb-4">
                    <div className={`w-[200px] h-[120px] rounded-md flex p-3 relative shadow-sm transition-all ${selectedBackground.type === 'color' ? selectedBackground.value : `bg-gradient-to-br ${selectedBackground.value}`}`}>
                        <div className="relative z-10 w-full h-full flex gap-1.5 opacity-50">
                            <div className="w-1/3 h-full bg-[#ffffff3d] rounded-[3px]"></div>
                            <div className="w-1/3 h-full bg-[#ffffff3d] rounded-[3px]"></div>
                            <div className="w-1/3 h-full bg-[#ffffff3d] rounded-[3px]"></div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="text-xs font-bold text-text-muted mb-2 block">Fondo</label>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {BACKGROUNDS.slice(0, 4).map((bg, idx) => (
                                <button key={idx} type="button" onClick={() => setSelectedBackground(bg)} className={`h-10 rounded-sm relative overflow-hidden ${bg.type === 'color' ? bg.value : `bg-gradient-to-br ${bg.value}`}`}>
                                    {selectedBackground.value === bg.value && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <span className="material-symbols-outlined text-white text-[16px]">check</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-bold text-text-muted mb-1.5 block">Título del tablero</label>
                        <input
                            ref={inputRef}
                            type="text"
                            className={`w-full bg-[#1d2125] border ${hasError ? 'border-red-500' : 'border-[#3e474f]'} rounded-[3px] px-3 py-2 text-sm text-text-main focus:outline-none`}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => setIsDirty(true)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!title.trim() || loading}
                        className={`w-full h-9 flex items-center justify-center gap-2 rounded-[3px] text-sm font-medium transition-colors mb-3 ${(!title.trim() || loading) ? 'bg-[#3e474f] text-[#9fadbc] cursor-not-allowed' : 'bg-[#579dff] text-[#1d2125] hover:bg-[#85b8ff]'}`}
                    >
                        {loading && <LoadingSpinner size="sm" color="text-[#1d2125]" />}
                        {loading ? 'Creando...' : 'Crear'}
                    </button>
                </form>
            </div>
        </div>
    );
}
