import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".csv": "text/csv; charset=utf-8", ".png": "image/png", ".gif": "image/gif", ".mp4": "video/mp4", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8" };
http.createServer((request, response) => {
  if (request.method !== "GET") { response.writeHead(405); response.end(); return; }
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const candidate = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
  if (!candidate.startsWith(root + path.sep) || !fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) { response.writeHead(404); response.end("Not found"); return; }
  response.writeHead(200, { "Content-Type": types[path.extname(candidate)] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  fs.createReadStream(candidate).pipe(response);
}).listen(4174, "127.0.0.1", () => console.log("DEMO_READY http://127.0.0.1:4174"));
