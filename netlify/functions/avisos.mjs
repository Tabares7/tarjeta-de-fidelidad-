// El cliente activa o desactiva los avisos de su tarjeta.
import { guardarCliente, obtenerCliente } from "./_lib/db.mjs";
import { error, ID_VALIDO, json, leerCuerpo } from "./_lib/http.mjs";

const MAX_TELEFONOS = 5;

function suscripcionValida(s) {
  try {
    return (
      new URL(s.endpoint).protocol === "https:" &&
      typeof s.keys?.p256dh === "string" &&
      typeof s.keys?.auth === "string" &&
      s.endpoint.length < 1000
    );
  } catch {
    return false;
  }
}

export default async (req) => {
  if (req.method !== "POST") return error("Método no permitido", 405);
  const cuerpo = await leerCuerpo(req);
  const id = String(cuerpo?.id ?? "");
  if (!ID_VALIDO.test(id)) return error("Tarjeta no encontrada.", 404);
  const cliente = await obtenerCliente(id);
  if (!cliente) return error("Tarjeta no encontrada.", 404);

  const s = cuerpo.suscripcion;
  if (!s || !suscripcionValida(s)) return error("Suscripción inválida.");
  const limpia = { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } };

  const otras = (cliente.suscripciones ?? []).filter((x) => x.endpoint !== limpia.endpoint);
  cliente.suscripciones = cuerpo.quitar ? otras : [...otras, limpia].slice(-MAX_TELEFONOS);
  await guardarCliente(cliente);
  return json({ ok: true, activos: cliente.suscripciones.length > 0 });
};

export const config = { path: "/api/avisos" };
