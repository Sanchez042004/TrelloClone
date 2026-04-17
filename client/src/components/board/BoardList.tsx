import { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { Droppable } from '@hello-pangea/dnd';
import type { List, Card } from '../../types';
import BoardCard, { BoardCardContent } from './BoardCard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface BoardListProps {
    list: List;
    onDeleteList: (listId: number) => void;
    onUpdateTitle: (listId: number, title: string) => void;
    onCreateCard: (title: string, listId: number) => void;
    onEditCard: (e: React.MouseEvent, card: Card) => void;
    onQuickEditCard: (e: React.MouseEvent, card: Card) => void;
    onUpdateCard: (cardId: number, updates: Partial<Card>) => void;
    onDeleteCard: (cardId: number) => void;
    onHoverCard: (e: React.MouseEvent, card: Card) => void;
    onLeaveCard: () => void;
    isGlobalDragging: boolean;
    isCreatingCard?: boolean;
}

export default memo(function BoardList({
    list,
    onDeleteList,
    onUpdateTitle,
    onCreateCard,
    onEditCard,
    onQuickEditCard,
    onUpdateCard,
    onDeleteCard,
    onHoverCard,
    onLeaveCard,
    isGlobalDragging,
    isCreatingCard
}: BoardListProps) {
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState(list.title);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [isListActionsOpen, setIsListActionsOpen] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [listActionsPosition, setListActionsPosition] = useState({ top: 0, left: 0 });
    const [isDeleting, setIsDeleting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const addCardContainerRef = useRef<HTMLDivElement>(null);
    const listActionsRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Click away for list actions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isClickInsideTrigger = listActionsRef.current?.contains(event.target as Node);
            const isClickInsideMenu = menuRef.current?.contains(event.target as Node);
            
            if (!isClickInsideTrigger && !isClickInsideMenu) {
                setIsListActionsOpen(false);
            }
        };

        if (isListActionsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isListActionsOpen]);

    // Click away for Add Card
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addCardContainerRef.current && !addCardContainerRef.current.contains(event.target as Node)) {
                setIsAddingCard(false);
            }
        };

        if (isAddingCard) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAddingCard]);

    // Focus textarea when opening add mode
    useEffect(() => {
        if (isAddingCard && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isAddingCard]);

    const handleAddCard = () => {
        if (!newCardTitle.trim()) return;
        onCreateCard(newCardTitle, list.id);
        setNewCardTitle('');
        // We keep it open for multiple card creation (Better UX)
        if (textareaRef.current) textareaRef.current.focus();
    };

    const handleTitleSubmit = () => {
        if (tempTitle.trim() && tempTitle !== list.title) {
            onUpdateTitle(list.id, tempTitle.trim());
        }
        setIsEditingTitle(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddCard();
        } else if (e.key === 'Escape') {
            setIsAddingCard(false);
        }
    };

    return (
        <div className="flex flex-col w-64 max-h-full glass-list">
            {/* List Header */}
            <div className="p-3 pb-2 flex items-center justify-between group/header">
                {isEditingTitle ? (
                    <input
                        autoFocus
                        className="flex-1 bg-background-dark text-white text-sm font-bold px-2 py-1 rounded border border-primary outline-none"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onBlur={handleTitleSubmit}
                        onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                    />
                ) : (
                    <h3
                        onClick={() => {
                            setTempTitle(list.title);
                            setIsEditingTitle(true);
                        }}
                        className="text-white text-sm font-bold px-2 tracking-tight flex-1 cursor-pointer rounded py-1"
                    >
                        {list.title}
                    </h3>
                )}
                <div className="relative" ref={listActionsRef}>
                    <button onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setListActionsPosition({ top: rect.bottom + 4, left: rect.left });
                        setIsListActionsOpen(!isListActionsOpen);
                        setIsConfirmingDelete(false);
                    }} className={`p-1.5 rounded-lg transition-all cursor-pointer active:scale-95 ${isListActionsOpen ? 'bg-[#BFC1C4] text-[#1d2125]' : 'text-white/40 hover:bg-white/10'}`}>
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>
                </div>
            </div>

            {isListActionsOpen && createPortal(
                <div 
                    ref={menuRef}
                    className="fixed w-[280px] bg-[#282e33] border border-white/10 rounded-[8px] shadow-[0_12px_24px_rgba(0,0,0,0.5)] z-[99999] animate-in fade-in zoom-in-95 duration-100 flex flex-col py-2 cursor-default"
                    style={{
                        top: listActionsPosition.top,
                        left: listActionsPosition.left
                    }}
                >
                     {isConfirmingDelete ? (
                        <>
                             <div className="flex justify-between items-center mb-1 px-3">
                                 <button onClick={() => setIsConfirmingDelete(false)} className="text-white/40 hover:text-white p-1 -ml-1 rounded">
                                     <span className="material-icons-outlined text-[16px]">chevron_left</span>
                                 </button>
                                 <span className="text-[13px] font-semibold text-center text-white/80">¿Eliminar lista?</span>
                                 <button onClick={() => setIsListActionsOpen(false)} className="text-white/40 hover:text-white p-1 -mr-1 rounded">
                                     <span className="material-icons-outlined text-[16px]">close</span>
                                 </button>
                             </div>
                             <div className="h-px bg-white/10 mx-0 mb-1" />
                             <div className="px-3 py-2 flex flex-col gap-3">
                                 <p className="text-[14px] text-white/80 leading-relaxed font-normal">
                                     Se eliminará esta lista y todas sus tarjetas. Esta acción no se puede deshacer.
                                 </p>
                                 <button
                                     onClick={async () => {
                                         try {
                                             setIsDeleting(true);
                                             await onDeleteList(list.id);
                                             setIsListActionsOpen(false);
                                         } catch (error) {
                                             console.error('Error deleting list:', error);
                                         } finally {
                                             setIsDeleting(false);
                                         }
                                     }}
                                     disabled={isDeleting}
                                     className="w-full h-9 flex items-center justify-center gap-2 bg-[#f87168] hover:bg-[#ff8a82] text-[#1d2125] font-semibold text-[14px] px-3 py-2 rounded-[3px] transition-colors disabled:opacity-50"
                                 >
                                     {isDeleting && <LoadingSpinner size="sm" color="text-[#1d2125]" />}
                                     {isDeleting ? 'Eliminando...' : 'Eliminar'}
                                 </button>
                             </div>
                        </>
                     ) : (
                        <>
                             <div className="flex justify-between items-center mb-1 px-3">
                                 <div className="w-6" /> {/* spacer */}
                                 <span className="text-[13px] font-semibold text-center text-white/80">Enumerar acciones</span>
                                 <button onClick={() => setIsListActionsOpen(false)} className="text-white/40 hover:text-white p-1 -mr-1 rounded">
                                     <span className="material-icons-outlined text-[16px]">close</span>
                                 </button>
                             </div>
                             
                             <div className="flex flex-col mt-2">
                                 <button 
                                     onClick={() => {
                                         setIsListActionsOpen(false);
                                         setIsAddingCard(true);
                                     }}
                                     className="w-full text-left px-4 py-1.5 hover:bg-white/10 text-[#B6C2CF] text-[14px] font-medium transition-colors"
                                 >
                                     Añadir tarjeta
                                 </button>
                                 <button 
                                     onClick={() => {
                                         setIsListActionsOpen(false);
                                     }}
                                     className="w-full text-left px-4 py-1.5 hover:bg-white/10 text-[#B6C2CF] text-[14px] font-medium transition-colors"
                                 >
                                     Mover lista
                                 </button>
                                 <button 
                                     onClick={() => {
                                         setIsConfirmingDelete(true);
                                     }}
                                     className="w-full text-left px-4 py-1.5 hover:bg-white/10 text-[#B6C2CF] text-[14px] font-medium transition-colors"
                                 >
                                     Eliminar lista
                                 </button>
                             </div>
                        </>
                     )}
                </div>,
                document.body
            )}

            <Droppable
                droppableId={list.id.toString()}
                type="CARD"
                renderClone={(provided, snapshot, rubric) => {
                    const card = list.cards[rubric.source.index];
                    return createPortal(
                        <BoardCardContent
                            card={card}
                            isDragging={snapshot.isDragging}
                            onEdit={onEditCard}
                            onQuickEdit={onQuickEditCard}
                            onUpdate={onUpdateCard}
                            onDelete={onDeleteCard}
                            onHover={onHoverCard}
                            onLeave={onLeaveCard}
                            provided={provided}
                            isGlobalDragging={isGlobalDragging}
                            style={{
                                ...provided.draggableProps.style,
                                // Only rotate when dragging, not when returning/dropping
                                transform: snapshot.isDragging && !snapshot.isDropAnimating
                                    ? `${provided.draggableProps.style?.transform} rotate(3deg)`
                                    : provided.draggableProps.style?.transform,
                                zIndex: 9999,
                                boxSizing: 'border-box'
                            }}
                        />,
                        document.body
                    );
                }}
            >
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto px-2 pt-1 pb-2 space-y-2 custom-scrollbar transition-colors min-h-[10px] ${snapshot.isDraggingOver ? 'bg-white/5' : ''
                            }`}
                    >
                        {list.cards.map((card, index) => (
                            <BoardCard
                                key={card.id}
                                card={card}
                                index={index}
                                onEdit={onEditCard}
                                onQuickEdit={onQuickEditCard}
                                onUpdate={onUpdateCard}
                                onDelete={onDeleteCard}
                                onHover={onHoverCard}
                                onLeave={onLeaveCard}
                                isGlobalDragging={isGlobalDragging}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            <div className="p-2 pt-0">
                {isAddingCard ? (
                    <div
                        ref={addCardContainerRef}
                        className="p-2 space-y-2 animate-in fade-in zoom-in-95 duration-200"
                    >
                        <textarea
                            ref={textareaRef}
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isCreatingCard}
                            placeholder="Introduce un título o pega un enlace"
                            className="w-full bg-[#22272b] text-white rounded-[3px] border border-[#579dff] text-[14px] p-2 py-1.5 placeholder:text-[#9facbd] outline-none shadow-sm resize-none disabled:opacity-50"
                            rows={3}
                        />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleAddCard}
                                disabled={isCreatingCard || !newCardTitle.trim()}
                                className="bg-[#579dff] hover:bg-[#85b8ff] text-[#172b4d] text-[14px] font-semibold px-3 py-1.5 rounded-[3px] transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isCreatingCard && <LoadingSpinner size="sm" color="text-[#172b4d]" />}
                                {isCreatingCard ? 'Añadiendo...' : 'Añadir tarjeta'}
                            </button>
                            <button
                                onClick={() => setIsAddingCard(false)}
                                disabled={isCreatingCard}
                                className="p-1.5 text-white/70 hover:text-white transition-colors disabled:opacity-30"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setIsAddingCard(true)} className="w-full flex items-center gap-2 text-white/60 hover:bg-white/5 p-2.5 rounded-xl text-sm transition-all text-left group">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span className="font-medium">Añade una tarjeta</span>
                    </button>
                )}
            </div>
        </div>
    );
});
