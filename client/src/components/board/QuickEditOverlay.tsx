import { useState, useRef, useEffect } from 'react';
import type { Card } from '../../types';
import { useTags } from '../../context/TagContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface QuickEditOverlayProps {
    card: Card;
    rect: { top: number; left: number; width: number; height: number } | null;
    onClose: () => void;
    onSave: (cardId: number, newTitle: string) => void;
    onDelete: (cardId: number) => void;
    onOpenCard: (cardId: number) => void;
}

const SIDEBAR_BUTTONS = [
    { icon: 'branding_watermark', label: 'Abrir tarjeta', action: 'open' },
    { icon: 'delete', label: 'Eliminar tarjeta', action: 'archive' },
];

export default function QuickEditOverlay({
    card,
    rect,
    onClose,
    onSave,
    onDelete,
    onOpenCard
}: QuickEditOverlayProps) {
    const [title, setTitle] = useState(card.title);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { getTagColor } = useTags();

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, []);

    if (!rect) return null;

    const handleSave = () => {
        if (title.trim() !== card.title) {
            onSave(card.id, title);
        }
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleAction = (action: string) => {
        if (action === 'archive') {
            setIsConfirmingDelete(true);
        } else if (action === 'open') {
            onOpenCard(card.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/60" onClick={onClose}>
            <div className="relative w-full h-full">
                <div
                    className="absolute flex gap-2 items-start"
                    style={{
                        top: rect.top,
                        left: rect.left,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Editor Area */}
                    <div style={{ width: rect.width }}>
                        <div
                            style={{ height: rect.height }}
                            className="bg-[#1d2125] rounded-xl shadow-2xl p-2.5 overflow-hidden border border-white/5 animate-in fade-in duration-100 flex flex-col"
                        >
                            {(() => {
                                if (!card.label) return null;
                                const visibleTags = card.label.split(',').map(l => l.trim()).filter(Boolean).filter(lbl => getTagColor(lbl) !== '');
                                if (visibleTags.length === 0) return null;

                                return (
                                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                                        {visibleTags.map((lbl, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-1.5 w-8 rounded-full shadow-sm ${getTagColor(lbl)}`}
                                            />
                                        ))}
                                    </div>
                                );
                            })()}
                            <textarea
                                ref={textareaRef}
                                className="w-full flex-1 bg-transparent text-white text-[13px] font-medium resize-none outline-none leading-tight"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="mt-2">
                            <button
                                onClick={handleSave}
                                className="bg-[#579dff] hover:bg-[#85b8ff] text-[#172b4d] font-semibold text-[14px] px-3 py-1.5 rounded-[3px] transition-all active:scale-95"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className={isConfirmingDelete ? "w-[260px]" : "flex flex-col gap-1 w-[160px]"}>
                        {isConfirmingDelete ? (
                            <div className="bg-[#282e33] p-3 rounded-xl border border-white/10 shadow-[0_12px_24px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-left-2 duration-150 flex flex-col gap-2">
                                <div className="flex justify-between items-center mb-1">
                                    <button onClick={() => setIsConfirmingDelete(false)} disabled={isDeleting} className="text-white/40 hover:text-white p-1 -ml-1 rounded">
                                        <span className="material-icons-outlined text-[16px]">chevron_left</span>
                                    </button>
                                    <span className="text-[14px] font-semibold text-center text-white/80">Eliminar tarjeta</span>
                                    <button onClick={onClose} disabled={isDeleting} className="text-white/40 hover:text-white p-1 -mr-1 rounded">
                                        <span className="material-icons-outlined text-[16px]">close</span>
                                    </button>
                                </div>
                                <div className="h-px bg-white/10 -mx-3 mb-1" />
                                <p className="text-[14px] text-white/80 leading-relaxed font-medium mb-1 mt-1">
                                    Se eliminará esta tarjeta y todo su contenido. Esta acción no se puede deshacer.
                                </p>
                                <button
                                    onClick={async () => {
                                        try {
                                            setIsDeleting(true);
                                            await onDelete(card.id);
                                            onClose();
                                        } catch (error) {
                                            console.error('Error deleting card:', error);
                                        } finally {
                                            setIsDeleting(false);
                                        }
                                    }}
                                    disabled={isDeleting}
                                    className="w-full h-10 flex items-center justify-center gap-2 bg-[#f87168] hover:bg-[#ff8a82] text-[#1d2125] font-semibold text-[13px] px-3 py-2 rounded-[3px] transition-colors mt-2 disabled:opacity-50"
                                >
                                    {isDeleting && <LoadingSpinner size="sm" color="text-[#1d2125]" />}
                                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                                </button>
                            </div>
                        ) : (
                            SIDEBAR_BUTTONS.map((btn, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAction(btn.action)}
                                    className="group flex items-center gap-2.5 bg-[#161a1d]/90 hover:bg-[#2c333a] text-white text-[13px] font-semibold px-3 py-1.5 rounded-[4px] transition-all shadow-sm border border-white/5"
                                >
                                    <span className="material-icons-outlined text-[16px] text-white/70 group-hover:text-white">{btn.icon}</span>
                                    <span className="tracking-tight">{btn.label}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
