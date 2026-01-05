import React, { useState } from 'react';
import { Plus, Trash2, Dumbbell, Pencil, Save, X, Search } from 'lucide-react';
import { Exercise } from '../types';
import { generateId } from '../services/storage';

interface Props {
  exercises: Exercise[];
  onUpdate: (exercises: Exercise[]) => void;
}

const ExerciseManager: React.FC<Props> = ({ exercises, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Exercise>>({
    name: '',
    muscleGroup: '',
    defaultSets: 3,
    defaultReps: '10',
    defaultWeight: 0,
  });

  const handleSave = () => {
    if (!formData.name || !formData.muscleGroup) return;

    if (editingId) {
      const updatedExercises = exercises.map(ex => 
        ex.id === editingId ? { ...ex, ...formData } as Exercise : ex
      );
      onUpdate(updatedExercises);
      setEditingId(null);
    } else {
      const exercise: Exercise = {
        id: generateId(),
        name: formData.name!,
        muscleGroup: formData.muscleGroup!,
        defaultSets: formData.defaultSets || 3,
        defaultReps: formData.defaultReps || '10',
        defaultWeight: formData.defaultWeight || 0,
        notes: formData.notes || ''
      };
      onUpdate([...exercises, exercise]);
    }
    setFormData({ name: '', muscleGroup: '', defaultSets: 3, defaultReps: '10', defaultWeight: 0, notes: '' });
  };

  const handleEdit = (ex: Exercise) => {
    setEditingId(ex.id);
    setFormData(ex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', muscleGroup: '', defaultSets: 3, defaultReps: '10', defaultWeight: 0, notes: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este exercício?")) {
      onUpdate(exercises.filter(e => e.id !== id));
      if (editingId === id) handleCancelEdit();
    }
  };

  const filteredExercises = exercises.filter(ex => 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
         <h2 className="text-2xl font-bold text-white tracking-tight">Biblioteca</h2>
         <span className="text-sm text-slate-400 font-medium">{exercises.length} Exercícios</span>
      </div>

      {/* Editor Card */}
      <div className={`p-5 rounded-3xl border transition-all duration-300 ${editingId ? 'bg-slate-800 border-secondary shadow-lg ring-1 ring-secondary/50' : 'bg-surface/50 border-white/5 backdrop-blur-sm'}`}>
        <div className="flex justify-between items-center mb-5">
           <h3 className="text-white font-bold flex items-center gap-2">
               {editingId ? <Pencil size={18} className="text-secondary"/> : <Plus size={18} className="text-primary"/>}
               {editingId ? 'Editar Exercício' : 'Novo Cadastro'}
           </h3>
           {editingId && (
             <button onClick={handleCancelEdit} className="text-slate-400 hover:text-white bg-slate-700/50 p-1.5 rounded-full">
               <X size={16} />
             </button>
           )}
        </div>
        
        <div className="space-y-4">
            <input
                type="text"
                placeholder="Nome (ex: Supino Reto)"
                className="w-full bg-background/80 text-white p-4 rounded-xl border border-slate-700 focus:border-primary focus:outline-none focus:bg-background transition-all"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <input
                type="text"
                placeholder="Grupo Muscular (ex: Peitoral)"
                className="w-full bg-background/80 text-white p-4 rounded-xl border border-slate-700 focus:border-primary focus:outline-none focus:bg-background transition-all"
                value={formData.muscleGroup}
                onChange={e => setFormData({ ...formData, muscleGroup: e.target.value })}
            />
            
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-background/50 p-2 rounded-xl border border-slate-700/50">
                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1 pl-1">Séries</label>
                    <input
                    type="number"
                    className="w-full bg-transparent text-white font-bold text-center border-none focus:ring-0 p-0"
                    value={formData.defaultSets}
                    onChange={e => setFormData({ ...formData, defaultSets: parseInt(e.target.value) || 0 })}
                    />
                </div>
                <div className="bg-background/50 p-2 rounded-xl border border-slate-700/50">
                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1 pl-1">Reps</label>
                    <input
                    type="text"
                    className="w-full bg-transparent text-white font-bold text-center border-none focus:ring-0 p-0"
                    value={formData.defaultReps}
                    onChange={e => setFormData({ ...formData, defaultReps: e.target.value })}
                    />
                </div>
                <div className="bg-background/50 p-2 rounded-xl border border-slate-700/50">
                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1 pl-1">Kg (Ref)</label>
                    <input
                    type="number"
                    className="w-full bg-transparent text-white font-bold text-center border-none focus:ring-0 p-0"
                    value={formData.defaultWeight}
                    onChange={e => setFormData({ ...formData, defaultWeight: parseFloat(e.target.value) || 0 })}
                    />
                </div>
            </div>
        </div>
        
        <button
          onClick={handleSave}
          className={`w-full mt-6 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${editingId ? 'bg-secondary hover:bg-blue-600 text-white shadow-blue-500/20' : 'bg-primary hover:bg-emerald-600 text-slate-900 shadow-emerald-500/20'}`}
        >
          {editingId ? <Save size={20} /> : <Plus size={20} />} 
          {editingId ? 'Salvar Alterações' : 'Adicionar à Biblioteca'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar exercício..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface pl-12 pr-4 py-3 rounded-2xl border border-slate-700 focus:border-slate-500 focus:outline-none"
          />
      </div>

      {/* List */}
      <div className="space-y-3">
        {exercises.length === 0 && <p className="text-slate-500 text-center">Nenhum exercício cadastrado.</p>}
        {filteredExercises.map(ex => (
          <div key={ex.id} className="bg-surface p-4 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-slate-800 transition-colors group">
            <div className="flex-1">
              <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors">{ex.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold bg-slate-900 text-slate-500 px-2 py-0.5 rounded uppercase">{ex.muscleGroup}</span>
                  <span className="text-xs text-slate-500">{ex.defaultSets} x {ex.defaultReps}</span>
              </div>
            </div>
            <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(ex)} className="bg-slate-700/50 p-2 rounded-lg text-blue-400 hover:bg-blue-500/20">
                    <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(ex.id)} className="bg-slate-700/50 p-2 rounded-lg text-red-400 hover:bg-red-500/20">
                    <Trash2 size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseManager;