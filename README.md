# Tarjeta de fidelidad · Versión 1

Tarjeta de sellos digital para el estudio. El cliente se registra con un QR, guarda su tarjeta en la pantalla de inicio del teléfono y tú la sellas desde un panel privado con la cámara.

## Páginas

| Dirección | Para quién | Qué hace |
|---|---|---|
| `/` | Clientes | Registro con nombre y teléfono |
| `/t/<código>/` | Clientes | Su tarjeta: sellos, premios y su QR. Es la dirección que abre el ícono de la pantalla de inicio |
| `/admin/` | Tú | Escanear tarjetas, sellar, canjear premios, lista de clientes y QR de registro para imprimir |

## Cambiar nombre, premios, número de sellos y colores

Todo está en un solo archivo: **`netlify/functions/_lib/ajustes.mjs`**. Cambias los valores, subes el archivo a GitHub y Netlify publica la nueva versión sola en uno o dos minutos.

Para el ícono de la pantalla de inicio, reemplaza `public/icons/icon-192.png` e `icon-512.png` por tu logo (cuadrado, con esos mismos tamaños en píxeles).

## Publicarla (una sola vez, ~15 minutos)

1. **GitHub.** Crea una cuenta en github.com y un repositorio nuevo (privado está bien), por ejemplo `tarjeta-fidelidad`. En el repositorio, toca «uploading an existing file» y arrastra **todo el contenido** de esta carpeta (menos `node_modules`, si existe).
2. **Netlify.** Entra en app.netlify.com con tu cuenta de GitHub → *Add new project* → *Import an existing project* → GitHub → elige el repositorio. No cambies nada en la configuración de build y toca *Deploy*.
3. **Contraseña del panel.** En Netlify: *Project configuration* → *Environment variables* → *Add a variable*. Nombre: `ADMIN_PASSWORD`. Valor: una contraseña larga que solo sepas tú. Después ve a *Deploys* → *Trigger deploy* para que la tome.
4. **Listo.** Netlify te da una dirección tipo `algo.netlify.app` (puedes cambiar el nombre en *Domain management*, o conectar tu propio dominio más adelante).
   - Entra en `/admin/` desde tu teléfono, pon la contraseña y abre la pestaña **QR registro**. Imprime ese QR para el estudio.

Los datos de los clientes se guardan en Netlify Blobs, que viene incluido en Netlify. No hace falta crear otra cuenta.

## Uso diario

- **Cliente nuevo:** escanea el QR del estudio, pone su nombre y teléfono y le aparece su tarjeta. Si se registra dos veces con el mismo teléfono, recupera la misma tarjeta.
- **Sellar:** en `/admin/` → *Abrir cámara* → apuntas al QR de su tarjeta → *Sellar visita*. Si la cámara falla, búscalo en *Clientes*.
- **Error al sellar:** *Quitar sello*. Si intentas sellar dos veces en menos de 12 horas, el panel te pide confirmación.
- **Premios:** la tarjeta tiene 8 sellos. Al sello 4 se desbloquea un 20% de descuento y al sello 8 una sesión gratis. Cuando hay un premio disponible, en el panel aparece su botón *Canjear*. El 20% se puede usar una vez por tarjeta; al canjear la sesión gratis, la tarjeta vuelve a cero.

## Avisos (notificaciones)

- El cliente los activa desde su tarjeta con el botón **Activar avisos**. En iPhone solo funciona si abrió la tarjeta desde el ícono de la pantalla de inicio.
- **Automáticos:** al sellar, el cliente recibe «¡Nuevo sello!» con cuánto le falta, o «¡Premio desbloqueado!» al llegar a un premio.
- **Manuales:** en el panel, pestaña **Avisos**, escribes un mensaje y lo envías a todos los clientes con avisos activados o a uno en concreto (ábrelo primero en *Clientes*).
- Necesitan las variables `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` en Netlify (ya configuradas). No las cambies: si cambian, todos los clientes tendrían que volver a activar los avisos.

## Probarla en tu computadora (opcional)

Necesitas Node.js 20 o más nuevo.

```
npm install
npm run dev
```

Abre http://localhost:8888. El panel está en `/admin/` con la contraseña `demo`. En este modo los datos se borran al cerrar el servidor.

## Estructura

```
netlify/functions/        Servidor (corre en Netlify)
  _lib/ajustes.mjs        ← valores editables
  _lib/db.mjs             Guardado de clientes
  registro.mjs            Crear tarjeta
  tarjeta.mjs             Ver tarjeta
  admin.mjs               Acciones del panel (con contraseña)
  manifest.mjs            Ícono de pantalla de inicio por cliente
public/                   Páginas que ve la gente
scripts/dev.mjs           Servidor local de pruebas
```

## Próximas versiones

- **V2:** botón «Añadir a Google Wallet».
- **V3:** botón «Añadir a Apple Wallet» (requiere cuenta de Apple Developer).
