import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

app.use(cors()); 
app.use(express.json()); 
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Hackathon API is running' });
});

import userRouter from "./routes/user.routes.js";
import hackathonRouter from "./routes/hackathon.routes.js"
import teamRouter from "./routes/team.routes.js"
import projectRouter from "./routes/project.routes.js"

app.use("/api/v1/users", userRouter);
app.use("/api/v1/hackathon", hackathonRouter);
app.use("/api/v1/team", teamRouter);
app.use("./api/v1/project", projectRouter);

export { app };