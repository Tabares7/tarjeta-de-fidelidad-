import { obtenerCliente } from "./_lib/db.mjs";
import { error, ID_VALIDO, json, vistaPublica } from "./_lib/http.mjs";

export default async (req) => {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!ID_VALIDO.test(id)) return error("Tarjeta no encontrada.", 404);
  const cliente = await obtenerCliente(id);
  if (!cliente) return error("Tarjeta no encontrada.", 404);
  return json(vistaPublica(cliente));
};

export const config = { path: "/api/tarjeta" };
