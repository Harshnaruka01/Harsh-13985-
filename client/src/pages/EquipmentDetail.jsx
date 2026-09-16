import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import AvailabilityChecker from '../components/AvailabilityChecker';
import BorrowModal from '../components/BorrowModal';
import { Camera, ArrowLeft, CheckCircle2, ShieldCheck, IndianRupee, AlertTriangle, Loader2, Calendar } from 'lucide-react';

const EquipmentDetail = () => {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Borrow Modal State
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await api.getEquipmentById(id);
      setEquipment(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-slate-800 rounded-3xl border border-red-500/30 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-white mb-1">Equipment Not Found</h3>
        <p className="text-xs text-slate-400 mb-4">{error || 'Invalid equipment ID'}</p>
        <Link to="/equipment" className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isAvailable = (equipment.availableQuantity !== undefined ? equipment.availableQuantity : equipment.totalQuantity) > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back Link */}
      <Link
        to="/equipment"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-sky-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Equipment Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-slate-800/90 rounded-3xl border border-slate-700/80 overflow-hidden shadow-2xl">
            <div className="relative h-80 bg-slate-900">
              {equipment.imageUrl ? (
                <img
                  src={equipment.imageUrl}
                  alt={equipment.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <Camera className="w-20 h-20 opacity-40" />
                </div>
              )}
              <div className="absolute top-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-xs font-bold text-sky-400 border border-slate-700">
                {equipment.category}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white">{equipment.name}</h1>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {equipment.description || 'Standard college AV room lending gear.'}
                </p>
              </div>

              {/* Specs & Fee Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-700/60">
                
                <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Quantity</span>
                  <span className="font-extrabold text-white text-base">{equipment.totalQuantity} Units</span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 block font-medium">Daily Late Fee</span>
                  <span className="font-extrabold text-amber-400 text-base">₹{equipment.lateFeePerDay}</span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 block font-medium">Refundable Deposit</span>
                  <span className="font-extrabold text-emerald-400 text-base">₹{equipment.depositAmount}</span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 block font-medium">Condition</span>
                  <span className="font-extrabold text-slate-200 text-base">{equipment.condition}</span>
                </div>

              </div>
            </div>

          </div>

          {/* Business Rules Banner */}
          <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs space-y-2 text-slate-300">
            <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Lending & Policy Rules
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Deposit is 100% refundable upon timely return without damage.</li>
              <li>Late returns incur a per-day late fee of ₹{equipment.lateFeePerDay} per unit.</li>
              <li>Refund calculation: <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">max(0, deposit - lateFee)</code>.</li>
              <li>Students have a max active limit of 3 equipment units total.</li>
            </ul>
          </div>

        </div>

        {/* Right Column: Date Availability & Action */}
        <div className="space-y-6">
          
          <div className="bg-slate-800/90 p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Current Today Status</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                isAvailable ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {equipment.availableQuantity ?? equipment.totalQuantity} / {equipment.totalQuantity} Available
              </span>
            </div>

            <button
              onClick={() => setIsBorrowModalOpen(true)}
              disabled={!isAvailable}
              className={`w-full py-3 rounded-2xl text-xs font-extrabold transition-all shadow-xl flex items-center justify-center gap-2 ${
                isAvailable
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Reserve & Borrow Equipment
            </button>
          </div>

          {/* Live Availability Checker Widget */}
          <AvailabilityChecker
            equipmentId={equipment._id}
            totalQuantity={equipment.totalQuantity}
          />

        </div>

      </div>

      {/* Borrow Modal */}
      <BorrowModal
        equipment={equipment}
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        onSuccess={fetchDetail}
      />

    </div>
  );
};

export default EquipmentDetail;
