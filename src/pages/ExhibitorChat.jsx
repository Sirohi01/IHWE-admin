import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Send, MessageSquare, Search, ArrowLeft, Check, CheckCheck } from "lucide-react";
import api, { SERVER_URL } from "../lib/api";

function timeStr(d) {
    return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function timeAgo(d) {
    if (!d) return "";
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return "now";
    if (diff < 3600) return Math.floor(diff / 60) + "m";
    if (diff < 86400) return Math.floor(diff / 3600) + "h";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function Ticks({ msg }) {
    if (msg.senderType !== "admin") return null;
    return msg.readByExhibitor
        ? <CheckCheck size={11} className="text-blue-400 inline ml-1" />
        : <Check size={11} className="text-slate-400 inline ml-1" />;
}

export default function ExhibitorChat() {
    const [socket, setSocket] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [search, setSearch] = useState("");
    const [typingRoom, setTypingRoom] = useState(null);
    const [onlineExhibitors, setOnlineExhibitors] = useState(new Set());
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const bottomRef = useRef(null);
    const typingTimer = useRef(null);
    const activeRoomRef = useRef(null);
    activeRoomRef.current = activeRoom;

    const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo") || "{}");
    const adminId = adminInfo._id || adminInfo.id || "admin";
    const adminName = adminInfo.fullName || adminInfo.username || "Admin"; // Use Full Name for RM matching if possible
    const adminRole = adminInfo.role || "";

    useEffect(() => {
        const s = io(SERVER_URL, { transports: ["websocket", "polling"] });
        s.on("connect", () => s.emit("join_admin", { adminId, adminName }));

        s.on("receive_message", (msg) => {
            // Only add to messages if it belongs to active room
            if (msg.roomId === activeRoomRef.current?._id) {
                setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);
                // Auto mark read since admin is viewing this room
                if (msg.senderType === "exhibitor") {
                    s.emit("mark_read", { roomId: msg.roomId, readerType: "admin" });
                }
            }
            setRooms(prev => prev.map(r => r._id === msg.roomId ? {
                ...r, lastMessage: msg.message, lastMessageAt: msg.createdAt,
                lastSenderType: msg.senderType,
                unreadAdmin: msg.roomId === activeRoomRef.current?._id ? 0 : (r.unreadAdmin || 0) + (msg.senderType === "exhibitor" ? 1 : 0)
            } : r).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)));
        });

        s.on("messages_seen", ({ roomId, seenBy }) => {
            if (seenBy === "exhibitor") {
                setMessages(prev => prev.map(m => m.roomId === roomId && m.senderType === "admin" ? { ...m, readByExhibitor: true } : m));
            }
        });

        s.on("room_updated", (data) => {
            // Safety: Only add/update if it's assigned to currently logged-in admin
            // (Super admins are also filtered now as per user request)
            if (data.spokenWith && data.spokenWith.toLowerCase() !== adminName.toLowerCase()) return;

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
            if (res.data.success) setRooms(res.data.data);
        });
    }, [adminName]);

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

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typingRoom]);

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
    };

    const handleTyping = (val) => {
        setInput(val);
        if (!socket || !activeRoom) return;
        socket.emit("typing", { roomId: activeRoom._id, senderType: "admin", senderName: adminName });
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => socket.emit("stop_typing", { roomId: activeRoom._id }), 1500);
    };

    const isOnline = (room) => onlineExhibitors.has(room.exhibitorRegistrationId?.toString() || room.buyerRegistrationId?.toString());
    const filtered = rooms.filter(r => {
        const name = (r.exhibitorName || r.buyerName || "").toLowerCase();
        return !search || name.includes(search.toLowerCase());
    });
    const totalUnread = rooms.reduce((s, r) => s + (r.unreadAdmin || 0), 0);

    return (
        <div className="flex h-[calc(100vh-80px)] bg-gray-50 overflow-hidden border border-gray-200 shadow-sm mt-6">
            {/* Sidebar */}
            <div className={`w-full md:w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col ${activeRoom ? "hidden md:flex" : "flex"}`}>
                <div className="px-4 py-3 bg-[#23471d] flex items-center gap-2">
                    <MessageSquare size={15} className="text-white" />
                    <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Chat Support</h2>
                    {totalUnread > 0 && <span className="ml-auto bg-[#d26019] text-white text-[9px] font-black px-2 py-0.5 rounded-full">{totalUnread}</span>}
                </div>
                <div className="px-3 py-2 border-b border-gray-100">
                    <div className="relative">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contact..."
                            className="w-full pl-8 pr-3 h-8 border border-gray-200 rounded-[2px] text-xs outline-none focus:border-[#23471d]" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-[11px] text-slate-400 font-bold uppercase">No assigned exhibitors</p>
                            <p className="text-[10px] text-slate-300 mt-1">"Spoken With" must match your username</p>
                        </div>
                    ) : filtered.map(room => (
                        <button key={room._id} onClick={() => setActiveRoom(room)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-slate-50 transition-colors ${activeRoom?._id === room._id ? "bg-[#23471d]/5 border-l-[3px] border-l-[#23471d]" : ""}`}>
                            <div className="flex items-center gap-2.5">
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-[#23471d]/10 flex items-center justify-center text-[13px] font-black text-[#23471d]">
                                        {(room.exhibitorName || "E")[0].toUpperCase()}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline(room) ? "bg-emerald-500" : "bg-slate-300"}`} />
                                    {isOnline(room) && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-[12px] truncate ${room.unreadAdmin > 0 ? "font-black text-slate-900" : "font-bold text-slate-700"}`}>
                                            {room.exhibitorName || room.buyerName || "Unknown"}
                                        </p>
                                        <p className="text-[9px] text-slate-400 flex-shrink-0 ml-1">{timeAgo(room.lastMessageAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {(room.registrationId || room.stallNo) && (
                                            <p className="text-[9px] text-[#23471d] font-bold">{room.registrationId}{room.stallNo ? ` · ${room.stallNo}` : ""}</p>
                                        )}
                                        <span className={`text-[8px] px-1 rounded-sm font-black uppercase ${room.isBuyer ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {room.isBuyer ? 'Buyer' : 'Exhibitor'}
                                        </span>
                                    </div>
                                    {room.spokenWith && adminRole === 'super-admin' && (
                                        <p className="text-[9px] text-slate-400">RM: {room.spokenWith}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-0.5">
                                        <p className="text-[10px] text-slate-500 truncate flex-1">
                                            {typingRoom === room._id ? <span className="text-emerald-500 font-bold italic">typing...</span>
                                                : room.noMessages ? <span className="text-slate-300 italic">Start conversation</span>
                                                : <>{room.lastSenderType === "admin" ? "You: " : ""}{room.lastMessage}</>}
                                        </p>
                                        {room.unreadAdmin > 0 && (
                                            <span className="flex-shrink-0 ml-1 bg-[#d26019] text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">{room.unreadAdmin}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!activeRoom ? "hidden md:flex" : "flex"}`}>
                {!activeRoom ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Select a conversation</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm">
                            <button onClick={() => setActiveRoom(null)} className="md:hidden p-1 text-slate-500"><ArrowLeft size={16} /></button>
                            <div className="relative flex-shrink-0">
                                <div className="w-9 h-9 rounded-full bg-[#23471d]/10 flex items-center justify-center text-[12px] font-black text-[#23471d]">
                                    {(activeRoom.exhibitorName || activeRoom.buyerName || "U")[0].toUpperCase()}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline(activeRoom) ? "bg-emerald-500" : "bg-slate-300"}`} />
                                {isOnline(activeRoom) && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-black text-slate-800">{activeRoom.exhibitorName || activeRoom.buyerName}</p>
                                <p className="text-[10px] text-slate-400">
                                    {activeRoom.registrationId && <span className="mr-2">{activeRoom.registrationId}</span>}
                                    {activeRoom.stallNo && <span className="mr-2">· Stall {activeRoom.stallNo}</span>}
                                    {typingRoom === activeRoom._id
                                        ? <span className="text-emerald-500 font-bold">typing...</span>
                                        : <span className={isOnline(activeRoom) ? "text-emerald-500 font-bold" : ""}>{isOnline(activeRoom) ? "● Online" : "Offline"}</span>}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-slate-50/50">
                            {loadingMsgs ? (
                                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[#23471d] border-t-transparent rounded-full animate-spin" /></div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8 text-[11px] text-slate-400 font-bold uppercase">No messages yet. Start the conversation!</div>
                            ) : messages.map((msg, i) => {
                                const isAdmin = msg.senderType === "admin";
                                const showTime = i === 0 || new Date(msg.createdAt) - new Date(messages[i-1].createdAt) > 300000;
                                return (
                                    <div key={msg._id || i}>
                                        {showTime && (
                                            <div className="text-center my-2">
                                                <span className="text-[9px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{timeStr(msg.createdAt)}</span>
                                            </div>
                                        )}
                                        <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[68%] flex flex-col gap-0.5 ${isAdmin ? "items-end" : "items-start"}`}>
                                                <div className={`px-3.5 py-2 text-[13px] leading-relaxed shadow-sm ${isAdmin ? "bg-[#23471d] text-white rounded-2xl rounded-br-sm" : "bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-bl-sm"}`}>
                                                    {msg.message}
                                                </div>
                                                <div className="flex items-center gap-1 px-1">
                                                    <span className="text-[9px] text-slate-400">{timeStr(msg.createdAt)}</span>
                                                    <Ticks msg={msg} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {typingRoom === activeRoom._id && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                                        <div className="flex gap-1 items-center">
                                            {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div className="px-4 py-3 bg-white border-t border-gray-200 flex gap-2">
                            <input value={input} onChange={e => handleTyping(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                placeholder="Type a message..." autoFocus
                                className="flex-1 h-10 px-4 border border-gray-300 rounded-full text-sm outline-none focus:border-[#23471d] bg-slate-50 focus:bg-white transition-colors" />
                            <button onClick={sendMessage} disabled={!input.trim()}
                                className="w-10 h-10 bg-[#23471d] text-white flex items-center justify-center hover:bg-[#1a3516] disabled:opacity-40 rounded-full transition-colors flex-shrink-0">
                                <Send size={15} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
