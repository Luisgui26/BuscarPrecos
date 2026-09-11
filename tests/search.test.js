import test from 'node:test';
import assert from 'node:assert/strict';
import search from '../api/search.js';

function invoke(query = { q: 'mouse' }, method = 'GET') {
  const res = {
    headers: {}, statusCode: 200,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };
  return search({ query, method }, res).then(() => res);
}

test('rota de shopping', async (t) => {
  const previousKey = process.env.SERPAPI_API_KEY;
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.SERPAPI_API_KEY;
    else process.env.SERPAPI_API_KEY = previousKey;
  });
  process.env.SERPAPI_API_KEY = 'test-only-secret';
  globalThis.fetch = async () => { throw new Error('Não deveria consultar a API'); };

  await t.test('rejeita termo ausente, vazio, repetido ou muito longo', async () => {
    for (const query of [{}, { q: '   ' }, { q: ['a', 'b'] }, { q: 'a'.repeat(201) }]) {
      assert.equal((await invoke(query)).statusCode, 400);
    }
  });
  await t.test('rejeita POST', async () => {
    const res = await invoke({ q: 'mouse' }, 'POST');
    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.Allow, 'GET');
  });
  await t.test('informa ausência da chave', async () => {
    delete process.env.SERPAPI_API_KEY;
    assert.equal((await invoke()).statusCode, 503);
    process.env.SERPAPI_API_KEY = 'test-only-secret';
  });
  await t.test('normaliza BRL, ordena e descarta ofertas inválidas', async () => {
    globalThis.fetch = async (url, options) => {
      const requestUrl = new URL(url);
      assert.equal(requestUrl.origin + requestUrl.pathname, 'https://serpapi.com/search.json');
      assert.deepEqual(Object.fromEntries(requestUrl.searchParams), {
        engine: 'google_shopping', q: 'mouse', gl: 'br', hl: 'pt', api_key: 'test-only-secret',
      });
      assert.equal(options.signal instanceof AbortSignal, true);
      const offer = { title: 'Mouse', source: 'Loja', product_link: 'https://loja.example/produto', thumbnail: 'https://loja.example/image.png', delivery: 'Frete grátis' };
      return Response.json({ shopping_results: [
        ...['R$ 1.299,90', 'R$ 189,90', 99.5, '199.99', 'R$ 1.000', null, '', 'Grátis', 'R$ -5,00', 0, -10, '10x R$ 19,90', 'R$ 10 a R$ 20', '$99.00', '€ 20,00'].map((price) => ({ ...offer, price })),
        { ...offer, price: 'R$ 999,00', extracted_price: 89.9 },
        { ...offer, price: 5, product_link: 'javascript:alert(1)' },
        { ...offer, price: 5, title: null },
        { ...offer, price: 5, product_link: null }, null,
      ] });
    };
    const res = await invoke({ q: ' mouse ' });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body.map((item) => item.price), [89.9, 99.5, 189.9, 199.99, 1000, 1299.9]);
    assert.deepEqual(res.body[0], { title: 'Mouse', store: 'Loja', price: 89.9, shipping: 'Frete grátis', image: 'https://loja.example/image.png', url: 'https://loja.example/produto' });
    assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.ok(!JSON.stringify(res.body).includes('test-only-secret'));
  });
  await t.test('retorna lista vazia e preserva campos opcionais ausentes', async () => {
    globalThis.fetch = async () => Response.json({ shopping_results: [] });
    assert.deepEqual((await invoke()).body, []);
    globalThis.fetch = async () => Response.json({ search_information: { total_results: 0 } });
    assert.deepEqual((await invoke()).body, []);
    globalThis.fetch = async () => Response.json({ shopping_results: [{ title: 'Mouse', extracted_price: 10, product_link: 'https://loja.example' }] });
    const { body } = await invoke();
    assert.equal(body[0].shipping, null);
    assert.equal(body[0].image, null);
    assert.equal(body[0].store, null);
  });
  await t.test('trata autenticação, créditos e falha do provedor sem vazar sua resposta', async () => {
    for (const status of [401, 403, 429, 500]) {
      globalThis.fetch = async () => new Response('test-only-secret', { status });
      const res = await invoke();
      assert.equal(res.statusCode, status === 429 ? 429 : 502);
      assert.ok(!JSON.stringify(res.body).includes('test-only-secret'));
    }
  });
  await t.test('trata JSON e estrutura inválidos', async () => {
    for (const payload of ['not json', '{"shopping_results":null}', 'null', '{"error":"Invalid API key"}']) {
      globalThis.fetch = async () => new Response(payload);
      assert.equal((await invoke()).statusCode, 502);
    }
  });
  await t.test('trata falhas de conexão e timeout', async () => {
    globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
    assert.equal((await invoke()).statusCode, 502);
    globalThis.fetch = async () => { throw new DOMException('timeout', 'TimeoutError'); };
    assert.equal((await invoke()).statusCode, 504);
  });
});
