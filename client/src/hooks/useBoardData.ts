import { useState, useCallback } from 'react';
import type { List } from '../types';
import {
    getListsByBoard as apiFetchLists,
    createList as apiCreateList,
    deleteList as apiDeleteList,
    updateList as apiUpdateList,
    createCard as apiCreateCard,
    updateCard as apiUpdateCard,
    updateBoard as apiUpdateBoard,
    deleteCard as apiDeleteCard,
    getBoardById,
    getBoards as apiFetchBoards
} from '../services/api';

export const useBoardData = (boardId: number | string) => {
    const [lists, setLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const [boardBackground, setBoardBackground] = useState<string>('bg-[#1d2125]'); // Default dark
    const [boardTitle, setBoardTitle] = useState<string>('');

    const refreshLists = useCallback(async () => {
        try {
            const response = await apiFetchLists(boardId);
            setLists(response.data);
        } catch (error) {
            console.error('Error fetching lists:', error);
        } finally {
            setLoading(false);
        }
    }, [boardId]);

    const fetchBoardData = useCallback(async () => {
        try {
            const response = await getBoardById(boardId);
            if (response.data) {
                if (response.data.background) setBoardBackground(response.data.background);
                if (response.data.title) setBoardTitle(response.data.title);
            } else {
                // Fallback
                const boardsRes = await apiFetchBoards();
                const currentBoard = boardsRes.data.find((b: any) => b.id === Number(boardId));
                if (currentBoard) {
                    if (currentBoard.background) setBoardBackground(currentBoard.background);
                    if (currentBoard.title) setBoardTitle(currentBoard.title);
                }
            }
        } catch (error) {
            console.error('Error fetching board data:', error);
        }
    }, [boardId]);

    const updateBoardTitle = useCallback(async (title: string) => {
        try {
            setBoardTitle(title); // Optimistic
            await apiUpdateBoard(boardId, { title });
        } catch (error) {
            console.error('Error updating board title:', error);
            fetchBoardData(); // Revert on error
        }
    }, [boardId, fetchBoardData]);

    const createList = useCallback(async (title: string) => {
        try {
            setIsCreatingList(true);
            await apiCreateList(title, boardId);
            await refreshLists();
        } catch (error) {
            console.error('Error creating list:', error);
        } finally {
            setIsCreatingList(false);
        }
    }, [boardId, refreshLists]);

    const deleteList = useCallback(async (listId: number) => {
        try {
            await apiDeleteList(listId);
            refreshLists();
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    }, [refreshLists]);

    const updateListTitle = useCallback(async (listId: number, title: string) => {
        try {
            // Optimistic update
            setLists(prevLists => prevLists.map(list =>
                list.id === listId ? { ...list, title } : list
            ));
            await apiUpdateList(listId, { title });
            // No need to refreshLists() if we trust our local state, 
            // but we can do it in the background if needed. 
            // For now, removing it to avoid unnecessary flashes.
        } catch (error) {
            console.error('Error updating list:', error);
            refreshLists(); // Revert/Sync on error
        }
    }, [refreshLists]);

    const createCard = useCallback(async (title: string, listId: number) => {
        try {
            setIsCreatingCard(true);
            // Using default empty options for now as UI only provides title
            await apiCreateCard(title, '', listId, {});
            await refreshLists();
        } catch (error) {
            console.error('Error creating card:', error);
        } finally {
            setIsCreatingCard(false);
        }
    }, [refreshLists]);

    const updateCard = useCallback(async (cardId: number, updates: any) => {
        try {
            await apiUpdateCard(cardId, updates);
            refreshLists();
        } catch (error) {
            console.error('Error updating card:', error);
        }
    }, [refreshLists]);

    // Optimistic update wrapper or just direct call
    const moveCard = useCallback(async (cardId: number, newListId: number, newPos: number) => {
        try {
            await apiUpdateCard(cardId, { list_id: newListId, position: newPos });
            // Removed refreshLists(); to prevent optimistic UI state from being wiped out
        } catch (error) {
            console.error('Error moving card:', error);
            refreshLists(); // Revert on error
        }
    }, [refreshLists]);

    const deleteCard = useCallback(async (cardId: number) => {
        try {
            await apiDeleteCard(cardId);
            refreshLists();
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    }, [refreshLists]);

    return {
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
    };
};
