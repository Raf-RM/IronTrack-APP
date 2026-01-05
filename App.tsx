import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Dumbbell, Layers, Menu } from 'lucide-react';
import { AppData, Exercise, Routine, WorkoutLog, UserProfile } from './types';
import { 
  getUserData, 
  saveUserData, 
  getRegisteredUsers, 
  saveRegisteredUser, 
  getActiveSessionEmail, 
  setActiveSession, 
  clearSession,
  DEFAULT_EXERCISES 
} from './services/storage';
import Dashboard from './components/Dashboard';
import ExerciseManager from './components/ExerciseManager';
import RoutineBuilder from './components/RoutineBuilder';
import ActiveWorkout from './components/ActiveWorkout';
import AuthScreen from './components/AuthScreen';
import Profile from './components/Profile';

// Enhanced Nav Item with animation and glow
const NavItem = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 group`}
  >
    <div className={`absolute top-0 w-8 h-1 rounded-b-full transition-all duration-300 ${active ? 'bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-transparent'}`}></div>
    <div className={`p-2 rounded-xl transition-all ${active ? 'text-primary translate-y-[-2px]' : 'text-slate-400 group-hover:text-slate-200'}`}>
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className={`text-[10px] font-medium transition-colors ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
  </button>
);

const App: React.FC = () => {
  const [data, setData] = useState<AppData>({ user: null, exercises: [], routines: [], activeRoutineId: null, logs: [] });
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, exercises, routines, workout, profile
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Initial Load: Check for active session
  useEffect(() => {
    const sessionEmail = getActiveSessionEmail();
    if (sessionEmail) {
      const userData = getUserData(sessionEmail);
      // Ensure we have the user profile attached if it's missing in the data blob 
      // (safety check against registry)
      if (!userData.user) {
        const registeredUsers = getRegisteredUsers();
        const profile = registeredUsers.find(u => u.email === sessionEmail);
        if (profile) userData.user = profile;
      }
      
      setData(userData);
      setIsAuthenticated(true);
    }
    setIsLoaded(true);
  }, []);

  // Save Data on Change (only if authenticated)
  useEffect(() => {
    if (isLoaded && isAuthenticated && data.user?.email) {
      saveUserData(data.user.email, data);
    }
  }, [data, isLoaded, isAuthenticated]);

  // Auth Handlers
  const handleRegister = (newUser: UserProfile) => {
    const users = getRegisteredUsers();
    if (users.some(u => u.email === newUser.email)) {
      setAuthError("Este e-mail já está cadastrado.");
      return false; // Indicate failure
    }

    // Save to global registry
    saveRegisteredUser(newUser);

    // Initialize specific user data
    const newUserData: AppData = {
      user: newUser,
      exercises: DEFAULT_EXERCISES,
      routines: [],
      activeRoutineId: null,
      logs: []
    };

    // Save specific data
    saveUserData(newUser.email, newUserData);
    
    // Set Session
    setActiveSession(newUser.email);
    
    // Update State
    setData(newUserData);
    setIsAuthenticated(true);
    setAuthError('');
    return true; // Indicate success
  };

  const handleLogin = (email: string, password: string) => {
    const users = getRegisteredUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Load specific data
      const userData = getUserData(email);
      // Ensure profile is up to date with registry
      userData.user = user; 
      
      setActiveSession(email);
      setData(userData);
      setIsAuthenticated(true);
      setAuthError('');
      return true;
    } else {
      setAuthError("E-mail ou senha incorretos.");
      return false;
    }
  };

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    setData({ user: null, exercises: [], routines: [], activeRoutineId: null, logs: [] });
    setCurrentView('dashboard');
    setAuthError('');
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
      // Update global registry
      saveRegisteredUser(updatedUser);
      // Update local state (which triggers effect to save specific data)
      setData(prev => ({ ...prev, user: updatedUser }));
  };
  
  const handleResetPassword = (newPassword: string) => {
    if (data.user) {
        const updatedUser = { ...data.user, password: newPassword };
        handleUpdateUser(updatedUser); // Reuse update logic
    }
  };

  const handleImportData = (importedData: AppData) => {
      // When importing, we must preserve the identity of the currently logged in user
      // unless we want to allow account cloning.
      // Strategy: Import exercises, routines, logs, but KEEP the current user profile credentials (email/pass)
      // or update the profile but force the email to match the session.
      
      if (!data.user) return;

      const mergedData: AppData = {
        ...importedData,
        user: {
            ...importedData.user!, // Take imported profile data (name, height, etc)
            email: data.user.email, // Force keep current email
            password: data.user.password // Force keep current password
        }
      };

      setData(mergedData);
      // Also update registry in case name/avatar changed
      saveRegisteredUser(mergedData.user!); 
      
      alert('Dados importados com sucesso!');
  };

  // Data Handlers
  const updateExercises = (exercises: Exercise[]) => {
    setData(prev => ({ ...prev, exercises }));
  };

  const handleSaveRoutine = (routine: Routine) => {
    setData(prev => {
      const exists = prev.routines.find(r => r.id === routine.id);
      let updatedRoutines;
      if (exists) {
        updatedRoutines = prev.routines.map(r => r.id === routine.id ? routine : r);
      } else {
        updatedRoutines = [...prev.routines, routine];
      }
      const newActiveId = (!prev.activeRoutineId && updatedRoutines.length > 0) 
        ? routine.id 
        : prev.activeRoutineId;
      return { ...prev, routines: updatedRoutines, activeRoutineId: newActiveId };
    });
  };

  const deleteRoutine = (id: string) => {
    setData(prev => ({
      ...prev,
      routines: prev.routines.filter(r => r.id !== id),
      activeRoutineId: prev.activeRoutineId === id ? null : prev.activeRoutineId
    }));
  };

  const setActiveRoutine = (id: string) => {
    setData(prev => ({ ...prev, activeRoutineId: id }));
  };

  const handleStartWorkout = () => {
    setCurrentView('workout');
  };

  const handleCompleteWorkout = (updatedRoutine: Routine, newLog: WorkoutLog) => {
    const nextIndex = (updatedRoutine.currentSplitIndex + 1) % updatedRoutine.splits.length;
    const finalRoutine = { ...updatedRoutine, currentSplitIndex: nextIndex };
    setData(prev => ({
        ...prev,
        routines: prev.routines.map(r => r.id === finalRoutine.id ? finalRoutine : r),
        logs: [...prev.logs, newLog]
    }));
    setCurrentView('dashboard');
  };

  if (!isLoaded) return null;

  // Show Auth Screen if not authenticated
  if (!isAuthenticated) {
      return (
          <AuthScreen 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
            onResetPassword={handleResetPassword}
            authError={authError}
            clearError={() => setAuthError('')}
          />
      );
  }

  const activeRoutine = data.routines.find(r => r.id === data.activeRoutineId);
  const userInitials = data.user?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "U";
  const userAvatar = data.user?.avatar;

  // If in Workout Mode, render full screen overlay
  if (currentView === 'workout' && activeRoutine) {
    return (
      <div className="min-h-screen bg-background text-white">
        <ActiveWorkout 
            routine={activeRoutine}
            exercises={data.exercises}
            logs={data.logs}
            onCompleteSplit={handleCompleteWorkout}
            onCancel={() => setCurrentView('dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans selection:bg-primary selection:text-slate-900">
      
      {/* Top Bar */}
      <header className="px-6 pt-6 pb-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-primaryDark p-2 rounded-xl text-white shadow-lg shadow-primary/20">
            <Dumbbell size={20} fill="currentColor" className="text-white/20" stroke="currentColor" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight leading-none">IronTrack</h1>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase opacity-80">AI Enhanced</span>
          </div>
        </div>
        
        {/* Profile Avatar Trigger */}
        <button 
            onClick={() => setCurrentView('profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-white hover:border-primary transition-all shadow-md active:scale-95 overflow-hidden"
        >
            {userAvatar ? (
              <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              userInitials
            )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-5 pb-32 max-w-3xl mx-auto w-full relative">
        {currentView === 'dashboard' && (
          <Dashboard 
            data={data} 
            onStartWorkout={handleStartWorkout} 
            onNavigate={setCurrentView}
          />
        )}
        {currentView === 'exercises' && (
          <ExerciseManager exercises={data.exercises} onUpdate={updateExercises} />
        )}
        {currentView === 'routines' && (
          <RoutineBuilder 
            data={data} 
            onSaveRoutine={handleSaveRoutine} 
            onDeleteRoutine={deleteRoutine}
            onSetActive={setActiveRoutine}
          />
        )}
        {currentView === 'profile' && data.user && (
            <Profile 
                appData={data} 
                onUpdateUser={handleUpdateUser} 
                onImportData={handleImportData}
                onLogout={handleLogout}
                onBack={() => setCurrentView('dashboard')}
            />
        )}
      </main>

      {/* Bottom Navigation (Hidden on Profile) */}
      {currentView !== 'profile' && (
        <nav className="fixed bottom-6 left-4 right-4 z-50 max-w-3xl mx-auto">
            <div className="glass rounded-3xl shadow-2xl shadow-black/50 border border-slate-700/30 flex justify-between items-center h-16 px-4 overflow-hidden relative">
            <NavItem 
                active={currentView === 'dashboard'} 
                onClick={() => setCurrentView('dashboard')} 
                icon={LayoutDashboard} 
                label="Início" 
            />
            <NavItem 
                active={currentView === 'workout'} 
                onClick={() => handleStartWorkout()} 
                icon={Dumbbell} 
                label="Treinar" 
            />
            <NavItem 
                active={currentView === 'exercises'} 
                onClick={() => setCurrentView('exercises')} 
                icon={Layers} 
                label="Biblioteca" 
            />
            <NavItem 
                active={currentView === 'routines'} 
                onClick={() => setCurrentView('routines')} 
                icon={Menu} 
                label="Rotinas" 
            />
            </div>
        </nav>
      )}
    </div>
  );
};

export default App;