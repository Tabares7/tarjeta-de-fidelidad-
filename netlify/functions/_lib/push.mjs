// Envío de notificaciones (Web Push). Las claves VAPID viven en variables de entorno de Netlify:
// VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY y, opcional, VAPID_SUBJECT (https://… o mailto:…).
import webpush from "web-push";
import { AJUSTES } from "./ajustes.mjs";

let configurado = false;

export const pushDisponible = () => Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

function configurar() {
  if (configurado) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "https://tarjeta-fidelidad-tabares.netlify.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
  configurado = true;
}

// Envía a todos los teléfonos del cliente. Quita las suscripciones caducadas (el cliente
// borró la app o desactivó avisos). Devuelve si hay que guardar el cliente.
export async function notificar(cliente, { titulo, cuerpo }) {
  const subs = cliente.suscripciones ?? [];
  if (!subs.length || !pushDisponible()) return { enviados: 0, fallidos: 0, cambio: false };
  configurar();
  const payload = JSON.stringify({ titulo, cuerpo, url: `/t/${cliente.id}/` });
  const vivas = [];
  let enviados = 0;
  let fallidos = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(s, payload, { TTL: 60 * 60 * 24 * 3 });
        enviados++;
        vivas.push(s);
      } catch (e) {
        fallidos++;
        if (e.statusCode !== 404 && e.statusCode !== 410) vivas.push(s);
      }
    }),
  );
  const cambio = vivas.length !== subs.length;
  cliente.suscripciones = vivas;
  return { enviados, fallidos, cambio };
}

// Texto automático tras sellar.
export function mensajeSello(cliente) {
  const s = cliente.sellos;
  const desbloqueado = AJUSTES.premios.find((p) => p.en === s);
  if (desbloqueado) {
    return { titulo: "¡Premio desbloqueado! 🎉", cuerpo: `${desbloqueado.premio}. Pídelo en tu próxima visita.` };
  }
  const siguiente = AJUSTES.premios.find((p) => p.en > s);
  const falta = siguiente ? siguiente.en - s : 0;
  return {
    titulo: "¡Nuevo sello!",
    cuerpo: siguiente
      ? `Llevas ${s} de ${AJUSTES.sellosTotales}. ${falta === 1 ? "Te falta 1" : `Te faltan ${falta}`} para: ${siguiente.premio.toLowerCase()}.`
      : `Llevas ${s} de ${AJUSTES.sellosTotales}.`,
  };
}
