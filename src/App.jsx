import { useState } from 'react';
import ProductCard from './components/ProductCard.jsx';

export default function App() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState('');

  async function handleSearch(event) {
    event.preventDefault();
    if (loading) return;
    const term = query.trim();
    if (!term) { setError('Digite o nome de um produto.'); return; }
    setLoading(true);
    setError('');
    setProducts([]);
    setSearched('');
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: AbortSignal.timeout(25000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a busca.');
      if (!Array.isArray(data)) throw new Error('A busca retornou uma resposta inválida.');
      setProducts(data);
      setSearched(term);
    } catch (error) {
      setError(error.name === 'TimeoutError' ? 'A busca demorou demais. Tente novamente.'
        : error instanceof TypeError ? 'Não foi possível conectar. Confira sua internet e tente novamente.'
        : error instanceof SyntaxError ? 'O serviço de busca retornou uma resposta inválida. Tente novamente.' : error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Buscar Preços<span className="text-indigo-600">.</span></h1>
        <p className="mt-3 text-slate-500">Encontre seu produto em diferentes lojas.</p>
      </header>

      <form onSubmit={handleSearch} className="mb-8">
        <label htmlFor="product" className="mb-2 block text-sm font-medium">Qual produto você procura?</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input id="product" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: Logitech G305" required maxLength={200} disabled={loading}
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-5 py-4 text-base placeholder:text-slate-400 disabled:opacity-60" />
          <button type="submit" disabled={loading} className="rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
        </div>
      </form>

      {error && <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      <section aria-label="Resultados da busca" aria-busy={loading}>
        <div role="status" aria-live="polite">
          {loading && <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Consultando ofertas nas lojas…</p>}
          {!loading && !error && !searched && <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">Digite um produto para ver as ofertas, do menor ao maior preço.</p>}
          {searched && products.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Nenhuma oferta válida para “{searched}”. Tente outro nome ou modelo.</p>}
          {products.length > 0 && <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">{products.length} {products.length === 1 ? 'oferta' : 'ofertas'} para “{searched}”</h2>
            <p className="text-xs text-slate-500">Menor preço primeiro · sem incluir frete</p>
          </div>}
        </div>
        {products.length > 0 && <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => <ProductCard key={`${product.url}-${index}`} product={product} />)}
        </ul>}
      </section>
      <p className="mt-8 text-xs leading-relaxed text-slate-400">Preços e disponibilidade podem mudar. Confirme o valor e o frete na loja.</p>
    </main>
  );
}
