function httpUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function priceInReais(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;
  const price = value.replace(/^R\$\s*/, '').trim();
  // Aceita apenas um valor BRL; não confunde parcelas, faixas ou outras moedas.
  if (/^\d{1,3}(\.\d{3})+(,\d{2})?$/.test(price)) {
    return Number(price.replaceAll('.', '').replace(',', '.'));
  }
  if (/^\d+(,\d{2})?$/.test(price)) return Number(price.replace(',', '.'));
  if (/^\d+\.\d{2}$/.test(price)) return Number(price);
  return NaN;
}

export default async function search(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const q = typeof req.query?.q === 'string' ? req.query.q.trim() : '';
  if (!q || q.length > 200) {
    return res.status(400).json({ error: 'Digite um produto com até 200 caracteres.' });
  }
  if (!process.env.SERPAPI_API_KEY?.trim()) {
    return res.status(503).json({ error: 'A chave da API de busca ainda não foi configurada no servidor.' });
  }

  try {
    const params = new URLSearchParams({
      engine: 'google_shopping_light',
      q,
      gl: 'br',
      hl: 'pt',
      api_key: process.env.SERPAPI_API_KEY,
    });
    const response = await fetch(`https://serpapi.com/search.json?${params}`, {
      signal: AbortSignal.timeout(50000),
    });

    if (!response.ok) {
      const error = response.status === 429
        ? 'Limite de buscas atingido. Tente novamente mais tarde.'
        : 'Não foi possível consultar as lojas. Confira a chave e os créditos da API ou tente novamente.';
      return res.status(response.status === 429 ? 429 : 502).json({ error });
    }

    const data = await response.json();
    if (!data || typeof data !== 'object') throw new Error('Resposta inválida');
    if (data?.error) throw new Error('Erro da SerpApi');
    if (data?.shopping_results !== undefined && !Array.isArray(data.shopping_results)) {
      throw new Error('Resposta inválida');
    }
    const shoppingResults = data?.shopping_results || [];

    const products = shoppingResults.filter((item) => item && typeof item === 'object').map((item) => ({
      title: typeof item.title === 'string' ? item.title.trim() : '',
      store: typeof item.source === 'string' ? item.source : null,
      price: Number.isFinite(item.extracted_price) ? item.extracted_price : priceInReais(item.price),
      shipping: typeof item.delivery === 'string' ? item.delivery : null,
      image: httpUrl(item.thumbnail),
      url: httpUrl(item.link || item.product_link),
    })).filter((item) => item.title && item.url && Number.isFinite(item.price) && item.price > 0)
      .sort((a, b) => a.price - b.price);

    return res.status(200).json(products);
  } catch (error) {
    const timeout = error.name === 'TimeoutError' || error.name === 'AbortError';
    return res.status(timeout ? 504 : 502).json({
      error: timeout ? 'A busca demorou demais. Tente novamente.' : 'O serviço de busca está indisponível. Tente novamente.',
    });
  }
}
