import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Middleware per iniettare HOST_ID
app.use((req, res, next) => {
  if (req.path === "/" || req.path.endsWith(".html")) {
    const indexPath = path.join(__dirname, "dist", "index.html");
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, "utf8");
      const hostId = process.env.HOST_ID || "192.168.1.61";
      html = html.replace("</head>", `<script>window.__HOST_ID__ = "${hostId}";</script></head>`);
      res.setHeader("Content-Type", "text/html");
      return res.send(html);
    }
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, "dist")));

// Serve uploaded images (must be before the SPA fallback)
app.use('/uploads', express.static('/app/uploads'));

// SPA fallback
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "dist", "index.html");
  let html = fs.readFileSync(indexPath, "utf8");
  const hostId = process.env.HOST_ID || "192.168.1.61";
  html = html.replace("</head>", `<script>window.__HOST_ID__ = "${hostId}";</script></head>`);
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

const port = process.env.PORT || 8443;
const certPath = process.env.SSL_CERT_PATH || "/app/cert/cert.pem";
const keyPath = process.env.SSL_KEY_PATH || "/app/cert/key.pem";

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

https.createServer(httpsOptions, app).listen(port, "0.0.0.0", () => {
  console.log(`Frontend HTTPS server running on port ${port}`);
  console.log(`HOST_ID injected: ${process.env.HOST_ID || "192.168.1.61"}`);
});
