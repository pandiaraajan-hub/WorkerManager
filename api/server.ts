import express from "express";
import { registerRoutes } from "../server/routes";

let app: express.Express | null = null;

async function getApp() {
  if (!app) {
    app = express();
    
    // Middleware
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: false, limit: '50mb' }));
    
    // CORS for production
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      next();
    });
    
    // Error handling middleware
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('API Error:', err);
      res.status(500).json({ 
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
    
    // Initialize routes
    try {
      await registerRoutes(app);
    } catch (error) {
      console.error('Failed to register routes:', error);
    }
    
    // Catch-all for unmatched routes
    app.use('*', (req, res) => {
      res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
    });
  }
  
  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const expressApp = await getApp();
    return expressApp(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ message: "Server initialization error" });
  }
}
