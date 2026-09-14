import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";

dotenv.config({ path: './.env' });

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
  }
})

app.set("io", io);

io.on("connection", (socket)=>{
  console.log("Socket connected:", socket.id);

  socket.on("joinHackathon", (hackathonId) => {
    const roomName = `hackathon:${hackathonId}`;

        socket.join(roomName);

        console.log(
            `Socket ${socket.id} joined ${roomName}`
        );
    });

  socket.on("disconnect", ()=>{
    console.log("Socket disconnected", socket.id);
  })
})

connectDB()
  .then(() => {
    httpServer.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port: ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed !!!", err);
  });