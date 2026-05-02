import React from 'react';
import { ListChecks, Sparkles } from 'lucide-react';

const MockModulePage = ({ title, subtitle, metrics = [], items = [], cta = 'Open Module' }) => {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1">{subtitle}</p>
        </div>
        <button className="w-max px-5 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
          {cta}
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <ListChecks size={18} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Mock Activity Feed</h2>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item} className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex items-start gap-3">
              <Sparkles size={16} className="text-primary-600 mt-0.5" />
              <p className="text-sm text-slate-700 font-medium">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MockModulePage;
