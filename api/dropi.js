export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const DROPI_TOKEN = process.env.DROPI_TOKEN;
  const { endpoint } = req.query;

  try {
    const response = await fetch(`https://app.dropi.co/api/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${DROPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Error conectando con Dropi" });
  }
}
