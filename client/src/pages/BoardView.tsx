import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useBoardData } from '../hooks/useBoardData';
import BoardList from '../components/board/BoardList';
import CardModal from '../components/board/CardModal';
import QuickEditOverlay from '../components/board/QuickEditOverlay';
import TopNav from '../components/TopNav';
import type { Card } from '../types';

export default function BoardView() {
    const { boardId } = useParams<{ boardId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        lists,
        setLists,
        loading,
        boardBackground,
        boardTitle,
        refreshLists,
        fetchBoardData,
        updateBoardTitle,
        createList,
        deleteList,
        updateListTitle,
        createCard,
        updateCard,
        moveCard,
        deleteCard
    } = useBoardData(Number(boardId));

    // UI State
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [quickEditingCard, setQuickEditingCard] = useState<{ card: Card, rect: any } | null>(null);
    const [newListTitle, setNewListTitle] = useState('');
    const [isAddingList, setIsAddingList] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [isGlobalDragging, setIsGlobalDragging] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const addListContainerRef = useRef<HTMLDivElement>(null);

    // Keyboard shortcut: track hovered card + its DOM element
    const hoveredCardRef = useRef<{ card: Card; element: HTMLElement } | null>(null);

    // Click away for Add List
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addListContainerRef.current && !addListContainerRef.current.contains(event.target as Node)) {
                setIsAddingList(false);
            }
        };

        if (isAddingList) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAddingList]);

    // Initial Data Fetch
    useEffect(() => {
        if (boardId) {
            refreshLists();
            fetchBoardData();
        }
    }, [boardId, refreshLists, fetchBoardData]);

    // Handle deep linking for cards
    useEffect(() => {
        const cardId = searchParams.get('cardId');
        if (cardId && lists.length > 0) {
            const card = lists.flatMap(l => l.cards).find(c => c.id === Number(cardId));
            if (card && (!editingCard || editingCard.id !== card.id)) {
                setEditingCard(card);
                // Clear the param after opening to avoid re-opening on every render
                const params = new URLSearchParams(searchParams);
                params.delete('cardId');
                setSearchParams(params, { replace: true });
            }
        }
    }, [searchParams, lists, editingCard, setSearchParams]);

    const handleTitleSubmit = () => {
        if (tempTitle.trim() && tempTitle !== boardTitle) {
            updateBoardTitle(tempTitle.trim());
        }
        setIsEditingTitle(false);
    };


    const handleCreateList = () => {
        if (newListTitle.trim()) {
            createList(newListTitle);
            setNewListTitle('');
            setIsAddingList(false);
        }
    };

    // Opens quick edit given a card and its DOM element (no MouseEvent needed)
    const openQuickEditForElement = useCallback((card: Card, element: HTMLElement) => {
        const glassCard = element.closest('.glass-card') as HTMLElement | null;
        const target = glassCard || element;
        const rect = target.getBoundingClientRect();
        setQuickEditingCard({
            card,
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        });
    }, []);

    const handleStartQuickEdit = useCallback((e: React.MouseEvent, card: Card) => {
        e.preventDefault();
        e.stopPropagation();
        const element = e.currentTarget.closest('.glass-card') as HTMLElement | null;
        if (element) {
            openQuickEditForElement(card, element);
        }
    }, [openQuickEditForElement]);

    const handleEditCard = useCallback((_e: React.MouseEvent, card: Card) => {
        setEditingCard(card);
    }, []);

    const handleHoverCard = useCallback((_e: React.MouseEvent, card: Card) => {
        const target = (_e.currentTarget as HTMLElement);
        hoveredCardRef.current = { card, element: target };
    }, []);

    const handleLeaveCard = useCallback(() => {
        hoveredCardRef.current = null;
    }, []);

    // Global "E" keyboard shortcut to open quick edit on hovered card
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'e' && e.key !== 'E') return;

            // Don't trigger while typing in an input, textarea, or contentEditable
            const active = document.activeElement;
            if (active) {
                const tag = active.tagName.toLowerCase();
                if (tag === 'input' || tag === 'textarea' || (active as HTMLElement).isContentEditable) {
                    return;
                }
            }

            // Don't trigger if a modal/overlay is already open
            if (editingCard || quickEditingCard) return;

            const hovered = hoveredCardRef.current;
            if (!hovered) return;

            e.preventDefault();
            openQuickEditForElement(hovered.card, hovered.element);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editingCard, quickEditingCard, openQuickEditForElement]);

    const handleDragStart = useCallback(() => {
        setIsGlobalDragging(true);
        document.body.classList.add('is-dragging-card');
    }, []);

    const handleDragEnd = useCallback((result: DropResult) => {
        setIsGlobalDragging(false);
        document.body.classList.remove('is-dragging-card');
        const { destination, source, draggableId } = result;

        // Si no hay destino (drag cancelado)
        if (!destination) return;

        // Si no cambió nada
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const sourceListId = Number(source.droppableId);
        const destListId = Number(destination.droppableId);
        const cardId = Number(draggableId);

        // Update local state avoiding direct mutation to prevent re-render issues
        const newLists = lists.map(list => {
            // Shallow clone the cards array for the lists we are going to modify
            if (list.id === sourceListId || list.id === destListId) {
                return { ...list, cards: [...list.cards] };
            }
            return list;
        });

        const sourceList = newLists.find(l => l.id === sourceListId);
        const destList = newLists.find(l => l.id === destListId);

        if (!sourceList || !destList) return;

        // Remover la tarjeta de la lista origen
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        // Caso 1: Misma lista
        if (sourceListId === destListId) {
            sourceList.cards.splice(destination.index, 0, movedCard);
        } else {
            // Caso 2: Diferente lista
            movedCard.list_id = destListId;
            destList.cards.splice(destination.index, 0, movedCard);
        }

        // Actualizar estado local inmediatamente (optimistic update)
        setLists(newLists);

        // Calcular nueva posición
        const newPosition = destination.index;

        // Sincronizar con backend
        moveCard(cardId, destListId, newPosition);
    }, [lists, setLists, moveCard]);

    const getBackgroundProps = () => {
        if (!boardBackground) return { className: 'bg-background-dark' };

        if (boardBackground.startsWith('from-')) {
            return { className: `bg-gradient-to-br ${boardBackground}` };
        }
        if (boardBackground.startsWith('bg-')) {
            return { className: boardBackground };
        }
        if (boardBackground.startsWith('http') || boardBackground.startsWith('url')) {
            return {
                className: 'board-bg',
                style: { backgroundImage: boardBackground.startsWith('url') ? boardBackground : `url(${boardBackground})` }
            };
        }
        // Fallback for hex/rgb
        return { style: { backgroundColor: boardBackground } };
    };

    const bgProps = getBackgroundProps();

    if (loading && lists.length === 0) {
        return <div className="h-screen w-full flex items-center justify-center bg-background-dark text-white">Cargando tablero...</div>;
    }

    return (
        <div
            className={`flex flex-col h-screen text-text-main ${bgProps.className || ''}`}
            style={bgProps.style}
        >
            <TopNav 
                searchValue={searchQuery} 
                onSearchChange={setSearchQuery}
                hasResults={lists.some(l => l.cards.some(c => {
                    const query = searchQuery.toLowerCase();
                    return c.title.toLowerCase().split(/\s+/).some(word => word.startsWith(query));
                }))}
                results={lists.flatMap(l => 
                    l.cards
                        .filter(c => {
                            const query = searchQuery.toLowerCase();
                            return c.title.toLowerCase().split(/\s+/).some(word => word.startsWith(query));
                        })
                        .map(c => ({
                            id: c.id,
                            title: c.title,
                            subtitle: `${boardTitle}: ${l.title}`,
                            type: 'card' as const,
                            boardId: Number(boardId)
                        }))
                )}
                placeholder="Buscar tarjetas"
            />

            <header className="glass-nav border-b border-white/10 px-4 h-12 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                    {isEditingTitle ? (
                        <input
                            autoFocus
                            className="text-lg font-bold px-2 py-1 rounded bg-[#1d2125] border-2 border-primary outline-none"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={handleTitleSubmit}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                        />
                    ) : (
                        <h1
                            onClick={() => {
                                setTempTitle(boardTitle);
                                setIsEditingTitle(true);
                            }}
                            className="text-lg font-bold px-2 py-1 rounded hover:bg-white/20 cursor-pointer transition-colors"
                        >
                            {boardTitle || 'Cargando...'}
                        </h1>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded hover:bg-white/20 transition-colors">
                        <span className="material-symbols-outlined text-lg">more_horiz</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-x-auto custom-scrollbar p-4 flex gap-4 items-start select-none pb-24">
                <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
                    <div className="flex items-start gap-4 h-full">
                        {lists.map((list) => (
                            <BoardList
                                key={list.id}
                                list={list}
                                onDeleteList={deleteList}
                                onUpdateTitle={updateListTitle}
                                onCreateCard={createCard}
                                onEditCard={handleEditCard}
                                onQuickEditCard={handleStartQuickEdit}
                                onHoverCard={handleHoverCard}
                                onLeaveCard={handleLeaveCard}
                                isGlobalDragging={isGlobalDragging}
                            />
                        ))}

                        <div className="w-64 shrink-0">
                            {isAddingList ? (
                                <div
                                    ref={addListContainerRef}
                                    className="bg-[#101204] p-2 rounded-xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 shadow-2xl"
                                >
                                    <input
                                        autoFocus
                                        className="w-full bg-[#22272b] text-white text-[14px] border border-[#579dff] rounded-[3px] p-2 py-1.5 mb-2 outline-none placeholder:text-[#9facbd]"
                                        placeholder="Introduce el nombre de la lista..."
                                        value={newListTitle}
                                        onChange={(e) => setNewListTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleCreateList}
                                            className="bg-[#579dff] hover:bg-[#85b8ff] text-[#172b4d] text-[14px] font-semibold px-3 py-1.5 rounded-[3px] transition-colors"
                                        >
                                            Añadir lista
                                        </button>
                                        <button
                                            onClick={() => setIsAddingList(false)}
                                            className="p-1.5 text-white/70 hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">close</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingList(true)}
                                    className="w-64 bg-white/20 hover:bg-white/30 transition-colors text-white shrink-0 rounded-xl p-3 flex items-center gap-2 text-sm font-medium"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Añade otra lista
                                </button>
                            )}
                        </div>
                    </div>
                </DragDropContext>
            </main>

            {editingCard && (
                <CardModal
                    card={editingCard}
                    listTitle={lists.find(l => l.id === editingCard.list_id)?.title || 'Lista'}
                    onClose={async (updatedData) => {
                        if (updatedData) {
                            await updateCard(editingCard.id, updatedData);
                        }
                        setEditingCard(null);
                    }}
                />
            )}

            {quickEditingCard && (
                <QuickEditOverlay
                    card={quickEditingCard.card}
                    rect={quickEditingCard.rect}
                    onClose={() => setQuickEditingCard(null)}
                    onSave={(cardId, title) => updateCard(cardId, { title })}
                    onDelete={deleteCard}
                    onOpenCard={(cardId) => {
                        const card = lists.flatMap(l => l.cards).find(c => c.id === cardId);
                        if (card) {
                            setQuickEditingCard(null);
                            setEditingCard(card);
                        }
                    }}
                />
            )}
        </div>
    );
}
