export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const DROPI_TOKEN = process.env.DROPI_TOKEN;
  const { endpoint } = req.query;

  // Verificar que el token existe
  if (!DROPI_TOKEN) {
    return res.status(500).json({ error: "Token no encontrado en variables de entorno" });
  }

  try {
    const url = `https://app.dropi.co/api/${endpoint || 'publications'}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${DROPI_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    return res.status(200).json({
      status: response.status,
      statusText: response.statusText,
      url: url,
      tokenPrimeros10: DROPI_TOKEN.substring(0, 10),
      body: await response.text()
    });
    
  } catch (error) {
    return res.status(500).json({ 
      error: error.message
    });
  }
}