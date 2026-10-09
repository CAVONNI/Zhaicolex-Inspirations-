// api/dropi.js  (Vercel Serverless Function)
export default async function handler(req, res) {
  const url = process.env.DROPI_PRODUCTS_URL; // endpoint de productos que te confirme Dropi
  const token = process.env.DROPI_TOKEN;
  if (!url || !token)
    return res.status(500).json({ error: "Faltan variables de entorno" });

  try {
    const qs = new URLSearchParams(req.query).toString();
    const r = await fetch(`${url}${url.includes("?") ? "&" : "?"}${qs}`, {
      headers: {
        "dropi-integration-key": token,
        "Content-Type": "application/json",
      },
    });
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: "Dropi no disponible" });
  }
}
