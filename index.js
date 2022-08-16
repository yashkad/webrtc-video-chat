const { v4 } = require("uuid");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("/" + v4());
});

app.get("/:room", (req, res) => {
  res.render("room", {
    roomId: req.params.room,
  });
});

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    console.log("user joined ", data.userId);

    socket.join(data.roomId);
    socket.broadcast.to(data.roomId).emit("user-connected", data.userId);

    socket.on("disconnect", () => {
      socket.broadcast.to(data.roomId).emit("user-disconnected", data.userId);
    });
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log("App is running");
});
