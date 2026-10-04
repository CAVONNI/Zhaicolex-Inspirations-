export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const DROPI_TOKEN = process.env.DROPI_TOKEN;
  const { endpoint } = req.query;

  try {
    const url = `https://app.dropi.co/api/${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${DROPI_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    const text = await response.text();
    
    // Devolver el texto crudo para ver qué responde Dropi
    return res.status(200).send(text);
    
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}