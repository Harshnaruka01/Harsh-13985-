import React, { useState } from 'react';
import { api } from '../services/api';
import { X, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';

const ReturnModal = ({ borrowing, isOpen, onClose, onSuccess }) => {
  if (!isOpen || !borrowing) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [returnDate, setReturnDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const equipment = borrowing.equipmentId || {};
  const quantity = borrowing.quantity || 1;
  const deposit = borrowing.depositAmount || 0;
  const dailyFee = (equipment.lateFeePerDay || 100) * quantity;

  // Live calculation preview
  const due = new Date(borrowing.dueDate);
  due.setHours(23, 59, 59, 999);
  const ret = new Date(returnDate);

  let previewLateDays = 0;
  if (ret > due) {
    const diffMs = ret.getTime() - due.getTime();
    previewLateDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (previewLateDays < 0) previewLateDays = 0;
  }

  const previewLateFee = previewLateDays * dailyFee;
  const previewRefund = Math.max(0, deposit - previewLateFee);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.returnBorrowing(borrowing._id, {
        returnDate,
        notes
      });
      setSummary(res.summary);
      if (onSuccess) onSuccess();
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Process Equipment Return</h2>
              <p className="text-xs text-slate-400">{equipment.name || 'Equipment'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!summary ? (
          <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
            
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Borrow Date:</span>
                <span className="text-white font-medium">{new Date(borrowing.borrowDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Due Date:</span>
                <span className="text-sky-300 font-medium">{new Date(borrowing.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity Borrowed:</span>
                <span className="text-white font-medium">{quantity} unit(s)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Return Date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Condition Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Lens clean, all cables returned"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Live Fee & Refund Preview */}
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
              previewLateDays > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
            }`}>
              <div className="flex justify-between font-medium">
                <span className="text-slate-300">Late Days:</span>
                <span className={previewLateDays > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {previewLateDays} day(s) late
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-300">Calculated Late Fee:</span>
                <span className="font-bold text-amber-400">₹{previewLateFee}</span>
              </div>

              <div className="flex justify-between pt-1 border-t border-slate-700/50">
                <span className="text-white font-semibold">Refund Amount (Deposit - Fee):</span>
                <span className="font-extrabold text-emerald-400 text-sm">₹{previewRefund}</span>
              </div>
            </div>

            {/* Actions */}
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
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirm Return & Issue Refund
              </button>
            </div>

          </form>
        ) : (
          /* Receipt Summary View */
          <div className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-extrabold text-white">Return Summary Receipt</h3>
            <p className="text-xs text-slate-400">Equipment returned and inventory restored!</p>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/60 text-left space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Equipment:</span><span className="text-white font-bold">{summary.equipmentName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Returned Date:</span><span className="text-slate-200">{new Date(summary.returnedDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Late Days:</span><span className="text-amber-400 font-bold">{summary.lateDays} days</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Late Fee Deducted:</span><span className="text-amber-400 font-bold">₹{summary.totalLateFee}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Initial Deposit:</span><span className="text-slate-200 font-medium">₹{summary.initialDeposit}</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-700 text-sm font-bold"><span className="text-white">Net Refund Issued:</span><span className="text-emerald-400">₹{summary.refundAmount}</span></div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all"
            >
              Close Receipt
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReturnModal;
