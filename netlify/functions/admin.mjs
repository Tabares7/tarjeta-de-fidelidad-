// Panel del estudio: todas las acciones requieren la contraseña (ADMIN_PASSWORD).
import { AJUSTES } from "./_lib/ajustes.mjs";
import { guardarCliente, listarClientes, obtenerCliente } from "./_lib/db.mjs";
import { error, esAdmin, ID_VALIDO, json, leerCuerpo, vistaAdmin } from "./_lib/http.mjs";

const HORA = 60 * 60 * 1000;

function anotar(cliente, tipo) {
  const fecha = new Date().toISOString();
  cliente.historial.push({ tipo, fecha });
  cliente.historial = cliente.historial.slice(-50);
  if (tipo === "sello") cliente.ultimaVisita = fecha;
}

export default async (req) => {
  if (req.method !== "POST") return error("Método no permitido", 405);
  if (!process.env.ADMIN_PASSWORD) return error("Falta configurar ADMIN_PASSWORD en Netlify.", 500);
  if (!esAdmin(req)) return error("Contraseña incorrecta.", 401);

  const cuerpo = (await leerCuerpo(req)) ?? {};
  const { accion } = cuerpo;

  if (accion === "entrar") return json({ ok: true });

  if (accion === "listar") {
    const q = String(cuerpo.q ?? "").trim().toLowerCase();
    const digitos = q.replace(/\D/g, "");
    let clientes = await listarClientes();
    if (q) {
      clientes = clientes.filter(
        (c) => c.nombre.toLowerCase().includes(q) || (digitos.length >= 3 && c.telefono.includes(digitos)),
      );
    }
    clientes.sort((a, b) => (b.ultimaVisita ?? b.creado).localeCompare(a.ultimaVisita ?? a.creado));
    return json({ clientes: clientes.slice(0, 100).map(vistaAdmin), total: clientes.length });
  }

  const id = String(cuerpo.id ?? "");
  if (!ID_VALIDO.test(id)) return error("Ese código no es una tarjeta válida.", 404);
  const cliente = await obtenerCliente(id);
  if (!cliente) return error("No se encontró la tarjeta.", 404);
  const meta = AJUSTES.sellosParaPremio;

  switch (accion) {
    case "ver":
      return json(vistaAdmin(cliente));

    case "sellar": {
      if (cliente.sellos >= meta) {
        return error("Esta tarjeta ya tiene el premio listo. Canjéalo antes de seguir sellando.", 409, "premio");
      }
      const ultimo = cliente.ultimaVisita ? Date.parse(cliente.ultimaVisita) : 0;
      if (!cuerpo.forzar && Date.now() - ultimo < AJUSTES.horasEntreSellos * HORA) {
        return error("Ya recibió un sello hace poco. ¿Sellar de todos modos?", 409, "reciente");
      }
      cliente.sellos += 1;
      anotar(cliente, "sello");
      break;
    }

    case "quitar":
      if (cliente.sellos === 0) return error("La tarjeta no tiene sellos.", 409);
      cliente.sellos -= 1;
      anotar(cliente, "quitado");
      break;

    case "canjear":
      if (cliente.sellos < meta) return error(`Faltan ${meta - cliente.sellos} sellos para el premio.`, 409);
      cliente.sellos -= meta;
      cliente.canjes += 1;
      anotar(cliente, "canje");
      break;

    default:
      return error("Acción desconocida.");
  }

  await guardarCliente(cliente);
  return json(vistaAdmin(cliente));
};

export const config = { path: "/api/admin" };
