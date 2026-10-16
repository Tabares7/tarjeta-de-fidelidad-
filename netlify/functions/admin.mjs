// Panel del estudio: todas las acciones requieren la contraseña (ADMIN_PASSWORD).
import { AJUSTES } from "./_lib/ajustes.mjs";
import { guardarCliente, listarClientes, obtenerCliente } from "./_lib/db.mjs";
import { error, esAdmin, ID_VALIDO, json, leerCuerpo, vistaAdmin } from "./_lib/http.mjs";

const HORA = 60 * 60 * 1000;

function anotar(cliente, tipo, detalle) {
  const fecha = new Date().toISOString();
  cliente.historial.push(detalle ? { tipo, fecha, detalle } : { tipo, fecha });
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
  const total = AJUSTES.sellosTotales;
  cliente.canjeados ??= [];

  switch (accion) {
    case "ver":
      return json(vistaAdmin(cliente));

    case "sellar": {
      if (cliente.sellos >= total) {
        return error("La tarjeta está completa. Canjea el premio final para empezar una nueva.", 409, "completa");
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

    case "canjear": {
      const premio = AJUSTES.premios.find((p) => p.en === Number(cuerpo.en));
      if (!premio) return error("Ese premio no existe.");
      if (cliente.canjeados.includes(premio.en)) return error("Ese premio ya se usó en esta tarjeta.", 409);
      if (cliente.sellos < premio.en) return error(`Faltan ${premio.en - cliente.sellos} sellos para ese premio.`, 409);
      cliente.canjes += 1;
      anotar(cliente, "canje", premio.premio);
      if (premio.en >= total) {
        // Premio final: la tarjeta vuelve a empezar.
        cliente.sellos = 0;
        cliente.canjeados = [];
      } else {
        cliente.canjeados.push(premio.en);
      }
      break;
    }

    default:
      return error("Acción desconocida.");
  }

  await guardarCliente(cliente);
  return json(vistaAdmin(cliente));
};

export const config = { path: "/api/admin" };
