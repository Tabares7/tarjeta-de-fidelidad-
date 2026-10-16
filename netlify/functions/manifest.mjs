// Manifest de cada tarjeta, servido en /t/<id>/manifest.webmanifest.
// La página de la tarjeta lo enlaza con una ruta relativa, así el navegador siempre
// recibe el start_url correcto desde el HTML (sin depender de JavaScript), y el ícono
// de la pantalla de inicio abre la tarjeta de ese cliente.
import { AJUSTES } from "./_lib/ajustes.mjs";
import { ID_VALIDO } from "./_lib/http.mjs";

export default async (req, context) => {
  const id = context?.params?.id ?? new URL(req.url).pathname.split("/")[2] ?? "";
  const inicio = ID_VALIDO.test(id) ? `/t/${id}/` : "/";
  const manifest = {
    id: inicio,
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

export const config = { path: "/t/:id/manifest.webmanifest" };
