// Funciones compartidas por las páginas.

export async function cargarAjustes() {
  const r = await fetch("/api/ajustes");
  const a = await r.json();
  for (const [k, v] of Object.entries(a.colores)) document.documentElement.style.setProperty(`--${k}`, v);
  document.querySelectorAll("[data-estudio]").forEach((el) => (el.textContent = a.estudio));
  document.querySelectorAll("[data-lema]").forEach((el) => (el.textContent = a.lema));
  document.querySelectorAll("[data-premio]").forEach((el) => (el.textContent = a.premio));
  document.querySelectorAll("[data-meta]").forEach((el) => (el.textContent = a.sellosParaPremio));
  document.querySelectorAll("[data-regla]").forEach((el) => (el.textContent = a.reglaSello));
  document.title = document.title.replace("{estudio}", a.estudio);
  return a;
}

export async function api(url, { metodo = "GET", datos, clave } = {}) {
  const headers = {};
  if (datos) headers["content-type"] = "application/json";
  if (clave) headers["x-admin-key"] = clave;
  const r = await fetch(url, { method: metodo, headers, body: datos ? JSON.stringify(datos) : undefined });
  let cuerpo = {};
  try { cuerpo = await r.json(); } catch {}
  if (!r.ok) {
    const e = new Error(cuerpo.error || "Algo salió mal. Intenta de nuevo.");
    e.status = r.status;
    e.codigo = cuerpo.codigo;
    throw e;
  }
  return cuerpo;
}

// localStorage puede fallar (modo privado); nunca debe romper la página.
export const local = {
  leer(k) { try { return localStorage.getItem(k); } catch { return null; } },
  guardar(k, v) { try { localStorage.setItem(k, v); } catch {} },
  borrar(k) { try { localStorage.removeItem(k); } catch {} },
};

const ESTRELLA =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.5l2.6 7.1 7.4.4-5.8 4.7 2 7.3L12 16.8 5.8 21l2-7.3L2 9l7.4-.4z"/></svg>';

export function pintarSellos(contenedor, sellos, total, nuevo = false) {
  contenedor.innerHTML = "";
  contenedor.style.gridTemplateColumns = `repeat(${Math.min(total, 5)}, 1fr)`;
  for (let i = 0; i < total; i++) {
    const s = document.createElement("div");
    s.className = "sello";
    if (i < sellos) {
      s.classList.add("lleno");
      if (nuevo && i === sellos - 1) s.classList.add("nuevo");
      s.innerHTML = ESTRELLA;
    } else {
      s.textContent = i + 1;
    }
    contenedor.append(s);
  }
}

export function pintarQR(contenedor, texto) {
  const q = window.qrcode(0, "M");
  q.addData(texto);
  q.make();
  contenedor.innerHTML = q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
}
