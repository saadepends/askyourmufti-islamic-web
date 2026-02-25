"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, MessageSquare, Search, Send, UserRound } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface AskedQuestion {
    _id: string;
    fullName: string;
    email: string;
    category: string;
    preferredLanguage: string;
    question: string;
    status: "new" | "reviewed";
    adminAnswer?: string;
    answeredAt?: string;
    createdAt: string;
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AskedQuestionsPage() {
    const [questions, setQuestions] = useState<AskedQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
    const [expandedAnswerId, setExpandedAnswerId] = useState<string | null>(null);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/asked-questions`);
                const data = await res.json();
                setQuestions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load asked questions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const filteredQuestions = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return questions;

        return questions.filter((item) =>
            item.fullName.toLowerCase().includes(q)
            || item.email.toLowerCase().includes(q)
            || item.question.toLowerCase().includes(q)
            || item.category.toLowerCase().includes(q)
        );
    }, [questions, searchQuery]);

    const handleDraftChange = (id: string, value: string) => {
        setAnswerDrafts((prev) => ({ ...prev, [id]: value }));
    };

    const sendAnswer = async (item: AskedQuestion) => {
        const answer = (answerDrafts[item._id] || "").trim();
        if (!answer) {
            setActionMessage({ type: "error", text: "Please write an answer before sending." });
            return;
        }

        try {
            setSendingId(item._id);
            setActionMessage(null);

            const res = await fetch(`${API_URL}/asked-questions/${item._id}/answer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answer }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || "Failed to send answer email.");
            }

            setQuestions((prev) =>
                prev.map((q) =>
                    q._id === item._id
                        ? { ...q, status: "reviewed", adminAnswer: answer, answeredAt: new Date().toISOString() }
                        : q
                )
            );
            setAnswerDrafts((prev) => ({ ...prev, [item._id]: "" }));
            setExpandedAnswerId(null);
            setActionMessage({ type: "success", text: "Answer email sent successfully." });
        } catch (error) {
            setActionMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Failed to send answer email.",
            });
        } finally {
            setSendingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-zinc-900">Asked Questions</h1>
                <p className="text-zinc-500 mt-1">Questions submitted from the public ask form.</p>
            </div>

            <div className="relative max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search by name, email, category, question..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
                />
            </div>

            {actionMessage && (
                <div
                    className={`rounded-xl px-4 py-3 text-sm font-medium ${
                        actionMessage.type === "success"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                >
                    {actionMessage.text}
                </div>
            )}

            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="py-16 flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-primary" />
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="py-16 text-center text-zinc-500 text-sm">
                        {questions.length === 0 ? "No asked questions submitted yet." : "No matching questions found."}
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {filteredQuestions.map((item) => (
                            <div key={item._id} className="p-5 md:p-6">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-700 font-semibold">
                                        <UserRound size={14} className="text-primary" />
                                        {item.fullName}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
                                        <Mail size={14} />
                                        {item.email}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs font-bold">
                                        {item.category}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 text-xs font-semibold uppercase">
                                        {item.preferredLanguage || "en"}
                                    </span>
                                    <span
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase ${
                                            item.status === "reviewed"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-amber-100 text-amber-700"
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-xs text-zinc-400">{formatDate(item.createdAt)}</span>
                                        <button
                                            onClick={() =>
                                                setExpandedAnswerId((prev) => (prev === item._id ? null : item._id))
                                            }
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                                        >
                                            <Send size={12} />
                                            Answer Now
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-zinc-700">
                                    <MessageSquare size={15} className="text-primary mt-1 flex-shrink-0" />
                                    <p className="leading-relaxed text-sm md:text-base">{item.question}</p>
                                </div>

                                {item.adminAnswer && (
                                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                                            Sent Answer
                                        </p>
                                        <p className="text-sm text-emerald-900 whitespace-pre-wrap">{item.adminAnswer}</p>
                                    </div>
                                )}

                                {expandedAnswerId === item._id && (
                                    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                                        <label className="block text-sm font-semibold text-zinc-800 mb-2">
                                            Write answer to send via email
                                        </label>
                                        <textarea
                                            value={answerDrafts[item._id] || ""}
                                            onChange={(e) => handleDraftChange(item._id, e.target.value)}
                                            rows={5}
                                            placeholder="Type the answer for this question..."
                                            className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-800 focus:ring-2 focus:ring-primary/40 outline-none"
                                        />
                                        <div className="mt-3 flex items-center gap-2">
                                            <button
                                                onClick={() => sendAnswer(item)}
                                                disabled={sendingId === item._id}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
                                            >
                                                {sendingId === item._id ? (
                                                    <Loader2 size={15} className="animate-spin" />
                                                ) : (
                                                    <Send size={15} />
                                                )}
                                                {sendingId === item._id ? "Sending..." : "Send Answer Email"}
                                            </button>
                                            <button
                                                onClick={() => setExpandedAnswerId(null)}
                                                className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm font-semibold hover:bg-zinc-100"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
