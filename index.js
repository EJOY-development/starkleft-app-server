const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const cors = require("cors");
const SocketIo = require("socket.io");
const db = require("./database");
const jwt = require("./jwt");
const TwoWayMap = require("./TwoWayMap");

app.use(cors());
app.all("/*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

const PORT = parseInt(process.env.SERVER_PORT);
const server = app.listen(PORT, async () => {
  console.info(`server opened at: http://localhost:${PORT}`);
});

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("success");
});

app.post("/verify-token", async (req, res) => {});

// setup socket
const io = SocketIo(server, {
  cors: {
    origin: "*",
  },
});

// socketId, uid
const onlineUsers = new TwoWayMap();
const userInfoMap = {};

io.on("connection", (socket) => {
  console.log(`Client ${socket.id} connected`);

  const isAuthorized = () => onlineUsers.has(socket.id);

  socket.on("t-ping", (data) => {
    socket.emit("t-pong", data);
  });

  socket.on("online-users", () => {
    if (!isAuthorized()) {
      console.log("not authorized");
      return;
    }
    socket.emit("online-users", userInfoMap);
  });

  socket.on("verify-token", async (data) => {
    try {
      const { accessToken, refreshToken } = data;
      const userInfo = await jwt.verify(accessToken);
      console.log(userInfo);
      const { uid } = userInfo;
      const result = await db.get(`SELECT * FROM users WHERE id = ?`, [uid]);
      if (result == null) throw new Error("user not found");
      onlineUsers.set(socket.id, result.id);
      userInfoMap[result.id] = {
        id: result.id,
        uid: result.uid,
        nickname: result.nickname,
      };

      socket.emit("verify-token", true);
      io.emit("join", userInfoMap[result.id]);
    } catch (e) {
      console.error(e);
      socket.emit("verify-token", false);
    }
  });

  socket.on("signin", async (data) => {
    try {
      const { id, credential } = data;
      const result = await db.get(
        `SELECT * FROM users WHERE uid = ? AND credential = ?`,
        [id, credential]
      );
      if (result == null) throw new Error("user not found");
      // create jwt
      const token = jwt.generate({ uid: result.id });
      socket.emit("signin", true, {
        uid: result.id,
        nickname: result.nickname,
        ...token,
      });

      onlineUsers.set(socket.id, result.id);
      userInfoMap[result.id] = {
        id: result.id,
        uid: result.uid,
        nickname: result.nickname,
      };
      io.emit("join", userInfoMap[result.id]);
    } catch (e) {
      console.error(e);
      socket.emit("signin", false);
    }
  });

  socket.on("signup", async (data) => {
    try {
      const { id, credential, nickname } = data;
      await db.run(
        `INSERT INTO users(uid, credential, nickname) VALUES(?, ?, ?)`,
        [id, credential, nickname]
      );
      socket.emit("signup", true);
    } catch (e) {
      console.error(e);
      socket.emit("signup", false);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected`);
    if (onlineUsers.has(socket.id)) {
      const userId = onlineUsers.get(socket.id);
      delete userInfoMap[userId];
      onlineUsers.delete(socket.id);
      io.emit("leave", userId);
    }
  });
});
