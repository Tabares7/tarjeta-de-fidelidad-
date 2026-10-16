// Servidor local para probar sin Netlify: guarda los datos en memoria.
// Uso: npm run dev  →  http://localhost:8888  (contraseña del panel: demo)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

process.env.ALMACEN ??= "memoria";
process.env.ADMIN_PASSWORD ??= "demo";

const RAIZ = new URL("../public/", import.meta.url).pathname;
const FUNCIONES = ["ajustes", "registro", "tarjeta", "manifest", "admin"];
const rutas = {};
for (const f of FUNCIONES) {
  const m = await import(`../netlify/functions/${f}.mjs`);
  rutas[m.config.path] = m.default;
}
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const fn = rutas[url.pathname];
  if (fn) {
    const body = ["GET", "HEAD"].includes(req.method) ? undefined : await new Promise((ok) => { let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => ok(d)); });
    const r = await fn(new Request(url, { method: req.method, headers: req.headers, body }));
    res.writeHead(r.status, Object.fromEntries(r.headers));
    return res.end(await r.text());
  }
  let ruta = normalize(join(RAIZ, decodeURIComponent(url.pathname)));
  if (!ruta.startsWith(RAIZ)) return res.writeHead(403).end();
  try {
    if ((await stat(ruta)).isDirectory()) ruta = join(ruta, "index.html");
    res.writeHead(200, { "content-type": TIPOS[extname(ruta)] ?? "application/octet-stream" });
    res.end(await readFile(ruta));
  } catch {
    res.writeHead(404).end("No encontrado");
  }
}).listen(8888, () => console.log("Listo en http://localhost:8888  ·  panel: /admin/  ·  contraseña: demo"));
