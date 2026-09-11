const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProductCard({ product }) {
  return (
    <li className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
      <div className="relative mb-5 flex h-44 items-center justify-center rounded-xl bg-slate-50 p-3">
        <span className="text-xs text-slate-400">Imagem indisponível</span>
        {product.image && <img src={product.image} alt={product.title} loading="lazy" referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full rounded-xl bg-white object-contain p-3"
          onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
      </div>
      <p className="mb-2 text-sm text-slate-500">{product.store || 'Loja não informada'}</p>
      <h3 className="mb-5 grow text-base font-semibold leading-relaxed wrap-anywhere">{product.title}</h3>
      <p className="text-2xl font-bold tracking-tight">{currency.format(product.price)}</p>
      <p className="mt-1 mb-5 text-sm text-slate-500">{product.shipping || 'Frete não informado'}</p>
      <a href={product.url} target="_blank" rel="noopener noreferrer"
        aria-label={`Ver oferta de ${product.title} em ${product.store || 'outra loja'} (abre em nova aba)`}
        className="rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700">
        Ver oferta <span aria-hidden="true">↗</span>
      </a>
    </li>
  );
}
