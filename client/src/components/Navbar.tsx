"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Globe, Heart, Menu, MessageCircle, Search, X } from "lucide-react";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { getLocaleFromPathname, Locale, withLocale } from "@/lib/i18n";
import { t } from "@/lib/messages";
import { translateTopicLabel } from "@/lib/topicLabels";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface TopicItem {
    _id: string;
    name: string;
    slug: string;
}

const FALLBACK_TOPICS = [
    { name: "Salah", slug: "salah" },
    { name: "Zakat", slug: "zakat" },
    { name: "Business", slug: "business" },
    { name: "Marriage", slug: "marriage" },
    { name: "Women", slug: "women" },
    { name: "Finance", slug: "finance" },
];

const LANGUAGES: Array<{ code: Locale; name: string; short: string }> = [
    { code: "en", name: "English", short: "EN" },
    { code: "ur", name: "Urdu", short: "UR" },
    { code: "de", name: "Deutsch", short: "DE" },
    { code: "fr", name: "French", short: "FR" },
    { code: "es", name: "Spanish", short: "ES" },
];

export const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [topics, setTopics] = useState(FALLBACK_TOPICS);
    const [navSearch, setNavSearch] = useState("");
    const pathname = usePathname();
    const router = useRouter();

    const currentLocale = getLocaleFromPathname(pathname || "/");
    const localize = (path: string) => withLocale(path, currentLocale);
    const switchLocale = (locale: Locale) => withLocale(pathname || "/", locale);

    React.useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await fetch(`${API_URL}/topics`);
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const mapped = (data as TopicItem[]).map((item) => ({
                        name: item.name,
                        slug: item.slug || item.name.toLowerCase().replace(/\s+/g, "-"),
                    }));
                    setTopics(mapped);
                }
            } catch (err) {
                console.error("Failed to load navbar topics", err);
            }
        };

        fetchTopics();
    }, []);

    const handleNavSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const next = navSearch.trim();
        router.push(next ? `${localize("/search")}?q=${encodeURIComponent(next)}` : localize("/search"));
    };

    return (
        <>
            <motion.nav
                initial={{ y: -80 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-accent/15 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
                    <div className="hidden lg:grid grid-cols-[1fr_minmax(220px,340px)_auto] items-center gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <Link href={localize("/")} className="flex items-center gap-2 shrink-0">
                                <Image
                                    src="/logo.png"
                                    alt="Ask Your Mufti Logo"
                                    width={200}
                                    height={200}
                                    className="rounded-full object-cover border border-accent/30"
                                    priority
                                />
                               
                            </Link>

                            <div className="flex items-center gap-1 min-w-0 overflow-x-auto">
                                <Link href={localize("/")} className="px-3 py-2 text-xs font-bold tracking-wide text-accent hover:bg-accent/10 rounded-lg transition-all whitespace-nowrap">
                                    {t(currentLocale, "nav.home")}
                                </Link>

                                <HeadlessMenu as="div" className="relative">
                                    <HeadlessMenu.Button className="px-3 py-2 text-xs font-bold tracking-wide text-accent hover:bg-accent/10 rounded-lg transition-all inline-flex items-center gap-1 whitespace-nowrap">
                                        {t(currentLocale, "nav.topics")}
                                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                                    </HeadlessMenu.Button>
                                    <Transition
                                        as={React.Fragment}
                                        enter="transition ease-out duration-150"
                                        enterFrom="transform opacity-0 scale-95 -translate-y-1"
                                        enterTo="transform opacity-100 scale-100 translate-y-0"
                                        leave="transition ease-in duration-100"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <HeadlessMenu.Items className="absolute left-0 mt-2 w-52 origin-top-left rounded-xl bg-white border border-accent/15 shadow-xl focus:outline-none flex flex-col py-2">
                                            {topics.map((topic) => (
                                                <HeadlessMenu.Item key={topic.slug}>
                                                    {({ active }) => (
                                                        <Link
                                                            href={localize(`/topics/${topic.slug}`)}
                                                            className={cn(
                                                                "block px-4 py-2.5 text-sm font-medium transition-all",
                                                                active ? "bg-accent/10 text-accent" : "text-foreground/70"
                                                            )}
                                                        >
                                                            {translateTopicLabel(topic.name, currentLocale)}
                                                        </Link>
                                                    )}
                                                </HeadlessMenu.Item>
                                            ))}
                                        </HeadlessMenu.Items>
                                    </Transition>
                                </HeadlessMenu>

                                <Link href={localize("/sessions")} className="px-3 py-2 text-xs font-bold tracking-wide text-accent hover:bg-accent/10 rounded-lg transition-all whitespace-nowrap">
                                    {t(currentLocale, "nav.sessions")}
                                </Link>
                                <Link href={localize("/qa")} className="px-3 py-2 text-xs font-bold tracking-wide text-accent hover:bg-accent/10 rounded-lg transition-all whitespace-nowrap">
                                    {t(currentLocale, "nav.qa")}
                                </Link>
                                <Link href={localize("/about")} className="px-3 py-2 text-xs font-bold tracking-wide text-accent hover:bg-accent/10 rounded-lg transition-all whitespace-nowrap">
                                    {t(currentLocale, "nav.about")}
                                </Link>
                            </div>
                        </div>

                        <form onSubmit={handleNavSearchSubmit} className="relative w-full max-w-[320px] justify-self-center">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/70" />
                            <input
                                value={navSearch}
                                onChange={(e) => setNavSearch(e.target.value)}
                                placeholder={currentLocale === "ur" ? "???? ????" : "Search..."}
                                className="w-full rounded-full border border-accent/20 bg-ivory/70 py-2.5 pl-8 pr-3 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/30"
                            />
                        </form>

                        <div className="flex items-center justify-end gap-2">
                            <HeadlessMenu as="div" className="relative">
                                <HeadlessMenu.Button className="flex items-center gap-1.5 px-3 py-2 text-accent hover:text-accent-light hover:bg-accent/10 rounded-lg transition-all">
                                    <Globe size={17} />
                                    <span className="text-xs font-semibold tracking-wide">{currentLocale.toUpperCase()}</span>
                                </HeadlessMenu.Button>
                                <Transition
                                    as={React.Fragment}
                                    enter="transition ease-out duration-150"
                                    enterFrom="transform opacity-0 scale-95 -translate-y-1"
                                    enterTo="transform opacity-100 scale-100 translate-y-0"
                                    leave="transition ease-in duration-100"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <HeadlessMenu.Items className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl bg-white border border-accent/15 shadow-xl focus:outline-none flex flex-col py-2">
                                        {LANGUAGES.map((lang) => (
                                            <HeadlessMenu.Item key={lang.code}>
                                                {({ active }) => (
                                                    <Link
                                                        href={switchLocale(lang.code)}
                                                        className={cn(
                                                            "flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition-all",
                                                            active ? "bg-accent/10 text-accent" : "text-foreground/70"
                                                        )}
                                                    >
                                                        <span className="text-[11px] font-bold w-6">{lang.short}</span>
                                                        {lang.name}
                                                    </Link>
                                                )}
                                            </HeadlessMenu.Item>
                                        ))}
                                    </HeadlessMenu.Items>
                                </Transition>
                            </HeadlessMenu>

                            <Link href={localize("/ask")} className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-accent/20">
                                <MessageCircle size={15} />
                                {t(currentLocale, "nav.ask")}
                            </Link>
                        </div>
                    </div>

                    <div className="flex lg:hidden items-center justify-between gap-3">
                        <Link href={localize("/")} className="flex items-center gap-2 shrink-0">
                            <Image
                                src="/logo.png"
                                alt="Ask Your Mufti Logo"
                                width={190}
                                height={190}
                                className="rounded-full object-cover border border-accent/30"
                                priority
                            />
                            
                        </Link>

                        <div className="flex items-center gap-2">
                            <HeadlessMenu as="div" className="relative">
                                <HeadlessMenu.Button className="p-2 rounded-lg hover:bg-accent/10 text-accent inline-flex items-center gap-1">
                                    <Globe size={18} />
                                    <span className="text-[11px] font-semibold">{currentLocale.toUpperCase()}</span>
                                </HeadlessMenu.Button>
                                <Transition
                                    as={React.Fragment}
                                    enter="transition ease-out duration-150"
                                    enterFrom="transform opacity-0 scale-95 -translate-y-1"
                                    enterTo="transform opacity-100 scale-100 translate-y-0"
                                    leave="transition ease-in duration-100"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <HeadlessMenu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white border border-accent/15 shadow-xl focus:outline-none flex flex-col py-2 z-50">
                                        {LANGUAGES.map((lang) => (
                                            <HeadlessMenu.Item key={lang.code}>
                                                {({ active }) => (
                                                    <Link
                                                        href={switchLocale(lang.code)}
                                                        className={cn(
                                                            "flex items-center gap-2 w-full px-3 py-2 text-sm transition-all",
                                                            active ? "bg-accent/10 text-accent" : "text-foreground/70"
                                                        )}
                                                    >
                                                        <span className="text-[11px] font-bold w-6">{lang.short}</span>
                                                        {lang.name}
                                                    </Link>
                                                )}
                                            </HeadlessMenu.Item>
                                        ))}
                                    </HeadlessMenu.Items>
                                </Transition>
                            </HeadlessMenu>
                            <Link href={localize("/search")} className="p-2 rounded-lg hover:bg-accent/10 text-accent">
                                <Search size={20} />
                            </Link>
                            <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-accent/10 text-primary">
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] bg-primary-dark lg:hidden flex flex-col pt-20 px-6 overflow-y-auto"
                    >
                        <button onClick={() => setMobileMenuOpen(false)} className="absolute top-5 right-5 p-2 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors">
                            <X className="w-6 h-6 text-accent" />
                        </button>

                        <div className="flex flex-col gap-1">
                            <Link href={localize("/")} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-lg font-semibold text-accent/80 hover:text-accent hover:bg-accent/10 rounded-lg transition-all">
                                {t(currentLocale, "nav.home")}
                            </Link>

                            <div className="flex flex-col gap-1 mt-2">
                                <span className="px-4 text-accent/40 text-xs font-bold tracking-widest uppercase">Topics</span>
                                <div className="flex flex-col gap-1 ml-4 border-l-2 border-accent/20">
                                    {topics.map((topic) => (
                                        <Link
                                            key={topic.slug}
                                            href={localize(`/topics/${topic.slug}`)}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="px-4 py-2.5 text-accent/70 hover:text-accent hover:bg-accent/10 rounded-r-lg transition-all"
                                        >
                                            {translateTopicLabel(topic.name, currentLocale)}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <Link href={localize("/sessions")} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-lg font-semibold text-accent/80 hover:text-accent hover:bg-accent/10 rounded-lg transition-all">
                                {t(currentLocale, "nav.sessions")}
                            </Link>
                            <Link href={localize("/qa")} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-lg font-semibold text-accent/80 hover:text-accent hover:bg-accent/10 rounded-lg transition-all">
                                {t(currentLocale, "nav.qa")}
                            </Link>
                            <Link href={localize("/search")} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-lg font-semibold text-accent/80 hover:text-accent hover:bg-accent/10 rounded-lg transition-all">
                                {t(currentLocale, "nav.search")}
                            </Link>
                            <Link href={localize("/about")} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-lg font-semibold text-accent/80 hover:text-accent hover:bg-accent/10 rounded-lg transition-all">
                                {t(currentLocale, "nav.about")}
                            </Link>
                            <Link href={localize("/donate")} onClick={() => setMobileMenuOpen(false)} className="mx-4 flex items-center justify-center gap-2 px-6 py-3.5 bg-accent text-white rounded-xl font-bold text-base shadow-md shadow-accent/20 hover:bg-accent-light transition-all">
                                <Heart size={18} fill="currentColor" />
                                {t(currentLocale, "nav.donate")}
                            </Link>

                            <div className="mt-6 pt-6 border-t border-accent/10 flex flex-col gap-3">
                                <span className="px-4 text-accent/40 text-xs font-bold tracking-widest uppercase">Language</span>
                                <div className="flex flex-wrap gap-2 px-4">
                                    {LANGUAGES.map((lang) => (
                                        <Link
                                            key={lang.code}
                                            href={switchLocale(lang.code)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-accent/20 text-sm text-accent/70 hover:text-accent hover:border-accent/40 transition-all"
                                        >
                                            <span className="text-[11px] font-bold">{lang.short}</span>
                                            {lang.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <Link href={localize("/ask")} onClick={() => setMobileMenuOpen(false)} className="mt-6 mx-4 flex items-center justify-center gap-2 px-6 py-4 bg-accent hover:bg-accent-light text-white rounded-xl font-semibold transition-all">
                                <MessageCircle size={18} />
                                {t(currentLocale, "nav.ask")}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
