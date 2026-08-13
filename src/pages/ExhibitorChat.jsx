import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { 
    Send, 
    Search, 
    ArrowLeft, 
    Check, 
    CheckCheck, 
    Paperclip, 
    Smile, 
    Phone, 
    Video, 
    MoreVertical, 
    SlidersHorizontal, 
    Star,
    MessageSquare
} from "lucide-react";
import api, { SERVER_URL } from "../lib/api";
import EmojiPicker from "emoji-picker-react";

function timeStr(d) {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatChatListTime(d) {
    if (!d) return "";
    const date = new Date(d);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    }
    if (isYesterday) {
        return "Yesterday";
    }
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
        return date.toLocaleDateString("en-US", { weekday: "short" });
    }
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

const AVATAR_COLOR_PALETTES = [
    { bg: "bg-blue-100", text: "text-blue-700" },
    { bg: "bg-purple-100", text: "text-purple-700" },
    { bg: "bg-orange-100", text: "text-orange-700" },
    { bg: "bg-green-100", text: "text-green-700" },
    { bg: "bg-pink-100", text: "text-pink-700" },
    { bg: "bg-indigo-100", text: "text-indigo-700" },
    { bg: "bg-teal-100", text: "text-teal-700" },
    { bg: "bg-amber-100", text: "text-amber-700" },
];

function getAvatarStyle(name = "") {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLOR_PALETTES.length;
    return AVATAR_COLOR_PALETTES[index];
}

function getInitials(name = "") {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "E";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function Ticks({ msg }) {
    if (msg.senderType !== "admin") return null;
    return msg.readByExhibitor
        ? <CheckCheck size={14} className="text-[#0055DA] flex-shrink-0" />
        : <Check size={14} className="text-[#0055DA] flex-shrink-0" />;
}

export default function ExhibitorChat() {
    const location = useLocation();
    const [socket, setSocket] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem("chat_favorites");
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });
    const [typingRoom, setTypingRoom] = useState(null);
    const [onlineExhibitors, setOnlineExhibitors] = useState(new Set());
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const bottomRef = useRef(null);
    const typingTimer = useRef(null);
    const fileInputRef = useRef(null);
    const activeRoomRef = useRef(null);
    activeRoomRef.current = activeRoom;

    const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
    const adminId = adminInfo._id || adminInfo.id || "admin";
    const adminName = adminInfo.fullName || adminInfo.username || "Admin";
    const adminRole = adminInfo.role || "";

    const toggleFavorite = (roomId, e) => {
        e?.stopPropagation();
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(roomId)) next.delete(roomId);
            else next.add(roomId);
            try {
                localStorage.setItem("chat_favorites", JSON.stringify(Array.from(next)));
            } catch (err) {
                console.error("Failed to save favorites", err);
            }
            return next;
        });
    };

    useEffect(() => {
        const s = io(SERVER_URL, { transports: ["websocket", "polling"] });
        s.on("connect", () => s.emit("join_admin", { adminId, adminName }));

        s.on("receive_message", (msg) => {
            if (msg.roomId === activeRoomRef.current?._id) {
                setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);
                if (msg.senderType === "exhibitor") {
                    s.emit("mark_read", { roomId: msg.roomId, readerType: "admin" });
                }
            }
            setRooms(prev => prev.map(r => r._id === msg.roomId ? {
                ...r, 
                lastMessage: msg.message, 
                lastMessageAt: msg.createdAt,
                lastSenderType: msg.senderType,
                unreadAdmin: msg.roomId === activeRoomRef.current?._id ? 0 : (r.unreadAdmin || 0) + (['exhibitor','buyer'].includes(msg.senderType) ? 1 : 0)
            } : r).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)));
        });

        s.on("messages_seen", ({ roomId, seenBy }) => {
            if (seenBy === "exhibitor") {
                setMessages(prev => prev.map(m => m.roomId === roomId && m.senderType === "admin" ? { ...m, readByExhibitor: true } : m));
            }
        });

        s.on("room_updated", (data) => {
            if (adminRole !== "IHWE–Super Administrator" && data.spokenWith && data.spokenWith.toLowerCase() !== adminName.toLowerCase()) return;

            setRooms(prev => {
                const exists = prev.find(r => r._id === data.roomId);
                if (exists) return prev.map(r => r._id === data.roomId ? { ...r, ...data, unreadAdmin: data.roomId === activeRoomRef.current?._id ? 0 : (r.unreadAdmin || 0) + (data.unreadIncrement || 0) } : r)
                    .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
                return [{ _id: data.roomId, ...data }, ...prev];
            });
        });

        s.on("typing", ({ senderType, roomId }) => {
            if (senderType === "exhibitor") setTypingRoom(roomId);
        });
        s.on("stop_typing", ({ roomId }) => {
            setTypingRoom(prev => prev === roomId ? null : prev);
        });

        s.on("user_status", ({ userId, userType, online }) => {
            if (userType === "exhibitor") {
                setOnlineExhibitors(prev => {
                    const n = new Set(prev);
                    online ? n.add(userId) : n.delete(userId);
                    return n;
                });
            }
        });

        setSocket(s);
        return () => s.disconnect();
    }, []);

    useEffect(() => {
        api.get(`/api/chat/rooms?adminUsername=${encodeURIComponent(adminName)}&adminRole=${encodeURIComponent(adminRole)}`).then(res => {
            if (res.data.success) {
                const fetchedRooms = res.data.data;
                setRooms(fetchedRooms);

                const queryParams = new URLSearchParams(location.search);
                const queryRoomId = queryParams.get("roomId");
                const targetRoomId = location.state?.activeRoomId || queryRoomId;

                if (targetRoomId) {
                    const match = fetchedRooms.find(r => r._id === targetRoomId);
                    if (match) setActiveRoom(match);
                } else if (fetchedRooms.length > 0 && !activeRoom) {
                    setActiveRoom(fetchedRooms[0]);
                }
            }
        });
    }, [adminName, location.state?.activeRoomId, location.search]);

    useEffect(() => {
        if (!activeRoom) return;
        setLoadingMsgs(true);
        setMessages([]);
        setTypingRoom(null);
        api.get(`/api/chat/messages/${activeRoom._id}`).then(res => {
            if (res.data.success) setMessages(res.data.data);
        }).finally(() => setLoadingMsgs(false));
        api.put(`/api/chat/read/${activeRoom._id}`, { readerType: "admin" });
        setRooms(prev => prev.map(r => r._id === activeRoom._id ? { ...r, unreadAdmin: 0 } : r));
        if (socket) {
            socket.emit("join_room", { roomId: activeRoom._id, userId: adminId, userType: "admin", userName: adminName });
            socket.emit("mark_read", { roomId: activeRoom._id, readerType: "admin" });
        }
    }, [activeRoom?._id]);

    useEffect(() => { 
        bottomRef.current?.scrollIntoView({ behavior: "smooth" }); 
    }, [messages, typingRoom]);

    const sendMessage = () => {
        if (!input.trim() || !activeRoom || !socket) return;
        socket.emit("send_message", {
            roomId: activeRoom._id,
            exhibitorRegistrationId: activeRoom.exhibitorRegistrationId,
            exhibitorName: activeRoom.exhibitorName,
            senderType: "admin", senderId: adminId, senderName: adminName,
            message: input.trim(),
        });
        setInput("");
        socket.emit("stop_typing", { roomId: activeRoom._id });
        setShowEmojiPicker(false);
    };

    const handleTyping = (val) => {
        setInput(val);
        if (!socket || !activeRoom) return;
        socket.emit("typing", { roomId: activeRoom._id, senderType: "admin", senderName: adminName });
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => socket.emit("stop_typing", { roomId: activeRoom._id }), 1500);
    };

    const addEmoji = (emoji) => {
        setInput(prev => prev + emoji);
    };

    const isOnline = (room) => onlineExhibitors.has(room.exhibitorRegistrationId?.toString() || room.buyerRegistrationId?.toString());
    
    const totalAllCount = rooms.length;
    const totalUnreadCount = rooms.filter(r => (r.unreadAdmin || 0) > 0).length;
    const totalFavCount = rooms.filter(r => favorites.has(r._id)).length;

    const filteredRooms = rooms.filter(r => {
        const name = (r.exhibitorName || r.buyerName || "").toLowerCase();
        const regId = (r.registrationId || "").toLowerCase();
        const stall = (r.stallNo || "").toLowerCase();
        const query = search.toLowerCase();
        
        const matchesSearch = !search || name.includes(query) || regId.includes(query) || stall.includes(query);
        if (!matchesSearch) return false;

        if (activeTab === "unread") return (r.unreadAdmin || 0) > 0;
        if (activeTab === "favorites") return favorites.has(r._id);
        return true;
    });

    const cardShadowStyle = { boxShadow: "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em" };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-white p-2 md:p-3 gap-3 overflow-hidden font-sans" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            {/* Left Sidebar */}
            <div 
                className={`w-full md:w-88 flex-shrink-0 bg-white rounded-lg border border-gray-100 flex flex-col overflow-hidden ${activeRoom ? "hidden md:flex" : "flex"}`}
                style={cardShadowStyle}
            >
                {/* Search & Filter Header */}
                <div className="p-3 pb-2 border-b border-gray-100 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                                placeholder="Search exhibitors..."
                                className="w-full pl-9 pr-3 h-9 bg-slate-50 border border-slate-200/80 rounded-md text-[14px] font-normal outline-none focus:border-[#0055DA] focus:bg-white transition-all text-slate-700 placeholder-slate-400" 
                            />
                        </div>
                        <button 
                            className="w-9 h-9 flex items-center justify-center bg-slate-50 border border-slate-200/80 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all flex-shrink-0"
                            title="Filter options"
                        >
                            <SlidersHorizontal size={15} />
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center justify-around px-2 text-[11.5px] pt-1 font-semibold">
                        <button 
                            onClick={() => setActiveTab("all")}
                            className={`pb-1.5 relative transition-colors ${activeTab === "all" ? "text-[#499A13]" : "text-black hover:text-slate-800"}`}
                        >
                            All ({totalAllCount})
                            {activeTab === "all" && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#499A13] rounded-full" />
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab("unread")}
                            className={`pb-1.5 relative transition-colors ${activeTab === "unread" ? "text-[#499A13]" : "text-black hover:text-slate-800"}`}
                        >
                            Unread ({totalUnreadCount})
                            {activeTab === "unread" && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#499A13] rounded-full" />
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab("favorites")}
                            className={`pb-1.5 relative transition-colors ${activeTab === "favorites" ? "text-[#499A13]" : "text-black hover:text-slate-800"}`}
                        >
                            Favorites {totalFavCount > 0 ? `(${totalFavCount})` : ""}
                            {activeTab === "favorites" && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#499A13] rounded-full" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Rooms List */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                    {filteredRooms.length === 0 ? (
                        <div className="p-6 text-center flex flex-col items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                            <p className="text-[12px] text-slate-500 font-semibold uppercase tracking-wider">No contacts found</p>
                            <p className="text-[12px] text-slate-400 mt-1">Try adjusting your search or tab filter</p>
                        </div>
                    ) : filteredRooms.map(room => {
                        const displayName = room.exhibitorName || room.buyerName || "Exhibitor";
                        const initials = getInitials(displayName);
                        const avatarStyle = getAvatarStyle(displayName);
                        const isActive = activeRoom?._id === room._id;
                        const isFav = favorites.has(room._id);

                        return (
                            <div 
                                key={room._id} 
                                onClick={() => setActiveRoom(room)}
                                className={`w-full text-left p-2.5 transition-all flex items-start gap-2.5 cursor-pointer group relative border-b border-gray-100 ${
                                    isActive 
                                        ? "bg-[#edf7f0] border-l-4 border-l-[#499A13]" 
                                        : "bg-white border-l-4 border-l-transparent hover:bg-slate-50/90"
                                }`}
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0 pt-0.5">
                                    <div className={`w-9 h-9 rounded-full ${avatarStyle.bg} ${avatarStyle.text} flex items-center justify-center font-bold text-[13px] shadow-2xs`}>
                                        {initials}
                                    </div>
                                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${isOnline(room) ? "bg-green-500" : "bg-red-500"}`} />
                                </div>

                                {/* Room Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <p className="text-[13px] font-semibold text-black truncate leading-snug">
                                            {displayName}
                                        </p>
                                        <span className="text-[10.5px] font-medium text-gray-500 flex-shrink-0">
                                            {formatChatListTime(room.lastMessageAt)}
                                        </span>
                                    </div>

                                    {/* Reg ID & Stall No */}
                                    <div className="flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-[#4B1426] truncate">
                                        {room.registrationId && <span>{room.registrationId}</span>}
                                        {room.registrationId && room.stallNo && <span>·</span>}
                                        {room.stallNo && <span>{room.stallNo}</span>}
                                    </div>

                                    {/* RM tag if super admin */}
                                    {room.spokenWith && adminRole === 'IHWE–Super Administrator' && (
                                        <p className="text-[10px] font-semibold text-blue-600 mt-0.5">RM: {room.spokenWith}</p>
                                    )}

                                    {/* Last message / Status */}
                                    <div className="flex items-center justify-between mt-1 gap-2">
                                        <p className="text-[12px] font-semibold text-[#0A2947] truncate flex-1">
                                            {typingRoom === room._id ? (
                                                <span className="text-green-600 font-medium italic">typing...</span>
                                            ) : room.noMessages ? (
                                                <span className="text-gray-400 font-normal italic">No messages yet. Start the conversation!</span>
                                            ) : (
                                                <>{room.lastSenderType === "admin" ? "You: " : ""}{room.lastMessage}</>
                                            )}
                                        </p>

                                        {/* Badges / Favorite star */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {room.unreadAdmin > 0 && (
                                                <span className="bg-[#499A13] text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-2xs">
                                                    {room.unreadAdmin}
                                                </span>
                                            )}
                                            <button 
                                                onClick={(e) => toggleFavorite(room._id, e)} 
                                                className={`p-0.5 rounded-full hover:bg-slate-200/60 transition-colors ${isFav ? "text-amber-400" : "text-slate-300 opacity-0 group-hover:opacity-100"}`}
                                                title={isFav ? "Remove from favorites" : "Add to favorites"}
                                            >
                                                <Star size={13} fill={isFav ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Chat Area */}
            <div 
                className={`flex-1 flex flex-col bg-white rounded-lg border border-gray-100 overflow-hidden ${!activeRoom ? "hidden md:flex" : "flex"}`}
                style={cardShadowStyle}
            >
                {!activeRoom ? (
                    <div className="flex-1 flex items-center justify-center bg-white p-6">
                        <div className="text-center max-w-sm">
                            <div className="w-12 h-12 bg-blue-50 text-[#0055DA] rounded-full flex items-center justify-center mx-auto mb-3">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Select a Conversation</h3>
                            <p className="text-[13px] font-normal text-slate-500">Choose an exhibitor from the contact list on the left to start chatting.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header Bar */}
                        <div className="p-3 md:px-4 md:py-3 bg-white border-b border-gray-100 flex items-center justify-between shadow-2xs">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveRoom(null)} className="md:hidden p-1 rounded-md hover:bg-slate-100 text-slate-600">
                                    <ArrowLeft size={16} />
                                </button>
                                
                                <div className="relative flex-shrink-0">
                                    <div className={`w-10 h-10 rounded-full ${getAvatarStyle(activeRoom.exhibitorName || activeRoom.buyerName).bg} ${getAvatarStyle(activeRoom.exhibitorName || activeRoom.buyerName).text} flex items-center justify-center font-bold text-[14px] shadow-2xs`}>
                                        {getInitials(activeRoom.exhibitorName || activeRoom.buyerName)}
                                    </div>
                                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${isOnline(activeRoom) ? "bg-green-500" : "bg-red-500"}`} />
                                </div>

                                <div>
                                    <h2 className="text-[14.5px] font-semibold text-black leading-snug">
                                        {activeRoom.exhibitorName || activeRoom.buyerName}
                                    </h2>
                                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#4B1426]">
                                        {activeRoom.registrationId && <span>{activeRoom.registrationId}</span>}
                                        {activeRoom.registrationId && activeRoom.stallNo && <span>•</span>}
                                        {activeRoom.stallNo && <span>Stall {activeRoom.stallNo}</span>}
                                        <span>•</span>
                                        <span 
                                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                                typingRoom === activeRoom._id || isOnline(activeRoom)
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-red-50 text-red-600 border-red-200"
                                            }`}
                                        >
                                            {typingRoom === activeRoom._id ? "typing..." : isOnline(activeRoom) ? "Online" : "Offline"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                            {/* Date Separator Pill */}
                            <div className="flex items-center justify-center my-1.5 relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200/60" />
                                </div>
                                <span className="relative text-[12px] font-medium text-slate-500 bg-white border border-slate-200/80 px-3.5 py-0.5 rounded-full shadow-2xs">
                                    Today
                                </span>
                            </div>

                            {loadingMsgs ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-5 h-5 border-2 border-[#0055DA] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8 text-[13px] font-medium text-slate-400 uppercase tracking-wider">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : messages.map((msg, i) => {
                                const isAdmin = msg.senderType === "admin";
                                return (
                                    <div key={msg._id || i} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                                        <div className="max-w-[75%] md:max-w-[65%] flex flex-col">
                                            <div 
                                                className={`px-3.5 pt-3 pb-2 text-[14.5px] leading-relaxed font-semibold min-w-[120px] ${
                                                    isAdmin 
                                                        ? "bg-[#e6effd] text-[#0A2947] rounded-lg rounded-tr-xs border border-blue-100" 
                                                        : "bg-white text-[#0A2947] rounded-lg rounded-tl-xs border border-slate-100"
                                                }`}
                                                style={{ boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px" }}
                                            >
                                                <div className="whitespace-pre-wrap break-words">{msg.message}</div>
                                                <div className="flex items-center justify-between gap-3 mt-1.5 text-[11px] font-semibold text-slate-500">
                                                    <span>{timeStr(msg.createdAt)}</span>
                                                    {isAdmin && <Ticks msg={msg} />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {typingRoom === activeRoom._id && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-100 shadow-2xs px-3.5 py-2.5 rounded-lg rounded-tl-xs">
                                        <div className="flex gap-1.5 items-center">
                                            {[0, 1, 2].map(i => (
                                                <div 
                                                    key={i} 
                                                    className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" 
                                                    style={{ animationDelay: `${i * 0.15}s` }} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input Footer */}
                        <div className="p-3 bg-white border-t border-gray-100 relative">
                            {showEmojiPicker && (
                                <div 
                                    className="absolute bottom-14 right-2 z-40 rounded-2xl overflow-hidden border border-slate-200/90"
                                    style={{ boxShadow: "rgba(14, 30, 37, 0.15) 0px 4px 16px 0px, rgba(14, 30, 37, 0.25) 0px 12px 32px 0px" }}
                                >
                                    <EmojiPicker 
                                        onEmojiClick={(emojiData) => addEmoji(emojiData.emoji)}
                                        width={330}
                                        height={410}
                                        previewConfig={{ showPreview: false }}
                                        skinTonesDisabled
                                        lazyLoadEmojis
                                    />
                                </div>
                            )}

                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={() => alert("File attachment ready")}
                            />

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 rounded-md border border-slate-200/80 bg-slate-50/60 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all flex-shrink-0"
                                    title="Attach File"
                                >
                                    <Paperclip size={16} />
                                </button>

                                <div className="relative flex-1">
                                    <input 
                                        value={input} 
                                        onChange={e => handleTyping(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                        placeholder="Type your message..." 
                                        autoFocus
                                        className="w-full bg-slate-50/80 border border-slate-200/80 rounded-md pl-3.5 pr-9 py-2 text-[14px] font-normal text-slate-800 placeholder-slate-400 outline-none focus:border-[#0055DA] focus:bg-white transition-all" 
                                    />
                                    <button 
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                                        title="Add emoji"
                                    >
                                        <Smile size={16} />
                                    </button>
                                </div>

                                <button 
                                    onClick={sendMessage} 
                                    disabled={!input.trim()}
                                    className="w-9 h-9 rounded-md bg-[#0055DA] hover:bg-[#0044B0] text-white flex items-center justify-center shadow-xs disabled:opacity-40 transition-all flex-shrink-0"
                                    title="Send Message"
                                >
                                    <Send size={15} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}


