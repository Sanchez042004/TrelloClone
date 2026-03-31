import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import type { Card } from '../../types';
import { useTags } from '../../context/TagContext';

interface CardModalProps {
    card: Card;
    listTitle: string;
    onClose: (updatedCardData?: any) => void;
}



const LABEL_COLOR_PALETTE = [
    'bg-[#21855a]', 'bg-[#4b6c1f]', 'bg-[#7f5b00]', 'bg-[#b33529]', 'bg-[#6549a1]',
    'bg-[#216e4e]', 'bg-[#946f00]', 'bg-[#b35b00]', 'bg-[#c9372c]', 'bg-[#9f3ac9]',
    'bg-[#1f845a]', 'bg-[#d4a72c]', 'bg-[#d97a21]', 'bg-[#e77c7c]', 'bg-[#c49be0]',
    'bg-[#0055cc]', 'bg-[#206a83]', 'bg-[#4c6b1f]', 'bg-[#943d73]', 'bg-[#8c9bab]',
    'bg-[#0c66e4]', 'bg-[#2898bd]', 'bg-[#4c9c2e]', 'bg-[#e774bb]', 'bg-[#8590a2]',
    'bg-[#227ad6]', 'bg-[#319ec0]', 'bg-[#5db040]', 'bg-[#ec85c7]', 'bg-[#b3bac5]',
];

export default function CardModal({ card, listTitle, onClose }: CardModalProps) {
    const { tags, getTagColor, createTag, updateTag, deleteTag } = useTags();

    const [editCardData, setEditCardData] = useState({
        title: card.title,
        description: card.description || '',
        label: card.label || '',
        priority: card.priority || '',
        image_url: card.image_url || ''
    });

    // State for Labels Popover
    const [isLabelsPopoverOpen, setIsLabelsPopoverOpen] = useState(false);
    const [labelsPopoverPosition, setLabelsPopoverPosition] = useState({ top: 0, left: 0 });
    const [labelsSearchQuery, setLabelsSearchQuery] = useState('');

    // State for Edit Label sub-panel
    const [editingTagId, setEditingTagId] = useState<number | 'new' | null>(null);
    const [editLabelName, setEditLabelName] = useState('');
    const [editLabelColor, setEditLabelColor] = useState('');
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // State for Description Edit Mode
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const initialHtmlRef = useRef(''); // Constant ref during active edit session

    // Track active formatting states
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        list: false,
        h3: false
    });

    const modalRef = useRef<HTMLDivElement>(null);
    const labelsSectionRef = useRef<HTMLDivElement>(null);
    const labelsPopoverRef = useRef<HTMLDivElement>(null);

    // Close labels popover on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isLabelsPopoverOpen) {
                const target = e.target as Node;
                const clickedInsidePopover = labelsPopoverRef.current?.contains(target);
                const clickedInsideSection = labelsSectionRef.current?.contains(target);
                
                if (!clickedInsidePopover && !clickedInsideSection) {
                    setIsLabelsPopoverOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isLabelsPopoverOpen]);

    const hasTextContent = useCallback((html?: string) => {
        if (!html) return false;
        const text = html.replace(/<[^>]+>/g, '').trim();
        // Since we don't have images in our editor yet, tracking just text length is accurate
        return text.length > 0;
    }, []);

    // Save on unmount or close is handled by parent passing the data back
    const handleClose = useCallback(() => {
        // Automatically save description if we were editing when closing
        if (isEditingDescription && editorRef.current) {
            let html = editorRef.current.innerHTML;
            if (!hasTextContent(html)) html = ''; // Clean up empty HTML
            if (html !== editCardData.description) {
                onClose({ ...editCardData, description: html });
                return;
            }
        }
        onClose(editCardData);
    }, [isEditingDescription, editCardData, onClose, hasTextContent]);

    // Close modal with Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                // Don't close the whole modal if we're in a popover or editing description
                if (isLabelsPopoverOpen) {
                    setIsLabelsPopoverOpen(false);
                    return;
                }
                if (isEditingDescription) {
                    setIsEditingDescription(false);
                    return;
                }
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose, isLabelsPopoverOpen, isEditingDescription]);

    const handleSaveDescription = useCallback(() => {
        let html = editorRef.current?.innerHTML || '';
        if (!hasTextContent(html)) html = ''; // Clean up empty HTML
        setEditCardData(prev => ({ ...prev, description: html }));
        setIsEditingDescription(false);
    }, [hasTextContent]);

    const checkFormatState = useCallback(() => {
        if (!editorRef.current) return;

        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            list: document.queryCommandState('insertUnorderedList'),
            h3: document.queryCommandValue('formatBlock') === 'h3'
        });
    }, []);

    const handleFormat = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        checkFormatState(); // Re-check formatting state immediately after applying
    }, [checkFormatState]);

    const editorElement = useMemo(() => {
        if (!isEditingDescription) return null;
        return (
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full min-h-[108px] p-4 bg-transparent text-white border-none focus:ring-0 text-[14px] outline-none editor-content"
                dangerouslySetInnerHTML={{ __html: initialHtmlRef.current }}
                data-placeholder="Añadir una descripción más detallada..."
                onKeyUp={checkFormatState}
                onMouseUp={checkFormatState}
                onSelect={checkFormatState}
                onKeyDown={(e) => {
                    checkFormatState();
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSaveDescription();
                    } else if (e.key === 'Escape') {
                        e.stopPropagation();
                        setIsEditingDescription(false);
                    }
                }}
            />
        );
    }, [isEditingDescription, checkFormatState, handleSaveDescription]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-[2px] p-4 pt-16 animate-none"
            onClick={handleClose}
        >
            <div
                ref={modalRef}
                className="bg-[#22272b] w-full max-w-[850px] max-h-[92vh] overflow-hidden rounded-xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] flex flex-col animate-in zoom-in-95 duration-300 border border-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Thin Modal Header Bar */}
                <div className="h-12 w-full shrink-0 flex justify-between items-center px-4 bg-[#22272b] border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md flex items-center gap-2 cursor-pointer transition-all">
                            <span className="text-white text-[13px] font-semibold">
                                {listTitle}
                            </span>
                            <span className="material-icons-outlined text-white/70 text-[14px]">expand_more</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleClose}
                            className="p-1.5 hover:bg-white/10 rounded-md transition-all text-white/80 hover:text-white"
                        >
                            <span className="material-icons-outlined text-[24px]">close</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1 p-8 pt-8 space-y-8 relative">
                    {/* Title Section */}
                    <div className="flex gap-4 items-start">
                        <div className="mt-1.5 size-5 flex items-center justify-center border-2 border-white/20 rounded-full shrink-0">
                            <div className="size-1.5 bg-white/20 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                            <input
                                className="w-full text-2xl font-bold bg-transparent border-none p-0 focus:ring-0 text-white placeholder:text-white/20"
                                value={editCardData.title}
                                onChange={(e) => setEditCardData({ ...editCardData, title: e.target.value })}
                                placeholder="Título de la tarjeta"
                            />
                        </div>
                    </div>

                    {/* Labels Section */}
                    <div className="pl-9 space-y-3 relative" ref={labelsSectionRef}>
                        <p className="text-[12px] font-bold text-white/40 uppercase tracking-wide">Etiquetas</p>
                        <div className="flex flex-wrap gap-2">
                            {editCardData.label ? (
                                editCardData.label.split(',').filter(Boolean).map((lbl, idx) => {
                                    const rawColor = getTagColor(lbl.trim());
                                    // If no color, use a default gray background in the card modal
                                    const displayColor = rawColor || 'bg-[#2c333a] hover:bg-[#38404a]';
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                if (!isLabelsPopoverOpen) {
                                                    if (labelsSectionRef.current) {
                                                        const rect = labelsSectionRef.current.getBoundingClientRect();
                                                        setLabelsPopoverPosition({ top: rect.bottom + 8, left: rect.left + 36 }); // +36 to align with the buttons, not the padding of the section container
                                                    }
                                                }
                                                setEditingTagId(null);
                                                setIsConfirmingDelete(false);
                                                setIsLabelsPopoverOpen(true);
                                            }}
                                            className={`h-8 px-4 flex items-center justify-center rounded-[3px] text-[13px] font-bold text-white cursor-pointer transition-all ${rawColor ? 'hover:brightness-110' : ''} ${displayColor}`}
                                        >
                                            {lbl.trim()}
                                        </div>
                                    );
                                })
                            ) : null}
                            <button
                                onClick={() => {
                                    if (!isLabelsPopoverOpen) {
                                        if (labelsSectionRef.current) {
                                            const rect = labelsSectionRef.current.getBoundingClientRect();
                                            setLabelsPopoverPosition({ top: rect.bottom + 8, left: rect.left + 36 });
                                        }
                                    }
                                    setEditingTagId(null);
                                    setIsConfirmingDelete(false);
                                    setIsLabelsPopoverOpen(true);
                                }}
                                className="size-8 bg-[#2c333a] hover:bg-[#38404a] rounded-md flex items-center justify-center border border-white/5 text-white/40 hover:text-white transition-all shadow-sm"
                            >
                                <span className="material-icons-outlined text-sm">add</span>
                            </button>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="pl-9 space-y-4">
                        <div className="flex items-center justify-between -ml-9 h-8">
                            <div className="flex items-center gap-3">
                                <span className="material-icons-outlined text-white/70 text-[24px]">subject</span>
                                <h3 className="text-[16px] font-semibold text-white/90">Descripción</h3>
                            </div>
                            {!isEditingDescription && hasTextContent(editCardData.description) && (
                                <button
                                    onClick={() => {
                                        initialHtmlRef.current = editCardData.description || '';
                                        setIsEditingDescription(true);
                                    }}
                                    className="bg-white/10 hover:bg-white/20 text-white/90 text-[14px] font-medium px-3 py-1.5 rounded-[3px] transition-colors"
                                >
                                    Editar
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {isEditingDescription ? (
                                <div className="space-y-3">
                                    <div className="w-full bg-[#22272b] rounded-[3px] border border-[#85b8ff] focus-within:ring-1 focus-within:ring-[#85b8ff] shadow-sm overflow-hidden flex flex-col transition-all">
                                        {/* Rich Text Toolbar */}
                                        <div className="flex items-center justify-between border-b border-white/10 px-1 py-1 bg-[#22272b]">
                                            <div className="flex items-center gap-1">
                                                <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('formatBlock', 'H3')} title="Formato de texto" className={`p-1.5 rounded transition-colors flex items-center justify-center ${activeFormats.h3 ? 'bg-trello-blue/20 text-trello-blue' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}>
                                                    <span className="material-icons-outlined text-[18px]">format_size</span>
                                                    <span className="material-icons-outlined text-[14px] ml-0.5">expand_more</span>
                                                </button>
                                                <div className="w-px h-4 bg-white/10 mx-1"></div>
                                                <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('bold')} title="Negrita" className={`size-7 rounded transition-colors flex items-center justify-center ${activeFormats.bold ? 'bg-trello-blue/20 text-trello-blue' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}>
                                                    <span className="material-icons-outlined text-[18px]">format_bold</span>
                                                </button>
                                                <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('italic')} title="Cursiva" className={`size-7 rounded transition-colors flex items-center justify-center ${activeFormats.italic ? 'bg-trello-blue/20 text-trello-blue' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}>
                                                    <span className="material-icons-outlined text-[18px]">format_italic</span>
                                                </button>
                                                <button disabled title="Más formato (No disponible)" className="size-7 rounded text-white/20 flex items-center justify-center cursor-default">
                                                    <span className="material-icons-outlined text-[18px] tracking-widest">more_horiz</span>
                                                </button>
                                                <div className="w-px h-4 bg-white/10 mx-1"></div>
                                                <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('insertUnorderedList')} title="Lista" className={`p-1.5 rounded transition-colors flex items-center justify-center ${activeFormats.list ? 'bg-trello-blue/20 text-trello-blue' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}>
                                                    <span className="material-icons-outlined text-[18px]">format_list_bulleted</span>
                                                </button>
                                                <div className="w-px h-4 bg-white/10 mx-1"></div>
                                                <button disabled title="Enlace (No disponible)" className="size-7 rounded text-white/20 flex items-center justify-center cursor-default">
                                                    <span className="material-icons-outlined text-[18px]">link</span>
                                                </button>
                                                <button disabled title="Añadir (No disponible)" className="p-1.5 rounded text-white/20 flex items-center justify-center cursor-default">
                                                    <span className="material-icons-outlined text-[18px]">add</span>
                                                    <span className="material-icons-outlined text-[14px] ml-0.5">expand_more</span>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button disabled title="Mencionar (No disponible)" className="size-7 rounded text-white/20 flex items-center justify-center cursor-default">
                                                    <span className="material-icons-outlined text-[18px]">alternate_email</span>
                                                </button>
                                                <button disabled title="Emoji (No disponible)" className="size-7 rounded text-white/20 flex items-center justify-center cursor-default">
                                                    <span className="material-icons-outlined text-[18px]">sentiment_satisfied</span>
                                                </button>
                                                <button disabled title="Ayuda con Markdown (No disponible)" className="size-7 rounded text-white/20 flex items-center justify-center cursor-default">
                                                    <span className="material-icons-outlined text-[18px]">help_outline</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Editor Area (WYSIWYG) */}
                                        {editorElement}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            onClick={handleSaveDescription}
                                            className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] font-semibold text-[14px] px-3 py-1.5 rounded-[3px] transition-colors active:scale-95"
                                        >
                                            Guardar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingDescription(false);
                                            }}
                                            className="text-white hover:bg-white/10 px-3 py-1.5 rounded-[3px] font-semibold text-[14px] transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => {
                                        initialHtmlRef.current = editCardData.description || '';
                                        setIsEditingDescription(true);
                                    }}
                                    className={`w-full ${hasTextContent(editCardData.description) ? 'py-1 cursor-pointer' : 'min-h-[56px] p-3 bg-white/5 hover:bg-white/10 rounded-[3px] cursor-pointer transition-colors'} text-[14px] editor-content`}
                                >
                                    {hasTextContent(editCardData.description) ? (
                                        <div className="text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: editCardData.description }} />
                                    ) : (
                                        <span className="text-white/60 font-medium">Añadir una descripción más detallada...</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Labels Popover - Outside clipping container */}
            {isLabelsPopoverOpen && (
                <div
                    ref={labelsPopoverRef}
                    className="fixed w-[300px] bg-[#22272b] border border-white/10 rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.5)] z-[200] p-3 animate-none"
                    style={{
                        top: labelsPopoverPosition.top,
                        left: labelsPopoverPosition.left
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isConfirmingDelete ? (
                        /* ─── Delete Confirmation Sub-Panel ─── */
                        <div>
                            <div className="flex items-center mb-4 px-1">
                                <button
                                    onClick={() => setIsConfirmingDelete(false)}
                                    className="text-white/40 hover:text-white p-1"
                                >
                                    <span className="material-icons-outlined text-[18px]">chevron_left</span>
                                </button>
                                <span className="text-[14px] font-semibold text-white/60 text-center flex-1">
                                    Eliminar etiqueta
                                </span>
                                <button onClick={() => { setIsConfirmingDelete(false); setEditingTagId(null); setIsLabelsPopoverOpen(false); }} className="text-white/40 hover:text-white p-1">
                                    <span className="material-icons-outlined text-[18px]">close</span>
                                </button>
                            </div>
                            <div className="px-1 mb-4">
                                <p className="text-[14px] text-white/80 leading-relaxed font-medium">
                                    Se eliminará esta etiqueta de todas las tarjetas. Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <div className="px-1">
                                <button
                                    onClick={async () => {
                                        const tag = tags.find(t => t.id === editingTagId);
                                        if (!tag) return;

                                        await deleteTag(editingTagId as number);

                                        if (editCardData.label) {
                                            const currentLabels = editCardData.label.split(',').map(s => s.trim()).filter(Boolean);
                                            const updated = currentLabels.filter(l => l !== tag.name);
                                            setEditCardData(prev => ({ ...prev, label: updated.join(', ') }));
                                        }

                                        setIsConfirmingDelete(false);
                                        setEditingTagId(null);
                                    }}
                                    className="w-full bg-[#f87168] hover:bg-[#ff8a82] text-[#1d2125] font-semibold text-[13px] px-4 py-2 rounded-[3px] transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ) : editingTagId !== null ? (
                        /* ─── Edit Label Sub-Panel ─── */
                        <div>
                            <div className="flex items-center mb-4 px-1">
                                <button
                                    onClick={() => setEditingTagId(null)}
                                    className="text-white/40 hover:text-white p-1"
                                >
                                    <span className="material-icons-outlined text-[18px]">chevron_left</span>
                                </button>
                                <span className="text-[14px] font-semibold text-white/60 text-center flex-1">
                                    {editingTagId === 'new' ? 'Crear etiqueta' : 'Editar etiqueta'}
                                </span>
                                <button onClick={() => { setEditingTagId(null); setIsLabelsPopoverOpen(false); }} className="text-white/40 hover:text-white p-1">
                                    <span className="material-icons-outlined text-[18px]">close</span>
                                </button>
                            </div>

                            {/* Color Preview */}
                            <div className="flex justify-center mb-4 px-1">
                                <div className={`w-full h-9 rounded-[4px] ${editLabelColor || 'bg-[#2c333a]'} flex items-center justify-center`}>
                                    <span className="text-white text-sm font-semibold truncate px-3">{editLabelName}</span>
                                </div>
                            </div>

                            {/* Name Input */}
                            <div className="mb-4 px-1">
                                <label className="text-[12px] font-bold text-white/50 mb-1.5 block">Título</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#1c2125] text-white border border-white/20 rounded-[3px] px-3 py-2 text-sm focus:outline-none focus:border-trello-blue transition-colors"
                                    value={editLabelName}
                                    onChange={(e) => setEditLabelName(e.target.value)}
                                />
                            </div>

                            {/* Color Grid */}
                            <div className="mb-4 px-1">
                                <label className="text-[12px] font-bold text-white/50 mb-2 block">Seleccionar un color</label>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {LABEL_COLOR_PALETTE.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setEditLabelColor(color)}
                                            className={`h-8 rounded-[4px] ${color} hover:brightness-110 transition-all relative ${editLabelColor === color ? 'ring-2 ring-white ring-offset-1 ring-offset-[#22272b]' : ''}`}
                                        >
                                            {editLabelColor === color && (
                                                <span className="material-icons-outlined text-white text-[16px] absolute inset-0 flex items-center justify-center">check</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Remove color */}
                            <button
                                onClick={() => setEditLabelColor('')}
                                className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#2c333a] hover:bg-[#38404a] text-white/80 text-[13px] font-medium rounded-md transition-all mb-4"
                            >
                                <span className="material-icons-outlined text-[16px]">close</span>
                                Quitar color
                            </button>

                            <div className="h-px bg-white/5 mx-1 mb-3" />

                            {/* Save / Delete buttons */}
                            <div className="flex justify-between px-1">
                                <button
                                    onClick={async () => {
                                        const newName = editLabelName.trim();
                                        const newColor = editLabelColor;

                                        if (editingTagId === 'new') {
                                            // Create new tag
                                            // We won't automatically map it to the card string to exactly mirror your snippet description, but we can if we want to
                                            await createTag({ name: newName, color: newColor });
                                        } else {
                                            // Edit existing tag
                                            const tag = tags.find(t => t.id === editingTagId);
                                            if (!tag) return;
                                            const oldName = tag.name;

                                            await updateTag(editingTagId, { name: newName || oldName, color: newColor });

                                            if (oldName !== newName && editCardData.label) {
                                                const currentLabels = editCardData.label.split(',').map(s => s.trim()).filter(Boolean);
                                                const updated = currentLabels.map(l => l === oldName ? newName : l);
                                                setEditCardData(prev => ({ ...prev, label: updated.join(', ') }));
                                            }
                                        }

                                        setEditingTagId(null);
                                    }}
                                    className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] font-semibold text-[13px] px-4 py-2 rounded-[3px] transition-colors"
                                >
                                    {editingTagId === 'new' ? 'Crear' : 'Guardar'}
                                </button>

                                {editingTagId !== 'new' && (
                                    <button
                                        onClick={() => setIsConfirmingDelete(true)}
                                        className="bg-[#c9372c] hover:bg-[#ae2a19] text-white font-semibold text-[13px] px-4 py-2 rounded-[3px] transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* ─── Labels List Panel ─── */
                        <div>
                            <div className="flex justify-between items-center mb-4 px-1">
                                <span className="text-[14px] font-semibold text-white/60 text-center flex-1">Etiquetas</span>
                                <button onClick={() => setIsLabelsPopoverOpen(false)} className="text-white/40 hover:text-white">
                                    <span className="material-icons-outlined text-[18px]">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="px-1">
                                    <input
                                        type="text"
                                        placeholder="Buscar etiquetas..."
                                        className="w-full bg-[#1c2125] text-white border border-trello-blue/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-trello-blue"
                                        value={labelsSearchQuery}
                                        onChange={(e) => setLabelsSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5 px-1">
                                    <p className="text-[12px] font-bold text-white/40 mb-2">Etiquetas</p>
                                    {tags.filter(t => t.name.toLowerCase().includes(labelsSearchQuery.toLowerCase())).map((tag) => {
                                        const currentLabels = editCardData.label.split(',').map(s => s.trim()).filter(Boolean);
                                        const isSelected = currentLabels.includes(tag.name);
                                        const displayColor = tag.color || 'bg-[#2c333a] hover:bg-[#38404a]';

                                        return (
                                            <div key={tag.id} className="flex items-center gap-2 group">
                                                <div
                                                    onClick={() => {
                                                        const nextLabels = isSelected
                                                            ? currentLabels.filter(l => l !== tag.name)
                                                            : [...currentLabels, tag.name];
                                                        setEditCardData({ ...editCardData, label: nextLabels.join(', ') });
                                                    }}
                                                    className={`size-4 rounded-[2px] border-2 flex items-center justify-center cursor-pointer transition-all shrink-0 ${isSelected ? 'border-trello-blue bg-trello-blue/10' : 'border-white/20 hover:border-white/40'}`}
                                                >
                                                    {isSelected && (
                                                        <span className="material-icons-outlined text-trello-blue text-[14px] font-bold">check</span>
                                                    )}
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        const nextLabels = isSelected
                                                            ? currentLabels.filter(l => l !== tag.name)
                                                            : [...currentLabels, tag.name];
                                                        setEditCardData({ ...editCardData, label: nextLabels.join(', ') });
                                                    }}
                                                    className={`flex-1 h-8 rounded-[4px] ${displayColor} ${tag.color ? 'hover:brightness-110' : ''} transition-all cursor-pointer flex items-center px-3 justify-between`}
                                                >
                                                    <span className="text-sm font-semibold text-white">{tag.name}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditLabelName(tag.name);
                                                        setEditLabelColor(tag.color);
                                                        setEditingTagId(tag.id);
                                                    }}
                                                    className="text-white/40 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded shrink-0"
                                                >
                                                    <span className="material-icons-outlined text-[16px]">edit</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-2 pt-2 border-t border-white/10 mx-1">
                                    <button
                                        onClick={() => {
                                            setEditLabelName('');
                                            setEditLabelColor('');
                                            setEditingTagId('new');
                                        }}
                                        className="w-full py-2 bg-[#2c333a] hover:bg-[#38404a] text-white/90 text-[13px] font-semibold rounded-md transition-all"
                                    >
                                        Crear una etiqueta nueva
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
