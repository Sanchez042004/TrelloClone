import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useBoardData } from '../hooks/useBoardData';
import BoardList from '../components/board/BoardList';
import CardModal from '../components/board/CardModal';
import QuickEditOverlay from '../components/board/QuickEditOverlay';
import TopNav from '../components/TopNav';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { Card } from '../types';

export default function BoardView() {
    const { boardId } = useParams<{ boardId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        lists,
        setLists,
        loading,
        isCreatingList,
        isCreatingCard,
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

    const hoveredCardRef = useRef<{ card: Card; element: HTMLElement } | null>(null);

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

    useEffect(() => {
        if (boardTitle) {
            document.title = `${boardTitle}`;
        } else {
            document.title = 'Cargando...';
        }
        // Restore default on unmount
        return () => {
            document.title = 'Trello Clone';
        };
    }, [boardTitle]);

    useEffect(() => {
        if (boardId) {
            refreshLists();
            fetchBoardData();
        }
    }, [boardId, refreshLists, fetchBoardData]);

    useEffect(() => {
        const cardId = searchParams.get('cardId');
        if (cardId && lists.length > 0) {
            const card = lists.flatMap(l => l.cards).find(c => c.id === Number(cardId));
            if (card && (!editingCard || editingCard.id !== card.id)) {
                setEditingCard(card);
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

    const handleCreateList = async () => {
        if (newListTitle.trim()) {
            await createList(newListTitle);
            setNewListTitle('');
            setIsAddingList(false);
        }
    };

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger if E is pressed without modifiers
            if (e.key.toLowerCase() !== 'e' || e.ctrlKey || e.metaKey || e.altKey) return;

            // Don't trigger if any modal/overlay is already open
            if (editingCard || quickEditingCard) return;

            // Don't trigger if user is typing in an input/textarea
            const active = document.activeElement;
            if (active) {
                const tag = active.tagName.toLowerCase();
                if (tag === 'input' || tag === 'textarea' || (active as HTMLElement).isContentEditable) {
                    return;
                }
            }

            const hovered = hoveredCardRef.current;
            if (!hovered || !hovered.element) return;

            // If we are here, we can trigger quick edit
            e.preventDefault();
            e.stopPropagation();
            openQuickEditForElement(hovered.card, hovered.element);
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [editingCard, quickEditingCard, openQuickEditForElement]);

    const handleDragStart = useCallback(() => {
        setIsGlobalDragging(true);
        document.body.classList.add('is-dragging-card');
    }, []);

    const handleDragEnd = useCallback((result: DropResult) => {
        setIsGlobalDragging(false);
        document.body.classList.remove('is-dragging-card');
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const sourceListId = Number(source.droppableId);
        const destListId = Number(destination.droppableId);
        const cardId = Number(draggableId);

        const newLists = lists.map(list => {
            if (list.id === sourceListId || list.id === destListId) {
                return { ...list, cards: [...list.cards] };
            }
            return list;
        });

        const sourceList = newLists.find(l => l.id === sourceListId);
        const destList = newLists.find(l => l.id === destListId);
        if (!sourceList || !destList) return;

        const [movedCard] = sourceList.cards.splice(source.index, 1);
        if (sourceListId === destListId) {
            sourceList.cards.splice(destination.index, 0, movedCard);
        } else {
            movedCard.list_id = destListId;
            destList.cards.splice(destination.index, 0, movedCard);
        }
        setLists(newLists);
        moveCard(cardId, destListId, destination.index);
    }, [lists, setLists, moveCard]);

    const getBackgroundProps = () => {
        if (!boardBackground) return { className: 'bg-background-dark' };
        if (boardBackground.startsWith('from-')) return { className: `bg-gradient-to-br ${boardBackground}` };
        if (boardBackground.startsWith('bg-')) return { className: boardBackground };
        if (boardBackground.startsWith('http') || boardBackground.startsWith('url')) {
            return {
                className: 'board-bg',
                style: { backgroundImage: boardBackground.startsWith('url') ? boardBackground : `url(${boardBackground})` }
            };
        }
        return { style: { backgroundColor: boardBackground } };
    };

    const bgProps = getBackgroundProps();

    if (loading && lists.length === 0) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background-dark text-white font-sans">
                <LoadingSpinner size="lg" color="text-trello-blue" />
                <p className="mt-4 text-text-muted animate-pulse font-medium">Cargando tablero...</p>
            </div>
        );
    }

    const filteredCards = searchQuery.trim() === '' ? [] : lists.flatMap(list =>
        list.cards
            .filter(card => {
                const query = searchQuery.toLowerCase();
                return card.title.toLowerCase().split(/\s+/).some(word => word.startsWith(query));
            })
            .map(card => ({
                id: card.id,
                title: card.title,
                subtitle: list.title,
                type: 'card' as const,
                boardId: Number(boardId)
            }))
    );

    return (
        <div className={`flex flex-col h-screen text-text-main ${bgProps.className || ''}`} style={bgProps.style}>
            <TopNav
                searchValue={searchQuery} onSearchChange={setSearchQuery}
                hasResults={filteredCards.length > 0}
                results={filteredCards}
                placeholder="Buscar tarjetas"
            />

            <header className="glass-nav border-b border-white/10 px-4 h-12 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                    {isEditingTitle ? (
                        <input
                            autoFocus className="text-lg font-bold px-2 py-1 rounded bg-[#1d2125] border-2 border-primary outline-none"
                            value={tempTitle} onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={handleTitleSubmit} onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                        />
                    ) : (
                        <h1 onClick={() => { setTempTitle(boardTitle); setIsEditingTitle(true); }} className="text-lg font-bold px-2 py-1 rounded hover:bg-white/20 cursor-pointer transition-colors">
                            {boardTitle || 'Cargando...'}
                        </h1>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-x-auto custom-scrollbar p-4 flex gap-4 items-start select-none pb-24">
                <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
                    <div className="flex items-start gap-4 h-full">
                        {lists.map((list) => (
                            <BoardList
                                key={list.id} list={list} onDeleteList={deleteList} onUpdateTitle={updateListTitle}
                                onCreateCard={createCard} onEditCard={handleEditCard} onQuickEditCard={handleStartQuickEdit}
                                onHoverCard={handleHoverCard} onLeaveCard={handleLeaveCard} isGlobalDragging={isGlobalDragging}
                                isCreatingCard={isCreatingCard}
                            />
                        ))}

                        <div className="w-64 shrink-0">
                            {isAddingList ? (
                                <div ref={addListContainerRef} className="bg-[#101204] p-2 rounded-xl border border-white/10">
                                    <input
                                        autoFocus className="w-full bg-[#22272b] text-white text-[14px] border border-[#579dff] rounded-[3px] p-2 py-1.5 mb-2 outline-none"
                                        placeholder="Introduce el nombre de la lista..."
                                        value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                                        disabled={isCreatingList}
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleCreateList} disabled={isCreatingList}
                                            className="bg-[#579dff] hover:bg-[#85b8ff] text-[#172b4d] text-[14px] font-semibold px-3 py-1.5 rounded-[3px] disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isCreatingList && <LoadingSpinner size="sm" color="text-[#172b4d]" />}
                                            {isCreatingList ? 'Añadiendo...' : 'Añadir lista'}
                                        </button>
                                        <button onClick={() => setIsAddingList(false)} disabled={isCreatingList} className="p-1.5 text-white/70 hover:text-white">
                                            <span className="material-symbols-outlined text-[20px]">close</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingList(true)}
                                    className="w-64 bg-white/20 hover:bg-white/30 transition-colors text-white shrink-0 rounded-xl p-3 flex items-center gap-2 text-sm font-medium"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span> Añade otra lista
                                </button>
                            )}
                        </div>
                    </div>
                </DragDropContext>
            </main>

            {editingCard && (
                <CardModal
                    card={editingCard} listTitle={lists.find(l => l.id === editingCard.list_id)?.title || 'Lista'}
                    onClose={(updatedData) => {
                        // Optimistic close: Close immediately and update in background
                        if (updatedData) {
                            updateCard(editingCard.id, updatedData);
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
                    onSave={async (cardId, newTitle) => {
                        await updateCard(cardId, { title: newTitle });
                        setQuickEditingCard(null);
                    }}
                    onDelete={async (cardId) => {
                        await deleteCard(cardId);
                        setQuickEditingCard(null);
                    }}
                    onOpenCard={(cardId) => {
                        const cardToOpen = lists.flatMap(l => l.cards).find(c => c.id === cardId);
                        if (cardToOpen) setEditingCard(cardToOpen);
                        setQuickEditingCard(null);
                    }}
                />
            )}
        </div>
    );
}
