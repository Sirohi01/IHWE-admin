import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MessageSquare, ArrowRight } from "lucide-react";
import { io } from "socket.io-client";
import api, { SERVER_URL } from "../../lib/api";

function timeAgo(d) {
  if (!d) return "";
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function NextActionPanel() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [onlineExhibitors, setOnlineExhibitors] = useState(new Set());

  const raw = localStorage.getItem("adminInfo") || sessionStorage.getItem("adminInfo");
  const adminInfo = raw && raw !== "null" ? JSON.parse(raw) : {};
  const adminId = adminInfo._id || adminInfo.id || "admin";
  const adminName = adminInfo.fullName || adminInfo.username || "Admin";
  const adminRole = adminInfo.role || "";

  useEffect(() => {
    // 1. Fetch initial rooms list
    api.get(`/api/chat/rooms?adminUsername=${encodeURIComponent(adminName)}&adminRole=${encodeURIComponent(adminRole)}`)
      .then(res => {
        if (res.data.success) {
          setRooms(res.data.data.slice(0, 3)); // Display top 3 active chats
        }
      }).catch(err => console.error("Error fetching rooms in widget:", err));

    // 2. Setup Socket.IO listener for real-time unread alerts
    const s = io(SERVER_URL, { transports: ["websocket", "polling"] });
    s.on("connect", () => s.emit("join_admin", { adminId, adminName }));

    s.on("receive_message", (msg) => {
      setRooms(prev => prev.map(r => r._id === msg.roomId ? {
        ...r, lastMessage: msg.message, lastMessageAt: msg.createdAt,
        lastSenderType: msg.senderType,
        unreadAdmin: (r.unreadAdmin || 0) + (msg.senderType === "exhibitor" ? 1 : 0)
      } : r).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)));
    });

    s.on("room_updated", (data) => {
      if (adminRole !== "super-admin" && data.spokenWith && data.spokenWith.toLowerCase() !== adminName.toLowerCase()) return;
      setRooms(prev => {
        const exists = prev.find(r => r._id === data.roomId);
        if (exists) return prev.map(r => r._id === data.roomId ? { ...r, ...data, unreadAdmin: (r.unreadAdmin || 0) + (data.unreadIncrement || 0) } : r)
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
        return [{ _id: data.roomId, ...data }, ...prev].slice(0, 3);
      });
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

    return () => s.disconnect();
  }, [adminName, adminRole]);

  const isOnline = (room) => onlineExhibitors.has(room.exhibitorRegistrationId?.toString() || room.buyerRegistrationId?.toString());
  const totalUnread = rooms.reduce((s, r) => s + (r.unreadAdmin || 0), 0);

  return (
    <div className="bg-white rounded-lg border border-slate-100 p-5 shadow-sm lg:col-span-3 col-span-1 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group" style={{ minHeight: '235px' }}>
      {/* Decorative subtle header line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#23471d] via-[#3a7031] to-[#d26019] opacity-70" />

      {/* Premium Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#23471d]/5 flex items-center justify-center text-[#23471d] shadow-sm border border-[#23471d]/10">
            <MessageSquare size={15} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Live Support</h3>
            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider mt-1 block">Assigned Messenger</span>
          </div>
        </div>
        
        {totalUnread > 0 ? (
          <span className="bg-gradient-to-r from-[#d26019] to-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-sm tracking-wide">
            {totalUnread} NEW
          </span>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[7.5px] text-emerald-700 font-black uppercase tracking-wider">LIVE</span>
          </div>
        )}
      </div>

      {/* Dynamic Chats List Area */}
      <div className="space-y-2 flex-1 overflow-y-auto mt-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-1" style={{ maxHeight: '145px' }}>
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center mb-2 border border-slate-100">
              <MessageSquare size={16} className="text-slate-300 stroke-[1.5]" />
            </div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
              No live conversations
            </div>
            <p className="text-[8.5px] text-slate-300 mt-0.5">Assigned inquiries will appear here</p>
          </div>
        ) : (
          rooms.map(room => (
            <button
              key={room._id}
              onClick={() => navigate("/exhibitor-chat", { state: { activeRoomId: room._id } })}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/20 hover:bg-slate-50 transition-all duration-200 text-left group/item relative overflow-hidden shadow-sm"
            >
              {/* Subtle hover accent line */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#23471d] scale-y-0 group-hover/item:scale-y-100 transition-transform duration-200" />

              <div className="flex items-center gap-2 min-w-0 flex-1 pl-1.5">
                {/* Content details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 leading-none mb-1.5">
                    <h5 className={`text-[11px] truncate flex items-center gap-1.5 ${
                      room.unreadAdmin > 0 ? "font-black text-slate-900" : "font-extrabold text-slate-700"
                    }`}>
                      {/* Online dot indicator inside text block */}
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isOnline(room) ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                      }`} />
                      <span className={`text-[6.5px] px-1 py-0.5 rounded-sm font-black uppercase flex-shrink-0 leading-none ${
                        room.isBuyer 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200/55' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200/55'
                      }`}>
                        {room.isBuyer ? 'Buyer' : 'Exhibitor'}
                      </span>
                      <span className="truncate">{room.exhibitorName || room.buyerName || "Unknown"}</span>
                    </h5>
                    <span className="text-[8px] text-slate-400 flex-shrink-0 font-semibold">{timeAgo(room.lastMessageAt)}</span>
                  </div>
                  
                  <p className="text-[9.5px] text-slate-500 truncate leading-none">
                    {room.noMessages ? (
                      <span className="text-slate-300 italic">Start chatting</span>
                    ) : (
                      <>{room.lastSenderType === "admin" ? <span className="font-bold text-[#23471d]/75">You: </span> : ""}{room.lastMessage}</>
                    )}
                  </p>
                </div>
              </div>

              {/* Unread Message Counter */}
              {room.unreadAdmin > 0 && (
                <span className="flex-shrink-0 ml-2 w-4.5 h-4.5 bg-[#d26019] text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {room.unreadAdmin}
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer Nav Link */}
      <div className="border-t border-slate-100/80 pt-3 mt-3">
        <Link
          to="/exhibitor-chat"
          className="w-full h-8.5 bg-slate-50 hover:bg-[#23471d] text-[9.5px] font-black text-slate-700 hover:text-white uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-xl transition-all duration-300 border border-slate-100 shadow-sm group"
        >
          Open Chat Messenger 
          <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </div>
  );
}

