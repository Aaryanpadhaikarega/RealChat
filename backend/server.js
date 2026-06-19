const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const { Server } = require("socket.io");

const Message = require("./models/Message");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const friendRoutes = require("./routes/friendRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", messageRoutes);
app.use("/api/friends", friendRoutes);

const uploadRoutes =
require("./routes/uploadRoutes");

app.use(
  "/api/upload",
  uploadRoutes
);

const server = http.createServer(app);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/*
=========================
ONLINE USERS
=========================
*/

const onlineUsers = {};

/*
=========================
HOME ROUTE
=========================
*/

app.get("/", (req, res) => {
  res.send("ChatSphere Backend Running");
});

/*
=========================
SOCKET.IO
=========================
*/

io.on("connection", (socket) => {

  console.log("User Connected:", socket.id);

  /*
  =========================
  USER JOINS
  =========================
  */

  socket.on("join", (username) => {

    onlineUsers[username] = socket.id;

    io.emit(
      "online_users",
      Object.keys(onlineUsers)
    );

  });

  /*
  =========================
  TYPING
  =========================
  */

  socket.on("typing", (data) => {

    io.emit("user_typing", data);

  });

  /*
  =========================
  SEND MESSAGE
  =========================
  */

  socket.on("send_message", async (data) => {

  try {

    const newMessage = await Message.create({

  sender: data.sender,

  receiver: data.receiver,

  text: data.text || "",

  image: data.image || "",

});

    // Sender socket
    const senderSocket =
      onlineUsers[data.sender];

    // Receiver socket
    const receiverSocket =
      onlineUsers[data.receiver];

    // Send back to sender
    if (senderSocket) {

      io.to(senderSocket).emit(
        "receive_message",
        newMessage
      );

    }

    // Send to receiver
    if (
      receiverSocket &&
      receiverSocket !== senderSocket
    ) {

      io.to(receiverSocket).emit(
        "receive_message",
        newMessage
      );

    }

  }

  catch (error) {

    console.log(error);

  }

});

/*
=========================
DELETE MESSAGE
=========================
*/

socket.on("delete_message", async (id) => {

  try {

    const updatedMessage =
      await Message.findByIdAndUpdate(

        id,

        {

          deleted: true,

          text: "",

          image: "",

        },

        {

          new: true,

        }

      );

    io.emit(

      "message_deleted",

      updatedMessage

    );

  }

  catch (err) {

    console.log(err);

  }

});
socket.on("edit_message", async (data) => {

  try {

    const updated = await Message.findByIdAndUpdate(

  data.id,

  {
    text: data.text,
  },

  {
    returnDocument: "after",
  }

);
console.log(updated);

    const senderSocket =
      onlineUsers[updated.sender];

    const receiverSocket =
      onlineUsers[updated.receiver];

    if (senderSocket) {

      io.to(senderSocket).emit(
        "message_edited",
        updated
      );

    }

    if (
      receiverSocket &&
      receiverSocket !== senderSocket
    ) {

      io.to(receiverSocket).emit(
        "message_edited",
        updated
      );

    }

  }

  catch (err) {

    console.log(err);

  }

});

  /*
  =========================
  STOP TYPING
  =========================
  */

  socket.on("stop_typing", () => {

    io.emit("stop_typing");

  });

  /*
  =========================
  DISCONNECT
  =========================
  */

  socket.on("disconnect", () => {

    console.log("User Disconnected");

    for (const user in onlineUsers) {

      if (onlineUsers[user] === socket.id) {

        delete onlineUsers[user];

      }

    }

    io.emit(
      "online_users",
      Object.keys(onlineUsers)
    );

  });

  socket.on("friend_added",(data)=>{

const senderSocket=onlineUsers[data.sender];

const receiverSocket=onlineUsers[data.receiver];

if(senderSocket){

io.to(senderSocket).emit("refresh_friends");

}

if(receiverSocket){

io.to(receiverSocket).emit("refresh_friends");

}

});

});

/*
=========================
START SERVER
=========================
*/

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});