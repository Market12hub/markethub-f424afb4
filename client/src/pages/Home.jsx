import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductRow from '../components/ProductRow.jsx';

const LIMIT = 12;

// How dark the background is: 0 = no darkening, 1 = fully black.
// Try 0.4 for lighter, 0.7 for much darker.
const DARKNESS = 0.55;

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/categories')
      .then((d) => setCategories(d.categories))
      .catch(() => {});

    // Products that have a crossed-out old price go into the "Today's deals" row
    api('/products?limit=50')
      .then((d) =>
        setDeals(
          d.products.filter((p) => p.original_price && p.original_price > p.price).slice(0, 10)
        )
      )
      .catch(() => {});
  }, []);

  // Reload products when the search, category or page changes (with a short delay while typing)
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search.trim()) params.set('search', search.trim());
      if (category) params.set('category', category);

      api(`/products?${params}`)
        .then((d) => {
          setProducts(d.products);
          setTotal(d.total);
          setError('');
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, page]);

  const pages = Math.max(1, Math.ceil(total / LIMIT));
  const browsing = !search.trim() && !category && page === 1;

  // Shared style for the Previous / Next buttons
  const pagerBtn =
    'rounded-lg border border-emerald-500/50 bg-ink/70 px-4 py-2 font-medium text-emerald-400 hover:border-emerald-400 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-emerald-500/50 disabled:hover:text-emerald-400';

  return (
    <div>
      {/* Dark layer over the background image. It only exists on this page. */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          background: `linear-gradient(to bottom, rgba(0,0,0,${DARKNESS * 0.8}), rgba(0,0,0,${DARKNESS}))`,
        }}
      />

      <section className="rounded-2xl border border-line bg-gradient-to-br from-panel2 to-panel p-8">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Shop local, <span className="text-brand">buy better.</span>
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Coffee, textiles, handicrafts and more from sellers across Ethiopia.
        </p>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search products..."
          className="mt-5 w-full max-w-md rounded-lg border border-line bg-ink px-4 py-2.5 outline-none focus:border-brand"
        />
      </section>

      {browsing && <ProductRow title="Today's deals" products={deals} />}

      <div className="mt-8 flex flex-wrap gap-2">
        {[{ id: '', name: 'All' }, ...categories].map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setCategory(c.id);
              setPage(1);
            }}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              category === c.id
                ? 'border-brand bg-brand text-ink'
                : 'border-emerald-500/50 bg-ink/70 text-emerald-400 hover:border-emerald-400 hover:text-emerald-300'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 text-red-400">{error}</p>}
      {loading && (
        <p className="mt-6 inline-block rounded-lg bg-ink/70 px-3 py-1.5 font-medium text-emerald-400">
          Loading...
        </p>
      )}
      {!loading && !error && products.length === 0 && (
        <p className="mt-6 inline-block rounded-lg bg-ink/70 px-3 py-1.5 font-medium text-emerald-400">
          No products found.
        </p>
      )}

      <div
        key={products.map((p) => p.id).join('-')}
        className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={pagerBtn}>
            Previous
          </button>
          <span className="rounded-lg bg-ink/70 px-3 py-2 font-medium text-emerald-400">
            Page {page} of {pages}
          </span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className={pagerBtn}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}