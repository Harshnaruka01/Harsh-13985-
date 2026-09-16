import React, { useState } from 'react';
import { api } from '../services/api';
import { X, User, Mail, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

const TransferModal = ({ borrowing, isOpen, onClose, onSuccess }) => {
  if (!isOpen || !borrowing) return null;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.transferBorrowing(borrowing._id, { newUserEmail: email });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="p-6 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Transfer Borrowing</h2>
              <p className="text-xs text-purple-400 font-medium">{borrowing.equipmentId ? borrowing.equipmentId.name : 'Equipment'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Borrower Email</label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">The original due date will remain unchanged; availability unaffected.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
