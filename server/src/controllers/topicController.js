const Topic = require('../models/Topic');

// @desc    Get all topics
// @route   GET /api/topics
// @access  Public
const getTopics = async (req, res) => {
    try {
        const topics = await Topic.find({}).sort({ name: 1 });
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a topic
// @route   POST /api/topics
// @access  Private/Admin
const createTopic = async (req, res) => {
    try {
        const existing = await Topic.findOne({ slug: req.body.slug });
        if (existing) {
            return res.status(400).json({ message: 'Topic slug already exists' });
        }

        const topic = await Topic.create(req.body);
        res.status(201).json(topic);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Update a topic
// @route   PUT /api/topics/:id
// @access  Private/Admin
const updateTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        const { name, slug } = req.body;

        if (slug) {
            const existingSlug = await Topic.findOne({ slug, _id: { $ne: req.params.id } });
            if (existingSlug) {
                return res.status(400).json({ message: 'Topic slug already exists' });
            }
        }

        if (name) {
            const existingName = await Topic.findOne({ name, _id: { $ne: req.params.id } });
            if (existingName) {
                return res.status(400).json({ message: 'Topic name already exists' });
            }
        }

        const updated = await Topic.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Delete a topic
// @route   DELETE /api/topics/:id
// @access  Private/Admin
const deleteTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        await Topic.findByIdAndDelete(req.params.id);
        res.json({ message: 'Topic deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getTopics,
    createTopic,
    updateTopic,
    deleteTopic
};
