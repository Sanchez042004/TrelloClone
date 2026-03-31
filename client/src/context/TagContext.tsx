import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getTags, createTag as createTagApi, updateTag as updateTagApi, deleteTag as deleteTagApi } from '../services/api';
import type { Tag } from '../types';

interface TagContextType {
    tags: Tag[];
    loading: boolean;
    refreshTags: () => Promise<void>;
    getTagColor: (name: string) => string;
    createTag: (data: { name?: string; color?: string }) => Promise<void>;
    updateTag: (id: number, data: { name?: string; color?: string }) => Promise<void>;
    deleteTag: (id: number) => Promise<void>;
}

const TagContext = createContext<TagContextType | null>(null);

export function TagProvider({ children }: { children: ReactNode }) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshTags = useCallback(async () => {
        try {
            const res = await getTags();
            setTags(res.data);
        } catch (err) {
            console.error('Failed to fetch tags:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshTags();
    }, [refreshTags]);

    const getTagColor = useCallback((name: string): string => {
        const tag = tags.find(t => t.name === name);
        if (tag && tag.color === '') return ''; // explicitly empty color
        return tag?.color || 'bg-white/20'; // default color fallback
    }, [tags]);

    const createTag = useCallback(async (data: { name?: string; color?: string }) => {
        // Optimistic update
        const tempId = Date.now();
        setTags(prev => [...prev, { id: tempId, name: data.name || '', color: data.color || 'bg-slate-500' }]);
        try {
            await createTagApi(data);
            await refreshTags(); // Fetch true ID from backend
        } catch (err) {
            console.error('Failed to create tag:', err);
            await refreshTags(); // Rollback
        }
    }, [refreshTags]);

    const updateTag = useCallback(async (id: number, data: { name?: string; color?: string }) => {
        // Optimistic update
        setTags(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
        try {
            await updateTagApi(id, data);
        } catch (err) {
            console.error('Failed to update tag:', err);
            await refreshTags(); // Rollback
        }
    }, [refreshTags]);

    const deleteTag = useCallback(async (id: number) => {
        const backup = tags;
        setTags(prev => prev.filter(t => t.id !== id));
        try {
            await deleteTagApi(id);
        } catch (err) {
            console.error('Failed to delete tag:', err);
            setTags(backup); // Rollback
        }
    }, [tags, refreshTags]);

    return (
        <TagContext.Provider value={{
            tags,
            loading,
            refreshTags,
            getTagColor,
            createTag,
            updateTag,
            deleteTag
        }}>
            {children}
        </TagContext.Provider>
    );
}

export function useTags() {
    const ctx = useContext(TagContext);
    if (!ctx) throw new Error('useTags must be used within TagProvider');
    return ctx;
}
