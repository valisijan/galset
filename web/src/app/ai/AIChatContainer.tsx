"use client";

import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import { ArrowUp, ArrowDown, Send, MessageCircle, Plus, Loader2, MoreVertical, Trash2, SquarePen, Menu, X, User, Heart, MapPin, History, HatGlasses, ThumbsUp, ThumbsDown, RotateCw, Copy, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateAiChatId } from '@/lib/ai-utils';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '@/components/Loader';
import TypingIndicator from '@/components/TypingIndicator';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import DeleteAiChatModal from './DeleteAiChatModal';
import ChatHistoryModal from './ChatHistoryModal';
import RenameChatModal from './RenameChatModal';
import AdCard from '@/components/ads/AdCard';
import { toast } from 'sonner';


const NoImage = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/no-image.png?updatedAt=1776365511073";

interface AIChatContainerProps {
    initialChatId?: string;
}

export default function AIChatContainer({ initialChatId }: AIChatContainerProps) {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isSessionsLoading, setIsSessionsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [renamingSession, setRenamingSession] = useState<{ id: string, title: string } | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    const [viewportHeight, setViewportHeight] = useState("100%");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const handleViewportChange = () => {
            if (window.visualViewport) {
                const height = window.visualViewport.height;
                const isCurrentlyMobile = window.innerWidth < 768;
                setViewportHeight(isCurrentlyMobile ? `${height - 50}px` : "100%");
            }
        };
        window.visualViewport?.addEventListener("resize", handleViewportChange);
        window.visualViewport?.addEventListener("scroll", handleViewportChange);
        handleViewportChange();

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener("resize", handleViewportChange);
                window.visualViewport.removeEventListener("scroll", handleViewportChange);
            }
        };
    }, []);

    const loadSessions = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat/sessions`)
            .then(res => res.json())
            .then(data => {
                if (data.sessions) {
                    setSessions(data.sessions);
                }
                setIsSessionsLoading(false);
            })
            .catch(() => setIsSessionsLoading(false));
    };

    useEffect(() => {
        if (user) {
            loadSessions();
        } else {
            setIsSessionsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (isMobile && isInputFocused) {
            document.body.classList.add("hide-bottom-nav");
        } else {
            document.body.classList.remove("hide-bottom-nav");
        }
        return () => {
            document.body.classList.remove("hide-bottom-nav");
        };
    }, [isInputFocused, isMobile]);

    const startNewChat = () => {
        if (!initialChatId) {
            setRefreshKey(prev => prev + 1);
            window.history.pushState(null, '', '/ai');
        } else {
            router.push('/ai');
        }
    };

    const handleNewChat = () => {
        setIsPrivate(false);
        startNewChat();
    };

    const handleDeleteSession = async (id: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat/sessions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSessions(prev => prev.filter(s => s.id !== id));
                if (initialChatId === id) {
                    router.push('/ai');
                }
            }
        } catch (err) {
            console.error("Delete session error:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleRenameSession = async (id: string, newTitle: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat/sessions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            });
            if (res.ok) {
                setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
                toast.success("Razgovor je uspešno preimenovan!");
            }
        } catch (err) {
            console.error("Rename session error:", err);
            toast.error("Došlo je do greške pri preimenovanju.");
        } finally {
            setRenamingSession(null);
        }
    };

    useEffect(() => {
        if (!deletingId) return;

        window.history.pushState({ modal: "deleteAiChat" }, "");

        const handlePopState = () => {
            if (window.history.state?.modal !== "deleteAiChat") {
                setDeletingId(null);
            }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);

            if (window.history.state?.modal === "deleteAiChat") {
                window.history.back();
            }
        };
    }, [deletingId]);

    useEffect(() => {
        if (!renamingSession) return;

        window.history.pushState({ modal: "renameAiChat" }, "");

        const handlePopState = () => {
            if (window.history.state?.modal !== "renameAiChat") {
                setRenamingSession(null);
            }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);

            if (window.history.state?.modal === "renameAiChat") {
                window.history.back();
            }
        };
    }, [renamingSession]);

    useEffect(() => {
        const anyOpen = isHistoryOpen || !!deletingId || !!renamingSession;
        if (anyOpen) {
            document.body.classList.add("lock-scroll");
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        } else {
            document.body.classList.remove("lock-scroll");
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        }
    }, [isHistoryOpen, deletingId, renamingSession]);

    return (
        <div
            className="w-full bg-bg-1 text-text-main flex font-sans overflow-hidden relative h-full"
            style={isInputFocused && isMobile ? { height: viewportHeight, maxHeight: viewportHeight } : {}}
        >
            {/* Header bar with 3 buttons */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-bg-1 via-bg-1/90 to-transparent pt-4 pb-12 z-50 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    {/* Novo button */}
                    <button
                        onClick={handleNewChat}
                        className="flex items-center gap-2 px-4 py-2 bg-bg-2 border border-bg-3 rounded-full text-text-main text-sm font-semibold hover:bg-bg-3 transition-all cursor-pointer select-none"
                        title="Novi razgovor"
                    >
                        <SquarePen className="w-4 h-4 text-text-main" />
                        <span>Novo</span>
                    </button>

                    {/* Istorija button */}
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-bg-2 border border-bg-3 rounded-full text-text-main text-sm font-semibold hover:bg-bg-3 transition-all cursor-pointer select-none"
                        title="Istorija razgovora"
                    >
                        <History className="w-4 h-4 text-text-main" />
                        <span>Istorija</span>
                    </button>

                    {/* Privatno button */}
                    <button
                        onClick={() => setIsPrivate(prev => !prev)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold transition-all cursor-pointer select-none ${isPrivate
                            ? 'bg-[#5b42f3] border-[#5b42f3] hover:bg-[#4b35d6] text-white'
                            : 'bg-bg-2 border-bg-3 hover:bg-bg-3 text-text-main'
                            }`}
                        title="Privremeni razgovor"
                    >
                        <HatGlasses className={`w-4 h-4 ${isPrivate ? 'text-white' : 'text-text-main'}`} />
                        <span>Privatno</span>
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-1">
                <ChatWindow
                    key={`${isPrivate ? 'private' : (initialChatId || 'new')}-${refreshKey}`}
                    chatId={isPrivate ? undefined : initialChatId}
                    isLoggedIn={!!user}
                    isPrivate={isPrivate}
                    onNewChat={handleNewChat}
                    onFirstMessage={(newId) => {
                        if (user && !isPrivate) {
                            loadSessions();
                            if (!initialChatId) {
                                window.history.pushState(null, '', `/ai/${newId}`);
                            }
                        }
                    }}
                    onNewMessage={() => {
                        if (user && !isPrivate) {
                            setTimeout(loadSessions, 2000);
                        }
                    }}
                    isMobile={isMobile}
                    viewportHeight={viewportHeight}
                    isInputFocused={isInputFocused}
                    setIsInputFocused={setIsInputFocused}
                />
            </div>

            {/* Global Styles for Scrollbar */}
            <style jsx global>{`
                .sidebar-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .sidebar-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--bg-2);
                    border-radius: 10px;
                }
                .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--bg-3);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <ChatHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                sessions={sessions}
                isSessionsLoading={isSessionsLoading}
                activeSessionId={isPrivate ? undefined : initialChatId}
                onSelectSession={(id) => {
                    setIsPrivate(false);
                    router.push(`/ai/${id}`);
                }}
                onDeleteSession={(id) => setDeletingId(id)}
                onRenameSession={(id, title) => setRenamingSession({ id, title })}
            />

            <DeleteAiChatModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={() => deletingId && handleDeleteSession(deletingId)}
            />

            <RenameChatModal
                isOpen={!!renamingSession}
                onClose={() => setRenamingSession(null)}
                currentTitle={renamingSession?.title || ""}
                onConfirm={(newTitle) => renamingSession && handleRenameSession(renamingSession.id, newTitle)}
            />
        </div>
    );
}

const GREETINGS = [
    "Šta ti je na umu danas?",
    "Odakle da počnemo?",
    "Šta tražiš danas?",
    "Kako mogu da ti pomognem danas?",
    "Spreman sam za pretragu."
];

function ChatWindow({
    chatId,
    isLoggedIn,
    isPrivate,
    onNewChat,
    onFirstMessage,
    onNewMessage,
    isMobile,
    viewportHeight,
    isInputFocused,
    setIsInputFocused
}: {
    chatId?: string,
    isLoggedIn: boolean,
    isPrivate: boolean,
    onNewChat: () => void,
    onFirstMessage: (id: string) => void,
    onNewMessage: () => void,
    isMobile: boolean,
    viewportHeight: string,
    isInputFocused: boolean,
    setIsInputFocused: (val: boolean) => void
}) {
    const router = useRouter();
    const { user, sessionToken } = useAuth();
    const [draftId, setDraftId] = useState<string | null>(null);
    const draftIdRef = useRef<string | null>(null);
    const activeId = isPrivate ? 'private-session' : (isLoggedIn ? (chatId || draftId || 'new-session') : 'anonymous-session');
    const [greeting, setGreeting] = useState(GREETINGS[0]);

    const [messageAlternatives, setMessageAlternatives] = useState<{ [msgId: string]: string[] }>({});
    const [activeAlternativeIndex, setActiveAlternativeIndex] = useState<{ [msgId: string]: number }>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * GREETINGS.length);
        setGreeting(GREETINGS[randomIndex]);
    }, []);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [anonymousMessageCount, setAnonymousMessageCount] = useState(0);
    const [anonymousResetTime, setAnonymousResetTime] = useState<Date | null>(null);
    const [isLoginBannerDismissed, setIsLoginBannerDismissed] = useState(false);

    const [loggedInCount, setLoggedInCount] = useState(0);
    const [loggedInLimitReached, setLoggedInLimitReached] = useState(false);
    const [loggedInResetTime, setLoggedInResetTime] = useState<string | null>(null);

    const fetchLimitStatus = async () => {
        if (!isLoggedIn) return;
        try {
            const headers: Record<string, string> = {};
            if (sessionToken) {
                headers['Authorization'] = `Bearer ${sessionToken}`;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat/limit-status`, { headers });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setLoggedInCount(data.count);
                    setLoggedInLimitReached(data.limitReached);
                    setLoggedInResetTime(data.resetTime);
                }
            }
        } catch (err) {
            console.error("Error fetching limit status:", err);
        }
    };

    const checkAnonymousLimit = () => {
        if (!isLoggedIn) {
            const stored = localStorage.getItem('anonymous_ai_chats');
            const now = Date.now();
            const timestamps: number[] = stored ? JSON.parse(stored) : [];
            const active = timestamps.filter(t => t > now - 24 * 60 * 60 * 1000);
            setAnonymousMessageCount(active.length);
            if (active.length > 0) {
                setAnonymousResetTime(new Date(active[0] + 24 * 60 * 60 * 1000));
            } else {
                setAnonymousResetTime(null);
            }
        }
    };

    const incrementAnonymousCount = () => {
        if (!isLoggedIn) {
            const stored = localStorage.getItem('anonymous_ai_chats');
            const now = Date.now();
            const timestamps: number[] = stored ? JSON.parse(stored) : [];
            const active = timestamps.filter(t => t > now - 24 * 60 * 60 * 1000);
            active.push(now);
            localStorage.setItem('anonymous_ai_chats', JSON.stringify(active));
            setAnonymousMessageCount(active.length);
            if (active.length > 0) {
                setAnonymousResetTime(new Date(active[0] + 24 * 60 * 60 * 1000));
            }
        }
    };

    const formatResetTime = (isoString: string | null) => {
        if (!isoString) return "Sutra";
        const date = new Date(isoString);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `Sutra u ${hours}:${minutes}`;
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchLimitStatus();
        } else {
            checkAnonymousLimit();
        }
    }, [isLoggedIn, sessionToken]);


    let showBanner = false;
    let bannerTitle = "";
    let bannerSubtitle = "";
    let actionText = "";
    let actionLink = "";
    let showCancelButton = false;
    let isInputDisabled = false;

    if (isLoggedIn) {
        if (loggedInLimitReached) {
            showBanner = true;
            bannerTitle = "Dostigli ste dnevni limit";
            bannerSubtitle = `Dostigli ste dnevni limit besplatnog plana, ograničenje se resetuje ${formatResetTime(loggedInResetTime)}. Ili nadogradite vaš nalog.`;
            actionText = "Pogledaj planove";
            actionLink = "/pricing#planovi";
            showCancelButton = false;
            isInputDisabled = true;
        }
    } else {
        if (anonymousMessageCount >= 3) {
            showBanner = true;
            bannerTitle = "Prijavite se";
            bannerSubtitle = "Prijavite se da bi ste dobijali pametnije odgovore, pretraživali brže i sačuvali razgovore";
            actionText = "Prijava";
            actionLink = "/auth";
            showCancelButton = false;
            isInputDisabled = true;
        } else if (anonymousMessageCount > 0 && !isLoginBannerDismissed) {
            showBanner = true;
            bannerTitle = "Prijavite se";
            bannerSubtitle = "Prijavite se da bi ste dobijali pametnije odgovore, pretraživali brže i sačuvali razgovore";
            actionText = "Prijava";
            actionLink = "/auth";
            showCancelButton = true;
            isInputDisabled = false;
        }
    }

    const { messages, input, handleInputChange, handleSubmit, setInput, isLoading, setMessages, stop, reload } = useChat({
        api: `${process.env.NEXT_PUBLIC_API_URL}/ai/chat`,
        headers: sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : undefined,
        id: isPrivate ? 'private-session' : (chatId || draftId || 'new-session'),
        body: isPrivate
            ? { isPrivate: true }
            : (isLoggedIn ? { id: chatId || draftId || 'new-session' } : { isAnonymous: true }),
        onResponse: (response) => {
            setErrorMsg(null);
            if (response.ok && !chatId && !isPrivate) {
                onFirstMessage(draftIdRef.current || 'new-session');
            }
        },
        onError: (error) => {
            setErrorMsg('Došlo je do greške. Pokušajte ponovo.');
            console.error('AI chat error:', error);
        },
    });

    useEffect(() => {
        if (!isLoading) {
            if (isLoggedIn) {
                fetchLimitStatus();
            } else {
                checkAnonymousLimit();
            }
        }
    }, [isLoading, isLoggedIn]);

    useEffect(() => {
        if (isLoading) return;
        if (messages.length < 2) return;

        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role !== 'assistant') return;

        const parentUserMsg = messages[messages.length - 2];
        if (parentUserMsg.role !== 'user') return;

        const userMsgId = parentUserMsg.id;
        const currentContent = lastMsg.content;

        if (!currentContent) return;

        setMessageAlternatives(prev => {
            const list = prev[userMsgId] || [];
            if (list.includes(currentContent)) return prev;

            const newList = [...list, currentContent];

            setActiveAlternativeIndex(prevIdx => ({
                ...prevIdx,
                [userMsgId]: newList.length - 1
            }));

            return {
                ...prev,
                [userMsgId]: newList
            };
        });
    }, [messages, isLoading]);

    const [initialLoading, setInitialLoading] = useState(!!chatId);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const oldestMessageId = useRef<string | null>(null);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const loadMessages = async (cursor?: string) => {
        if (!chatId) return;

        const isInitial = !cursor;

        if (isInitial) {
            setInitialLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/ai/chat/sessions/${chatId}${cursor ? `?cursor=${cursor}` : ''}`;
            const res = await fetch(url);

            if (res.status === 404 || res.status === 401) {
                router.replace('/not-found');
                return;
            }

            const data = await res.json();
            const incoming: any[] = data.messages || [];
            setHasMore(!!data.hasMore);

            if (incoming.length === 0 && isInitial) {
                setMessages([]);
                return;
            }

            if (isInitial) {
                setMessages(incoming);
                if (incoming.length > 0) {
                    oldestMessageId.current = incoming[0].id;
                }
                requestAnimationFrame(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
                });
            } else {
                const container = messagesContainerRef.current;
                const prevScrollHeight = container?.scrollHeight || 0;

                setMessages(prev => [...incoming, ...prev]);
                if (incoming.length > 0) {
                    oldestMessageId.current = incoming[0].id;
                }

                requestAnimationFrame(() => {
                    if (container) {
                        container.scrollTop = container.scrollHeight - prevScrollHeight;
                    }
                });
            }
        } catch (err) {
            console.error("Fetch AI session error:", err);
        } finally {
            setInitialLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            setInitialLoading(false);
            setDraftId(null);
            draftIdRef.current = null;
            return;
        }
        loadMessages();
    }, [chatId]);

    const isScrolledToBottom = () => {
        const c = messagesContainerRef.current;
        if (!c) return true;
        return c.scrollHeight - c.scrollTop - c.clientHeight < 60;
    };

    // Scroll to bottom when input is focused on mobile
    useEffect(() => {
        if (isMobile && isInputFocused) {
            const timer = setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [isInputFocused, isMobile]);

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;
        if (container.scrollTop === 0 && hasMore && !loadingMore) {
            loadMessages(oldestMessageId.current ?? undefined);
        }

        const isScrollUp = container.scrollHeight - container.scrollTop - container.clientHeight > 150;
        setShowScrollBottom(isScrollUp);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const onSubmit = (e: any) => {
        e.preventDefault();
        if (!input.trim() || isInputDisabled) return;

        if (!isLoggedIn) {
            incrementAnonymousCount();
        }

        let targetId = activeId;

        if (isPrivate) {
            handleSubmit(e, {
                body: { isPrivate: true }
            });
        } else if (isLoggedIn && !chatId && !draftId) {
            const newId = generateAiChatId();
            draftIdRef.current = newId;
            setDraftId(newId);
            targetId = newId;

            handleSubmit(e, {
                body: { id: newId }
            });
        } else {
            handleSubmit(e, {
                body: { id: activeId }
            });
            onNewMessage();
        }

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e as any);
        }
    };

    const handleCopy = (text: string, msgId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(msgId);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success("Kopirano u privremenu memoriju!");
    };

    const handleFeedback = async (messageId: string, type: 'up' | 'down') => {
        if (isPrivate) {
            toast.info("Ocene nisu dostupne u privatnim razgovorima.");
            return;
        }
        if (!user) {
            window.dispatchEvent(new Event("open-auth-modal"));
            return;
        }

        const msg = messages.find(m => m.id === messageId);
        if (!msg) return;

        let newThumbUp = false;
        let newThumbDown = false;

        if (type === 'up') {
            newThumbUp = !(msg as any).thumbUp;
            newThumbDown = false;
        } else {
            newThumbDown = !(msg as any).thumbDown;
            newThumbUp = false;
        }

        setMessages(prev => prev.map(m => {
            if (m.id === messageId) {
                return {
                    ...m,
                    thumbUp: newThumbUp,
                    thumbDown: newThumbDown
                };
            }
            return m;
        }));

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };
            if (sessionToken) {
                headers['Authorization'] = `Bearer ${sessionToken}`;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat/messages/${messageId}/feedback`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    thumbUp: newThumbUp,
                    thumbDown: newThumbDown
                })
            });

            if (!res.ok) {
                throw new Error('Failed to save feedback');
            }
        } catch (err) {
            console.error("Failed to save AI feedback:", err);
            toast.error("Greška pri čuvanju ocene.");
            setMessages(prev => prev.map(m => {
                if (m.id === messageId) {
                    return {
                        ...m,
                        thumbUp: (msg as any).thumbUp ?? false,
                        thumbDown: (msg as any).thumbDown ?? false
                    };
                }
                return m;
            }));
        }
    };

    const handleRegenerate = (userMsgId: string | null, currentContent: string) => {
        if (!userMsgId) return;

        setMessageAlternatives(prev => {
            const list = prev[userMsgId] || [];
            if (list.includes(currentContent)) return prev;
            return {
                ...prev,
                [userMsgId]: [...list, currentContent]
            };
        });

        reload();
    };

    const handlePrevAlternative = (userMsgId: string, activeIdx: number) => {
        const newIdx = Math.max(0, activeIdx - 1);
        setActiveAlternativeIndex(prev => ({
            ...prev,
            [userMsgId]: newIdx
        }));

        const alternatives = messageAlternatives[userMsgId] || [];
        if (alternatives[newIdx]) {
            setMessages(prevMsgs => {
                const userMsgIndex = prevMsgs.findIndex(m => m.id === userMsgId);
                if (userMsgIndex !== -1 && userMsgIndex + 1 < prevMsgs.length) {
                    const nextMsg = prevMsgs[userMsgIndex + 1];
                    if (nextMsg.role === 'assistant') {
                        const updated = [...prevMsgs];
                        updated[userMsgIndex + 1] = {
                            ...nextMsg,
                            content: alternatives[newIdx]
                        };
                        return updated;
                    }
                }
                return prevMsgs;
            });
        }
    };

    const handleNextAlternative = (userMsgId: string, activeIdx: number, total: number) => {
        const newIdx = Math.min(total - 1, activeIdx + 1);
        setActiveAlternativeIndex(prev => ({
            ...prev,
            [userMsgId]: newIdx
        }));

        const alternatives = messageAlternatives[userMsgId] || [];
        if (alternatives[newIdx]) {
            setMessages(prevMsgs => {
                const userMsgIndex = prevMsgs.findIndex(m => m.id === userMsgId);
                if (userMsgIndex !== -1 && userMsgIndex + 1 < prevMsgs.length) {
                    const nextMsg = prevMsgs[userMsgIndex + 1];
                    if (nextMsg.role === 'assistant') {
                        const updated = [...prevMsgs];
                        updated[userMsgIndex + 1] = {
                            ...nextMsg,
                            content: alternatives[newIdx]
                        };
                        return updated;
                    }
                }
                return prevMsgs;
            });
        }
    };

    if (initialLoading) {
        return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#6366f1]" /></div>;
    }

    const hasUserMessage = messages.some(m => m.role === 'user');
    const shouldShowWelcome = !hasUserMessage;

    const inputForm = (
        <div className="w-full max-w-2xl mx-auto">
            {/* Limit Reached / Prompt Login Message Banner */}
            {showBanner && (
                <div className="mb-4 p-6 bg-bg-2 border border-bg-3 rounded-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between gap-6">
                        <div className="flex-1 text-left">
                            <h4 className="text-lg font-bold text-text-main mb-1">
                                {bannerTitle}
                            </h4>
                            <p className="text-sm text-gray-400">
                                {bannerSubtitle}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            {showCancelButton && (
                                <button
                                    type="button"
                                    onClick={() => setIsLoginBannerDismissed(true)}
                                    className="px-5 py-2.5 bg-bg-3 hover:bg-bg-4 text-text-main rounded-full transition-all text-sm font-semibold cursor-pointer active:scale-95 select-none"
                                >
                                    Otkaži
                                </button>
                            )}
                            <Link
                                href={actionLink}
                                className="px-5 py-2.5 bg-[#5b42f3] hover:bg-[#4b35d6] text-white rounded-full transition-all text-sm font-semibold active:scale-95 select-none text-center min-w-[100px]"
                            >
                                {actionText}
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="flex md:hidden flex-col gap-4">
                        <div className="text-left px-1">
                            <h4 className="text-base font-bold text-text-main mb-1">
                                {bannerTitle}
                            </h4>
                            <p className="text-xs text-gray-400">
                                {bannerSubtitle}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <Link
                                href={actionLink}
                                className="w-full py-2.5 bg-[#5b42f3] hover:bg-[#4b35d6] text-white rounded-full transition-all text-sm font-semibold text-center active:scale-95 select-none"
                            >
                                {actionText}
                            </Link>
                            {showCancelButton && (
                                <button
                                    type="button"
                                    onClick={() => setIsLoginBannerDismissed(true)}
                                    className="w-full py-2.5 bg-bg-3 hover:bg-bg-4 text-text-main rounded-full transition-all text-sm font-semibold cursor-pointer active:scale-95 select-none"
                                >
                                    Otkaži
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={onSubmit} className="relative flex items-end w-full group">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder={isInputDisabled ? "Limit dostignut..." : "Pitajte bilo šta..."}
                    className="w-full min-h-[54px] max-h-[200px] bg-bg-2 border border-bg-3 group-hover:border-border-3 rounded-[32px] py-3.5 pl-6 pr-16 text-text-main placeholder-gray-500 text-sm md:text-base focus:outline-none transition-all resize-none mt-auto overflow-y-auto no-scrollbar disabled:cursor-not-allowed"
                    disabled={isLoading || isInputDisabled}
                    rows={1}
                />
                <button
                    type={isLoading ? "button" : "submit"}
                    onPointerDown={(e) => {
                        if (!isLoading && input.trim() && !isInputDisabled) {
                            e.preventDefault();
                            onSubmit(e as any);
                            if (isMobile) {
                                textareaRef.current?.blur();
                            }
                        } else if (isLoading) {
                            e.preventDefault();
                            stop();
                            if (isMobile) {
                                textareaRef.current?.blur();
                            }
                        }
                    }}
                    onClick={isLoading ? () => stop() : undefined}
                    disabled={(!isLoading && !input.trim()) || isInputDisabled}
                    className="absolute right-2 bottom-2 w-10 h-10 bg-[#5b42f3] rounded-full flex items-center justify-center hover:bg-[#4b35d6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                    {isLoading ? (
                        <div className="w-3.5 h-3.5 bg-white rounded-sm" />
                    ) : (
                        <ArrowUp className="w-5 h-5 text-white" />
                    )}
                </button>
            </form>
        </div>
    );

    return (
        <div
            className="flex-1 w-full relative overflow-hidden flex flex-col h-full"
            style={isInputFocused && isMobile ? { height: viewportHeight, maxHeight: viewportHeight } : {}}
        >
            {/* Header / Actions */}

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className={`absolute inset-0 ${messages.length > 0 ? 'overflow-y-auto' : 'overflow-hidden pointer-events-none'} custom-chat-scrollbar transition-opacity duration-500 ${messages.length === 0 ? 'invisible opacity-0' : 'visible opacity-100'}`}
            >
                <div className="max-w-5xl mx-auto px-4 md:px-8 pt-32 pb-44 space-y-8">

                    {loadingMore && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-[#6366f1]" />
                        </div>
                    )}

                    {messages.map((m, index) => {
                        const isLastMessage = index === messages.length - 1;

                        const findPrecedingUserMsgId = (idx: number) => {
                            for (let i = idx - 1; i >= 0; i--) {
                                if (messages[i].role === 'user') {
                                    return messages[i].id;
                                }
                            }
                            return null;
                        };
                        const userMsgId = m.role === 'assistant' ? findPrecedingUserMsgId(index) : null;
                        const alternatives = userMsgId ? (messageAlternatives[userMsgId] || []) : [];
                        const activeIdx = userMsgId ? (activeAlternativeIndex[userMsgId] ?? 0) : 0;
                        const contentToRender = (m.role === 'assistant' && alternatives.length > 0 && activeIdx < alternatives.length && !(isLastMessage && isLoading))
                            ? alternatives[activeIdx]
                            : m.content;

                        return (
                            <div key={m.id} className="flex flex-col gap-1.5 w-full">
                                <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                                    <div className={`relative break-words [word-break:break-word] ${m.role === 'user'
                                        ? 'max-w-[90%] md:max-w-[80%] bg-bg-2 text-text-main rounded-[1.8rem] px-5 py-2.5 border border-bg-3'
                                        : 'w-full text-text-main px-0 py-2 md:py-3'
                                        }`}>
                                        {contentToRender ? (
                                            <div className="[&>p]:mb-4 last:[&>p]:mb-0 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ul]:mt-2 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4 [&>a]:text-[white] [&>a]:bg-[#5b42f3] hover:[&>a]:bg-[#0050b3] [&>a]:px-3 [&>a]:py-1 [&>a]:rounded-lg [&>a]:font-medium [&>a]:underline-none [&>a]:inline-block [&>a]:mb-2 [&>strong]:font-bold [&>strong]:text-text-main [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-3 text-sm md:text-[15px] leading-relaxed break-words [word-break:break-word]">
                                                <ReactMarkdown>{contentToRender}</ReactMarkdown>
                                            </div>
                                        ) : !m.toolInvocations?.some((t: any) => t.state === 'result') && isLoading && (
                                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                <div className="transform scale-[0.6] w-8 h-8 flex items-center justify-center -ml-2">
                                                    <TypingIndicator />
                                                </div>
                                                <span className="animate-pulse">Pretražujem...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {m.toolInvocations && m.toolInvocations.some((t: any) => t.toolName === 'searchAds' && t.state === 'result' && t.result?.length > 0) && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-2 mb-4">
                                        {Array.from(new Map(
                                            m.toolInvocations
                                                .filter((t: any) => t.toolName === 'searchAds' && t.state === 'result' && t.result)
                                                .flatMap((t: any) => t.result)
                                                .map((ad: any) => [ad.id, ad])
                                        ).values()).map((ad: any) => (
                                            <AdCard
                                                key={ad.id}
                                                ad={ad}
                                                viewMode="grid"
                                                currentUser={user}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Assistant Message Action Bar */}
                                {m.role === 'assistant' && m.content && (
                                    <div className="flex items-center justify-between w-full px-1 text-text-main/40 mt-1 select-none">
                                        {/* Left Side Actions */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleFeedback(m.id, 'up')}
                                                className={`p-1 transition-colors cursor-pointer hover:scale-105 active:scale-95 duration-200 ${(m as any).thumbUp
                                                    ? 'text-[#6366f1]'
                                                    : 'hover:text-text-main'
                                                    }`}
                                                title="Korisno"
                                            >
                                                <ThumbsUp className={`w-3.5 h-3.5 ${(m as any).thumbUp ? 'fill-[#6366f1]' : ''}`} />
                                            </button>
                                            <button
                                                onClick={() => handleFeedback(m.id, 'down')}
                                                className={`p-1 transition-colors cursor-pointer hover:scale-105 active:scale-95 duration-200 ${(m as any).thumbDown
                                                    ? 'text-[#6366f1]'
                                                    : 'hover:text-text-main'
                                                    }`}
                                                title="Nije korisno"
                                            >
                                                <ThumbsDown className={`w-3.5 h-3.5 ${(m as any).thumbDown ? 'fill-[#6366f1]' : ''}`} />
                                            </button>
                                            {isLastMessage && (
                                                <button
                                                    onClick={() => handleRegenerate(userMsgId, contentToRender)}
                                                    className={`p-1 hover:text-text-main transition-colors cursor-pointer hover:scale-105 active:scale-95 duration-200 ${isLoading ? 'animate-spin' : ''}`}
                                                    title="Generiši ponovo"
                                                    disabled={isLoading}
                                                >
                                                    <RotateCw className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleCopy(contentToRender, m.id)}
                                                className="p-1 hover:text-text-main transition-colors cursor-pointer hover:scale-105 active:scale-95 duration-200"
                                                title="Kopiraj poruku"
                                            >
                                                {copiedId === m.id ? (
                                                    <Check className="w-3.5 h-3.5 text-green-500 animate-in fade-in zoom-in duration-200" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Right Side Pagination */}
                                        {alternatives.length > 1 && userMsgId && (
                                            <div className="flex items-center gap-1.5 text-xs font-semibold select-none text-text-main/40">
                                                <button
                                                    onClick={() => handlePrevAlternative(userMsgId, activeIdx)}
                                                    disabled={activeIdx === 0}
                                                    className="p-1 hover:text-text-main disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                                >
                                                    <ChevronLeft className="w-3.5 h-3.5" />
                                                </button>
                                                <span>
                                                    {activeIdx + 1}/{alternatives.length}
                                                </span>
                                                <button
                                                    onClick={() => handleNextAlternative(userMsgId, activeIdx, alternatives.length)}
                                                    disabled={activeIdx === alternatives.length - 1}
                                                    className="p-1 hover:text-text-main disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                                >
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex justify-start">
                            <div className="py-2 flex items-center h-12">
                                <div className="transform scale-[0.6] w-8 h-8 flex items-center justify-center -ml-2">
                                    <TypingIndicator />
                                </div>
                            </div>
                        </div>
                    )}

                    {errorMsg && !isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[90%] md:max-w-[80%] px-5 py-3 rounded-[1.8rem] bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {errorMsg}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input area & Welcome content */}
            <div
                className={`w-full z-10 ${hasUserMessage
                    ? 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg-1 via-bg-1/90 to-transparent pt-12 pb-4 px-4'
                    : 'absolute inset-0 pt-[80px] pb-4 px-4 flex flex-col justify-between md:inset-auto md:top-1/2 md:-translate-y-1/2 md:left-0 md:right-0 md:pt-0 md:pb-0 md:h-auto md:block'
                    }`}
            >
                <div className={`w-full mx-auto ${hasUserMessage ? 'max-w-3xl px-4 md:px-10 relative' : 'flex-1 flex flex-col justify-between w-full relative md:block md:max-w-2xl'}`}>
                    <AnimatePresence>
                        {hasUserMessage && showScrollBottom && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={scrollToBottom}
                                className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 w-10 h-10 bg-bg-2 border border-bg-3 hover:border-bg-4 text-text-main rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                                type="button"
                            >
                                <ArrowDown className="w-5 h-5" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {!hasUserMessage ? (
                        <>
                            <div className="flex-1 flex flex-col justify-center items-center w-full md:flex-none md:block md:w-full md:mb-12">
                                <AnimatePresence>
                                    {shouldShowWelcome && (
                                        <motion.div
                                            layout="position"
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                y: { type: "tween", ease: "easeOut", duration: 0.4 },
                                                opacity: { duration: 0.35 },
                                                layout: { type: "tween", ease: "easeOut", duration: 0.3 }
                                            }}
                                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                            className="w-full text-center px-4"
                                        >
                                            {isPrivate ? (
                                                <div className="flex flex-col gap-2">
                                                    <h2 className="text-text-main text-3xl md:text-5xl font-black tracking-tight">
                                                        Privremeni razgovor
                                                    </h2>
                                                    <p className="text-sm text-gray-400">
                                                        Privremeni razgovori se ne čuvaju u istoriji razgovora.
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-text-main text-3xl md:text-5xl font-black tracking-tight">
                                                    {greeting}
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="w-full max-w-2xl mx-auto shrink-0 relative">
                                {inputForm}
                                <p className="text-center mt-3 text-xs text-gray-400">
                                    AI može da pogreši. Proveri bitne informacije.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="w-full max-w-2xl mx-auto">
                            {inputForm}
                            <p className="text-center mt-3 text-xs text-gray-400">
                                AI može da pogreši. Proveri bitne informacije.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
