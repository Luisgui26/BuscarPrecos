const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProductCard({ product, bestPrice }) {
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-[1.65rem] border border-slate-200/80 bg-white p-4 shadow-[0_12px_35px_-25px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_24px_55px_-28px_rgba(79,70,229,0.35)]">
      {bestPrice && (
        <span className="absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
          <svg viewBox="0 0 24 24" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 12 4 4L19 6" />
          </svg>
          Menor preço
        </span>
      )}

      <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-[1.15rem] border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/70 p-5">
        <span className="text-xs font-medium text-slate-400">Imagem indisponível</span>
        {product.image && (
          <img src={product.image} alt={product.title} loading="lazy" referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full bg-white object-contain p-5 transition duration-300 group-hover:scale-[1.03]"
            onError={(event) => { event.currentTarget.style.display = 'none'; }} />
        )}
      </div>

      <div className="flex grow flex-col px-1 pb-1 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-xs font-bold uppercase text-indigo-700" aria-hidden="true">
            {(product.store || 'L').charAt(0)}
          </span>
          <p className="truncate text-sm font-semibold text-slate-600">{product.store || 'Loja não informada'}</p>
        </div>

        <h3 className="line-clamp-3 grow text-base font-semibold leading-6 text-slate-900 wrap-anywhere">{product.title}</h3>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Preço encontrado</p>
          <p className="mt-1 text-[1.7rem] font-bold tracking-[-0.035em] text-slate-950">{currency.format(product.price)}</p>
          <div className="mt-2 flex min-h-5 items-center gap-1.5 text-sm text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0 text-slate-400" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h11v10H3z" />
              <path d="M14 10h4l3 3v3h-7z" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
            <span>{product.shipping || 'Frete não informado'}</span>
          </div>
        </div>

        <a href={product.url} target="_blank" rel="noopener noreferrer"
          aria-label={`Ver oferta de ${product.title} em ${product.store || 'outra loja'} (abre em nova aba)`}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:border-indigo-600 hover:bg-indigo-600 focus-visible:outline-indigo-600">
          Ver oferta
          <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </a>
      </div>
    </li>
  );
}
