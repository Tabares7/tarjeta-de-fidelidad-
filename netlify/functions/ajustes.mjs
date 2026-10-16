import { AJUSTES } from "./_lib/ajustes.mjs";
import { json } from "./_lib/http.mjs";

// vapidPublica: clave pública para que el teléfono pueda suscribirse a los avisos.
export default async () => json({ ...AJUSTES, vapidPublica: process.env.VAPID_PUBLIC_KEY ?? null });

export const config = { path: "/api/ajustes" };
