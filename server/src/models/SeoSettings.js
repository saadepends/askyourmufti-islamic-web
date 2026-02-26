const mongoose = require('mongoose');

const SeoSettingsSchema = new mongoose.Schema(
    {
        key: { type: String, default: 'default', unique: true },
        siteName: { type: String, default: '' },
        siteUrl: { type: String, default: '' },
        defaultTitle: { type: String, default: '' },
        titleTemplate: { type: String, default: '%s | AskYourMufti' },
        defaultDescription: { type: String, default: '' },
        defaultKeywords: [{ type: String }],
        ogImage: { type: String, default: '' },
        twitterHandle: { type: String, default: '' },
        robots: { type: String, default: 'index,follow' },
        canonicalBase: { type: String, default: '' },
        googleVerification: { type: String, default: '' },
        bingVerification: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('SeoSettings', SeoSettingsSchema);
