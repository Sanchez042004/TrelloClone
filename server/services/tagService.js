const prisma = require('../prismaClient');

const getAllTags = async () => {
    return await prisma.tags.findMany({
        orderBy: { id: 'asc' }
    });
};

const createTag = async (data) => {
    return await prisma.tags.create({
        data: {
            name: data.name || '',
            color: data.color || 'bg-slate-500' // Default color if none provided
        }
    });
};

const updateTag = async (id, data) => {
    const tagId = parseInt(id);
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.color !== undefined) updateData.color = data.color;

    return await prisma.tags.update({
        where: { id: tagId },
        data: updateData
    });
};

const deleteTag = async (id) => {
    const tagId = parseInt(id);
    // card_tags cascade-deletes, so just delete the tag
    return await prisma.tags.delete({
        where: { id: tagId }
    });
};

module.exports = {
    getAllTags,
    createTag,
    updateTag,
    deleteTag
};
