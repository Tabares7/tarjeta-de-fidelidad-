import { guardarCliente, idPorTelefono, obtenerCliente, registrarTelefono } from "./_lib/db.mjs";
import { error, json, leerCuerpo } from "./_lib/http.mjs";

export default async (req) => {
  if (req.method !== "POST") return error("Método no permitido", 405);
  const cuerpo = await leerCuerpo(req);
  if (!cuerpo) return error("Datos inválidos.");

  const nombre = String(cuerpo.nombre ?? "").trim().replace(/\s+/g, " ");
  const telefono = String(cuerpo.telefono ?? "").replace(/\D/g, "");
  if (nombre.length < 2 || nombre.length > 60) return error("Escribe tu nombre.");
  if (telefono.length < 7 || telefono.length > 15) return error("Revisa el número de teléfono.");

  // Si el teléfono ya tiene tarjeta, devolvemos la misma (así nadie tiene dos).
  const existente = await idPorTelefono(telefono);
  if (existente && (await obtenerCliente(existente))) return json({ id: existente, existente: true });

  const cliente = {
    id: crypto.randomUUID(),
    nombre,
    telefono,
    sellos: 0,
    canjes: 0,
    historial: [],
    creado: new Date().toISOString(),
    ultimaVisita: null,
  };
  await guardarCliente(cliente);
  await registrarTelefono(telefono, cliente.id);
  return json({ id: cliente.id, existente: false }, 201);
};

export const config = { path: "/api/registro" };
