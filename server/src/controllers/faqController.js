const FAQ = require('../models/FAQ');
const SUPPORTED_LANGS = ['en', 'ur', 'de', 'fr', 'es'];

const resolveLang = (lang) => {
    if (!lang || typeof lang !== 'string') return 'en';
    const normalized = lang.toLowerCase();
    return SUPPORTED_LANGS.includes(normalized) ? normalized : 'en';
};

const localizeFAQ = (faq, lang) => {
    const item = faq.toObject ? faq.toObject() : faq;
    if (lang === 'en') return item;

    const t = (item.translations && item.translations[lang]) || {};
    return {
        ...item,
        question: t.question || item.question,
        shortAnswer: t.shortAnswer || item.shortAnswer,
        fullAnswer: t.fullAnswer || item.fullAnswer,
        seoMetaTitle: t.seoMetaTitle || item.seoMetaTitle,
        seoMetaDescription: t.seoMetaDescription || item.seoMetaDescription,
    };
};

// @desc    Get all questions
// @route   GET /api/qa
// @access  Public
const getFAQs = async (req, res) => {
    try {
        const lang = resolveLang(req.query.lang);
        const faqs = await FAQ.find({}).sort({ createdAt: -1 });
        res.json(faqs.map((faq) => localizeFAQ(faq, lang)));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single question by slug
// @route   GET /api/qa/slug/:slug
// @access  Public
const getFAQBySlug = async (req, res) => {
    try {
        const lang = resolveLang(req.query.lang);
        const faq = await FAQ.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { viewCount: 1 } },
            { new: true }
        );
        if (!faq) return res.status(404).json({ message: 'Question not found' });
        res.json(localizeFAQ(faq, lang));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get most viewed questions
// @route   GET /api/qa/trending
// @access  Public
const getTrendingFAQs = async (req, res) => {
    try {
        const lang = resolveLang(req.query.lang);
        const limitRaw = parseInt(req.query.limit, 10);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 30) : 8;

        const faqs = await FAQ.find({})
            .sort({ viewCount: -1, createdAt: -1 })
            .limit(limit);

        res.json(faqs.map((faq) => localizeFAQ(faq, lang)));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get questions by topic
// @route   GET /api/qa/topic/:topic
// @access  Public
const getFAQsByTopic = async (req, res) => {
    try {
        const lang = resolveLang(req.query.lang);
        const topic = decodeURIComponent(req.params.topic);
        const faqs = await FAQ.find({ topic: { $regex: new RegExp(`^${topic}$`, 'i') } }).sort({ sessionNumber: -1, createdAt: -1 });
        res.json(faqs.map((faq) => localizeFAQ(faq, lang)));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get questions by session number
// @route   GET /api/qa/session/:sessionNumber
// @access  Public
const getFAQsBySession = async (req, res) => {
    try {
        const lang = resolveLang(req.query.lang);
        const faqs = await FAQ.find({ sessionNumber: req.params.sessionNumber }).sort({ topic: 1, createdAt: -1 });
        res.json(faqs.map((faq) => localizeFAQ(faq, lang)));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all unique topics from Q&A
// @route   GET /api/qa/topics-list
// @access  Public
const getTopicsList = async (req, res) => {
    try {
        const topics = await FAQ.aggregate([
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a question
// @route   POST /api/qa
// @access  Private/Admin
const createFAQ = async (req, res) => {
    try {
        const existing = await FAQ.findOne({
            $or: [{ qid: req.body.qid }, { slug: req.body.slug }]
        });

        if (existing) {
            return res.status(400).json({ message: 'Question ID or Slug already exists' });
        }

        const faq = await FAQ.create(req.body);
        res.status(201).json(faq);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Update a question
// @route   PUT /api/qa/:id
// @access  Private/Admin
const updateFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!faq) return res.status(404).json({ message: 'Question not found' });
        res.json(faq);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Delete a question
// @route   DELETE /api/qa/:id
// @access  Private/Admin
const deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id);
        if (!faq) return res.status(404).json({ message: 'Question not found' });
        res.json({ message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bulk Upload Q&A
// @route   POST /api/qa/bulk
// @access  Private/Admin
const bulkUploadFAQs = async (req, res) => {
    try {
        const { rows } = req.body;
        if (!Array.isArray(rows)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const incomingQids  = rows.map(r => r.Q_ID).filter(Boolean);
        const incomingSlugs = rows.map(r => r.Slug).filter(Boolean);

        const existingFaqs = await FAQ.find({
            $or: [
                { qid:  { $in: incomingQids  } },
                { slug: { $in: incomingSlugs } }
            ]
        }, "qid slug");

        const existingQids  = new Set(existingFaqs.map(f => f.qid));
        const existingSlugs = new Set(existingFaqs.map(f => f.slug));

        const toInsert = rows
            .filter(row => !existingQids.has(row.Q_ID) && !existingSlugs.has(row.Slug))
            .map(row => ({
                qid:           row.Q_ID,
                sessionNumber: row.Session,
                timestamp:     row.Timestamp,

                // English (primary)
                question:           row.Question_EN   || row.Question || "",
                shortAnswer:        row.Short_Answer_EN || row.Short_Answer || "",
                fullAnswer:         row.Full_Answer_EN  || row.Full_Answer  || "",
                seoMetaTitle:       row.Meta_Title_EN  || row.Meta_Title   || "",
                seoMetaDescription: row.Meta_Desc_EN || row.Meta_Description_EN || row.Meta_Description || "",

                // Shared
                topic:         row.Topic,
                subtopic:      row.Subtopic,
                keywords:      typeof row.Keywords === 'string'
                                   ? row.Keywords.split(',').map(k => k.trim()).filter(Boolean)
                                   : [],
                questionerName: row.Questioner_Name,
                location:       row.Location,
                slug:           row.Slug,

                // Translations
                translations: {
                    ur: {
                        question:           row.Question_UR    || "",
                        shortAnswer:        row.Short_Answer_UR || "",
                        fullAnswer:         row.Full_Answer_UR  || "",
                        seoMetaTitle:       row.Meta_Title_UR   || "",
                        seoMetaDescription: row.Meta_Desc_UR || row.Meta_Description_UR || "",
                    },
                    de: {
                        question:           row.Question_DE    || "",
                        shortAnswer:        row.Short_Answer_DE || "",
                        fullAnswer:         row.Full_Answer_DE  || "",
                        seoMetaTitle:       row.Meta_Title_DE   || "",
                        seoMetaDescription: row.Meta_Desc_DE || row.Meta_Description_DE || "",
                    },
                    es: {
                        question:           row.Question_ES    || "",
                        shortAnswer:        row.Short_Answer_ES || "",
                        fullAnswer:         row.Full_Answer_ES  || "",
                        seoMetaTitle:       row.Meta_Title_ES   || "",
                        seoMetaDescription: row.Meta_Desc_ES || row.Meta_Description_ES || "",
                    },
                    fr: {
                        question:           row.Question_FR    || "",
                        shortAnswer:        row.Short_Answer_FR || "",
                        fullAnswer:         row.Full_Answer_FR  || "",
                        seoMetaTitle:       row.Meta_Title_FR   || "",
                        seoMetaDescription: row.Meta_Desc_FR || row.Meta_Description_FR || "",
                    },
                },
            }));

        if (toInsert.length > 0) {
            await FAQ.insertMany(toInsert);
        }

        res.json({
            success:   true,
            processed: rows.length,
            inserted:  toInsert.length,
            skipped:   rows.length - toInsert.length,
        });
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({ message: 'Bulk upload failed' });
    }
};

module.exports = {
    getFAQs,
    getFAQBySlug,
    getTrendingFAQs,
    getFAQsByTopic,
    getFAQsBySession,
    getTopicsList,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    bulkUploadFAQs
};
