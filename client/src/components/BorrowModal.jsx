import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Calendar, AlertCircle, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';

const BorrowModal = ({ equipment, isOpen, onClose, onSuccess }) => {
  if (!isOpen || !equipment) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDue = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  const [quantity, setQuantity] = useState(1);
  const [borrowDate, setBorrowDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDue);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalDeposit = (parseInt(quantity, 10) || 1) * equipment.depositAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createBorrowing({
        equipmentId: equipment._id,
        quantity: parseInt(quantity, 10),
        borrowDate,
        dueDate,
        notes
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-6 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Borrow Equipment</h2>
              <p className="text-xs text-sky-400 font-medium">{equipment.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Borrow Date</label>
              <input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                min={todayStr}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Return / Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={borrowDate}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quantity (Max available: {equipment.availableQuantity ?? equipment.totalQuantity})
            </label>
            <input
              type="number"
              min="1"
              max={equipment.availableQuantity ?? equipment.totalQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose / Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Photography Club Shoot / Tech Fest Presentation"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Fee & Refundable Deposit Calculation Summary */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Unit Deposit:</span>
              <span className="font-medium text-white">₹{equipment.depositAmount} × {quantity}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Total Deposit Required:</span>
              <span className="font-bold text-emerald-400 text-sm">₹{totalDeposit}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              <span>Daily Late Fee Rate:</span>
              <span className="text-amber-400 font-medium">₹{equipment.lateFeePerDay * quantity} / day</span>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-1">
              * Deposit is 100% refundable upon timely return minus any daily late fees.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-sky-600/30 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Confirm Borrow Reservation
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default BorrowModal;
