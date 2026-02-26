const SeoSettings = require('../models/SeoSettings');

const DEFAULT_SEO_SETTINGS = {
    key: 'default',
    siteName: 'AskYourMufti',
    siteUrl: '',
    defaultTitle: 'AskYourMufti - Islamic Q&A by Mufti Tariq Masood',
    titleTemplate: '%s | AskYourMufti',
    defaultDescription: 'Authentic Islamic questions and answers by Mufti Tariq Masood.',
    defaultKeywords: [],
    ogImage: '',
    twitterHandle: '',
    robots: 'index,follow',
    canonicalBase: '',
    googleVerification: '',
    bingVerification: '',
};

const sanitizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeKeywords = (value) => {
    if (Array.isArray(value)) {
        return value.map((k) => String(k).trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
        return value.split(',').map((k) => k.trim()).filter(Boolean);
    }
    return [];
};

// @desc    Get SEO settings
// @route   GET /api/seo-settings
// @access  Private/Admin
const getSeoSettings = async (req, res) => {
    try {
        const doc = await SeoSettings.findOne({ key: 'default' }).lean();
        if (!doc) return res.json(DEFAULT_SEO_SETTINGS);
        res.json({ ...DEFAULT_SEO_SETTINGS, ...doc });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create/update SEO settings
// @route   PUT /api/seo-settings
// @access  Private/Admin
const upsertSeoSettings = async (req, res) => {
    try {
        const payload = {
            key: 'default',
            siteName: sanitizeString(req.body.siteName),
            siteUrl: sanitizeString(req.body.siteUrl),
            defaultTitle: sanitizeString(req.body.defaultTitle),
            titleTemplate: sanitizeString(req.body.titleTemplate),
            defaultDescription: sanitizeString(req.body.defaultDescription),
            defaultKeywords: normalizeKeywords(req.body.defaultKeywords),
            ogImage: sanitizeString(req.body.ogImage),
            twitterHandle: sanitizeString(req.body.twitterHandle),
            robots: sanitizeString(req.body.robots),
            canonicalBase: sanitizeString(req.body.canonicalBase),
            googleVerification: sanitizeString(req.body.googleVerification),
            bingVerification: sanitizeString(req.body.bingVerification),
        };

        const settings = await SeoSettings.findOneAndUpdate(
            { key: 'default' },
            { $set: payload },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(settings);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

module.exports = {
    getSeoSettings,
    upsertSeoSettings,
};
