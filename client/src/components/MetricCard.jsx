import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: 'from-blue-500/10 to-sky-500/10 border-blue-500/20 text-sky-400 icon-blue',
    emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400 icon-emerald',
    amber: 'from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-400 icon-amber',
    rose: 'from-rose-500/10 to-red-500/10 border-rose-500/20 text-rose-400 icon-rose',
    purple: 'from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-400 icon-purple'
  };

  const bgClasses = colorMap[color] || colorMap.blue;

  return (
    <div className={`p-5 rounded-2xl bg-slate-800/80 border bg-gradient-to-br shadow-xl backdrop-blur-sm transition-all hover:scale-[1.02] ${bgClasses}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-white">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-700/50">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
