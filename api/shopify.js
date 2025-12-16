export default async function handler(req, res) {
  const { ACCESS_TOKEN, SHOPIFY_STORE } = process.env;

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/products.json?limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
