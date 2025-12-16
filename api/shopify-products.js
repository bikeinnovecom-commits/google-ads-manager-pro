export default async function handler(req, res) {
  // Ajouter les headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const SHOPIFY_STORE = process.env.VITE_SHOPIFY_STORE;
  const SHOPIFY_TOKEN = process.env.VITE_SHOPIFY_ACCESS_TOKEN;

  if (!SHOPIFY_STORE || !SHOPIFY_TOKEN) {
    return res.status(500).json({ 
      error: 'Configuration manquante',
      details: 'VITE_SHOPIFY_STORE ou VITE_SHOPIFY_ACCESS_TOKEN non défini'
    });
  }

  try {
    const url = `https://${SHOPIFY_STORE}/admin/api/2024-01/products.json?limit=250`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Erreur API Shopify:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des produits',
      details: error.message 
    });
  }
}
