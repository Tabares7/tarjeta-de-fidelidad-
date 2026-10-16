import { AJUSTES } from "./_lib/ajustes.mjs";
import { json } from "./_lib/http.mjs";

export default async () => json(AJUSTES);

export const config = { path: "/api/ajustes" };
