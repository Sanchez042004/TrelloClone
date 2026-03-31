const tagService = require('../services/tagService');

const getAllTags = async (req, res, next) => {
    try {
        const tags = await tagService.getAllTags();
        res.json(tags);
    } catch (err) {
        next(err);
    }
};

const createTag = async (req, res, next) => {
    try {
        const saved = await tagService.createTag(req.body);
        res.status(201).json(saved);
    } catch (err) {
        next(err);
    }
};

const updateTag = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await tagService.updateTag(id, req.body);
        res.json(updated);
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json('Tag not found');
        }
        next(err);
    }
};

const deleteTag = async (req, res, next) => {
    try {
        const { id } = req.params;
        await tagService.deleteTag(id);
        res.json('Tag deleted');
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json('Tag not found');
        }
        next(err);
    }
};

module.exports = {
    getAllTags,
    createTag,
    updateTag,
    deleteTag
};
