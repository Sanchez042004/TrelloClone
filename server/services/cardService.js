const prisma = require('../prismaClient');

const getCardsByList = async (listId) => {
    const cards = await prisma.cards.findMany({
        where: { list_id: parseInt(listId) },
        include: {
            card_tags: {
                include: {
                    tags: true
                }
            }
        },
        orderBy: { position: 'asc' }
    });

    return cards.map(card => {
        const tags = card.card_tags
            .map(ct => ct.tags)
            .sort((a, b) => a.name.localeCompare(b.name));

        return {
            ...card,
            label: tags.map(t => t.name).join(','),
            tags // full tag objects: { id, name, color }
        };
    });
};

const createCard = async (cardData) => {
    const { title, description, list_id, image_url, label, priority } = cardData;

    return await prisma.$transaction(async (tx) => {
        // Get max position
        const aggregate = await tx.cards.aggregate({
            _max: { position: true },
            where: { list_id: parseInt(list_id) }
        });
        const maxPos = aggregate._max.position !== null ? aggregate._max.position : -1;
        const newPosition = maxPos + 1;

        // Create Card
        const newCard = await tx.cards.create({
            data: {
                title,
                description: description || '',
                list_id: parseInt(list_id),
                position: newPosition,
                image_url: image_url || null,
                priority: priority || null,
                label: label || null // keep for compat, but we rely on tags
            }
        });

        // Handle Tags
        if (label) {
            await syncTags(tx, newCard.id, label);
        }

        // Return with label string
        return { ...newCard, label: label || '' };
    });
};

const updateCard = async (id, cardData) => {
    const cardId = parseInt(id);

    return await prisma.$transaction(async (tx) => {
        const currentCard = await tx.cards.findUnique({
            where: { id: cardId }
        });

        if (!currentCard) throw new Error('Card not found');

        const oldListId = currentCard.list_id;
        const oldPos = currentCard.position;
        const newListId = cardData.list_id !== undefined ? parseInt(cardData.list_id) : oldListId;
        const newPos = cardData.position !== undefined ? parseInt(cardData.position) : oldPos;

        // Reordering Logic
        if (oldListId === newListId) {
            if (newPos > oldPos) {
                // Moved down: Decrease pos for items between old and new
                await tx.cards.updateMany({
                    where: {
                        list_id: oldListId,
                        position: { gt: oldPos, lte: newPos }
                    },
                    data: { position: { decrement: 1 } }
                });
            } else if (newPos < oldPos) {
                // Moved up: Increase pos for items between new and old
                await tx.cards.updateMany({
                    where: {
                        list_id: oldListId,
                        position: { gte: newPos, lt: oldPos }
                    },
                    data: { position: { increment: 1 } }
                });
            }
        } else {
            // Moved to another list
            // 1. Close gap in old list
            await tx.cards.updateMany({
                where: {
                    list_id: oldListId,
                    position: { gt: oldPos }
                },
                data: { position: { decrement: 1 } }
            });

            // 2. Open gap in new list
            await tx.cards.updateMany({
                where: {
                    list_id: newListId,
                    position: { gte: newPos }
                },
                data: { position: { increment: 1 } }
            });
        }

        // Update Fields
        const updateData = {};
        if (cardData.title !== undefined) updateData.title = cardData.title;
        if (cardData.description !== undefined) updateData.description = cardData.description;
        if (cardData.list_id !== undefined) updateData.list_id = newListId;
        if (cardData.position !== undefined) updateData.position = newPos;
        if (cardData.image_url !== undefined) updateData.image_url = cardData.image_url;
        if (cardData.priority !== undefined) updateData.priority = cardData.priority;
        if (cardData.label !== undefined) updateData.label = cardData.label;
        if (cardData.is_completed !== undefined) updateData.is_completed = cardData.is_completed;

        await tx.cards.update({
            where: { id: cardId },
            data: updateData
        });

        // Sync Tags
        if (cardData.label !== undefined) {
            await syncTags(tx, cardId, cardData.label);
        }

        // Fetch upgraded
        const updatedCard = await tx.cards.findUnique({
            where: { id: cardId },
            include: {
                card_tags: { include: { tags: true } }
            }
        });

        const sortedTags = updatedCard.card_tags
            .map(ct => ct.tags.name)
            .sort()
            .join(',');

        return { ...updatedCard, label: sortedTags };
    });
};

const deleteCard = async (id) => {
    try {
        return await prisma.cards.delete({
            where: { id: parseInt(id) }
        });
    } catch (error) {
        if (error.code === 'P2025') return null;
        throw error;
    }
};

// Helper: Sync Tags
async function syncTags(tx, cardId, labelString) {
    // 1. Remove all existing card_tags for this card
    await tx.card_tags.deleteMany({
        where: { card_id: cardId }
    });

    if (!labelString) return;

    const names = labelString.split(',').map(s => s.trim()).filter(Boolean);

    for (const name of names) {
        let tag = await tx.tags.findUnique({
            where: { name }
        });

        // If the tag doesn't exist, skip it. 
        // Tags should only be created explicitly via the Tag API, not implicitly by card updates.
        if (!tag) continue;

        // Create relation
        await tx.card_tags.create({
            data: {
                card_id: cardId,
                tag_id: tag.id
            }
        });
    }
}

module.exports = {
    getCardsByList,
    createCard,
    updateCard,
    deleteCard
};
