import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer } from 'http';
import bootstrap from './src/app.js';


const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await bootstrap(app, express);
  server.listen(PORT, () => {
    console.log(`HTTP on http://localhost:${PORT}`);
  });
};
startServer();