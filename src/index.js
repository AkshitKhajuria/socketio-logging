import { createServer } from "http";
import { Server } from "socket.io";
import logger from "./logger.js";
import wildcard from "socketio-wildcard";
import { homePageRequestHandler } from "./controller/home.js";
import { resondToChat } from "./controller/chat.js";

const PORT = process.env.PORT || 3000;
const httpServer = createServer(homePageRequestHandler);
const io = new Server(httpServer, {
  transports: ["websocket"],
  cors: {
    origin: "*",
  },
});

io.use(wildcard());
io.on("connection", (socket) => {
  logger.info(`A client with socket id ${socket.id} connected!`);
  // Log ALL incoming socket events
  socket.on("*", (packet) => {
    const [eventName, eventData] = packet.data;
    logger.info({
      eventName,
      eventData,
      socketId: socket.id,
    });
  });

  // The original socket emitter
  let _emit = socket.emit;

  // decorate emit function
  // Log ALL outgoing socket events
  socket.emit = function () {
    _emit.apply(socket, arguments);
    let { 0: eventName, 1: eventData } = arguments;
    logger.info({
      eventName: `[Emit] ${eventName}`,
      eventData,
      socketId: socket.id,
    });
  };

  socket.on("disconnect", (socket) => {
    logger.info("Socket disconnected!");
  });
  resondToChat(socket);
});

httpServer.listen(PORT);
logger.info(`Server running at http://127.0.0.1:${PORT}/`);
