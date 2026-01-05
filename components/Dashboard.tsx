import React, { useMemo } from 'react';
import { Play, Calendar, Trophy, ChevronRight } from 'lucide-react';
import { AppData } from '../types';

interface Props {
  data: AppData;
  onStartWorkout: () => void;
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<Props> = ({ data, onStartWorkout, onNavigate }) => {
  const activeRoutine = data.routines.find(r => r.id === data.activeRoutineId);

  // Calendar Logic
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push(d);
    }
    return days;
  }, []);

  const getLogForDate = (date: Date) => {
      return data.logs.find(log => {
          const logDate = new Date(log.date);
          return logDate.getDate() === date.getDate() && 
                 logDate.getMonth() === date.getMonth() && 
                 logDate.getFullYear() === date.getFullYear();
      });
  };

  if (!activeRoutine) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
        <div className="bg-surfaceLight/30 p-8 rounded-full mb-8 shadow-xl shadow-black/40 backdrop-blur-sm border border-white/5">
          <Calendar size={64} className="text-slate-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Sem Rotina Ativa</h2>
        <p className="text-slate-400 mb-8 max-w-xs leading-relaxed">
          Para começar a rastrear seus treinos, crie uma nova rotina e marque-a como ativa.
        </p>
        <button
          onClick={() => onNavigate('routines')}
          className="bg-primary hover:bg-primaryDark text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 border border-primary/20"
        >
          Criar Primeira Rotina
        </button>
      </div>
    );
  }

  const nextSplit = activeRoutine.splits[activeRoutine.currentSplitIndex];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Calendar Strip */}
      <div className="bg-surface/60 backdrop-blur-md p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar shadow-lg shadow-black/20">
         <div className="flex justify-between min-w-max px-2 py-3 gap-2">
         {weekDays.map((day, index) => {
             const isToday = new Date().toDateString() === day.toDateString();
             const log = getLogForDate(day);
             const dayName = day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
             
             return (
                 <div key={index} className={`flex flex-col items-center justify-center w-[13.5%] min-w-[48px] py-3 rounded-xl transition-all ${isToday ? 'bg-slate-800 border border-slate-600 shadow-md' : 'opacity-60'}`}>
                     <span className={`text-[10px] uppercase tracking-wider mb-1 ${isToday ? 'text-primary font-bold' : 'text-slate-500'}`}>
                         {dayName}
                     </span>
                     <div className={`text-lg font-bold mb-1 ${isToday ? 'text-white' : 'text-slate-300'}`}>
                         {day.getDate()}
                     </div>
                     <div className="h-4 flex items-center justify-center">
                        {log ? (
                             <span className="bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                {log.splitName.substring(0, 1)}
                             </span>
                        ) : (
                            <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-slate-600' : 'bg-slate-800'}`}></div>
                        )}
                     </div>
                 </div>
             )
         })}
         </div>
      </div>

      {/* Hero Card - Improved High Contrast & Gradients */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
        
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl p-6 shadow-2xl overflow-hidden">
          
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
               <div className="flex items-center gap-2 mb-2">
                 <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-emerald-500/20">
                   Próximo Treino
                 </span>
               </div>
               <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">Divisão {nextSplit.name}</h1>
               <p className="text-slate-400 font-medium flex items-center gap-2 mt-2 text-sm">
                 {activeRoutine.name} 
                 <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                 {nextSplit.exercises.length} Exercícios
               </p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-2xl backdrop-blur-md border border-slate-700 text-primary shadow-inner">
               <Trophy size={28} />
            </div>
          </div>

          <button
            onClick={onStartWorkout}
            className="w-full bg-gradient-to-r from-primary to-primaryDark text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-lg shadow-black/20 transition-all hover:scale-[1.02] active:scale-[0.98] group border-t border-white/10"
          >
            <div className="bg-white/20 p-1.5 rounded-full">
               <Play fill="currentColor" size={12} className="ml-0.5" />
            </div>
            INICIAR AGORA
          </button>
        </div>
      </div>

      {/* Quick Preview List */}
      <div>
        <h3 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4 ml-1">Resumo da Sessão</h3>
        <div className="space-y-3">
            {nextSplit.exercises.slice(0, 5).map((ex, i) => {
                const exerciseName = data.exercises.find(e => e.id === ex.exerciseId)?.name;
                return (
                    <div key={ex.id} className="bg-surface/40 border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:bg-surfaceLight/40 transition-colors">
                        <div className="flex items-center gap-4">
                            <span className="text-slate-600 font-mono text-xs font-bold w-4">{i + 1}</span>
                            <span className="text-slate-200 font-semibold">{exerciseName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                             <span className="text-slate-400 text-xs font-medium bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                                {ex.targetSets} x {ex.targetReps}
                             </span>
                             <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
                        </div>
                    </div>
                )
            })}
            {nextSplit.exercises.length > 5 && (
                <div className="text-center py-2">
                    <span className="text-xs text-slate-500 font-medium bg-slate-800/30 px-3 py-1 rounded-full border border-slate-800">
                        + {nextSplit.exercises.length - 5} exercícios restantes
                    </span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;