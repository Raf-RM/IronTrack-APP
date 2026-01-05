import React, { useState, useRef } from 'react';
import { User, Mail, Calendar, Phone, Ruler, Weight, Save, LogOut, ArrowLeft, Lock, Download, UploadCloud, FileJson } from 'lucide-react';
import { UserProfile, AppData } from '../types';

interface Props {
  appData: AppData;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onImportData: (data: AppData) => void;
  onLogout: () => void;
  onBack: () => void;
}

const Profile: React.FC<Props> = ({ appData, onUpdateUser, onImportData, onLogout, onBack }) => {
  const user = appData.user!;
  const [formData, setFormData] = useState<UserProfile>(user);
  const [newPassword, setNewPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    let updatedUser = { ...formData };
    if (newPassword) {
        updatedUser.password = newPassword;
    }
    onUpdateUser(updatedUser);
    setNewPassword(''); // Clear password field
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `irontrack_backup_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileReader = new FileReader();
      const file = e.target.files?.[0];

      if (file) {
          fileReader.readAsText(file, "UTF-8");
          fileReader.onload = (event) => {
              try {
                  const result = event.target?.result;
                  if (typeof result === 'string') {
                      const parsedData = JSON.parse(result) as AppData;
                      // Basic validation
                      if (parsedData.user && Array.isArray(parsedData.exercises) && Array.isArray(parsedData.routines)) {
                          if (window.confirm("Isso irá substituir TODOS os seus dados atuais pelos dados do arquivo. Deseja continuar?")) {
                              onImportData(parsedData);
                              // Update local form data to reflect imported user
                              setFormData(parsedData.user);
                          }
                      } else {
                          alert("Arquivo inválido. Formato de dados incorreto.");
                      }
                  }
              } catch (err) {
                  alert("Erro ao ler o arquivo. Certifique-se que é um JSON válido.");
                  console.error(err);
              }
          };
      }
      // Reset input
      e.target.value = '';
  };

  // Get initials for avatar placeholder
  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const inputClasses = "w-full bg-black/40 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-primary focus:outline-none mt-1 transition-colors";

  return (
    <div className="pb-32 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="bg-surface p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white">Meu Perfil</h2>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center text-3xl font-bold text-white shadow-2xl mb-4 border-4 border-surfaceLight overflow-hidden ring-2 ring-primary/20">
                {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    initials
                )}
            </div>
            <h3 className="text-xl font-bold text-white">{user.name}</h3>
            <p className="text-slate-400 text-sm">{user.email}</p>
        </div>

        <div className="space-y-6">
            
            {/* Data Management Card (Import/Export) */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                <h4 className="text-white font-bold flex items-center gap-2 mb-2">
                    <FileJson size={18} className="text-blue-400"/> Gerenciamento de Dados
                </h4>
                <p className="text-xs text-slate-400 mb-4">Exporte seus dados para backup ou transfira para outro dispositivo.</p>
                
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleExport}
                        className="flex flex-col items-center justify-center gap-2 bg-black/30 hover:bg-black/50 border border-white/10 p-4 rounded-xl transition-all group"
                    >
                        <Download size={24} className="text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-300">Exportar Backup</span>
                    </button>
                    
                    <button 
                        onClick={handleImportClick}
                        className="flex flex-col items-center justify-center gap-2 bg-black/30 hover:bg-black/50 border border-white/10 p-4 rounded-xl transition-all group"
                    >
                        <UploadCloud size={24} className="text-secondary group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-300">Importar Dados</span>
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".json" 
                        className="hidden" 
                    />
                </div>
            </div>

            {/* Personal Info Card */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                <h4 className="text-white font-bold flex items-center gap-2 mb-2">
                    <User size={18} className="text-primary"/> Dados Pessoais
                </h4>
                
                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold pl-1">Nome Completo</label>
                    <input 
                        type="text"
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        className={inputClasses}
                    />
                </div>

                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold pl-1">E-mail</label>
                    <div className="relative">
                        <input 
                            type="email"
                            value={formData.email}
                            onChange={e => handleChange('email', e.target.value)}
                            className={inputClasses}
                        />
                         <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs text-slate-500 uppercase font-bold pl-1">Nascimento</label>
                        <input 
                            type="date"
                            value={formData.dob}
                            onChange={e => handleChange('dob', e.target.value)}
                            className={`${inputClasses} text-sm`}
                        />
                    </div>
                     <div>
                        <label className="text-xs text-slate-500 uppercase font-bold pl-1">Telefone</label>
                        <input 
                            type="tel"
                            value={formData.phone || ''}
                            onChange={e => handleChange('phone', e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Card */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                <h4 className="text-white font-bold flex items-center gap-2 mb-2">
                    <Ruler size={18} className="text-secondary"/> Medidas
                </h4>
                <div className="grid grid-cols-3 gap-3">
                     <div>
                        <label className="text-xs text-slate-500 uppercase font-bold pl-1">Altura (cm)</label>
                        <input 
                            type="number"
                            value={formData.height || ''}
                            onChange={e => handleChange('height', parseFloat(e.target.value))}
                            className={inputClasses}
                        />
                    </div>
                     <div>
                        <label className="text-xs text-slate-500 uppercase font-bold pl-1">Peso (kg)</label>
                        <input 
                            type="number"
                            value={formData.weight || ''}
                            onChange={e => handleChange('weight', parseFloat(e.target.value))}
                            className={inputClasses}
                        />
                    </div>
                     <div>
                        <label className="text-xs text-slate-500 uppercase font-bold pl-1">Sexo</label>
                         <select 
                            value={formData.gender || ''} 
                            onChange={e => handleChange('gender', e.target.value)}
                            className={`${inputClasses} appearance-none text-slate-300`}
                        >
                            <option value="">-</option>
                            <option value="Masculino">Masc.</option>
                            <option value="Feminino">Fem.</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Security Card */}
             <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                <h4 className="text-white font-bold flex items-center gap-2 mb-2">
                    <Lock size={18} className="text-accent"/> Segurança
                </h4>
                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold pl-1">Alterar Senha</label>
                    <input 
                        type="password"
                        placeholder="Nova senha (deixe em branco para manter)"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className={inputClasses}
                    />
                </div>
             </div>

            <button
                onClick={handleSave}
                className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border-t border-white/10 ${isSaved ? 'bg-emerald-500 text-white' : 'bg-primary hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'}`}
            >
                <Save size={20} /> {isSaved ? 'Dados Salvos!' : 'Salvar Alterações'}
            </button>

            <button
                onClick={onLogout}
                className="w-full bg-surfaceLight/30 text-red-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-700 hover:bg-red-500/10 transition-all"
            >
                <LogOut size={20} /> Sair da Conta
            </button>
        </div>
    </div>
  );
};

export default Profile;