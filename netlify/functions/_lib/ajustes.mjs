// ⚙️ AJUSTES DE LA TARJETA
// Todo el sitio lee estos valores. Cambia aquí y se actualiza en todas partes.

export const AJUSTES = {
  estudio: "Piter Tabares",
  lema: "Tattoo Artist · Irving, TX",
  sellosTotales: 8,
  // Premios por cantidad de sellos. Al canjear el último, la tarjeta vuelve a empezar.
  premios: [
    { en: 4, premio: "20% de descuento en tu próxima sesión" },
    { en: 8, premio: "Una sesión gratis" },
  ],
  reglaSello: "Recibes un sello por cada sesión de más de 5 horas.",
  horasEntreSellos: 12, // Avisa si intentas sellar dos veces en poco tiempo

  // Colores provisionales (pendientes de los definitivos)
  colores: {
    fondo: "#121110",
    superficie: "#1c1a18",
    borde: "#2e2a26",
    texto: "#ece4d6",
    tenue: "#9a9083",
    acento: "#c2452d",
  },
};
