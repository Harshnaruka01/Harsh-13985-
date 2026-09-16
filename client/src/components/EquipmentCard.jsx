import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Video, Mic, Disc, Speaker, ShieldAlert, IndianRupee, CheckCircle2, AlertTriangle } from 'lucide-react';

const CategoryIcon = ({ category }) => {
  switch (category) {
    case 'Camera': return <Camera className="w-4 h-4" />;
    case 'Projector': return <Video className="w-4 h-4" />;
    case 'Microphone': return <Mic className="w-4 h-4" />;
    case 'Tripod': return <Disc className="w-4 h-4" />;
    case 'Audio/Speaker': return <Speaker className="w-4 h-4" />;
    default: return <ShieldAlert className="w-4 h-4" />;
  }
};

const EquipmentCard = ({ equipment, onBorrowClick }) => {
  const { _id, name, category, description, totalQuantity, availableQuantity, lateFeePerDay, depositAmount, condition, imageUrl } = equipment;

  const isAvailable = (availableQuantity !== undefined ? availableQuantity : totalQuantity) > 0;
  const currentAvailable = availableQuantity !== undefined ? availableQuantity : totalQuantity;

  return (
    <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl hover:border-slate-600 transition-all flex flex-col group">
      
      {/* Thumbnail Header */}
      <div className="relative h-44 bg-slate-900 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
            <Camera className="w-12 h-12 opacity-40" />
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-xs font-semibold text-sky-300 border border-slate-700/60 shadow-lg">
          <CategoryIcon category={category} />
          {category}
        </div>

        {/* Condition Tag */}
        <div className="absolute top-3 right-3 px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-md rounded-md text-[11px] font-medium text-slate-300 border border-slate-700/60">
          {condition}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-1">{name}</h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{description || 'Standard college AV equipment'}</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
          
          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/40">
            <span className="text-slate-400 text-[10px] block font-medium">Daily Late Fee</span>
            <span className="font-bold text-amber-400 flex items-center">
              ₹{lateFeePerDay} <span className="text-[10px] text-slate-400 font-normal ml-0.5">/day</span>
            </span>
          </div>

          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/40">
            <span className="text-slate-400 text-[10px] block font-medium">Deposit (Refundable)</span>
            <span className="font-bold text-emerald-400">
              ₹{depositAmount}
            </span>
          </div>

        </div>

        {/* Availability Badge & Actions */}
        <div className="mt-4 flex items-center justify-between gap-3">
          
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
            isAvailable 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {isAvailable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{currentAvailable} / {totalQuantity} Available</span>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/equipment/${_id}`}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Details
            </Link>
            
            <button
              onClick={() => onBorrowClick(equipment)}
              disabled={!isAvailable}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                isAvailable
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Borrow
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default EquipmentCard;
