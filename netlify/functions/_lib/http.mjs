import { createHash, timingSafeEqual } from "node:crypto";
import { AJUSTES } from "./ajustes.mjs";

export const ID_VALIDO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function json(datos, status = 200) {
  return new Response(JSON.stringify(datos), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export const error = (mensaje, status = 400, codigo) => json({ error: mensaje, codigo }, status);

export async function leerCuerpo(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

// Compara la contraseña del panel con la variable ADMIN_PASSWORD de Netlify.
export function esAdmin(req) {
  const clave = process.env.ADMIN_PASSWORD;
  if (!clave) return false;
  const dada = req.headers.get("x-admin-key") ?? "";
  const h = (s) => createHash("sha256").update(s).digest();
  return timingSafeEqual(h(dada), h(clave));
}

// Lo que ve el cliente en su tarjeta (sin teléfono ni historial).
export function vistaPublica(c) {
  return {
    nombre: c.nombre,
    sellos: c.sellos,
    requeridos: AJUSTES.sellosParaPremio,
    premio: AJUSTES.premio,
    canjes: c.canjes,
    listo: c.sellos >= AJUSTES.sellosParaPremio,
  };
}

// Lo que ve el estudio en el panel.
export function vistaAdmin(c) {
  return {
    ...vistaPublica(c),
    id: c.id,
    telefono: c.telefono,
    creado: c.creado,
    ultimaVisita: c.ultimaVisita,
    historial: c.historial.slice(-10).reverse(),
  };
}
