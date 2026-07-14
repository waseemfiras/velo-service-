import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiApp from "./server/app";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use the extracted API router
  app.use("/api", apiApp);

  // Serve Firebase config
  app.get("/firebase-applet-config.json", (req, res, next) => {
    if ('import' in req.query) {
      return next();
    }
    res.sendFile(path.join(process.cwd(), "firebase-applet-config.json"));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
