import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, TrendingUp, MessageSquare, Save, X, Clock, ChevronDown, ChevronUp, Mic } from 'lucide-react';
import { AppData, Routine, RoutineExercise, PerformedSet, Exercise, WorkoutLog } from '../types';
import { askAICoach } from '../services/geminiService';
import { generateId } from '../services/storage';

interface Props {
  routine: Routine;
  exercises: Exercise[];
  logs: WorkoutLog[];
  onCompleteSplit: (updatedRoutine: Routine, newLog: WorkoutLog) => void;
  onCancel: () => void;
}

const ActiveWorkout: React.FC<Props> = ({ routine, exercises, logs, onCompleteSplit, onCancel }) => {
  const currentSplit = routine.splits[routine.currentSplitIndex];
  
  // Data State
  const [sessionData, setSessionData] = useState<Record<string, PerformedSet[]>>({});
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [showChartForId, setShowChartForId] = useState<string | null>(null);
  
  // AI Chat State
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Timer State
  const [timer, setTimer] = useState<{ active: boolean; remaining: number; total: number }>({ 
    active: false, remaining: 0, total: 0 
  });

  useEffect(() => {
    // Initialize session data
    const initialData: Record<string, PerformedSet[]> = {};
    
    currentSplit.exercises.forEach(routineEx => {
      if (routineEx.lastPerformance && routineEx.lastPerformance.sets.length > 0) {
        initialData[routineEx.id] = routineEx.lastPerformance.sets.map(s => ({...s, completed: false}));
      } else {
        initialData[routineEx.id] = Array(routineEx.targetSets).fill(null).map(() => ({
          reps: routineEx.targetReps,
          weight: 0,
          completed: false
        }));
      }
    });
    setSessionData(initialData);
  }, [currentSplit]);

  // Timer Logic & Sound (Simplified for brevity, same logic applies)
  useEffect(() => {
    let interval: any;
    if (timer.active && timer.remaining > 0) {
      interval = setInterval(() => {
        setTimer(prev => ({ ...prev, remaining: prev.remaining - 1 }));
      }, 1000);
    } else if (timer.active && timer.remaining <= 0) {
      setTimer(prev => ({ ...prev, active: false }));
    }
    return () => clearInterval(interval);
  }, [timer.active, timer.remaining]);

  const updateSet = (exerciseId: string, setIndex: number, field: keyof PerformedSet, value: any, restTime: number = 60) => {
    const currentSets = [...(sessionData[exerciseId] || [])];
    const previousValue = currentSets[setIndex].completed;
    
    currentSets[setIndex] = { ...currentSets[setIndex], [field]: value };
    setSessionData({ ...sessionData, [exerciseId]: currentSets });

    if (field === 'completed' && value === true && !previousValue) {
        setTimer({ active: true, remaining: restTime, total: restTime });
    }
  };

  const addSet = (exerciseId: string) => {
    const currentSets = [...(sessionData[exerciseId] || [])];
    const lastSet = currentSets[currentSets.length - 1];
    currentSets.push({ 
        reps: lastSet ? lastSet.reps : '10', 
        weight: lastSet ? lastSet.weight : 0, 
        completed: false 
    });
    setSessionData({ ...sessionData, [exerciseId]: currentSets });
  };

  const removeSet = (exerciseId: string, index: number) => {
    const currentSets = [...(sessionData[exerciseId] || [])];
    currentSets.splice(index, 1);
    setSessionData({ ...sessionData, [exerciseId]: currentSets });
  }

  const handleFinish = () => {
    const todayISO = new Date().toISOString();
    const logExercises = currentSplit.exercises
        .filter(ex => sessionData[ex.id] && sessionData[ex.id].length > 0)
        .map(ex => {
            const baseExercise = exercises.find(e => e.id === ex.exerciseId);
            return {
                exerciseId: ex.exerciseId,
                exerciseName: baseExercise?.name || 'Desconhecido',
                sets: sessionData[ex.id]
            };
        });

    const newLog: WorkoutLog = {
        id: generateId(),
        date: todayISO,
        routineId: routine.id,
        splitName: currentSplit.name,
        exercises: logExercises
    };

    const updatedSplits = routine.splits.map(s => {
      if (s.id !== currentSplit.id) return s;
      const updatedExercises = s.exercises.map(ex => {
        if (sessionData[ex.id]) {
          return {
            ...ex,
            lastPerformance: {
              date: todayISO,
              sets: sessionData[ex.id]
            }
          };
        }
        return ex;
      });
      return { ...s, exercises: updatedExercises };
    });

    onCompleteSplit({ ...routine, splits: updatedSplits }, newLog);
  };

  const handleAiAsk = async () => {
    if (!aiQuery) return;
    setIsAiLoading(true);
    setAiResponse('');
    
    const context = `Treino: ${currentSplit.name}. Exercícios: ${currentSplit.exercises.map(ex => exercises.find(e => e.id === ex.exerciseId)?.name).join(', ')}.`;
    const response = await askAICoach(aiQuery, context);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedExerciseId(prev => prev === id ? null : id);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

   // --- Chart Logic ---
  const getProgressData = (exerciseId: string) => {
      const relevantLogs = logs.filter(l => 
          l.exercises.some(e => e.exerciseId === exerciseId)
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return relevantLogs.map(log => {
          const exLog = log.exercises.find(e => e.exerciseId === exerciseId);
          const maxWeight = exLog ? Math.max(...exLog.sets.map(s => s.weight)) : 0;
          return {
              date: new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
              weight: maxWeight
          };
      }).slice(-10);
  };

  const renderChart = (data: {date: string, weight: number}[]) => {
      if (data.length < 2) return <p className="text-slate-500 text-xs text-center py-4">Dados insuficientes para gráfico.</p>;
      const height = 100; const width = 300; const padding = 10;
      const maxW = Math.max(...data.map(d => d.weight)) * 1.1;
      const minW = Math.min(...data.map(d => d.weight)) * 0.9;
      
      const points = data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
          const y = height - padding - ((d.weight - minW) / (maxW - minW || 1)) * (height - 2 * padding);
          return `${x},${y}`;
      }).join(' ');

      return (
          <div className="w-full flex flex-col items-center animate-fade-in py-2">
              <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                  <polyline fill="none" stroke="#10b981" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
                  {data.map((d, i) => {
                      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
                      const y = height - padding - ((d.weight - minW) / (maxW - minW || 1)) * (height - 2 * padding);
                      return <circle key={i} cx={x} cy={y} r="3" fill="#10b981" />
                  })}
              </svg>
          </div>
      );
  };

  return (
    <div className="pb-32 relative min-h-screen bg-background">
      {/* Glass Header */}
      <div className="glass sticky top-0 z-20 px-4 py-4 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Treino {currentSplit.name}</h2>
          <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Em Andamento</p>
          </div>
        </div>
        <button onClick={onCancel} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700">
            <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        
        {/* AI Assistant - Modernized */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-2xl border border-indigo-500/20 overflow-hidden">
             {!showAiChat ? (
                 <button 
                  onClick={() => setShowAiChat(true)}
                  className="w-full p-3 flex items-center justify-between text-indigo-300 hover:text-indigo-200 transition-colors"
                 >
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600/20 p-2 rounded-lg"><MessageSquare size={16} /></div>
                        <span className="text-sm font-semibold">Consultar IronCoach AI</span>
                    </div>
                    <ChevronDown size={16} />
                 </button>
             ) : (
                <div className="p-4 animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-wider">Assistente Inteligente</h4>
                        <button onClick={() => setShowAiChat(false)}><ChevronUp size={16} className="text-indigo-400" /></button>
                    </div>
                    <div className="flex gap-2 mb-3">
                        <input 
                            value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                            className="flex-1 bg-slate-900/80 text-white px-3 py-2 rounded-xl text-sm border border-indigo-500/30 focus:border-indigo-400 focus:outline-none"
                            placeholder="Dúvida sobre execução?"
                        />
                        <button onClick={handleAiAsk} disabled={isAiLoading} className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-500">
                            {isAiLoading ? <span className="animate-spin text-xs">↻</span> : <CheckCircle size={18} />}
                        </button>
                    </div>
                    {aiResponse && (
                        <div className="bg-slate-900/50 p-3 rounded-xl text-sm text-indigo-100 border border-indigo-500/10 leading-relaxed">
                            {aiResponse}
                        </div>
                    )}
                </div>
             )}
        </div>

        {/* Exercises List */}
        <div className="space-y-5">
          {currentSplit.exercises.map(routineEx => {
            const baseExercise = exercises.find(e => e.id === routineEx.exerciseId);
            const sets = sessionData[routineEx.id] || [];
            const isExpanded = expandedExerciseId === routineEx.id;
            const completedSets = sets.filter(s => s.completed).length;

            return (
              <div key={routineEx.id} className={`bg-surface/50 backdrop-blur-sm rounded-3xl border transition-all duration-300 ${isExpanded ? 'border-primary/40 shadow-lg shadow-black/30' : 'border-white/5'}`}>
                
                {/* Header Card */}
                <div onClick={() => toggleExpand(routineEx.id)} className="p-5 flex justify-between items-center cursor-pointer">
                    <div>
                        <h3 className={`text-base font-bold transition-colors ${isExpanded ? 'text-primary' : 'text-white'}`}>{baseExercise?.name}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs font-medium bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                                {completedSets} / {routineEx.targetSets} Séries
                            </span>
                            {routineEx.restTimeSeconds && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                    <Clock size={10} /> {routineEx.restTimeSeconds}s
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-primary/20 text-primary rotate-180' : 'bg-slate-800 text-slate-500'}`}>
                        <ChevronDown size={16} />
                    </div>
                </div>

                {isExpanded && (
                    <div className="px-4 pb-4 animate-fade-in">
                        {/* Action Bar */}
                        <div className="flex justify-end mb-4 border-t border-slate-700/30 pt-3">
                             <button 
                                onClick={(e) => { e.stopPropagation(); setShowChartForId(showChartForId === routineEx.id ? null : routineEx.id); }}
                                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border transition-all ${showChartForId === routineEx.id ? 'bg-emerald-900/30 border-primary text-primary' : 'border-slate-600 text-slate-400 hover:border-slate-400'}`}
                             >
                                <TrendingUp size={12} /> {showChartForId === routineEx.id ? 'Ocultar Gráfico' : 'Ver Progresso'}
                             </button>
                        </div>

                        {showChartForId === routineEx.id && (
                            <div className="mb-4 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-inner">
                                {renderChart(getProgressData(routineEx.exerciseId))}
                            </div>
                        )}

                        <div className="space-y-3">
                            {/* Header Labels */}
                            <div className="grid grid-cols-10 gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center px-1">
                                <span className="col-span-1">Set</span>
                                <span className="col-span-3">Reps</span>
                                <span className="col-span-3">Carga (kg)</span>
                                <span className="col-span-2">Status</span>
                                <span className="col-span-1"></span>
                            </div>
                            
                            {sets.map((set, idx) => (
                                <div key={idx} className={`grid grid-cols-10 gap-3 items-center transition-all ${set.completed ? 'opacity-40' : 'opacity-100'}`}>
                                    <span className="col-span-1 text-center text-xs font-mono text-slate-500">{idx + 1}</span>
                                    
                                    <input
                                        type="tel"
                                        className="col-span-3 bg-slate-900/50 text-white py-3 rounded-xl text-center font-bold text-lg border-2 border-transparent focus:border-primary/50 focus:bg-slate-900 focus:outline-none transition-all shadow-sm"
                                        value={set.reps}
                                        onChange={(e) => updateSet(routineEx.id, idx, 'reps', e.target.value)}
                                        placeholder="0"
                                    />
                                    
                                    <input
                                        type="tel"
                                        className="col-span-3 bg-slate-900/50 text-white py-3 rounded-xl text-center font-bold text-lg border-2 border-transparent focus:border-primary/50 focus:bg-slate-900 focus:outline-none transition-all shadow-sm"
                                        value={set.weight}
                                        onChange={(e) => updateSet(routineEx.id, idx, 'weight', parseFloat(e.target.value))}
                                        placeholder="0"
                                    />
                                    
                                    <button
                                        onClick={(e) => { e.stopPropagation(); updateSet(routineEx.id, idx, 'completed', !set.completed, routineEx.restTimeSeconds || 60); }}
                                        className={`col-span-2 h-full flex items-center justify-center rounded-xl transition-all ${set.completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        <CheckCircle size={22} fill={set.completed ? "currentColor" : "none"} />
                                    </button>
                                    
                                    <button onClick={() => removeSet(routineEx.id, idx)} className="col-span-1 flex justify-center text-slate-600 hover:text-red-400">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => addSet(routineEx.id)}
                            className="mt-5 w-full py-3 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 text-xs font-bold uppercase tracking-widest transition-all hover:bg-slate-800/30"
                        >
                            + Adicionar Série
                        </button>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Floating Timer */}
      {timer.active && (
        <div className="fixed bottom-24 left-4 right-4 glass-card p-4 rounded-3xl shadow-2xl flex items-center justify-between z-40 animate-slide-up border border-primary/20">
            <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path className="text-primary transition-all duration-1000 ease-linear" strokeDasharray={`${(timer.remaining / timer.total) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    <span className="absolute text-xs font-bold text-white">{timer.remaining}</span>
                </div>
                <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">Descanso</span>
                    <span className="text-white font-bold text-lg">{formatTime(timer.remaining)}</span>
                </div>
            </div>
            <button 
                onClick={() => setTimer({ ...timer, active: false })} 
                className="bg-slate-700/50 hover:bg-slate-700 text-white px-5 py-2 rounded-full text-sm font-bold transition-colors"
            >
                Pular
            </button>
        </div>
      )}

      {/* Floating Action Button for Finish */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pt-8 bg-gradient-to-t from-background via-background to-transparent z-30">
        <button
          onClick={handleFinish}
          className="w-full bg-primary hover:bg-primaryDark text-slate-900 font-bold text-lg py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-transform active:scale-95 flex justify-center items-center gap-2"
        >
          <Save size={20} /> FINALIZAR TREINO
        </button>
      </div>
    </div>
  );
};

export default ActiveWorkout;