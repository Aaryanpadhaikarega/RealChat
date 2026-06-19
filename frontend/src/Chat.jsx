import axios from "axios";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

const socket = io("http://localhost:5000");

function Chat() {
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);

  const [friendRequests, setFriendRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);

  const bottomRef = useRef();
  const fileInputRef = useRef();
  const [showMenu, setShowMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    socket.emit("join", username);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const onEmojiClick = (emojiData) => {

  setMessage((prev) => prev + emojiData.emoji);

  setShowEmojiPicker(false);

};
  
  const sendMessage = () => {
    if (!selectedUser) return;

    if (!message.trim()) return;

    socket.emit("send_message", {
      sender: username,
      receiver: selectedUser.username,
      text: message,
    });

    socket.emit("stop_typing");

    setMessage("");
  };

  const sendImage = async (file) => {

  if (!selectedUser) return;

  const formData = new FormData();

  formData.append("image", file);

  try {

    const res = await axios.post(
      "http://localhost:5000/api/upload",
      formData
    );

    socket.emit("send_message", {

      sender: username,

      receiver: selectedUser.username,

      text: "",

      image: res.data.image,

    });

  } catch (err) {

    console.log(err);

  }

};

  useEffect(() => {
    const loadFriends = async () => {

const res = await axios.get(
`http://localhost:5000/api/friends/${username}`
);

setFriends(res.data);

};

    loadFriends();
    const loadRequests = async () => {

  const res = await axios.get(

    `http://localhost:5000/api/friends/requests/${username}`

  );

  setFriendRequests(res.data);

};

loadRequests();

    socket.on("online_users", (data) => {
      setOnlineUsers(data);
    });

    socket.on("user_typing", (data) => {
      if (data.username !== username) {
        setTypingUser(data.username);
      }
    });

    socket.on("stop_typing", () => {
      setTypingUser("");
    });

    socket.on("receive_message", (data) => {

  const isCurrentChat =
    selectedUser &&
    (
      (data.sender === username &&
        data.receiver === selectedUser.username) ||

      (data.sender === selectedUser.username &&
        data.receiver === username)
    );

  if (isCurrentChat) {

    setMessages((prev) => [...prev, data]);

  }

  if (
    data.receiver === username &&
    (!selectedUser ||
      data.sender !== selectedUser.username)
  ) {

    setUnread((prev) => ({

      ...prev,

      [data.sender]:
        (prev[data.sender] || 0) + 1,

    }));

  }

  setUsers((prev) =>
    prev.map((u) =>
      u.username === data.sender ||
      u.username === data.receiver
        ? {
            ...u,
            lastMessage: data.text,
            lastMessageTime: data.createdAt,
          }
        : u
    )
  );

});
socket.off("refresh_friends");

 socket.on("message_edited", (updated) => {

  setMessages((prev) =>

    prev.map((msg) =>

      msg._id === updated._id

        ? updated

        : msg

    )

  );

});
socket.off("refresh_friends");

socket.on("message_deleted", (updatedMessage) => {

  setMessages((prev) =>

    prev.map((msg) =>

      msg._id === updatedMessage._id

        ? updatedMessage

        : msg

    )

  );

});
socket.off("refresh_friends");

socket.on("refresh_friends",async()=>{

  console.log("REFRESH RECEIVED", username);

  const res=await axios.get(

  `http://localhost:5000/api/friends/${username}`

   );

  setFriends(res.data);

});

    return () => {
      socket.off("receive_message");
      socket.off("online_users");
      socket.off("user_typing");
      socket.off("stop_typing");
      socket.off("message_deleted");
      socket.off("message_edited");
      socket.off("refresh_friends");
    };
  }, [username, selectedUser]);

  const loadConversation = async (u) => {

  setSelectedUser(u);

  setUnread((prev) => ({

    ...prev,

    [u.username]: 0,

  }));

  const res = await axios.get(
    `http://localhost:5000/api/chat/${username}/${u.username}`
  );

  setMessages(res.data);

};

  const filteredFriends = friends.filter((u)=>

u.username
.toLowerCase()
.includes(search.toLowerCase())

);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex justify-center items-center p-4">
      <div className="w-full max-w-[1280px] h-[760px] bg-slate-900/60 backdrop-blur-xl rounded-3xl flex overflow-hidden shadow-2xl border border-slate-800/60 ring-1 ring-white/5">
        
        {/* Sidebar */}
        <div className="w-80 flex flex-col bg-slate-950/40 border-r border-slate-800/60">
          
          {/* Sidebar Header */}
          <div className="p-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">

  <div className="flex items-center gap-2">

    <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-xl">
      💬
    </div>

    <h1 className="text-2xl text-white font-bold tracking-tight">
      RealChat
    </h1>

  </div>

  <button

    onClick={() => setShowAddFriend(true)}

    className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xl"

  >

    +

  </button>
  <button

onClick={()=>setShowRequests(true)}

className="w-10 h-10 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white"

>

🔔

</button>

</div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                🔍
              </span>
              <input
                placeholder="Search users..."
                value={search}
                onChange={async(e)=>{

setSearch(e.target.value);

if(e.target.value===""){

setSearchResults([]);

return;

}

const res=await axios.get(

`http://localhost:5000/api/users/search/${e.target.value}`

);

setSearchResults(res.data);

}}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/95 text-slate-800 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/40 transition-all"
              />
            </div>
          </div>

         

          {/* User List */}
          <div className="flex-1 overflow-y-auto custom-scroll">
            {friends.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-sm">
                No users found
              </div>
            )}

            {friends.map((u)=> (
              <div
                key={u._id}
                onClick={() => loadConversation(u)}
                className={`group p-4 cursor-pointer border-b border-slate-800/40 transition-all duration-300 hover:bg-slate-800/50 ${
                  selectedUser?._id === u._id
                    ? "bg-gradient-to-r from-indigo-600/20 to-transparent border-l-2 border-l-indigo-500"
                    : "border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={
                          u.avatar
                            ? `http://localhost:5000${u.avatar}`
                            : `[ui-avatars.com](https://ui-avatars.com/api/?name=${u.username}&background=6366f1&color=fff)`
                        }
                        alt={u.username}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700 group-hover:ring-indigo-500 transition-all duration-300"
                      />
                      {onlineUsers.includes(u.username) && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-white font-semibold truncate">
                          {u.username}
                        </h2>
                        {u.lastMessageTime && (
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {new Date(u.lastMessageTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs truncate mt-0.5">
                        {u.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>

                  {unread[u.username] > 0 && (
                    <div className="ml-2 bg-gradient-to-br from-pink-500 to-red-600 text-white min-w-[22px] h-[22px] px-1.5 rounded-full flex justify-center items-center text-[11px] font-bold shadow-lg shadow-red-500/30 animate-bounce-soft">
                      {unread[u.username]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-800/60 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <img
                src={`[ui-avatars.com](https://ui-avatars.com/api/?name=${username}&background=6366f1&color=fff)`}
                alt={username}
                className="w-10 h-10 rounded-full ring-2 ring-indigo-500"
              />
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{username}</p>
                <p className="text-green-400 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Active now
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-950/30">
          
          {/* Chat Header */}
          <div className="h-20 bg-gradient-to-r from-slate-900/80 to-slate-900/40 backdrop-blur-md px-6 flex justify-between items-center border-b border-slate-800/60">
            <div className="flex items-center gap-4">
              {selectedUser ? (
                <>
                  <div className="relative">
                    <img
                      src={
                        selectedUser.avatar
                          ? `http://localhost:5000${selectedUser.avatar}`
                          : `[ui-avatars.com](https://ui-avatars.com/api/?name=${selectedUser.username}&background=6366f1&color=fff)`
                      }
                      alt={selectedUser.username}
                      className="w-12 h-12 rounded-full ring-2 ring-indigo-500/50"
                    />
                    {onlineUsers.includes(selectedUser.username) && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-slate-900"></span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedUser.username}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {onlineUsers.includes(selectedUser.username)
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Welcome, {username} 👋
                  </h1>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Select a conversation to get started
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center justify-center">
                📞
              </button>
              <button className="w-10 h-10 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center justify-center">
                🎥
              </button>
              <button className="w-10 h-10 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center justify-center">
                ⋮
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-2 custom-scroll bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.05),_transparent_50%)]">
            {!selectedUser && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center text-5xl">
                  💬
                </div>
                <p className="text-lg font-medium">Your messages</p>
                <p className="text-sm">Pick a user from the sidebar to start chatting</p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isMine = msg.sender === username;
              return (
                <div
                  key={i}
                  className={`flex ${isMine ? "justify-end" : "justify-start"} animate-message-in`}
                >
                  <div
                    className={`group relative max-w-[420px] overflow-hidden px-3 py-3 rounded-2xl shadow-md transition-all duration-200 ${
                      isMine
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm"
                        : "bg-slate-800/90 text-white rounded-bl-sm border border-slate-700/50"
                    }`}
                  >
                   {isMine && !msg.deleted && (

<button
onClick={()=>{
setSelectedMessage(msg);
setShowMenu(true);
}}
className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-700 text-white opacity-0 group-hover:opacity-100 transition"
>

⋮

</button>

)}
                    <>
  {msg.deleted ? (

    <p className="italic text-slate-400 text-sm">

      🚫 This message was deleted

    </p>

  ) : (

    <>

      {msg.image && (

        <div className="overflow-hidden rounded-xl mb-2">

          <img
            src={msg.image}
            alt=""
            className="w-full max-h-80 object-cover hover:scale-105 transition duration-300"
          />

        </div>

      )}

      {msg.text && (

<p className="text-sm leading-relaxed break-words">

{msg.text}

{msg.updatedAt !== msg.createdAt && (

<span className="text-xs opacity-60 ml-2">

(edited)

</span>

)}

</p>

)}

    </>

  )}
</>
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        isMine ? "text-indigo-100/80" : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            {typingUser &&
              selectedUser &&
              typingUser === selectedUser.username && (
                <div className="flex items-center gap-2 text-slate-400 text-xs pl-2 animate-message-in">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                  <span>{typingUser} is typing...</span>
                </div>
              )}

              {showMenu && ( <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"> <div className="bg-slate-900 p-5 rounded-2xl w-72"> <h2 className="text-white text-lg font-bold mb-4"> Message Options </h2> <button onClick={() => { setEditText(selectedMessage.text); setShowMenu(false); setShowEdit(true); }} className="w-full p-3 rounded-xl bg-indigo-600 text-white mb-2" > ✏️ Edit Message </button> <button onClick={() => { socket.emit("delete_message", selectedMessage._id); setShowMenu(false); }} className="w-full p-3 rounded-xl bg-red-600 text-white mb-2" > 🗑 Delete Message </button> <button onClick={() => setShowMenu(false)} className="w-full p-3 rounded-xl bg-slate-700 text-white" > Cancel </button> </div> </div> )}
             {showEdit && ( <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"> <div className="bg-slate-900 p-5 rounded-2xl w-80"> <h2 className="text-white text-lg font-bold mb-4"> Edit Message </h2> <input value={editText} onChange={(e)=>setEditText(e.target.value)} className="w-full p-3 rounded-xl bg-slate-800 text-white mb-4" /> <button onClick={()=>{ socket.emit("edit_message",{ id:selectedMessage._id, text:editText, }); setShowEdit(false); }} className="w-full p-3 rounded-xl bg-indigo-600 text-white mb-2" > Save </button> <button onClick={()=>setShowEdit(false)} className="w-full p-3 rounded-xl bg-slate-700 text-white" > Cancel </button> </div> </div> )}
            <div ref={bottomRef}></div>
          </div>

          {/* Input */}
          <div className="relative p-4 border-t border-slate-800/60 bg-slate-900/60 backdrop-blur-md">

  {showEmojiPicker && (

    <div className="absolute bottom-20 left-4 z-50">

      <EmojiPicker
        onEmojiClick={onEmojiClick}
        theme="dark"
      />

    </div>

  )}

  <div className="flex gap-3 items-center">

    <button
      onClick={() =>
        setShowEmojiPicker(!showEmojiPicker)
      }
      className="w-11 h-11 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center justify-center shrink-0"
    >
      😊
    </button>

    <>

<button

onClick={() => fileInputRef.current.click()}

className="w-11 h-11 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center justify-center shrink-0"

>

📎

</button>

<input

type="file"

accept="image/*"

hidden

ref={fileInputRef}

onChange={(e)=>{

if(e.target.files[0]){

sendImage(e.target.files[0]);

}

}}

/>

</>

    <input
      value={message}
      onChange={(e) => {

        setMessage(e.target.value);

        socket.emit("typing", {
          username,
        });

      }}
      onBlur={() =>
        socket.emit("stop_typing")
      }
      onKeyDown={(e) =>
        e.key === "Enter" &&
        sendMessage()
      }
      placeholder={
        selectedUser
          ? "Type a message..."
          : "Select a user first"
      }
      disabled={!selectedUser}
      className="flex-1 px-5 py-3 rounded-full bg-slate-800/80 text-white text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
    />

    <button
      onClick={sendMessage}
      disabled={
        !selectedUser ||
        !message.trim()
      }
      className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all px-6 h-11 rounded-full text-white font-semibold text-sm shadow-lg hover:scale-105 active:scale-95"
    >
      Send
    </button>

  </div>

</div>
        </div>
      </div>

      {showAddFriend && (

<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

<div className="bg-slate-900 w-[420px] rounded-2xl p-5">

<h2 className="text-white text-xl font-bold mb-4">

Add Friend

</h2>

<input
placeholder="Search username..."
value={search}
onChange={async(e)=>{

setSearch(e.target.value);

if(e.target.value===""){

setSearchResults([]);

return;

}

const res=await axios.get(

`http://localhost:5000/api/users/search/${e.target.value}`

);

setSearchResults(res.data);

}}
className="w-full p-3 rounded-xl bg-slate-800 text-white mb-4"
/>

<div className="space-y-3 max-h-72 overflow-y-auto">

{searchResults.map((u)=>(

<div
key={u._id}
className="flex justify-between items-center bg-slate-800 p-3 rounded-xl"
>

<p className="text-white">
{u.username}
</p>

<button

onClick={async()=>{

await axios.post(

"http://localhost:5000/api/friends/request",

{
sender:username,
receiver:u.username
}

);

alert("Friend Request Sent");

}}

className="bg-indigo-600 px-3 py-2 rounded-lg text-white"

>

Add

</button>

</div>

))}

</div>

<button

onClick={()=>{

setShowAddFriend(false);

setSearch("");

setSearchResults([]);

}}

className="mt-4 w-full bg-slate-700 p-3 rounded-xl text-white"

>

Close

</button>

</div>

</div>

)}

{showRequests && (

<div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

<div className="bg-slate-900 w-[420px] p-5 rounded-2xl">

<h1 className="text-white text-xl font-bold mb-5">

Friend Requests

</h1>

{

friendRequests.map((req)=>(

<div

key={req._id}

className="flex justify-between items-center bg-slate-800 p-3 rounded-xl mb-3"

>

<p className="text-white">

{req.sender}

</p>

<div className="flex gap-2">

<button

onClick={async()=>{

console.log(req);

await axios.post(
"http://localhost:5000/api/friends/accept",
{id:req._id}
);

socket.emit("friend_added",{

sender:req.sender,

receiver:username,

});

// Reload requests

const requests=await axios.get(
`http://localhost:5000/api/friends/requests/${username}`
);

setFriendRequests(requests.data);

// Reload friends

const friends=await axios.get(
`http://localhost:5000/api/friends/${username}`
);

setFriends(friends.data);

}}

className="bg-green-600 px-3 py-1 rounded-lg text-white"

>

Accept

</button>

<button

onClick={async()=>{

await axios.post(
"http://localhost:5000/api/friends/reject",
{id:req._id}
);



const requests=await axios.get(
`http://localhost:5000/api/friends/requests/${username}`
);

setFriendRequests(requests.data);

}}

className="bg-red-600 px-3 py-1 rounded-lg text-white"

>

Reject

</button>

</div>

</div>

))

}

<button

onClick={()=>setShowRequests(false)}

className="mt-3 w-full p-3 bg-slate-700 rounded-xl text-white"

>

Close

</button>

</div>

</div>

)}

      {/* Embedded styles for custom animations + scrollbar */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }

        @keyframes message-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-message-in {
          animation: message-in 0.25s ease-out;
        }

        @keyframes bounce-soft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .animate-bounce-soft {
          animation: bounce-soft 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Chat;
