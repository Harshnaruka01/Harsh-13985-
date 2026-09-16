import React, { useState } from 'react';
import { api } from '../services/api';
import { Calendar, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const AvailabilityChecker = ({ equipmentId, totalQuantity }) => {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.checkAvailability(equipmentId, startDate, endDate, quantity);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
        <Calendar className="w-5 h-5 text-sky-400" />
        <h3 className="font-bold text-white text-base">Check Date Availability</h3>
      </div>

      <form onSubmit={handleCheck} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Borrow Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Return / Due Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity Needed</label>
            <input
              type="number"
              min="1"
              max={totalQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-sky-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-sky-500/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Availability Algorithm'}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-xl border text-xs space-y-2 ${
          result.isAvailable 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            {result.isAvailable ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{result.message}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/50 text-[11px]">
            <div>
              <span className="text-slate-400 block">Total Units</span>
              <span className="font-bold text-white">{result.totalQuantity}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Already Booked</span>
              <span className="font-bold text-amber-400">{result.bookedQuantity}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Available</span>
              <span className="font-bold text-emerald-400">{result.availableQuantity}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityChecker;
