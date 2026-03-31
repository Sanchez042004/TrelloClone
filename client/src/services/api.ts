import axios from 'axios';

const API_URL = '';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Interceptor removed as cookies are handled automatically by browser

// Auth
export const register = (email: string, password: string) =>
    api.post('/auth/register', { email, password });

export const login = (email: string, password: string) =>
    api.post('/auth/login', { email, password });

export const verifyToken = () =>
    api.get('/auth/is-verify');

export const logout = () =>
    api.post('/auth/logout');

export const getGuestSession = () =>
    api.get('/auth/guest-session');

// Boards
export const getBoards = () => {
    return api.get('/boards');
};

export const getBoardById = (id: string | number) =>
    api.get(`/boards/${id}`);

export const updateBoard = (id: string | number, updates: any) =>
    api.put(`/boards/${id}`, { ...updates });

export const createBoard = (title: string, background?: string) =>
    api.post('/boards', { title, background });

export const deleteBoard = (id: string | number) => {
    return api.delete(`/boards/${id}`);
};

// Lists
export const getListsByBoard = (boardId: string | number) =>
    api.get(`/lists/board/${boardId}`);

export const createList = (title: string, board_id: string | number) =>
    api.post('/lists', { title, board_id });

export const deleteList = (id: string | number) =>
    api.delete(`/lists/${id}`);

export const updateList = (id: string | number, updates: any) =>
    api.put(`/lists/${id}`, updates);

// Cards
export const getCardsByList = (listId: string | number) =>
    api.get(`/cards/list/${listId}`);

export const createCard = (title: string, description: string, list_id: string | number, extra: any = {}) =>
    api.post('/cards', { title, description, list_id, ...extra });

export const updateCard = (id: string | number, updates: any) =>
    api.put(`/cards/${id}`, updates);

export const deleteCard = (id: string | number) =>
    api.delete(`/cards/${id}`);

// Tags
export const getTags = () =>
    api.get('/tags');

export const createTag = (data: { name?: string; color?: string }) =>
    api.post('/tags', data);

export const updateTag = (id: number, updates: { name?: string; color?: string }) =>
    api.put(`/tags/${id}`, updates);

export const deleteTag = (id: number) =>
    api.delete(`/tags/${id}`);

export default api;
