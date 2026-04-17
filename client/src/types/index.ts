export interface Tag {
    id: number;
    name: string;
    color: string;
}

export interface Card {
    id: number;
    title: string;
    description: string;
    position: number;
    list_id: number;
    image_url?: string;
    label?: string;
    priority?: string;
    is_completed?: boolean;
    tags?: Tag[];
}

export interface List {
    id: number;
    title: string;
    position: number;
    board_id: number;
    cards: Card[];
    board_title?: string; // Optional since it might come from a join
}

export interface Board {
    id: number;
    title: string;
    background?: string;
    user_id?: number;
    guest_id?: string;
    created_at?: string;
}
