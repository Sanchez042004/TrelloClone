import React, { useState, useRef, useEffect } from 'react';

interface CreateBoardPopoverProps {
    onClose: () => void;
    onCreate: (title: string, background: string) => void;
}

const BACKGROUNDS = [
    // Gradients acting as "Unsplash Images"
    { type: 'image', value: 'from-blue-600 to-indigo-700', label: 'Montaña' },
    { type: 'image', value: 'from-purple-600 to-pink-600', label: 'Atardecer' },
    { type: 'image', value: 'from-emerald-600 to-teal-600', label: 'Naturaleza' },
    { type: 'image', value: 'from-orange-600 to-red-600', label: 'Desierto' },
    // Solid Colors
    { type: 'color', value: 'bg-blue-600', label: 'Azul' },
    { type: 'color', value: 'bg-indigo-500', label: 'Índigo' },
    { type: 'color', value: 'bg-sky-500', label: 'Celeste' },
    { type: 'color', value: 'bg-pink-500', label: 'Rosa' },
    { type: 'color', value: 'bg-green-500', label: 'Verde' },
];

export default function CreateBoardPopover({ onClose, onCreate }: CreateBoardPopoverProps) {
    const [title, setTitle] = useState('');
    const [selectedBackground, setSelectedBackground] = useState(BACKGROUNDS[0]);
    const [isDirty, setIsDirty] = useState(true);
    const [visibility, setVisibility] = useState<'privado' | 'espacio'>('privado');
    const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsDirty(true);
        if (!title.trim()) return;
        onCreate(title.trim(), selectedBackground.value);
    };

    const hasError = isDirty && !title.trim();

    return (
        <div
            ref={popoverRef}
            className="absolute top-0 left-0 sm:left-full sm:ml-2 mt-2 sm:mt-0 w-[304px] bg-[#2b2c2f] border border-[#2B2C2F] rounded-[14px] shadow-2xl z-50 text-text-main animate-in fade-in zoom-in-95 duration-200"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 mb-2">
                <div className="flex-1 text-center">
                    <h2 className="text-sm font-semibold text-text-muted">Crear tablero</h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-text-muted hover:text-text-main p-1 rounded hover:bg-hover-dark"
                >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
            </div>

            <div className="px-4 pb-4">
                {/* Preview */}
                <div className="flex justify-center mb-4">
                    <div
                        className={`w-[200px] h-[120px] rounded-md flex p-3 relative shadow-sm transition-all ${selectedBackground.type === 'color' ? selectedBackground.value : `bg-gradient-to-br ${selectedBackground.value}`
                            }`}
                    >
                        <div className="relative z-10 w-full h-full flex gap-1.5">
                            {/* Mini Board UI */}
                            <div className="w-1/3 h-full bg-[#ffffff3d] rounded-[3px] flex flex-col gap-1 p-1">
                                <div className="w-3/4 h-1.5 bg-white rounded-sm mb-1 opacity-70"></div>
                                <div className="w-full h-2 bg-white rounded-sm opacity-50"></div>
                                <div className="w-full h-2 bg-white rounded-sm opacity-50"></div>
                            </div>
                            <div className="w-1/3 h-full bg-[#ffffff3d] rounded-[3px] flex flex-col gap-1 p-1">
                                <div className="w-3/4 h-1.5 bg-white rounded-sm mb-1 opacity-70"></div>
                                <div className="w-full h-2 bg-white rounded-sm opacity-50"></div>
                            </div>
                            <div className="w-1/3 h-full bg-[#ffffff3d] rounded-[3px] flex flex-col gap-1 p-1">
                                <div className="w-2/3 h-1.5 bg-white rounded-sm mb-1 opacity-70"></div>
                                <div className="w-full h-2 bg-white rounded-sm opacity-50"></div>
                                <div className="w-full h-2 bg-white rounded-sm opacity-50"></div>
                                <div className="w-full h-2 bg-white rounded-sm opacity-50"></div>
                            </div>
                        </div>
                        {/* Overlay to simulate light gloss */}
                        <div className="absolute inset-0 bg-black/10 rounded-md"></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Background Selector */}
                    <div className="mb-4">
                        <label className="text-xs font-bold text-text-muted mb-2 block">Fondo</label>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {BACKGROUNDS.slice(0, 4).map((bg, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedBackground(bg)}
                                    className={`h-10 rounded-sm relative overflow-hidden hover:brightness-110 transition-all ${bg.type === 'color' ? bg.value : `bg-gradient-to-br ${bg.value}`
                                        }`}
                                    title={bg.label}
                                >
                                    {selectedBackground.value === bg.value && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {BACKGROUNDS.slice(4, 9).map((bg, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedBackground(bg)}
                                    className={`flex-1 h-8 rounded-sm relative hover:brightness-110 transition-all ${bg.value}`}
                                    title={bg.label}
                                >
                                    {selectedBackground.value === bg.value && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title Input */}
                    <div className="mb-4">
                        <label className="text-xs font-bold text-text-muted mb-1.5 block">
                            Título del tablero <span className="text-red-500">*</span>
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            className={`w-full bg-[#1d2125] border ${hasError ? 'border-red-500 focus:border-red-500' : 'border-[#3e474f] focus:border-[#579dff]'} rounded-[3px] px-3 py-2 text-sm text-text-main focus:outline-none transition-colors`}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => setIsDirty(true)}
                        />
                        {hasError && (
                            <p className="mt-1.5 text-sm text-text-main flex items-center gap-1.5">
                                <span className="text-base">👋</span> Es necesario indicar el título del tablero
                            </p>
                        )}
                    </div>

                    {/* Visibility */}
                    <div className="mb-4">
                        <label className="text-xs font-bold text-text-muted mb-1.5 block">Visibilidad</label>

                        {/* Toggle Button (Select Box) */}
                        <div
                            onClick={() => setIsVisibilityOpen(!isVisibilityOpen)}
                            className={`w-full bg-[#1d2125] border ${isVisibilityOpen ? 'border-[#579dff]' : 'border-[#333b43]'} rounded-[3px] px-3 py-1.5 text-sm text-text-main flex items-center justify-between cursor-pointer mb-1 transition-all hover:bg-[#22272b]`}
                        >
                            <span className="flex items-center gap-2">
                                <span className={`material-symbols-outlined text-[18px] ${visibility === 'privado' ? 'text-trello-blue' : ''}`}>{visibility === 'privado' ? 'lock' : 'groups'}</span>
                                {visibility === 'privado' ? 'Privado' : 'Espacio de trabajo'}
                            </span>
                            <span className="material-symbols-outlined text-[#9fadbc] text-[20px]">expand_more</span>
                        </div>

                        {/* Dropdown Menu */}
                        {isVisibilityOpen && (
                            <div className="bg-[#22272b] border border-[#333b43] rounded-[3px] shadow-md overflow-hidden animate-in slide-in-from-top-1 duration-150">
                                <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                                    {/* Option: Privado */}
                                    <div
                                        onClick={() => { setVisibility('privado'); setIsVisibilityOpen(false); }}
                                        className={`flex items-start gap-4 p-3 cursor-pointer transition-colors bg-selection-bg border-l-[3px] border-trello-blue`}
                                    >
                                        <div className="pt-0.5">
                                            <span className="material-symbols-outlined text-trello-blue text-[18px]">lock</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-trello-blue leading-tight">Privado</span>
                                            <span className="text-[11px] text-[#84B8FF] mt-1 leading-snug">
                                                Únicamente los miembros del tablero pueden ver este tablero. Los administradores del Espacio de trabajo pueden cerrarlo o quitarle miembros.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className={`w-full py-2 px-4 rounded-[3px] text-sm font-medium transition-colors mb-3 ${!title.trim()
                            ? 'bg-[#3e474f] text-[#9fadbc] cursor-not-allowed'
                            : 'bg-[#579dff] text-[#1d2125] hover:bg-[#85b8ff]'
                            }`}
                    >
                        Crear
                    </button>
                </form>
            </div>
        </div>
    );
}
