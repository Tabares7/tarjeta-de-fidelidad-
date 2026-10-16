// Almacenamiento de clientes en Netlify Blobs (incluido en Netlify, sin cuentas extra).
// Para pruebas locales: ALMACEN=memoria guarda todo en memoria mientras corre el servidor.

const usarMemoria = process.env.ALMACEN === "memoria";
const memoria = (globalThis.__tarjetaMemoria ??= { clientes: new Map(), telefonos: new Map() });

let tiendas;
async function abrir() {
  if (usarMemoria) return null;
  if (!tiendas) {
    const { getStore } = await import("@netlify/blobs");
    tiendas = {
      clientes: getStore({ name: "clientes", consistency: "strong" }),
      telefonos: getStore({ name: "telefonos", consistency: "strong" }),
    };
  }
  return tiendas;
}

export async function obtenerCliente(id) {
  const t = await abrir();
  if (!t) return memoria.clientes.has(id) ? structuredClone(memoria.clientes.get(id)) : null;
  return await t.clientes.get(id, { type: "json" });
}

export async function guardarCliente(cliente) {
  const t = await abrir();
  if (!t) return void memoria.clientes.set(cliente.id, structuredClone(cliente));
  await t.clientes.setJSON(cliente.id, cliente);
}

export async function idPorTelefono(telefono) {
  const t = await abrir();
  if (!t) return memoria.telefonos.get(telefono) ?? null;
  return await t.telefonos.get(telefono);
}

export async function registrarTelefono(telefono, id) {
  const t = await abrir();
  if (!t) return void memoria.telefonos.set(telefono, id);
  await t.telefonos.set(telefono, id);
}

export async function listarClientes() {
  const t = await abrir();
  if (!t) return [...memoria.clientes.values()].map((c) => structuredClone(c));
  const { blobs } = await t.clientes.list();
  const todos = await Promise.all(blobs.map((b) => t.clientes.get(b.key, { type: "json" })));
  return todos.filter(Boolean);
}
