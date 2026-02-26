"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Save, Search } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface SeoSettings {
    siteName: string;
    siteUrl: string;
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultKeywords: string[];
    ogImage: string;
    twitterHandle: string;
    robots: string;
    canonicalBase: string;
    googleVerification: string;
    bingVerification: string;
}

const emptySettings: SeoSettings = {
    siteName: "",
    siteUrl: "",
    defaultTitle: "",
    titleTemplate: "%s | AskYourMufti",
    defaultDescription: "",
    defaultKeywords: [],
    ogImage: "",
    twitterHandle: "",
    robots: "index,follow",
    canonicalBase: "",
    googleVerification: "",
    bingVerification: "",
};

export default function SeoSettingsPage() {
    const [form, setForm] = useState<SeoSettings>(emptySettings);
    const [keywordsText, setKeywordsText] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/seo-settings`);
                let data: any = null;
                if (res.ok) {
                    data = await res.json();
                } else {
                    const fallback = await fetch(`${API_URL}/seo`);
                    if (!fallback.ok) {
                        throw new Error("SEO settings endpoint not found");
                    }
                    data = await fallback.json();
                }
                const merged = { ...emptySettings, ...(data || {}) };
                setForm(merged);
                setKeywordsText((merged.defaultKeywords || []).join(", "));
            } catch (err) {
                console.error("Failed to load SEO settings", err);
                setError("Failed to load SEO settings. Please restart backend server.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError("");
            setMessage("");

            const payload = {
                ...form,
                defaultKeywords: keywordsText
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
            };

            const res = await fetch(`${API_URL}/seo-settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            let data: any = null;
            if (res.ok) {
                data = await res.json();
            } else {
                const fallback = await fetch(`${API_URL}/seo`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!fallback.ok) throw new Error("Failed to save SEO settings");
                data = await fallback.json();
            }
            setForm({ ...emptySettings, ...(data || {}) });
            setKeywordsText(((data?.defaultKeywords || []) as string[]).join(", "));
            setMessage("SEO settings saved.");
        } catch (err) {
            console.error("Failed to save SEO settings", err);
            setError("Failed to save SEO settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-zinc-900">SEO Settings</h1>
                <p className="text-zinc-500 mt-1">Manage global SEO defaults for the website.</p>
            </div>

            <form onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-200 bg-zinc-50 flex items-center gap-3">
                    <Search size={19} className="text-primary" />
                    <h2 className="text-lg font-bold text-zinc-900">Global SEO</h2>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-zinc-700">Site Name</label>
                        <input name="siteName" value={form.siteName} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-zinc-700">Site URL</label>
                        <input name="siteUrl" value={form.siteUrl} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none" placeholder="https://example.com" />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-zinc-700">Default Meta Title</label>
                        <input name="defaultTitle" value={form.defaultTitle} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none" />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-zinc-700">Title Template</label>
                        <input name="titleTemplate" value={form.titleTemplate} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none" placeholder="%s | AskYourMufti" />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-zinc-700">Default Meta Description</label>
                        <textarea name="defaultDescription" value={form.defaultDescription} onChange={handleChange} rows={3} className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none resize-y" />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-zinc-700">Default Keywords (comma-separated)</label>
                        <input value={keywordsText} onChange={(e) => setKeywordsText(e.target.value)} className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none" placeholder="islam, fatwa, q&a" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-zinc-700">OG Image URL</label>
                        <input name="ogImage" value={form.ogImage} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-zinc-700">Twitter Handle</label>
                        <input name="twitterHandle" value={form.twitterHandle} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none" placeholder="@askyourmufti" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-zinc-700">Robots</label>
                        <input name="robots" value={form.robots} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-zinc-700">Canonical Base</label>
                        <input name="canonicalBase" value={form.canonicalBase} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-zinc-700">Google Verification</label>
                        <input name="googleVerification" value={form.googleVerification} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-zinc-700">Bing Verification</label>
                        <input name="bingVerification" value={form.bingVerification} onChange={handleChange} className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 outline-none" />
                    </div>
                </div>

                <div className="px-6 pb-6">
                    {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
                    {message && <p className="text-sm text-emerald-600 mb-3">{message}</p>}
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save SEO Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
}
