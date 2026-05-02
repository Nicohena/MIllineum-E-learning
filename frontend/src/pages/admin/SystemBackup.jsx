import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

const SystemBackup = () => {
  const [years, setYears] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [yearName, setYearName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingYear, setSavingYear] = useState(false);
  const [activatingYearId, setActivatingYearId] = useState(null);
  const [deletingYearId, setDeletingYearId] = useState(null);

  const formatApiError = (err, fallback) => {
    const apiError = err?.response?.data;
    if (!apiError) {
      return fallback;
    }

    if (apiError.details && typeof apiError.details === 'object') {
      const detailsText = Object.entries(apiError.details)
        .filter(([, count]) => Number(count) > 0)
        .map(([key, count]) => `${key}: ${count}`)
        .join(', ');

      return detailsText ? `${apiError.error} (${detailsText})` : (apiError.error || fallback);
    }

    return apiError.error || fallback;
  };

  const loadYears = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminService.getYears();
      setYears(response.years || []);
      setActiveYear(response.active_year || null);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load academic years.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYears();
  }, []);

  const handleCreateYear = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    const normalizedYearName = yearName.trim();
    const match = normalizedYearName.match(/^(\d{4})-(\d{4})$/);
    if (!match) {
      setError('Academic year format must be YYYY-YYYY (example: 2026-2027).');
      return;
    }

    const start = Number(match[1]);
    const end = Number(match[2]);
    if (end !== start + 1) {
      setError('Academic year end must be exactly one year after start year.');
      return;
    }

    setSavingYear(true);

    try {
      await adminService.createYear(normalizedYearName);
      setYearName('');
      setMessage('Academic year created successfully.');
      await loadYears();
    } catch (err) {
      setError(formatApiError(err, 'Failed to create academic year.'));
    } finally {
      setSavingYear(false);
    }
  };

  const handleActivate = async (yearId) => {
    setMessage('');
    setError('');
    setActivatingYearId(yearId);

    try {
      await adminService.setActiveYear(yearId);
      setMessage('Active academic year updated.');
      await loadYears();
    } catch (err) {
      setError(formatApiError(err, 'Failed to activate academic year.'));
    } finally {
      setActivatingYearId(null);
    }
  };

  const handleDeleteYear = async (yearId, yearLabel) => {
    const confirmed = window.confirm(`Delete academic year "${yearLabel}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setMessage('');
    setError('');
    setDeletingYearId(yearId);

    try {
      await adminService.deleteYear(yearId);
      setMessage('Academic year deleted successfully.');
      await loadYears();
    } catch (err) {
      setError(formatApiError(err, 'Failed to delete academic year.'));
    } finally {
      setDeletingYearId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Academic Year Settings</h1>
        <p className="mt-1 text-slate-500">Create new academic years and choose which one is currently active for assignments and enrollments.</p>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1.4fr]">
        <form onSubmit={handleCreateYear} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Create Academic Year</h2>
          <p className="mt-1 text-sm text-slate-500">Example: `2026-2027`</p>
          <input
            value={yearName}
            onChange={(e) => setYearName(e.target.value)}
            placeholder="2026-2027"
            maxLength={9}
            className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
            required
          />
          <button type="submit" disabled={savingYear} className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
            Save academic year
          </button>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Available Academic Years</h2>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
              Active: {activeYear?.name || 'Not set'}
            </span>
          </div>

          {loading ? (
            <p className="mt-5 text-sm text-slate-500">Loading years...</p>
          ) : (
            <div className="mt-5 space-y-3">
              {years.map((year) => (
                <div key={year.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-800">{year.name}</p>
                    <p className="text-xs text-slate-400">
                      {Number(year.is_active) === 1 ? 'Currently active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleActivate(year.id)}
                      disabled={Number(year.is_active) === 1 || activatingYearId === year.id || deletingYearId === year.id}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {Number(year.is_active) === 1 ? 'Active' : (activatingYearId === year.id ? 'Activating...' : 'Set active')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteYear(year.id, year.name)}
                      disabled={Number(year.is_active) === 1 || deletingYearId === year.id || activatingYearId === year.id}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {deletingYearId === year.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
              {years.length === 0 && <p className="text-sm text-slate-500">No academic years found yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemBackup;
