import { useEffect, useState } from 'react';
import helpService from '../../services/helpService';

const HelpQueries = () => {
  const [queries, setQueries] = useState([]);
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async (cat) => {
    const params = {};
    if (cat) params.category = cat;
    const res = await helpService.getQueries(params);
    setQueries(res || []);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Help Center — User Queries</h1>
        <p className="text-sm text-slate-600">View user-submitted questions with category filters.</p>
      </div>

      <div className="flex items-center gap-3">
        <select value={category} onChange={(e) => { setCategory(e.target.value); fetchQueries(e.target.value); }} className="rounded border px-3 py-2">
          <option value="">All</option>
          <option value="general">General</option>
          <option value="account">Account</option>
          <option value="courses">Courses</option>
          <option value="technical">Technical</option>
          <option value="billing">Billing</option>
        </select>
      </div>

      <div className="grid gap-3">
        {queries.length === 0 ? (
          <div className="rounded border p-6">No queries found.</div>
        ) : queries.map((q) => (
          <div key={q.id} className="rounded border p-4 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{q.user_name || q.user_email || 'Guest'}</p>
                <p className="text-xs text-slate-500">{q.category} • {new Date(q.created_at).toLocaleString()}</p>
              </div>
              <div className="text-sm text-slate-600">Status: {q.status}</div>
            </div>
            <p className="mt-3 text-slate-700">{q.question}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpQueries;
