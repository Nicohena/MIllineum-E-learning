import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const HelpCenter = () => {
  const [query, setQuery] = useState('');
  const helpCenter = modulePageMockData.helpCenter;

  const filteredGuides = useMemo(() => {
    if (!query.trim()) return helpCenter.guides;
    const normalized = query.trim().toLowerCase();
    return helpCenter.guides.filter((guide) =>
      guide.title.toLowerCase().includes(normalized) ||
      guide.description.toLowerCase().includes(normalized) ||
      guide.tags.some((tag) => tag.toLowerCase().includes(normalized))
    );
  }, [helpCenter.guides, query]);

  const filteredArticles = useMemo(() => {
    if (!query.trim()) return helpCenter.articles;
    const normalized = query.trim().toLowerCase();
    return helpCenter.articles.filter((article) =>
      article.title.toLowerCase().includes(normalized) ||
      article.snippet.toLowerCase().includes(normalized) ||
      article.tags.some((tag) => tag.toLowerCase().includes(normalized))
    );
  }, [helpCenter.articles, query]);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="space-y-4">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600">Help Center</p>
        <h1 className="text-4xl font-extrabold text-slate-900">{helpCenter.title}</h1>
        <p className="max-w-2xl text-slate-600 text-lg leading-relaxed">{helpCenter.subtitle}</p>
      </div>

      <div className="relative max-w-2xl">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help topics, guides, or keywords..."
          className="w-full rounded-3xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <section className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          {filteredGuides.map((guide) => (
            <div key={guide.id} className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm transition hover:border-indigo-200">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-600">{guide.category}</p>
              <h2 className="mt-3 text-xl font-bold text-slate-900">{guide.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{guide.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {guide.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <article key={article.id} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition hover:border-indigo-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">{article.title}</h2>
                  <p className="text-sm text-slate-500 max-w-2xl">{article.snippet}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">No results found</p>
            <p className="mt-3 text-slate-600">Try a different keyword or browse the help topics again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
