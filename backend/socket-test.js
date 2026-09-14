import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

socket.on("connect", () => {
    console.log("Connected:", socket.id);

    socket.emit(
        "joinHackathon",
        "6aa83bcebf4781f3a782039c"
    );
});

socket.on("leaderboardUpdated", (data)=>{
    console.log("Leaderboard Updated:", data);
})

socket.on("disconnect", () => {
    console.log("Disconnected");
});
