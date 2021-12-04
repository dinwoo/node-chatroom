const utf8 = require("utf8");
var express = require("express"),
  app = express(),
  server = require("http").createServer(app),
  io = require("socket.io").listen(server),
  nicknames = [];

server.listen(process.env.PORT || 3000);

// io.sockets.on("connection", function (socket) {
//   socket.on("ChatMessage", (data) => {
//     console.log(`${data.lineId}:${data.message}`);
//     socket.emit("ChatMessage", data);
//     //save DB
//   });
//   socket.on("logout", (data) => {
//     console.log(data);
//     socket.emit("logout", data);
//     //save DB
//   });
// });
app.get("/", function (req, res) {
  res.sendfile(__dirname + "/index.html");
});
app.use("/public", express.static(__dirname + "/public"));

io.sockets.on("connection", function (socket) {
  console.log(socket.id);
  socket.on("new user", function (data) {
    console.log(data);
    if (nicknames.indexOf(data) != -1) {
    } else {
      socket.emit("chat", "SERVER", "歡迎光臨 " + data);

      socket.nickname = data;
      nicknames.push(socket.nickname);
      io.sockets.emit("usernames", nicknames);
      updateNicknames();
    }
  });

  function updateNicknames() {
    io.sockets.emit("usernames", nicknames);
  }

  //
  socket.on("send message", function (data) {
    io.sockets.emit("new message", { msg: data, nick: socket.nickname });
  });

  socket.on("disconnect", function (data) {
    if (!socket.nickname) return;
    io.sockets.emit("chat", "SERVER", socket.nickname + " 離開了聊天室～");
    nicknames.splice(nicknames.indexOf(socket.nickname), 1);
    updateNicknames();
  });
});
