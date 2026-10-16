// Manifest dinámico: al "añadir a pantalla de inicio", el ícono abre la tarjeta de ESE cliente.
import { AJUSTES } from "./_lib/ajustes.mjs";
import { ID_VALIDO } from "./_lib/http.mjs";

export default async (req) => {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const inicio = ID_VALIDO.test(id) ? `/tarjeta/?id=${id}` : "/";
  const manifest = {
    name: `${AJUSTES.estudio} · Tarjeta`,
    short_name: AJUSTES.estudio,
    start_url: inicio,
    scope: "/",
    display: "standalone",
    background_color: AJUSTES.colores.fondo,
    theme_color: AJUSTES.colores.fondo,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "content-type": "application/manifest+json", "cache-control": "no-store" },
  });
};

export const config = { path: "/api/manifest" };
