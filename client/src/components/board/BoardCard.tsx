import { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Card } from '../../types';
import { useTags } from '../../context/TagContext';

interface BoardCardProps {
    card: Card;
    index: number;
    onEdit: (e: React.MouseEvent, card: Card) => void;
    onQuickEdit: (e: React.MouseEvent, card: Card) => void;
    onUpdate: (cardId: number, updates: Partial<Card>) => void;
    onDelete: (cardId: number) => void;
    onHover: (e: React.MouseEvent, card: Card) => void;
    onLeave: () => void;
    isGlobalDragging?: boolean;
}



const getPriorityStyles = (p?: string) => {
    switch (p?.toLowerCase()) {
        case 'high': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
        case 'medium': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
        case 'low': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
        default: return 'text-slate-500 bg-slate-50 dark:bg-slate-800';
    }
};

const hasTextContent = (html?: string) => {
    if (!html) return false;
    const text = html.replace(/<[^>]+>/g, '').trim();
    return text.length > 0;
};

// Componente visual reutilizable para la tarjeta
export const BoardCardContent = memo(function BoardCardContent({
    card,
    onEdit,
    onQuickEdit,
    onUpdate,
    onDelete,
    onHover,
    onLeave,
    isDragging,
    provided,
    style,
    isGlobalDragging
}: {
    card: Card;
    onEdit: (e: React.MouseEvent, card: Card) => void;
    onQuickEdit: (e: React.MouseEvent, card: Card) => void;
    onUpdate: (cardId: number, updates: Partial<Card>) => void;
    onDelete: (cardId: number) => void;
    onHover: (e: React.MouseEvent, card: Card) => void;
    onLeave: () => void;
    isDragging: boolean;
    provided?: any;
    style?: any;
    isGlobalDragging?: boolean;
}) {
    const { getTagColor } = useTags();
    // Dynamic classes: when dragging globally, disable all hover effects on static cards
    const cardHoverClass = isGlobalDragging ? '' : 'hover:bg-white/10 hover:shadow-2xl hover:border-white/10';
    const buttonHoverOpacity = isGlobalDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100';
    const indicatorHoverWidth = isGlobalDragging ? (card.is_completed ? 'w-6' : 'w-0') : (card.is_completed ? 'w-6' : 'w-0 group-hover:w-6');
    const indicatorHoverOpacity = isGlobalDragging ? (card.is_completed ? 'opacity-100' : 'opacity-0') : (card.is_completed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100');

    const handleToggleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdate(card.id, { is_completed: !card.is_completed });
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
            onDelete(card.id);
        }
    };

    return (
        <div
            ref={provided?.innerRef}
            {...provided?.draggableProps}
            {...provided?.dragHandleProps}
            onClick={(e) => onEdit(e, card)}
            onMouseEnter={(e) => onHover(e, card)}
            onMouseLeave={() => onLeave()}
            className={`group relative glass-card p-2.5 rounded-xl border border-white/5 cursor-pointer ${cardHoverClass} ${isDragging
                ? 'shadow-2xl opacity-80'
                : 'transition-[transform,box-shadow,background-color,border-color] duration-300 active:scale-[0.98]'
                }`}
            style={style || {}}
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
            <div className={`flex items-start ${card.is_completed ? 'opacity-60' : ''}`}>
                <div 
                    onClick={handleToggleComplete}
                    className={`${indicatorHoverWidth} overflow-hidden transition-all duration-300 ease-in-out flex items-center shrink-0 group/indicator self-center relative`}
                >
                    <span className={`material-symbols-outlined text-[18px] transition-all duration-300 ${indicatorHoverOpacity} ${card.is_completed ? 'text-[#4bce97] fill-1' : 'text-white/40 hover:text-white'}`}>
                        {card.is_completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    
                    {/* Indicator Tooltip */}
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 px-2 py-1 bg-white text-[#1d2125] text-[10px] font-bold rounded-lg hidden group-hover/indicator:flex items-center whitespace-nowrap shadow-2xl pointer-events-none z-[100] border border-black/10 animate-in fade-in zoom-in-95 duration-100 origin-left">
                        {card.is_completed ? 'Marcar como incompleta' : 'Marcar como completada'}
                    </div>
                </div>
                <h4 className={`text-[13px] font-medium text-white tracking-tight leading-tight flex-1 transition-all duration-300 ${card.is_completed ? 'line-through text-white/50' : ''}`}>
                    {card.title}
                </h4>
            </div>

            <div className={`absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 ${buttonHoverOpacity}`}>
                <button
                    onClick={handleDelete}
                    className="group/del-btn size-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all duration-200 relative"
                >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <div className="absolute top-1/2 -translate-y-1/2 right-10 px-2 py-1 bg-white text-[#1d2125] text-[10px] rounded-lg hidden group-hover/del-btn:flex items-center whitespace-nowrap shadow-2xl pointer-events-none z-[100] border border-black/10 animate-in fade-in zoom-in-95 slide-in-from-right-1 duration-100 origin-right">
                        <span className="font-bold">Eliminar</span>
                    </div>
                </button>
                <button
                    onClick={(e) => onQuickEdit(e, card)}
                    className="group/edit-btn size-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all duration-200 relative"
                >
                    <span className="material-symbols-outlined text-[16px]">edit_square</span>
                    <div className="absolute top-1/2 -translate-y-1/2 right-10 px-2 py-1 bg-white text-[#1d2125] text-[10px] rounded-lg hidden group-hover/edit-btn:flex items-center gap-2 whitespace-nowrap shadow-2xl pointer-events-none z-[100] border border-black/10 animate-in fade-in zoom-in-95 slide-in-from-right-1 duration-100 origin-right">
                        <span className="font-bold">Editar rápida</span>
                        <span className="bg-gray-200 px-1 py-0.5 rounded text-[9px] font-black uppercase">e</span>
                    </div>
                </button>
            </div>

            {(card.priority || hasTextContent(card.description)) && (
                <div className="mt-2 flex items-center gap-2 text-white/50">
                    {card.priority && (
                        <div className={`inline-block px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider flex-shrink-0 ${getPriorityStyles(card.priority)}`}>
                            {card.priority}
                        </div>
                    )}
                    {hasTextContent(card.description) && (
                        <div className="flex items-center justify-center flex-shrink-0" title="Esta tarjeta tiene una descripción">
                            <span className="material-symbols-outlined text-[16px]">subject</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default memo(function BoardCard({ card, index, onEdit, onQuickEdit, onUpdate, onDelete, onHover, onLeave, isGlobalDragging }: BoardCardProps) {
    return (
        <Draggable draggableId={card.id.toString()} index={index}>
            {(provided, snapshot) => (
                <BoardCardContent
                    card={card}
                    onEdit={onEdit}
                    onQuickEdit={onQuickEdit}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onHover={onHover}
                    onLeave={onLeave}
                    isDragging={snapshot.isDragging}
                    isGlobalDragging={isGlobalDragging}
                    provided={provided}
                    style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging
                            ? `${provided.draggableProps.style?.transform} rotate(3deg)`
                            : provided.draggableProps.style?.transform,
                        zIndex: snapshot.isDragging ? 9999 : 'auto',
                        width: snapshot.isDragging ? '256px' : 'auto',
                    }}
                />
            )}
        </Draggable>
    );
});
