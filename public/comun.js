// Funciones compartidas por las páginas.

export async function cargarAjustes() {
  const r = await fetch("/api/ajustes");
  const a = await r.json();
  for (const [k, v] of Object.entries(a.colores)) document.documentElement.style.setProperty(`--${k}`, v);
  document.querySelectorAll("[data-estudio]").forEach((el) => (el.textContent = a.estudio));
  document.querySelectorAll("[data-lema]").forEach((el) => (el.textContent = a.lema));
  document.querySelectorAll("[data-total]").forEach((el) => (el.textContent = a.sellosTotales));
  document.querySelectorAll("[data-resumen]").forEach((el) => (el.textContent = resumenPremios(a.premios)));
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

// "20% de descuento… a los 4 sellos y una sesión gratis a los 8."
export function resumenPremios(premios) {
  const partes = premios.map((p, i) => `${i === 0 ? p.premio : p.premio.charAt(0).toLowerCase() + p.premio.slice(1)} a los ${p.en} sellos`);
  return partes.length > 1 ? partes.slice(0, -1).join(", ") + " y " + partes.at(-1) + "." : partes[0] + ".";
}

export function pintarSellos(contenedor, sellos, total, nuevo = false, hitos = []) {
  contenedor.innerHTML = "";
  const columnas = total > 5 ? Math.ceil(total / 2) : total;
  contenedor.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
  for (let i = 0; i < total; i++) {
    const s = document.createElement("div");
    s.className = "sello";
    if (hitos.includes(i + 1)) s.classList.add("hito");
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

// Lista de premios con su estado: disponible, usado o pendiente.
export function pintarPremios(contenedor, premios, sellos) {
  contenedor.innerHTML = "";
  for (const p of premios) {
    const fila = document.createElement("div");
    fila.className = `premio ${p.estado}`;
    const titulo = document.createElement("b");
    titulo.textContent = p.premio;
    const estado = document.createElement("span");
    const faltan = p.en - sellos;
    estado.textContent =
      p.estado === "disponible" ? "¡Listo! Pídelo en tu próxima visita"
      : p.estado === "usado" ? "Usado"
      : `Al sello ${p.en} · ${faltan === 1 ? "te falta 1" : `te faltan ${faltan}`}`;
    fila.append(titulo, estado);
    contenedor.append(fila);
  }
}
