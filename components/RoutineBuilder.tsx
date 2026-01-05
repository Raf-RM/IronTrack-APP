import React, { useState } from 'react';
import { Plus, Trash2, Save, Layers, Pencil, ArrowLeft, Clock, GripVertical } from 'lucide-react';
import { AppData, Routine, RoutineSplit, RoutineExercise, ExecutionStyle } from '../types';
import { generateId } from '../services/storage';

interface Props {
  data: AppData;
  onSaveRoutine: (routine: Routine) => void;
  onDeleteRoutine: (id: string) => void;
  onSetActive: (id: string) => void;
}

const RoutineBuilder: React.FC<Props> = ({ data, onSaveRoutine, onDeleteRoutine, onSetActive }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [currentSplitName, setCurrentSplitName] = useState('');
  
  const [draftRoutine, setDraftRoutine] = useState<Partial<Routine>>({
    name: '',
    splits: [],
    currentSplitIndex: 0
  });

  const handleCreateNew = () => {
    setDraftRoutine({
      id: generateId(),
      name: '',
      splits: [],
      currentSplitIndex: 0
    });
    setView('form');
  };

  const handleEdit = (routine: Routine) => {
    setDraftRoutine(JSON.parse(JSON.stringify(routine)));
    setView('form');
  };

  const addSplit = () => {
    if (!currentSplitName) return;
    const newSplit: RoutineSplit = {
      id: generateId(),
      name: currentSplitName.toUpperCase(),
      exercises: []
    };
    setDraftRoutine(prev => ({
      ...prev,
      splits: [...(prev.splits || []), newSplit]
    }));
    setCurrentSplitName('');
  };

  const deleteSplit = (splitId: string) => {
    setDraftRoutine(prev => ({
      ...prev,
      splits: prev.splits?.filter(s => s.id !== splitId)
    }));
  };

  const addExerciseToSplit = (splitId: string, exerciseId: string) => {
    const baseExercise = data.exercises.find(e => e.id === exerciseId);
    if (!baseExercise) return;

    const newRoutineExercise: RoutineExercise = {
      id: generateId(),
      exerciseId: baseExercise.id,
      targetSets: baseExercise.defaultSets,
      targetReps: baseExercise.defaultReps,
      restTimeSeconds: 60,
      executionStyle: ExecutionStyle.Normal,
      lastPerformance: { date: new Date().toISOString(), sets: [] }
    };

    setDraftRoutine(prev => ({
      ...prev,
      splits: prev.splits?.map(s => {
        if (s.id === splitId) {
          return { ...s, exercises: [...s.exercises, newRoutineExercise] };
        }
        return s;
      })
    }));
  };

  const removeExerciseFromSplit = (splitId: string, rExerciseId: string) => {
    setDraftRoutine(prev => ({
      ...prev,
      splits: prev.splits?.map(s => {
        if (s.id === splitId) {
          return { ...s, exercises: s.exercises.filter(re => re.id !== rExerciseId) };
        }
        return s;
      })
    }));
  };

  const updateExerciseField = (splitId: string, rExerciseId: string, field: keyof RoutineExercise, value: any) => {
    setDraftRoutine(prev => ({
      ...prev,
      splits: prev.splits?.map(s => {
        if (s.id === splitId) {
          const updatedExercises = s.exercises.map(ex => 
            ex.id === rExerciseId ? { ...ex, [field]: value } : ex
          );
          return { ...s, exercises: updatedExercises };
        }
        return s;
      })
    }));
  };

  const saveChanges = () => {
    if (!draftRoutine.name || !draftRoutine.splits || draftRoutine.splits.length === 0) {
      alert("A rotina precisa de um nome e pelo menos uma divisão.");
      return;
    }
    const routineToSave = { ...draftRoutine, id: draftRoutine.id || generateId() } as Routine;
    onSaveRoutine(routineToSave);
    setView('list');
  };

  if (view === 'list') {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             Minhas Rotinas
          </h2>
          <button
            onClick={handleCreateNew}
            className="bg-secondary hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-500/20 transition-all border border-secondary/20"
          >
            <Plus size={18} /> Nova
          </button>
        </div>

        <div className="grid gap-4">
          {data.routines.length === 0 && (
            <div className="text-center py-12 bg-surfaceLight/30 rounded-3xl border border-dashed border-slate-700">
                <Layers size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">Nenhuma rotina criada.</p>
            </div>
          )}
          {data.routines.map(r => (
            <div key={r.id} className={`bg-surface/50 p-5 rounded-2xl border transition-all ${data.activeRoutineId === r.id ? 'border-primary/50 bg-slate-800 shadow-lg shadow-black/20' : 'border-white/5 hover:bg-slate-800'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    {r.name}
                    {data.activeRoutineId === r.id && (
                       <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-primary/20">Ativa</span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                     {r.splits.map(s => (
                         <span key={s.id} className="text-xs bg-black/30 px-2 py-1 rounded text-slate-400 border border-white/5">{s.name}</span>
                     ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(r)} className="bg-slate-700/50 p-2 rounded-lg text-slate-300 hover:text-white transition-colors">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => onDeleteRoutine(r.id)} className="bg-slate-700/50 p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              {data.activeRoutineId !== r.id && (
                <button 
                  onClick={() => onSetActive(r.id)} 
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-700/30 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-xl border border-dashed border-slate-600 hover:border-primary transition-all"
                >
                  Selecionar como Ativa
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Form View
  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => setView('list')} className="bg-surface p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">{draftRoutine.id ? 'Editar Rotina' : 'Nova Rotina'}</h2>
      </div>

      <div className="bg-surface/30 backdrop-blur-sm p-5 rounded-3xl border border-white/5 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Nome da Rotina</label>
          <input
            className="w-full bg-black/40 text-white p-4 rounded-xl border border-slate-700 focus:border-secondary focus:outline-none transition-all placeholder:text-slate-600"
            placeholder="Ex: ABC Hipertrofia"
            value={draftRoutine.name}
            onChange={e => setDraftRoutine(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="border-t border-slate-700/50 pt-6">
          <div className="flex justify-between items-end mb-4">
              <div>
                  <h3 className="font-bold text-white text-lg">Divisões</h3>
                  <p className="text-xs text-slate-400 mt-1">Organize seu treino (A, B, C, etc)</p>
              </div>
          </div>
          
          <div className="flex gap-2 mb-8">
            <input
              className="flex-1 bg-black/40 text-white p-3 rounded-xl border border-slate-700 focus:border-secondary focus:outline-none placeholder:text-slate-600"
              placeholder="Nome (Ex: Peito e Tríceps)"
              value={currentSplitName}
              onChange={e => setCurrentSplitName(e.target.value)}
            />
            <button onClick={addSplit} className="bg-secondary text-white px-5 rounded-xl hover:bg-blue-600 font-bold shadow-lg shadow-blue-500/20">
              Adicionar
            </button>
          </div>

          <div className="space-y-8">
            {draftRoutine.splits?.map(split => (
              <div key={split.id} className="relative pl-4 border-l-2 border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                      <div className="bg-accent/10 border border-accent/20 text-accent font-bold w-8 h-8 flex items-center justify-center rounded-lg shadow-md">
                          {split.name.charAt(0)}
                      </div>
                      <h4 className="font-bold text-white text-lg">{split.name}</h4>
                  </div>
                  <button onClick={() => deleteSplit(split.id)} className="text-slate-500 hover:text-red-400 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="space-y-3 mb-4">
                  {split.exercises.length === 0 && (
                    <div className="text-slate-600 text-sm italic py-4 bg-black/20 rounded-xl text-center border border-dashed border-slate-800">
                        Adicione exercícios abaixo
                    </div>
                  )}
                  {split.exercises.map(ex => {
                    const original = data.exercises.find(e => e.id === ex.exerciseId);
                    return (
                       <div key={ex.id} className="bg-surfaceLight/30 p-4 rounded-xl border border-white/5 flex flex-col gap-3 group hover:border-white/10 transition-colors">
                         <div className="flex items-center gap-3 w-full">
                            <GripVertical size={16} className="text-slate-600 cursor-move flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-medium text-sm truncate">{original?.name}</div>
                            </div>
                            <button onClick={() => removeExerciseFromSplit(split.id, ex.id)} className="text-slate-600 hover:text-red-400 p-1">
                                <Trash2 size={16} />
                            </button>
                         </div>
                         
                         {/* Edit Controls */}
                         <div className="flex gap-2 items-center pl-7 w-full overflow-x-auto">
                            
                            {/* Sets */}
                            <div className="bg-black/40 rounded-lg p-1.5 flex flex-col items-center min-w-[50px] border border-slate-700">
                                <label className="text-[8px] text-slate-500 uppercase font-bold">Séries</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-transparent text-center text-white text-sm font-bold outline-none border-none p-0 focus:ring-0"
                                    value={ex.targetSets}
                                    onChange={(e) => updateExerciseField(split.id, ex.id, 'targetSets', parseInt(e.target.value) || 0)}
                                />
                            </div>

                            <span className="text-slate-600 text-xs">x</span>

                            {/* Reps */}
                            <div className="bg-black/40 rounded-lg p-1.5 flex flex-col items-center min-w-[60px] border border-slate-700">
                                <label className="text-[8px] text-slate-500 uppercase font-bold">Reps</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-transparent text-center text-white text-sm font-bold outline-none border-none p-0 focus:ring-0"
                                    value={ex.targetReps}
                                    onChange={(e) => updateExerciseField(split.id, ex.id, 'targetReps', e.target.value)}
                                />
                            </div>

                            {/* Rest */}
                            <div className="bg-black/40 rounded-lg p-1.5 flex flex-col items-center min-w-[60px] border border-slate-700 ml-auto">
                                <label className="text-[8px] text-slate-500 uppercase font-bold flex items-center gap-1"><Clock size={8}/> Descanso</label>
                                <div className="flex items-center justify-center gap-0.5">
                                    <input 
                                        type="number" 
                                        className="w-8 bg-transparent text-center text-white text-sm font-bold outline-none border-none p-0 focus:ring-0"
                                        value={ex.restTimeSeconds || 60}
                                        onChange={(e) => updateExerciseField(split.id, ex.id, 'restTimeSeconds', parseInt(e.target.value) || 0)}
                                    />
                                    <span className="text-[10px] text-slate-500">s</span>
                                </div>
                            </div>
                         </div>
                       </div>
                    );
                  })}
                </div>

                <div className="bg-surfaceLight/20 p-1.5 rounded-xl border border-white/5 flex gap-2">
                   <div className="flex-1 relative">
                       <select
                        className="w-full bg-transparent text-slate-300 p-2.5 text-sm outline-none appearance-none cursor-pointer"
                        onChange={(e) => {
                        if(e.target.value) {
                            addExerciseToSplit(split.id, e.target.value);
                            e.target.value = '';
                        }
                        }}
                    >
                        <option value="">+ Adicionar Exercício à divisão {split.name}</option>
                        {data.exercises.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                    </select>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Sticky Save Button */}
      <div className="sticky bottom-24 z-10">
        <button
          onClick={saveChanges}
          className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 border-t border-white/10"
        >
          <Save size={20} /> Salvar Rotina Completa
        </button>
      </div>
    </div>
  );
};

export default RoutineBuilder;