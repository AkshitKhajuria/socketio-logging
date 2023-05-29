const resondToChat = (socket) => {
  socket.on("chat message", (data) => {
    socket.emit("chat message", data);
  });
};

export { resondToChat };
