import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { AppRoute } from '../types';
import { DBService } from '../lib/db';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: DBService.getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <RefreshCw size={40} className="text-red-600 animate-spin opacity-50" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <p className="text-slate-400 font-medium">Carregando dados...</p>
      </div>
    );
  }

  const menuCards = [
    { id: 1, label: 'Reservas', value: stats.reservasPendentes, sublabel: 'pendentes', path: AppRoute.RESERVAS, alert: stats.reservasPendentes > 0, isSplit: true, total: stats.reservasTotal },
    { id: 2, label: 'Feedbacks', value: stats.feedbacksPendentes, sublabel: 'pendentes', path: AppRoute.FEEDBACKS, alert: stats.feedbacksPendentes > 0 },
    { id: 3, label: 'Consumação', value: stats.consumacoesPendentes || 0, sublabel: 'pendentes', path: AppRoute.CONSUMACOES, alert: false },
    { id: 4, label: 'Promocional', value: stats.promocoesAtivas || 0, sublabel: 'ativas', path: AppRoute.PROMOCIONAL, alert: false },
    { id: 5, label: 'Cupons', value: stats.cuponsAtivos || 0, sublabel: 'ativos', path: AppRoute.CUPONS, alert: false }
  ];

  // Ensure data starts on Monday
  const weeklyData = stats.reservasSemanais || [
    { day: 'Seg', val: 0 }, { day: 'Ter', val: 0 }, { day: 'Qua', val: 0 },
    { day: 'Qui', val: 0 }, { day: 'Sex', val: 0 }, { day: 'Sáb', val: 0 }, { day: 'Dom', val: 0 },
  ];

  const currentTotal = weeklyData.reduce((acc: number, d: any) => acc + d.val, 0);
  const maxVal = Math.max(...weeklyData.map((d: any) => d.val)) * 1.1 || 10;


  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {menuCards.map((card) => {
          const valueString = String(card.value);
          const fontSizeClass = valueString.length > 10 ? 'text-base sm:text-lg' : valueString.length > 7 ? 'text-lg sm:text-xl' : 'text-3xl sm:text-4xl';

          return (
            <button
              key={card.id}
              onClick={() => navigate(card.path)}
              className={`relative group p-5 rounded-[2rem] border transition-all duration-300 text-left flex flex-col justify-between h-44 shadow-sm active:scale-95 overflow-hidden
                ${card.alert
                  ? 'bg-red-600 border-red-500 text-white animate-[pulse_2s_infinite] shadow-lg shadow-red-200 dark:shadow-none ring-4 ring-red-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white hover:border-red-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col">
                  <span className={`text-[11px] font-bold ${card.alert ? 'text-red-50' : 'text-slate-600 dark:text-slate-400 tracking-wide'}`}>
                    {card.label}
                  </span>
                  {card.total !== undefined && (
                    <span className={`text-[10px] font-semibold ${card.alert ? 'text-red-100' : 'text-red-700 dark:text-red-400'}`}>
                      Total: {card.total}
                    </span>
                  )}
                </div>
                <ChevronRight size={18} className={`${card.alert ? 'text-white' : 'text-slate-400'} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>

              <div className="relative z-10 mt-auto">
                {card.isSplit ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 space-y-0.5">
                        <span className="text-3xl font-black tabular-nums tracking-tighter masonry-tracking-tight leading-none block">
                          {card.value}
                        </span>
                        <p className={`text-[10px] font-semibold ${card.alert ? 'text-red-100' : 'text-slate-500 tracking-tight'}`}>
                          Pendentes
                        </p>
                      </div>
                      <div className={`w-px h-10 shrink-0 ${card.alert ? 'bg-white/30' : 'bg-slate-100 dark:bg-slate-800'}`} />
                      <div className="flex-1 space-y-0.5 pl-1">
                        <span className="text-3xl font-black tabular-nums tracking-tighter masonry-tracking-tight leading-none block">
                          {stats.reservasHoje}
                        </span>
                        <p className={`text-[10px] font-semibold ${card.alert ? 'text-red-100' : 'text-slate-500 tracking-tight'}`}>
                          Para hoje
                        </p>
                      </div>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden flex ${card.alert ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <div
                        className={`h-full transition-all duration-1000 ${card.alert ? 'bg-white' : 'bg-red-600'}`}
                        style={{ width: `${(stats.reservasPendentes / (stats.reservasHoje || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className={`${fontSizeClass} font-black tabular-nums tracking-tight masonry-tracking-tight leading-tight block truncate`}>
                      {card.value}
                    </span>
                    <p className={`text-[11px] font-semibold tracking-tight truncate ${card.alert ? 'text-red-100' : 'text-slate-500'}`}>
                      {card.sublabel}
                    </p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">Fluxo de Reservas</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium capitalize">Visão Semanal</p>
            </div>

            <div className="text-right sm:ml-auto">
              <span className="text-3xl font-black text-red-700 dark:text-red-400 tracking-tight">
                {currentTotal}
              </span>
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Total</p>
            </div>
          </div>

          <div className="relative h-56 pt-8 pb-2 w-full">
            <div className="flex items-end justify-between gap-3 h-full">
              {weeklyData.map((d: any, i: number) => {
                // Assuming index corresponds to Monday (0) -> Sunday (6).
                // Let's highlight today. We can get today's index.
                const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
                const isToday = i === todayIndex;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full">
                    <div className="relative w-full flex flex-col items-center justify-end h-full">
                      <span className={`absolute -top-6 text-[11px] font-bold transition-all ${isToday ? 'text-red-700 dark:text-red-400 scale-110' : 'text-slate-500 opacity-60 group-hover:opacity-100'}`}>
                        {d.val}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 h-full w-full max-w-[36px] mx-auto bg-slate-50 dark:bg-slate-800/40 rounded-t-2xl -z-10" />
                      <div
                        className={`w-full max-w-[36px] rounded-t-2xl transition-all duration-1000 cursor-pointer relative shadow-sm
                          ${isToday
                            ? 'bg-gradient-to-t from-red-700 to-red-500 shadow-red-200 dark:shadow-none'
                            : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-red-400/50'
                          }
                        `}
                        style={{ height: `${(d.val / maxVal) * 100}%` }}
                      >
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold ${isToday ? 'text-red-700 dark:text-red-400' : 'text-slate-500'}`}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">Saúde da empresa</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Distribuição de feedbacks recebidos</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-red-700 dark:text-red-400 tracking-tight">
                {stats.feedbacksDistribucao.total}
              </span>
              <p className="text-[10px] font-bold text-slate-500 tracking-wider">Volume total</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
            <div className="relative w-36 h-36 shrink-0">
              {(() => {
                const { elogios, sugestao, total } = stats.feedbacksDistribucao;
                const totalPositiveWeighted = elogios + (sugestao * 0.5);
                const score = total > 0 ? (totalPositiveWeighted / total) * 100 : 100;

                let statusColor = 'stroke-emerald-600';
                let textColor = 'text-emerald-600';
                let statusLabel = 'Positivo';

                if (score < 40) {
                  statusColor = 'stroke-red-600';
                  textColor = 'text-red-600';
                  statusLabel = 'Crítico';
                } else if (score < 70) {
                  statusColor = 'stroke-amber-500';
                  textColor = 'text-amber-500';
                  statusLabel = 'Atenção';
                }

                return (
                  <>
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="4" />
                      <circle
                        cx="18" cy="18" r="16" fill="none"
                        className={`${statusColor} transition-all duration-1000`}
                        strokeWidth="4"
                        strokeDasharray={`${score} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">Status</span>
                        <p className={`text-[10px] font-bold ${textColor}`}>{statusLabel}</p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex-1 w-full space-y-3.5">
              {[
                { label: 'Elogios', color: 'bg-emerald-500', val: stats.feedbacksDistribucao.elogios },
                { label: 'Sugestão', color: 'bg-amber-500', val: stats.feedbacksDistribucao.sugestao },
                { label: 'Reclamações', color: 'bg-red-500', val: stats.feedbacksDistribucao.reclamacoes },
                { label: 'Denúncia', color: 'bg-orange-500', val: stats.feedbacksDistribucao.denuncia },
              ].map((item, i) => {
                const percentage = (item.val / stats.feedbacksDistribucao.total) * 100;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold tracking-tight masonry-tracking-tight">
                      <span className="text-slate-700 dark:text-slate-400">{item.label}</span>
                      <span className="text-slate-950 dark:text-white tabular-nums">{item.val}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.05)]`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
