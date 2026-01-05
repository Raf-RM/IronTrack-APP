import { AppData, Exercise, Routine, WorkoutLog, UserProfile } from '../types';

const USERS_KEY = 'iron_track_users_v1';
const SESSION_KEY = 'iron_track_session_v1';
const DATA_PREFIX = 'iron_track_data_';

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'def_01', name: 'Supino Reto com Barra', muscleGroup: 'Peitoral', defaultSets: 4, defaultReps: '8-12', defaultWeight: 20 },
  { id: 'def_02', name: 'Supino Inclinado com Halteres', muscleGroup: 'Peitoral', defaultSets: 3, defaultReps: '10-12', defaultWeight: 14 },
  { id: 'def_03', name: 'Crucifixo Máquina (Peck Deck)', muscleGroup: 'Peitoral', defaultSets: 3, defaultReps: '12-15', defaultWeight: 30 },
  { id: 'def_04', name: 'Puxada Alta (Polia)', muscleGroup: 'Costas', defaultSets: 4, defaultReps: '10-12', defaultWeight: 40 },
  { id: 'def_05', name: 'Remada Curvada', muscleGroup: 'Costas', defaultSets: 4, defaultReps: '8-10', defaultWeight: 30 },
  { id: 'def_06', name: 'Barra Fixa (Graviton)', muscleGroup: 'Costas', defaultSets: 3, defaultReps: 'Falha', defaultWeight: 0 },
  { id: 'def_07', name: 'Agachamento Livre', muscleGroup: 'Pernas', defaultSets: 4, defaultReps: '8-10', defaultWeight: 20 },
  { id: 'def_08', name: 'Leg Press 45º', muscleGroup: 'Pernas', defaultSets: 4, defaultReps: '10-12', defaultWeight: 80 },
  { id: 'def_09', name: 'Cadeira Extensora', muscleGroup: 'Pernas', defaultSets: 3, defaultReps: '12-15', defaultWeight: 30 },
  { id: 'def_10', name: 'Mesa Flexora', muscleGroup: 'Pernas', defaultSets: 3, defaultReps: '12-15', defaultWeight: 30 },
  { id: 'def_11', name: 'Levantamento Terra', muscleGroup: 'Posterior/Costas', defaultSets: 3, defaultReps: '6-8', defaultWeight: 60 },
  { id: 'def_12', name: 'Desenvolvimento com Halteres', muscleGroup: 'Ombros', defaultSets: 4, defaultReps: '10-12', defaultWeight: 12 },
  { id: 'def_13', name: 'Elevação Lateral', muscleGroup: 'Ombros', defaultSets: 4, defaultReps: '12-15', defaultWeight: 8 },
  { id: 'def_14', name: 'Rosca Direta (Barra W)', muscleGroup: 'Bíceps', defaultSets: 3, defaultReps: '10-12', defaultWeight: 10 },
  { id: 'def_15', name: 'Rosca Martelo', muscleGroup: 'Bíceps', defaultSets: 3, defaultReps: '10-12', defaultWeight: 10 },
  { id: 'def_16', name: 'Tríceps Corda (Polia)', muscleGroup: 'Tríceps', defaultSets: 3, defaultReps: '12-15', defaultWeight: 20 },
  { id: 'def_17', name: 'Tríceps Testa', muscleGroup: 'Tríceps', defaultSets: 3, defaultReps: '10-12', defaultWeight: 15 },
  { id: 'def_18', name: 'Abdominal Supra', muscleGroup: 'Abdômen', defaultSets: 3, defaultReps: '15-20', defaultWeight: 0 },
  { id: 'def_19', name: 'Prancha Isométrica', muscleGroup: 'Abdômen', defaultSets: 3, defaultReps: '60s', defaultWeight: 0 },
  { id: 'def_20', name: 'Panturrilha Sentado', muscleGroup: 'Panturrilhas', defaultSets: 4, defaultReps: '15-20', defaultWeight: 20 }
];

// --- User Registry Management ---

export const getRegisteredUsers = (): UserProfile[] => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (e) {
    console.error("Failed to load users", e);
    return [];
  }
};

export const saveRegisteredUser = (user: UserProfile) => {
  const users = getRegisteredUsers();
  // Update if exists, otherwise add
  const existingIndex = users.findIndex(u => u.email === user.email);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// --- Session Management ---

export const getActiveSessionEmail = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

export const setActiveSession = (email: string) => {
  localStorage.setItem(SESSION_KEY, email);
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// --- User Specific Data Management ---

const getUserStorageKey = (email: string) => `${DATA_PREFIX}${email}`;

export const getUserData = (email: string): AppData => {
  try {
    const data = localStorage.getItem(getUserStorageKey(email));
    if (data) {
      return JSON.parse(data);
    }
    // Return default empty structure for new users
    // Only exercises are populated initially
    return {
      user: null, // Will be filled by the app context
      exercises: DEFAULT_EXERCISES,
      routines: [],
      activeRoutineId: null,
      logs: []
    };
  } catch (e) {
    console.error(`Failed to load data for ${email}`, e);
    return { user: null, exercises: DEFAULT_EXERCISES, routines: [], activeRoutineId: null, logs: [] };
  }
};

export const saveUserData = (email: string, data: AppData) => {
  try {
    localStorage.setItem(getUserStorageKey(email), JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save data for ${email}`, e);
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};