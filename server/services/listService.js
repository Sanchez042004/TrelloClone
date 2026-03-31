const prisma = require('../prismaClient');

const getListsByBoard = async (boardId) => {
    const lists = await prisma.lists.findMany({
        where: { board_id: parseInt(boardId) },
        include: {
            cards: {
                include: {
                    card_tags: {
                        include: {
                            tags: true
                        }
                    }
                },
                orderBy: { position: 'asc' }
            }
        },
        orderBy: { position: 'asc' }
    });

    return lists.map(list => ({
        ...list,
        cards: list.cards.map(card => {
            const sortedTags = card.card_tags
                .map(ct => ct.tags.name)
                .sort()
                .join(',');

            return {
                ...card,
                label: sortedTags
            };
        })
    }));
};

const createList = async (title, boardId) => {
    // Get max position
    const aggregate = await prisma.lists.aggregate({
        _max: {
            position: true
        },
        where: {
            board_id: parseInt(boardId)
        }
    });

    const maxPos = aggregate._max.position !== null ? aggregate._max.position : -1;
    const newPosition = maxPos + 1;

    return await prisma.lists.create({
        data: {
            title,
            board_id: parseInt(boardId),
            position: newPosition
        }
    });
};

const deleteList = async (id) => {
    try {
        return await prisma.lists.delete({
            where: { id: parseInt(id) }
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return null;
        }
        throw error;
    }
};

const updateList = async (id, title) => {
    return await prisma.lists.update({
        where: { id: parseInt(id) },
        data: { title }
    });
};

module.exports = {
    getListsByBoard,
    createList,
    deleteList,
    updateList
};
