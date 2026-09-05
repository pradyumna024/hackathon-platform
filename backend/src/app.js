import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Hackathon API is running' });
});

import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);

export { app };