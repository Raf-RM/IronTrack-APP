import React, { useState, useRef, useEffect } from 'react';
import { Dumbbell, User, Mail, Lock, Calendar, Phone, Ruler, Weight, Camera, Upload, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  onLogin: (email: string, password: string) => boolean;
  onRegister: (user: UserProfile) => boolean;
  onResetPassword: (newPassword: string) => void;
  authError: string;
  clearError: () => void;
}

type AuthView = 'login' | 'register' | 'forgot-email' | 'forgot-success' | 'reset-password';

const AuthScreen: React.FC<Props> = ({ onLogin, onRegister, onResetPassword, authError, clearError }) => {
  const [view, setView] = useState<AuthView>('login');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    email: '',
    password: '',
    name: '',
    dob: '',
    gender: '',
    phone: '',
    height: undefined,
    weight: undefined,
    avatar: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (authError) clearError();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleChange('avatar', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
        onLogin(formData.email || '', formData.password || '');
        return;
    }
    onLogin(formData.email, formData.password);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.dob) {
        return; 
    }
    const newUser = formData as UserProfile;
    onRegister(newUser);
  };

  const handleSendRecoveryEmail = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.email) {
          return;
      }
      setView('forgot-success');
      clearError();
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.password || !confirmPassword) {
          return;
      }
      if (formData.password !== confirmPassword) {
          return;
      }
      
      onResetPassword(formData.password);
      setSuccessMsg("Senha alterada com sucesso!");
      setTimeout(() => {
        setSuccessMsg('');
        setView('login');
        setFormData(prev => ({...prev, password: ''}));
        setConfirmPassword('');
      }, 2000);
  };

  const inputClasses = "w-full bg-black/40 text-white pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-primary focus:bg-black/60 focus:outline-none placeholder:text-slate-600 transition-colors";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        
        {/* Logo Header */}
        <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-primary to-primaryDark w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20 ring-1 ring-white/10">
                <Dumbbell size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">IronTrack <span className="text-primary font-normal">AI</span></h1>
            <p className="text-slate-400 mt-2">Acompanhe sua evolução, supere limites.</p>
        </div>

        {/* Card */}
        <div className="glass p-8 rounded-3xl shadow-2xl border border-white/10">
            
            {/* Header / Back Button */}
            {view !== 'login' && view !== 'register' && (
                 <button onClick={() => { setView('login'); clearError(); }} className="mb-4 text-slate-400 hover:text-white flex items-center gap-1 text-sm">
                     <ArrowLeft size={16} /> Voltar para Login
                 </button>
            )}

            <h2 className="text-xl font-bold text-white mb-6 text-center">
                {view === 'register' && 'Crie sua conta'}
                {view === 'login' && 'Bem-vindo de volta'}
                {view === 'forgot-email' && 'Recuperar Senha'}
                {view === 'forgot-success' && 'E-mail Enviado!'}
                {view === 'reset-password' && 'Nova Senha'}
            </h2>

            {authError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
                    {authError}
                </div>
            )}
             {successMsg && (
                <div className="bg-primary/10 border border-primary/20 text-primary text-sm p-3 rounded-xl mb-4 text-center">
                    {successMsg}
                </div>
            )}

            {/* --- FORGOT PASSWORD FLOW: EMAIL INPUT --- */}
            {view === 'forgot-email' && (
                <form onSubmit={handleSendRecoveryEmail} className="space-y-4 animate-fade-in">
                    <p className="text-slate-400 text-sm text-center mb-4">
                        Digite seu e-mail cadastrado para receber um link de redefinição de senha.
                    </p>
                    <div className="relative">
                        <Mail className={iconClasses} size={18} />
                        <input 
                            type="email"
                            placeholder="Seu E-mail"
                            value={formData.email}
                            onChange={e => handleChange('email', e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3 rounded-xl mt-2 flex items-center justify-center gap-2">
                        <Send size={18} /> Enviar Link
                    </button>
                </form>
            )}

            {/* --- FORGOT PASSWORD FLOW: SUCCESS SIMULATION --- */}
            {view === 'forgot-success' && (
                <div className="text-center animate-fade-in space-y-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20">
                        <Mail size={32} />
                    </div>
                    <div>
                        <p className="text-white font-bold">Verifique seu e-mail</p>
                        <p className="text-slate-400 text-sm mt-2">Enviamos um link de recuperação para <br/><span className="text-white">{formData.email}</span></p>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-dashed border-slate-700 mt-6">
                        <p className="text-xs text-slate-500 mb-3 uppercase font-bold tracking-widest">Simulação de Ambiente</p>
                        <p className="text-xs text-slate-400 mb-3">Como este é um app local, clique abaixo para simular que você abriu o link do e-mail.</p>
                        <button 
                            onClick={() => setView('reset-password')}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                        >
                            Simular Clique no Link
                        </button>
                    </div>
                </div>
            )}

            {/* --- FORGOT PASSWORD FLOW: NEW PASSWORD --- */}
            {view === 'reset-password' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4 animate-fade-in">
                    <div className="relative">
                        <Lock className={iconClasses} size={18} />
                        <input 
                            type="password"
                            placeholder="Nova Senha"
                            value={formData.password}
                            onChange={e => handleChange('password', e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                    <div className="relative">
                        <Lock className={iconClasses} size={18} />
                        <input 
                            type="password"
                            placeholder="Confirme a Nova Senha"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3 rounded-xl mt-2 flex items-center justify-center gap-2">
                        <CheckCircle size={18} /> Redefinir Senha
                    </button>
                </form>
            )}

            {/* --- LOGIN & REGISTER FORMS --- */}
            {(view === 'login' || view === 'register') && (
                <form onSubmit={view === 'register' ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
                    
                    {view === 'register' && (
                        <div className="space-y-4 animate-fade-in">
                            {/* Avatar Upload */}
                            <div className="flex justify-center mb-6">
                                <div 
                                    onClick={triggerFileInput}
                                    className="relative w-24 h-24 rounded-full bg-black/40 border-2 border-dashed border-slate-700 hover:border-primary cursor-pointer flex items-center justify-center overflow-hidden transition-all group shadow-lg"
                                >
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Profile Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="text-slate-500 group-hover:text-primary transition-colors" size={32} />
                                    )}
                                    
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="text-white" size={24} />
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>

                            {/* Name */}
                            <div className="relative">
                                <User className={iconClasses} size={18} />
                                <input 
                                    type="text"
                                    placeholder="Nome Completo *"
                                    value={formData.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                            
                            {/* DOB */}
                            <div className="relative">
                                <Calendar className={iconClasses} size={18} />
                                <input 
                                    type={formData.dob ? "date" : "text"}
                                    onFocus={(e) => e.target.type = 'date'}
                                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                                    placeholder="Data de Nascimento *"
                                    value={formData.dob}
                                    onChange={e => handleChange('dob', e.target.value)}
                                    className={`${inputClasses} appearance-none text-slate-400`}
                                />
                            </div>
                        </div>
                    )}

                    {/* Email (Always visible) */}
                    <div className="relative">
                        <Mail className={iconClasses} size={18} />
                        <input 
                            type="email"
                            placeholder="E-mail *"
                            value={formData.email}
                            onChange={e => handleChange('email', e.target.value)}
                            className={inputClasses}
                        />
                    </div>

                    {/* Password (Always visible) */}
                    <div className="relative">
                        <Lock className={iconClasses} size={18} />
                        <input 
                            type="password"
                            placeholder="Senha *"
                            value={formData.password}
                            onChange={e => handleChange('password', e.target.value)}
                            className={inputClasses}
                        />
                    </div>

                    {view === 'login' && (
                        <div className="flex justify-end">
                            <button 
                                type="button" 
                                onClick={() => { setView('forgot-email'); clearError(); }}
                                className="text-xs text-primary hover:text-emerald-400 transition-colors"
                            >
                                Esqueci minha senha
                            </button>
                        </div>
                    )}

                    {view === 'register' && (
                        <div className="grid grid-cols-2 gap-3 pt-2 animate-fade-in">
                            <div className="relative col-span-2">
                                <Phone className={iconClasses} size={18} />
                                <input 
                                    type="tel"
                                    placeholder="Telefone (Opcional)"
                                    value={formData.phone}
                                    onChange={e => handleChange('phone', e.target.value)}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="relative">
                                <Ruler className={iconClasses} size={18} />
                                <input 
                                    type="number"
                                    placeholder="Altura (cm)"
                                    value={formData.height || ''}
                                    onChange={e => handleChange('height', parseFloat(e.target.value))}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="relative">
                                <Weight className={iconClasses} size={18} />
                                <input 
                                    type="number"
                                    placeholder="Peso (kg)"
                                    value={formData.weight || ''}
                                    onChange={e => handleChange('weight', parseFloat(e.target.value))}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="col-span-2">
                                <select 
                                    value={formData.gender} 
                                    onChange={e => handleChange('gender', e.target.value)}
                                    className="w-full bg-black/40 text-white px-4 py-3.5 rounded-xl border border-white/10 focus:border-primary focus:outline-none text-slate-400"
                                >
                                    <option value="">Sexo (Opcional)</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-primaryDark text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 border-t border-white/10"
                    >
                        {view === 'register' ? 'Cadastrar' : 'Entrar'}
                    </button>
                </form>
            )}

            <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                    {view === 'register' ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
                    <button 
                        onClick={() => {
                            setView(view === 'register' ? 'login' : 'register');
                            clearError();
                        }}
                        className="text-primary font-bold ml-2 hover:underline"
                    >
                        {view === 'register' ? 'Fazer Login' : 'Cadastre-se'}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;