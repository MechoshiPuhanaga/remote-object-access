const express = require("express");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const { createProvider, transformer } = require("./lib/remote-object-api");
const remoteObject = require("./remote-object-context");

app.use(express.static(__dirname));

app.get("/", (_, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  let provider = createProvider({ channel: socket, transformer });
  provider("remoteObject", remoteObject);

  socket.on("disconnect", () => {
    provider = null;
  });
});

http.listen(3000, () => {
  console.log("node listening on port 3000");
});
