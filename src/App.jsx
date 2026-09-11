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
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: AbortSignal.timeout(55000) });
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
    <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 px-5 py-7 shadow-[0_24px_70px_-34px_rgba(30,41,59,0.35)] backdrop-blur-xl sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-indigo-200/45 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-cyan-100/70 blur-3xl" />

          <div className="relative">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                    <path d="M8.5 11.5 10 13l3.5-4" />
                  </svg>
                </span>
                <span className="text-base font-bold tracking-tight text-slate-900">Buscar Preços</span>
              </div>
              <span className="hidden rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-2 text-xs font-semibold text-indigo-700 sm:inline-flex">Comparação simples e rápida</span>
            </div>

            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Economize em cada escolha</p>
              <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">Encontre o melhor preço sem procurar loja por loja.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Pesquise um produto e compare ofertas de diferentes lojas, organizadas do menor para o maior preço.</p>
            </div>

            <form onSubmit={handleSearch} className="mt-8 sm:mt-10">
              <label htmlFor="product" className="mb-2.5 block text-sm font-semibold text-slate-800">O que você está procurando?</label>
              <div className="search-shell flex flex-col gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-[0_16px_45px_-22px_rgba(15,23,42,0.38)] sm:flex-row sm:rounded-[1.35rem]">
                <div className="flex min-w-0 flex-1 items-center gap-3 px-2 sm:px-3">
                  <svg viewBox="0 0 24 24" fill="none" className="size-5 shrink-0 text-slate-400" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                  <input id="product" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: Logitech G305" required maxLength={200} disabled={loading}
                    className="min-w-0 flex-1 border-0 bg-transparent py-3 text-base text-slate-950 outline-none placeholder:text-slate-400 disabled:opacity-60 sm:py-3.5" />
                </div>
                <button type="submit" disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-200 disabled:cursor-wait disabled:translate-y-0 disabled:opacity-60">
                  {loading ? <><span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" />Buscando…</> : <>Buscar ofertas <span aria-hidden="true">→</span></>}
                </button>
              </div>
            </form>
          </div>
        </header>

        <section aria-label="Resultados da busca" aria-busy={loading} className="py-9 sm:py-12">
          <div role="status" aria-live="polite">
            {error && (
              <div role="alert" className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-800 shadow-sm">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-red-100 font-bold" aria-hidden="true">!</span>
                <p className="pt-1.5 leading-5">{error}</p>
              </div>
            )}

            {loading && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">Buscando as melhores ofertas</p>
                    <p className="mt-1 text-sm text-slate-500">Consultando preços em diferentes lojas…</p>
                  </div>
                  <span className="hidden text-sm font-medium text-indigo-600 sm:block">Só um momento</span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="rounded-[1.6rem] border border-slate-200/80 bg-white p-4 shadow-sm">
                      <div className="h-52 animate-pulse rounded-2xl bg-slate-100" />
                      <div className="mt-5 h-3 w-24 animate-pulse rounded-full bg-slate-100" />
                      <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-slate-100" />
                      <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
                      <div className="mt-7 h-8 w-32 animate-pulse rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && !error && !searched && (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300/90 bg-white/45 px-6 py-14 text-center sm:py-16">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-slate-200 bg-white text-indigo-600 shadow-sm" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="size-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 7h12l-1 11H7L6 7Z" />
                    <path d="M9 9V6a3 3 0 0 1 6 0v3" />
                  </svg>
                </span>
                <p className="mt-5 font-semibold text-slate-800">Suas ofertas aparecerão aqui</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Digite o nome ou modelo de um produto para comparar os preços disponíveis.</p>
              </div>
            )}

            {searched && products.length === 0 && (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                <p className="font-semibold text-slate-800">Nenhuma oferta válida para “{searched}”</p>
                <p className="mt-2 text-sm text-slate-500">Tente pesquisar com outro nome ou informe o modelo do produto.</p>
              </div>
            )}

            {products.length > 0 && (
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">Resultados encontrados</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{products.length} {products.length === 1 ? 'oferta' : 'ofertas'} para “{searched}”</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  Menor preço primeiro · sem incluir frete
                </div>
              </div>
            )}
          </div>

          {products.length > 0 && (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => <ProductCard key={`${product.url}-${index}`} product={product} bestPrice={index === 0} />)}
            </ul>
          )}
        </section>

        <footer className="border-t border-slate-200/80 py-6 text-center text-xs leading-relaxed text-slate-500">Preços e disponibilidade podem mudar. Confirme o valor e o frete diretamente na loja.</footer>
      </div>
    </main>
  );
}
