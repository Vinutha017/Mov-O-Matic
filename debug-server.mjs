import 'dotenv/config';
import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";

const app = express();
const server = createServer(app);
const port = parseInt(process.env.PORT || '5000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log('Starting server setup...');

try {
  await registerRoutes(app);
  console.log('Routes registered successfully');
  
  server.listen(port, () => {
    console.log(`✅ Server successfully bound to port ${port}`);
    console.log(`🌐 Server accessible at http://localhost:${port}`);
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });
  
} catch (error) {
  console.error('❌ Failed to setup server:', error);
  process.exit(1);
}